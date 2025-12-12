
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sczdpueymqspwnhbuomf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjemRwdWV5bXFzcHduaGJ1b21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTQ3MzIsImV4cCI6MjA4MDkzMDczMn0.PAYAg5sHJ873Qfy1bmIYWjQD36Ryb3VIHUYg-QdmPCY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const users = [
    {
        email: 'admin.provinsi@demo.com',
        password: 'demo123',
        role: 'admin_provinsi',
        nama: 'Admin Provinsi Demo',
        kabupaten_kota: 'Provinsi Jawa Timur'
    },
    {
        email: 'admin.surabaya@demo.com',
        password: 'demo123',
        role: 'admin_kabko',
        nama: 'Admin Surabaya Demo',
        kabupaten_kota: 'Kota Surabaya'
    },
    {
        email: 'hafiz.demo@demo.com',
        password: 'demo123',
        role: 'hafiz',
        nama: 'Hafiz Demo',
        kabupaten_kota: 'Kota Surabaya',
        isHafiz: true
    }
];

async function createDemoUsers() {
    console.log('Starting demo user creation...');

    for (const user of users) {
        console.log(`\nProcessing ${user.email}...`);

        // 1. Sign Up / Sign In
        let authUser;
        let session;

        // Try to sign in first
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: user.password
        });

        if (signInData.user) {
            console.log('User already exists, signed in.');
            authUser = signInData.user;
            session = signInData.session;
        } else {
            console.log('Creating new user...');
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: user.email,
                password: user.password,
                options: {
                    data: {
                        full_name: user.nama
                    }
                }
            });

            if (signUpError) {
                console.error(`Failed to create user ${user.email}:`, signUpError.message);
                continue;
            }

            if (!signUpData.session) {
                console.warn(`User created but no session (email confirmation might be required). Cannot setup profile for ${user.email}`);
                continue;
            }

            authUser = signUpData.user;
            session = signUpData.session;
            console.log('User created successfully.');
        }

        if (!authUser || !session) {
            console.error('No auth user or session available.');
            continue;
        }

        // 2. Insert/Update public.users
        // We need to use a client with the user's session to respect RLS "Users can insert their own data"
        const userClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            }
        });

        const { error: profileError } = await userClient
            .from('users')
            .upsert({
                id: authUser.id,
                email: user.email,
                role: user.role,
                nama: user.nama,
                kabupaten_kota: user.kabupaten_kota
            });

        if (profileError) {
            console.error(`Failed to create/update profile for ${user.email}:`, profileError.message);
        } else {
            console.log(`Profile configured for ${user.email}`);
        }

        // 3. If Hafiz, create hafiz profile
        if (user.isHafiz) {
            const { error: hafizError } = await userClient
                .from('hafiz')
                .upsert({
                    user_id: authUser.id,
                    nik: '1234567890123456',
                    nama: user.nama,
                    tempat_lahir: 'Surabaya',
                    tanggal_lahir: '2000-01-01',
                    jenis_kelamin: 'L',
                    alamat: 'Jl. Demo No. 1',
                    desa_kelurahan: 'Demo',
                    kecamatan: 'Demo',
                    kabupaten_kota: user.kabupaten_kota,
                    tahun_tes: 2024,
                    status_kelulusan: 'lulus'
                }, { onConflict: 'nik' });

            if (hafizError) {
                console.error(`Failed to create hafiz profile:`, hafizError.message);
            } else {
                console.log(`Hafiz profile created.`);
            }
        }
    }

    console.log('\nDemo user creation completed.');
}

createDemoUsers();
