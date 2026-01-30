'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { FiMessageCircle, FiRefreshCw, FiSend, FiUsers, FiSmartphone, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Image from 'next/image';

export default function WhatsAppGatewayPage() {
    const [status, setStatus] = useState<string>('checking');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Test Message State
    const [testNumber, setTestNumber] = useState('');
    const [testMessage, setTestMessage] = useState('');
    const [sendingTest, setSendingTest] = useState(false);

    // Broadcast State
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [targetGroup, setTargetGroup] = useState('all_hafiz');
    const [sendingBroadcast, setSendingBroadcast] = useState(false);

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetch('/api/auth/session')
            .then(res => res.json())
            .then(data => setUser(data.user));

        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        try {
            const res = await fetch('/api/whatsapp/status');
            const data = await res.json();
            setStatus(data.status);

            if (data.status !== 'connected') {
                fetchQr();
            } else {
                setQrCode(null);
            }
        } catch (error) {
            setStatus('error');
        }
    };

    const fetchQr = async () => {
        try {
            const res = await fetch('/api/whatsapp/qr');
            if (res.ok) {
                const data = await res.json();
                setQrCode(data.qr);
            }
        } catch (error) {
            console.error('Failed to fetch QR');
        }
    };

    const handleSendTest = async (e: React.FormEvent) => {
        e.preventDefault();
        setSendingTest(true);
        try {
            const res = await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ number: testNumber, message: testMessage }),
            });
            const data = await res.json();
            if (data.success) {
                alert('Pesan berhasil dikirim!');
                setTestMessage('');
            } else {
                alert('Gagal mengirim pesan: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Terjadi kesalahan');
        } finally {
            setSendingTest(false);
        }
    };

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm('Apakah Anda yakin ingin mengirim pesan masal ini?')) return;

        setSendingBroadcast(true);
        try {
            // Fetch numbers based on target group
            // This part requires an API to get numbers. For now, we'll mock or fetch from existing APIs
            let numbers: string[] = [];

            if (targetGroup === 'all_hafiz') {
                const res = await fetch('/api/hafiz?limit=10000');
                const data = await res.json();
                numbers = data.data.map((h: any) => h.telepon).filter((n: any) => n);
            } else if (targetGroup === 'admins') {
                // Fetch admins... (need an API for this)
                // For now, alert not implemented
                alert('Fitur broadcast ke admin belum tersedia');
                setSendingBroadcast(false);
                return;
            }

            if (numbers.length === 0) {
                alert('Tidak ada nomor tujuan ditemukan');
                setSendingBroadcast(false);
                return;
            }

            const res = await fetch('/api/whatsapp/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ numbers, message: broadcastMessage }),
            });

            const data = await res.json();
            alert(`Broadcast selesai. Terkirim: ${data.sent}, Gagal: ${data.failed}`);
            setBroadcastMessage('');

        } catch (error) {
            alert('Terjadi kesalahan saat broadcast');
        } finally {
            setSendingBroadcast(false);
        }
    };

    if (!user) return null;

    return (
        <div className="flex h-screen bg-neutral-50 overflow-hidden">
            <Sidebar userRole={user.role} userName={user.nama} userPhoto={user.foto_profil} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white border-b border-neutral-200 px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-neutral-800">WhatsApp Gateway</h1>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto space-y-8">

                        {/* Status Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <FiSmartphone /> Status Koneksi
                                </h2>
                                <button onClick={checkStatus} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                                    <FiRefreshCw />
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-10">
                                <div className="flex-1">
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4 ${status === 'connected' ? 'bg-emerald-100 text-emerald-700' :
                                        status === 'checking' ? 'bg-blue-100 text-blue-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-emerald-500' :
                                            status === 'checking' ? 'bg-blue-500 animate-pulse' :
                                                'bg-red-500'
                                            }`}></span>
                                        {status === 'connected' ? 'Server Aktif' :
                                            status === 'checking' ? 'Memeriksa...' :
                                                status === 'qr_ready' ? 'Menunggu Scan QR' : 'Server Tidak Aktif'}
                                    </div>
                                    <p className="text-neutral-600 mb-4">
                                        {status === 'connected'
                                            ? 'WhatsApp Gateway siap digunakan untuk mengirim notifikasi otomatis dan pengumuman.'
                                            : 'Server WhatsApp Gateway tidak berjalan. Jalankan server terlebih dahulu dengan perintah: node scripts/wa-server.js'}
                                    </p>
                                    {status === 'connected' && (
                                        <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3 text-emerald-700">
                                            <FiCheckCircle size={24} />
                                            <span>Server berjalan normal. Cron job pengingat aktif.</span>
                                        </div>
                                    )}
                                    {status !== 'connected' && status !== 'checking' && (
                                        <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                                            <div className="flex items-center gap-3 text-red-700 mb-3">
                                                <FiXCircle size={24} />
                                                <span className="font-bold">Server WhatsApp tidak aktif</span>
                                            </div>
                                            <p className="text-sm text-red-600 mb-2">Buka terminal baru dan jalankan:</p>
                                            <code className="block bg-red-100 px-3 py-2 rounded-lg text-sm text-red-800 font-mono">
                                                node scripts/wa-server.js
                                            </code>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-shrink-0">
                                    {status !== 'connected' && qrCode ? (
                                        <div className="bg-white p-4 rounded-xl border-2 border-neutral-200 shadow-inner">
                                            <Image src={qrCode} alt="QR Code" width={200} height={200} />
                                            <p className="text-center text-xs text-neutral-500 mt-2">Scan dengan WhatsApp</p>
                                        </div>
                                    ) : status === 'connected' ? (
                                        <div className="w-48 h-48 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100">
                                            <FiCheckCircle size={64} className="text-emerald-500" />
                                        </div>
                                    ) : (
                                        <div className="w-48 h-48 bg-red-50 rounded-full flex items-center justify-center border-4 border-red-100">
                                            <FiXCircle size={64} className="text-red-400" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Test Message */}
                            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
                                <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                                    <FiSend /> Kirim Pesan Test
                                </h2>
                                <form onSubmit={handleSendTest} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Nomor Tujuan</label>
                                        <input
                                            type="text"
                                            value={testNumber}
                                            onChange={e => setTestNumber(e.target.value)}
                                            placeholder="08123456789"
                                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Pesan</label>
                                        <textarea
                                            value={testMessage}
                                            onChange={e => setTestMessage(e.target.value)}
                                            placeholder="Isi pesan test..."
                                            rows={3}
                                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={sendingTest || status !== 'connected'}
                                        className="btn btn-primary w-full flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sendingTest ? 'Mengirim...' : <><FiSend /> Kirim</>}
                                    </button>
                                </form>
                            </div>

                            {/* Broadcast */}
                            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
                                <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                                    <FiUsers /> Pengumuman Masal
                                </h2>
                                <form onSubmit={handleBroadcast} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Target Penerima</label>
                                        <select
                                            value={targetGroup}
                                            onChange={e => setTargetGroup(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        >
                                            <option value="all_hafiz">Semua Hafiz</option>
                                            <option value="admins">Semua Admin (Belum Tersedia)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Isi Pengumuman</label>
                                        <textarea
                                            value={broadcastMessage}
                                            onChange={e => setBroadcastMessage(e.target.value)}
                                            placeholder="Tulis pengumuman di sini..."
                                            rows={5}
                                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={sendingBroadcast || status !== 'connected'}
                                        className="btn bg-indigo-600 hover:bg-indigo-700 text-white w-full flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sendingBroadcast ? 'Mengirim...' : <><FiMessageCircle /> Kirim Pengumuman</>}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
