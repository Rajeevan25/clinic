'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Update the global clinic settings (Admin only)
 */
export async function updateClinicSettingsAction(data: {
  name: string
  address: string
  phone: string
  email: string
  working_hours: string
}) {
  const supabase = await createClient()

  // Verify Admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('clinic_settings')
    .update({
      name: data.name,
      address: data.address,
      phone: data.phone,
      email: data.email,
      working_hours: data.working_hours,
      updated_at: new Date().toISOString()
    })
    .eq('id', 1)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/settings')
  return { success: true }
}

/**
 * Update the user's personal profile info
 */
export async function updateProfileAction(data: {
  fullName: string
  phone: string
  address?: string
  dateOfBirth?: string
  gender?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.fullName,
      phone: data.phone,
      address: data.address,
      date_of_birth: data.dateOfBirth,
      gender: data.gender
    })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/settings')
  revalidatePath('/doctor/settings')
  return { success: true }
}

/**
 * Update the doctor's professional details
 */
export async function updateDoctorProfessionalAction(data: {
  doctorId: string
  specialization: string
  bio: string
  qualifications: string
  registrationNumber: string
}) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('doctors')
    .update({
      specialization: data.specialization,
      bio: data.bio,
      qualifications: data.qualifications,
      registration_number: data.registrationNumber
    })
    .eq('id', data.doctorId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/doctor/settings')
  return { success: true }
}

/**
 * Update User Password
 */
export async function updatePasswordAction(data: {
  password: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: data.password
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}
