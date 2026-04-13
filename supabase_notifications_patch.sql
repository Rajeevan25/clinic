-- Update Notifications Table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'info';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT;

-- Update RLS Policies for Notifications

-- Allow users to update their own notification (mark as read)
CREATE POLICY "Users can update their own notifications" ON notifications 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins to update any notification (edit message)
CREATE POLICY "Admins can update any notification" ON notifications 
FOR UPDATE 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Allow admins to delete notifications
CREATE POLICY "Admins can delete notifications" ON notifications 
FOR DELETE 
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
