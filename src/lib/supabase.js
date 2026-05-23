import { createClient }
from '@supabase/supabase-js'

const supabaseUrl =
  'https://qcedjunifvjhcnuyumph.supabase.co'

const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZWRqdW5pZnZqaGNudXl1bXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MTM4OTEsImV4cCI6MjA5NTA4OTg5MX0.2PmBGR4J7D6YwjUbkjue42lYCFWT8aq-WKWotcVfLic'

export const supabase =
  createClient(
    supabaseUrl,
    supabaseKey
  )