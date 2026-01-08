import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
};
