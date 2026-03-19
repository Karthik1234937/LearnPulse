
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Access credentials directly from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qhwcsjgiuiqrgdfxzvjq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFod2NzamdpdWlxcmdkZnh6dmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5OTgyODgsImV4cCI6MjA4NDU3NDI4OH0.0KY-eZM4m78LJO6ku_oEjCfJcAfIbB-viUX-Ei8RJA4';

/**
 * Validates if the Supabase configuration is present.
 */
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

// Initialize with real credentials or a safe placeholder to avoid uncaught exceptions during module load.
// This prevents "supabaseUrl is required" error from blocking the entire JS execution.
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder-project.supabase.co', 'placeholder-key');

if (!isSupabaseConfigured) {
  console.warn(
    "LearnPulse: Supabase credentials missing. " +
    "Authentication and persistence are disabled. Use 'Preview Demo' to explore the app UI."
  );
}
