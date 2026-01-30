export const WA_SERVER_URL = 'http://localhost:3001';

export async function sendWhatsAppMessage(number: string, message: string) {
    try {
        const res = await fetch(`${WA_SERVER_URL}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number, message }),
        });
        return await res.json();
    } catch (error) {
        console.error('WA Send Error:', error);
        return { error: 'Failed to connect to WA Server' };
    }
}

export async function sendWhatsAppBroadcast(numbers: string[], message: string) {
    try {
        const res = await fetch(`${WA_SERVER_URL}/broadcast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numbers, message }),
        });
        return await res.json();
    } catch (error) {
        console.error('WA Broadcast Error:', error);
        return { error: 'Failed to connect to WA Server' };
    }
}

export async function getWhatsAppStatus() {
    try {
        const res = await fetch(`${WA_SERVER_URL}/status`);
        return await res.json();
    } catch (error) {
        return { status: 'server_down' };
    }
}

export async function getWhatsAppQR() {
    try {
        const res = await fetch(`${WA_SERVER_URL}/qr`);
        if (res.status === 404) return null;
        const data = await res.json();
        return data.qr;
    } catch (error) {
        return null;
    }
}
