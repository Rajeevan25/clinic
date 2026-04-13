'use server'

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Send a notification to a specific user
 */
export async function sendNotificationAction(
  userId: string,
  title: string,
  message: string,
  type: string = 'info',
  link?: string
) {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('notifications')
    .insert({
      user_id: userId,
      title: title,
      message: message,
      type: type,
      link: link,
      is_read: false
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

/**
 * Update an existing notification (Edit feature)
 */
export async function updateNotificationAction(
  notificationId: string,
  updates: {
    title?: string;
    message?: string;
    type?: string;
    link?: string;
  }
) {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('notifications')
    .update(updates)
    .eq('id', notificationId)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

/**
 * Mark a notification as read
 */
export async function markAsReadAction(notificationId: string) {
  const admin = createAdminClient() // Using admin to ensure it bypasses strict RLS if needed, or I could use client if user-initiated

  const { error } = await admin
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

/**
 * Delete a notification
 */
export async function deleteNotificationAction(notificationId: string) {
  const admin = createAdminClient()

  const { error } = await admin
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
