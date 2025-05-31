import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lkyapwufbbkbinkotvls.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxreWFwd3VmYmJrYmlua290dmxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMTMyOTYsImV4cCI6MjA2Mzc4OTI5Nn0.AClw3gnKXbl9Eou9V3ySslvKYw9AzLX6U19YcgA6fLQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);