-- Add guest patient contact columns (for unauthenticated bookings)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_phone TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_email TEXT;

-- Add doctor name as text (for cases where doctor is not yet in doctors table)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_name TEXT;

-- Allow anyone (including unauthenticated users) to book an appointment
CREATE POLICY "Anyone can book an appointment"
  ON appointments FOR INSERT
  WITH CHECK (true);
