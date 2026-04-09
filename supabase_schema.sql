-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Roles Enum
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'patient');

-- 2. Create Profiles Table (extends Supabase Auth users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'patient' NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Departments Table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  icon TEXT,
  services TEXT[],
  head_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Doctors Table
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  bio TEXT,
  specialization TEXT,
  availability_notes TEXT,
  image_url TEXT,
  phone TEXT,
  qualifications TEXT,
  registration_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Schedules Table
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  available_date DATE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT false,
  slot_duration_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Appointments Table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  patient_name TEXT,
  patient_phone TEXT,
  patient_email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create Medical Records Table
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  diagnosis TEXT,
  prescription TEXT,
  clinical_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROW LEVEL SECURITY (RLS) policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- 9. Create Clinic Settings Table
CREATE TABLE clinic_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1), -- Only one row allowed
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  working_hours TEXT,
  logo_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert initial default settings
INSERT INTO clinic_settings (id, name, address, phone, email, working_hours)
VALUES (1, 'Medical Centre', '123 Hospital Road, Jaffna', '+94 21 000 0000', 'info@clinic.lk', 'Mon – Sat: 8:00 AM – 6:00 PM')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view their own profile, Admins view all
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Departments: Viewable by everyone, Editable by admins
CREATE POLICY "Departments are viewable by everyone" ON departments FOR SELECT USING (true);

-- Doctors: Viewable by everyone, Editable by admins
CREATE POLICY "Doctors are viewable by everyone" ON doctors FOR SELECT USING (true);
CREATE POLICY "Admins can manage doctors" ON doctors FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Schedules: Viewable by everyone, Editable by admins/the doctor
CREATE POLICY "Schedules are viewable by everyone" ON schedules FOR SELECT USING (true);

CREATE POLICY "Users can view their own appointments" ON appointments FOR SELECT 
USING (auth.uid() = patient_id OR EXISTS (
  SELECT 1 FROM doctors WHERE doctors.id = appointments.doctor_id AND doctors.profile_id = auth.uid()
) OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update appointments" ON appointments FOR UPDATE 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete appointments" ON appointments FOR DELETE 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Function to handle new user profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'patient');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notifications: Users see their own, Admins can insert
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications" ON notifications FOR INSERT 
WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Medical Records: Doctors/Patients see their own, Admins view all
CREATE POLICY "Users can view their own medical records" ON medical_records FOR SELECT 
USING (auth.uid() = patient_id OR EXISTS (
  SELECT 1 FROM doctors WHERE doctors.id = medical_records.doctor_id AND doctors.profile_id = auth.uid()
) OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Doctors can manage medical records" ON medical_records FOR ALL 
USING (EXISTS (
  SELECT 1 FROM doctors WHERE doctors.profile_id = auth.uid() AND doctors.id = medical_records.doctor_id
));

-- Clinic Settings: Publicly viewable, editable by admins
CREATE POLICY "Clinic settings are viewable by everyone" ON clinic_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update clinic settings" ON clinic_settings FOR UPDATE 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Trigger to call high-level profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
