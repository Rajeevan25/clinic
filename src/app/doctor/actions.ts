'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Get current doctor profile from auth
 */
export async function getCurrentDoctor() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: doctor } = await supabase
    .from('doctors')
    .select('*, profiles(full_name)')
    .eq('profile_id', user.id)
    .single()
  
  return doctor
}

/**
 * Fetch medical records for a specific patient
 */
export async function getPatientMedicalHistory(patientId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('medical_records')
    .select(`
      *,
      doctor:doctors(
        profiles(full_name)
      ),
      appointment:appointments(appointment_date, start_time)
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
  
  if (error) return []
  return data
}

/**
 * Create a new medical record (consultation note)
 */
export async function createMedicalRecordAction(formData: {
  appointmentId: string
  patientId: string
  doctorId: string
  diagnosis: string
  prescription: string
  clinicalNotes: string
}) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('medical_records')
    .insert({
      appointment_id: formData.appointmentId,
      patient_id: formData.patientId,
      doctor_id: formData.doctorId,
      diagnosis: formData.diagnosis,
      prescription: formData.prescription,
      clinical_notes: formData.clinicalNotes
    })

  if (error) return { success: false, error: error.message }

  // Automatically mark appointment as completed when a record is created
  await supabase
    .from('appointments')
    .update({ status: 'completed' })
    .eq('id', formData.appointmentId)

  revalidatePath('/doctor')
  revalidatePath('/doctor/appointments')
  return { success: true }
}

/**
 * Manage Availability Slots
 */
export async function addAvailabilitySlotAction(formData: {
  doctorId: string
  availableDate: string
  startTime: string
  endTime: string
}) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('schedules')
    .insert({
      doctor_id: formData.doctorId,
      available_date: formData.availableDate,
      start_time: formData.startTime,
      end_time: formData.endTime
    })

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/doctor/availability')
  return { success: true }
}

/**
 * Copy slots from one day to the next day
 */
export async function copySlotsToNextDayAction(doctorId: string, sourceDate: string) {
  const supabase = await createClient()
  
  // 1. Get source slots
  const { data: sourceSlots } = await supabase
    .from('schedules')
    .select('*')
    .eq('doctor_id', doctorId)
    .eq('available_date', sourceDate)

  if (!sourceSlots || sourceSlots.length === 0) {
    return { success: false, error: 'No slots found to copy' }
  }

  // 2. Calculate target date (next day)
  const date = new Date(sourceDate)
  date.setDate(date.getDate() + 1)
  const targetDate = date.toISOString().split('T')[0]

  // 3. Prepare new slots
  const newSlots = sourceSlots.map((s: any) => ({
    doctor_id: doctorId,
    available_date: targetDate,
    start_time: s.start_time,
    end_time: s.end_time
  }))

  const { error } = await supabase.from('schedules').insert(newSlots)
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/doctor/availability')
  return { success: true }
}

/**
 * Delete an availability slot
 */
export async function deleteSlotAction(slotId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('schedules').delete().eq('id', slotId)
  
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/doctor/availability')
  return { success: true }
}
