/*
  # Flight Booking System Schema

  1. New Tables
    - `flights`
      - `id` (uuid, primary key)
      - `flight_number` (text, unique)
      - `airline` (text)
      - `origin` (text)
      - `destination` (text)
      - `departure_time` (timestamptz)
      - `arrival_time` (timestamptz)
      - `price` (decimal)
      - `available_seats` (integer)
      - `total_seats` (integer)
      - `aircraft_type` (text)
      - `created_at` (timestamptz)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `flight_id` (uuid, foreign key to flights)
      - `booking_reference` (text, unique)
      - `status` (text: 'confirmed', 'cancelled', 'pending')
      - `total_passengers` (integer)
      - `total_price` (decimal)
      - `booking_date` (timestamptz)
      - `created_at` (timestamptz)
    
    - `passengers`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, foreign key to bookings)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text)
      - `phone` (text)
      - `date_of_birth` (date)
      - `passport_number` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Flights: Public read access for searching
    - Bookings: Users can only view/create their own bookings
    - Passengers: Users can only view passengers for their own bookings
*/

-- Create flights table
CREATE TABLE IF NOT EXISTS flights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_number text UNIQUE NOT NULL,
  airline text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  departure_time timestamptz NOT NULL,
  arrival_time timestamptz NOT NULL,
  price decimal(10,2) NOT NULL,
  available_seats integer NOT NULL DEFAULT 0,
  total_seats integer NOT NULL,
  aircraft_type text NOT NULL DEFAULT 'Boeing 737',
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  flight_id uuid REFERENCES flights(id) NOT NULL,
  booking_reference text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  total_passengers integer NOT NULL DEFAULT 1,
  total_price decimal(10,2) NOT NULL,
  booking_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create passengers table
CREATE TABLE IF NOT EXISTS passengers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  date_of_birth date NOT NULL,
  passport_number text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;

-- Flights policies (public read access for searching)
CREATE POLICY "Anyone can view flights"
  ON flights FOR SELECT
  USING (true);

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Passengers policies
CREATE POLICY "Users can view passengers for own bookings"
  ON passengers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add passengers to own bookings"
  ON passengers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = passengers.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_flights_departure ON flights(departure_time);
CREATE INDEX IF NOT EXISTS idx_flights_route ON flights(origin, destination);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_flight ON bookings(flight_id);
CREATE INDEX IF NOT EXISTS idx_passengers_booking ON passengers(booking_id);