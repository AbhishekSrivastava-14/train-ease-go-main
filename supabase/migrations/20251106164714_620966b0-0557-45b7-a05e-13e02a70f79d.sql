-- Create trains table
CREATE TABLE public.trains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  train_number TEXT NOT NULL UNIQUE,
  train_name TEXT NOT NULL,
  from_station TEXT NOT NULL,
  to_station TEXT NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  total_seats INTEGER NOT NULL DEFAULT 100,
  available_seats INTEGER NOT NULL DEFAULT 100,
  price_per_seat DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  train_id UUID REFERENCES public.trains(id) ON DELETE CASCADE NOT NULL,
  passenger_name TEXT NOT NULL,
  passenger_age INTEGER NOT NULL,
  passenger_email TEXT NOT NULL,
  seat_number TEXT NOT NULL,
  journey_date DATE NOT NULL,
  booking_status TEXT NOT NULL DEFAULT 'confirmed',
  total_amount DECIMAL(10,2) NOT NULL,
  booking_reference TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Trains policies (public read access)
CREATE POLICY "Anyone can view trains"
  ON public.trains FOR SELECT
  USING (true);

-- Bookings policies (users can only see their own bookings)
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert sample train data
INSERT INTO public.trains (train_number, train_name, from_station, to_station, departure_time, arrival_time, total_seats, available_seats, price_per_seat) VALUES
('12301', 'Rajdhani Express', 'New Delhi', 'Mumbai Central', '16:55:00', '08:35:00', 100, 100, 1500.00),
('12302', 'Rajdhani Express', 'Mumbai Central', 'New Delhi', '16:25:00', '08:35:00', 100, 100, 1500.00),
('12951', 'Mumbai Rajdhani', 'New Delhi', 'Mumbai Central', '16:35:00', '08:15:00', 100, 100, 1450.00),
('12501', 'Poorva Express', 'New Delhi', 'Howrah', '15:50:00', '10:05:00', 100, 100, 1200.00),
('12909', 'Maharashtra Express', 'Mumbai CST', 'Nizamuddin', '17:35:00', '11:20:00', 100, 100, 1100.00),
('12869', 'Csmt Hazrat Nizamuddin Duronto', 'Mumbai CST', 'Hazrat Nizamuddin', '19:35:00', '08:45:00', 100, 100, 1350.00),
('12809', 'Howrah Mail', 'Mumbai CST', 'Howrah', '20:05:00', '05:25:00', 100, 100, 1250.00),
('12953', 'August Kranti Rajdhani', 'Mumbai Central', 'Hazrat Nizamuddin', '17:05:00', '08:35:00', 100, 100, 1550.00),
('12217', 'Sampoorna Kranti Express', 'Chandigarh', 'Mumbai Central', '22:30:00', '01:10:00', 100, 100, 1000.00),
('12223', 'Rajdhani Express', 'Howrah', 'New Delhi', '16:50:00', '09:55:00', 100, 100, 1400.00);

-- Function to update available seats after booking
CREATE OR REPLACE FUNCTION update_train_seats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.trains
    SET available_seats = available_seats - 1
    WHERE id = NEW.train_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.trains
    SET available_seats = available_seats + 1
    WHERE id = OLD.train_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to automatically update available seats
CREATE TRIGGER update_seats_after_booking
  AFTER INSERT OR DELETE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_train_seats();