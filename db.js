// db.js
const SUPABASE_URL = 'https://ccaggjhyeygyosbdnxmq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjYWdnamh5ZXlneW9zYmRueG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNjMzNzksImV4cCI6MjA5NjgzOTM3OX0.Z2NJXnSNoJtugQ0Co-R_SMH3dXbErVcCcItgxj_PQxs';

if (!window.supabase) {
    console.error("Supabase failed to load. Check your internet connection.");
} else {
    window.db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}