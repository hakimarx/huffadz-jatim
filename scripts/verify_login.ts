
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sczdpueymqspwnhbuomf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjemRwdWV5bXFzcHduaGJ1b21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTQ3MzIsImV4cCI6MjA4MDkzMDczMn0.PAYAg5sHJ873Qfy1bmIYWjQD36Ryb3VIHUYg-QdmPCY';

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin(password: string) {
    const email = 'hakimarx@gmail.com';
    console.log(`\n----------------------------------------`);
    console.log(`Trying login for ${email} with password: ${password}`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('❌ Login FAILED:', error.message);
        return false;
    } else {
        console.log('✅ Login SUCCESS!');
        console.log('User ID:', data.user?.id);
        console.log('Email Confirmed At:', data.user?.email_confirmed_at);

        // Check profile
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user?.id)
            .single();

        if (profileError) {
            console.error('❌ Profile Fetch FAILED:', profileError.message);
            console.log('   (This means the user exists in Auth but not in public.users table)');
        } else {
            console.log('✅ Profile Found:', profile);
        }
        return true;
    }
}

async function run() {
    // Try new password first
    const successNew = await testLogin('123456');
    if (successNew) return;

    // Try old password
    const successOld = await testLogin('g4yung4n');
    if (successOld) return;

    // Try demo password
    await testLogin('demo123');
}

run();
