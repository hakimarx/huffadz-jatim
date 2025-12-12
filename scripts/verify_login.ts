
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sczdpueymqspwnhbuomf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjemRwdWV5bXFzcHduaGJ1b21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTQ3MzIsImV4cCI6MjA4MDkzMDczMn0.PAYAg5sHJ873Qfy1bmIYWjQD36Ryb3VIHUYg-QdmPCY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyLogin() {
    const email = 'hakimarx@gmail.com';
    const password = 'g4yung4n';

    console.log(`Verifying login for ${email}...`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('LOGIN FAILED:', error.message);
        if (error.message.includes('Invalid login credentials')) {
            console.error('Possible causes: Wrong password, user not confirmed, or user deleted.');
        }
    } else {
        console.log('LOGIN SUCCESS!');
        console.log('User ID:', data.user?.id);
        console.log('Email:', data.user?.email);
        console.log('Role (Auth):', data.user?.role);

        // Check public.users
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user?.id)
            .single();

        if (userError) {
            console.error('Error fetching public profile:', userError.message);
        } else {
            console.log('Public Profile:', userData);
        }
    }
}

verifyLogin();
