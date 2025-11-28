import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.warn('Supabase URL is missing or invalid. Please set VITE_SUPABASE_URL in .env');
}

// Ensure we have a valid URL format to prevent createClient from throwing
const validUrl = (supabaseUrl && supabaseUrl.startsWith('http'))
    ? supabaseUrl
    : 'https://placeholder.supabase.co';

export const supabase = createClient(validUrl, supabaseKey || 'placeholder');
