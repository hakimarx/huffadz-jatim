const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const cron = require('node-cron');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Database connection
const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'huffadz_jatim',
};

async function getDbConnection() {
    return await mysql.createConnection(dbConfig);
}

// State
let sock;
let qrCodeData = null;
let connectionStatus = 'disconnected'; // disconnected, connecting, connected
let authState;
let saveCreds;

async function connectToWhatsApp() {
    const authPath = path.resolve(__dirname, '../wa_auth_info');
    if (!fs.existsSync(authPath)) {
        fs.mkdirSync(authPath, { recursive: true });
    }

    const { state, saveCreds: save } = await useMultiFileAuthState(authPath);
    authState = state;
    saveCreds = save;

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // Also print to terminal for debugging
        logger: pino({ level: 'silent' }),
        browser: ['Huffadz Jatim', 'Chrome', '1.0.0'],
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrCodeData = qr;
            connectionStatus = 'qr_ready';
            console.log('QR Code received');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect);
            connectionStatus = 'disconnected';
            if (shouldReconnect) {
                connectToWhatsApp();
            } else {
                console.log('Logged out. Delete wa_auth_info to re-login.');
                // Optional: fs.rmSync(authPath, { recursive: true, force: true });
            }
        } else if (connection === 'open') {
            console.log('Opened connection');
            connectionStatus = 'connected';
            qrCodeData = null;
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// API Endpoints

// Get Status
app.get('/status', (req, res) => {
    res.json({ status: connectionStatus });
});

// Get QR Code
app.get('/qr', async (req, res) => {
    if (connectionStatus === 'connected') {
        return res.status(400).json({ message: 'Already connected' });
    }
    if (!qrCodeData) {
        return res.status(404).json({ message: 'QR Code not ready yet' });
    }
    try {
        const qrImage = await QRCode.toDataURL(qrCodeData);
        res.json({ qr: qrImage });
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate QR image' });
    }
});

// Send Message
app.post('/send', async (req, res) => {
    const { number, message } = req.body;

    if (connectionStatus !== 'connected') {
        return res.status(503).json({ error: 'WhatsApp not connected' });
    }

    if (!number || !message) {
        return res.status(400).json({ error: 'Number and message are required' });
    }

    try {
        // Format number: 08xx -> 628xx
        let formattedNumber = number.toString().replace(/\D/g, '');
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '62' + formattedNumber.slice(1);
        }
        if (!formattedNumber.endsWith('@s.whatsapp.net')) {
            formattedNumber += '@s.whatsapp.net';
        }

        // Check if number exists on WA
        const [onWhatsApp] = await sock.onWhatsApp(formattedNumber);
        if (!onWhatsApp || !onWhatsApp.exists) {
            // Try sending anyway as onWhatsApp check can be flaky
            console.warn(`Number ${formattedNumber} might not be on WhatsApp, trying anyway.`);
        }

        await sock.sendMessage(formattedNumber, { text: message });
        res.json({ success: true });
    } catch (error) {
        console.error('Failed to send message:', error);
        res.status(500).json({ error: error.message });
    }
});

// Broadcast
app.post('/broadcast', async (req, res) => {
    const { numbers, message } = req.body; // numbers is array

    if (connectionStatus !== 'connected') {
        return res.status(503).json({ error: 'WhatsApp not connected' });
    }

    if (!Array.isArray(numbers) || !message) {
        return res.status(400).json({ error: 'Numbers array and message are required' });
    }

    let successCount = 0;
    let failCount = 0;

    for (const number of numbers) {
        try {
            let formattedNumber = number.toString().replace(/\D/g, '');
            if (formattedNumber.startsWith('0')) {
                formattedNumber = '62' + formattedNumber.slice(1);
            }
            if (!formattedNumber.endsWith('@s.whatsapp.net')) {
                formattedNumber += '@s.whatsapp.net';
            }
            await sock.sendMessage(formattedNumber, { text: message });
            successCount++;
            // Add delay to avoid ban
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            console.error(`Failed to send to ${number}:`, e);
            failCount++;
        }
    }

    res.json({ success: true, sent: successCount, failed: failCount });
});


// Cron Jobs

// Reminder Laporan Bulanan (Every day at 08:00)
// Check if today is near end of month (e.g. 25th onwards) and user hasn't submitted report
cron.schedule('0 8 * * *', async () => {
    console.log('Running daily reminder check...');
    if (connectionStatus !== 'connected') return;

    try {
        const conn = await getDbConnection();
        const today = new Date();
        const day = today.getDate();

        // Only remind on 25th, 28th, and 30th/31st
        if ([25, 28, 30, 31].includes(day)) {
            // Logic to find users who haven't submitted report for this month
            // This assumes 'laporan_harian' table exists and we check for entries in current month
            // Or maybe 'laporan_bulanan' if that exists. Based on file list, only 'laporan_harian' seen in db.ts

            // Example query: Get active hafiz who have NO laporan_harian in current month
            // This is just a placeholder logic, adjust to actual business rules
            const [rows] = await conn.execute(`
                SELECT h.nama, h.telepon 
                FROM hafiz h 
                JOIN users u ON h.user_id = u.id 
                WHERE u.is_active = 1 
                AND h.telepon IS NOT NULL
                AND h.id NOT IN (
                    SELECT hafiz_id FROM laporan_harian 
                    WHERE MONTH(tanggal) = MONTH(CURRENT_DATE()) 
                    AND YEAR(tanggal) = YEAR(CURRENT_DATE())
                )
            `);

            for (const row of rows) {
                if (row.telepon) {
                    const message = `Assalamualaikum ${row.nama}, diingatkan untuk segera mengisi laporan kegiatan bulan ini sebelum tanggal 30. Terima kasih.`;
                    // Send message logic (reuse send logic)
                    let formattedNumber = row.telepon.toString().replace(/\D/g, '');
                    if (formattedNumber.startsWith('0')) {
                        formattedNumber = '62' + formattedNumber.slice(1);
                    }
                    formattedNumber += '@s.whatsapp.net';

                    await sock.sendMessage(formattedNumber, { text: message });
                    await new Promise(r => setTimeout(r, 2000));
                }
            }
        }
        await conn.end();
    } catch (err) {
        console.error('Cron error:', err);
    }
});

// Start
connectToWhatsApp();
app.listen(PORT, () => {
    console.log(`WA Server running on port ${PORT}`);
});
