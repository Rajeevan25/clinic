'use server'

import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Server Action to update appointment status and notify the patient.
 */
export async function updateAppointmentStatusAction(
  appointmentId: string, 
  newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed',
  patientId: string,
  doctorName: string,
  appointmentDate: string
) {
  const admin = createAdminClient()

  // 1. Update the appointment status
  const { error: updateError } = await admin
    .from('appointments')
    .update({ status: newStatus })
    .eq('id', appointmentId)

  if (updateError) return { success: false, error: updateError.message }

  // 2. Create a notification for the patient
  let message = ''
  if (newStatus === 'confirmed') {
    message = `Your appointment with ${doctorName} on ${appointmentDate} has been confirmed.`
  } else if (newStatus === 'cancelled') {
    message = `Your appointment with ${doctorName} on ${appointmentDate} has been cancelled.`
  } else if (newStatus === 'completed') {
    message = `Your appointment with ${doctorName} has been marked as completed. We hope you have a great day!`
  } else {
    // For 'pending', maybe no notification or a different one
    return { success: true }
  }

  const { error: notifyError } = await admin
    .from('notifications')
    .insert({
      user_id: patientId,
      message: message,
      is_read: false
    })

  if (notifyError) {
    console.error('Failed to create notification:', notifyError)
    // We don't fail the whole action just because notification failed
  }

  return { success: true }
}

/**
 * Server Action for Admins to create an appointment (Walk-ins)
 */
export async function createAdministrativeAppointmentAction(formData: {
  patientId?: string | null
  patientName: string
  patientPhone: string
  patientEmail?: string
  doctorId: string
  departmentId: string
  appointmentDate: string
  startTime: string
  status: 'confirmed' | 'pending'
  notes?: string
}) {
  const admin = createAdminClient()

  const { error } = await admin.from('appointments').insert({
    patient_id: formData.patientId || null,
    patient_name: formData.patientName,
    patient_phone: formData.patientPhone,
    patient_email: formData.patientEmail || null,
    doctor_id: formData.doctorId,
    department_id: formData.departmentId,
    appointment_date: formData.appointmentDate,
    start_time: formData.startTime,
    status: formData.status,
    notes: formData.notes
  })

  if (error) return { success: false, error: error.message }

  return { success: true }
}

/**
 * Server Action to delete an appointment.
 */
export async function deleteAppointmentAction(id: string) {
  const admin = createAdminClient()

  const { error } = await admin
    .from('appointments')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  return { success: true }
}
