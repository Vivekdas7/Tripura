import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://floral-field-5e14.dasvivek398.workers.dev' // Use Worker URL here
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Crucial for mobile: ensures the session is saved to localStorage correctly
    persistSession: true, 
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Using a specific key prevents collisions with other apps on the same domain
    storageKey: 'tripurafly-auth-token', 
  },
  global: {
    headers: { 'x-application-name': 'tripurafly' },
  },
});

// --- Types ---

export type Flight = {
  id: string;
  flight_number: string;
  airline: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  total_seats: number;
  aircraft_type: string;
  [x: string]: any; 
};

export type Booking = {
  id: string;
  user_id: string;
  flight_id: string;
  booking_reference: string;
  status: 'confirmed' | 'cancelled' | 'pending';
  total_passengers: number;
  total_price: number;
  booking_date: string;
  created_at: string;
};

export type Passenger = {
  id?: string;
  booking_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  passport_number?: string;
  date_of_birth: string | number | readonly string[] | undefined;
};