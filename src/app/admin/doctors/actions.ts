'use server'

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Server Action to create a doctor account and profile.
 * Since this uses the admin client, it must be secure.
 */
export async function createDoctorAction(formData: {
  fullName: string
  email: string
  password: string
  phone: string
  departmentId: string
  specialization: string
  bio: string
  imageUrl?: string
}) {
  const admin = createAdminClient()

  // 1. Create the Auth User (Immediate Confirmation)
  const { data: userData, error: authError } = await admin.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true, // Immediate login allowed
    user_metadata: {
      full_name: formData.fullName,
      role: 'doctor' // metadata used by triggers usually
    }
  })

  if (authError) {
    // 1.1 Check if the user already exists
    if (authError.message.includes('already been registered')) {
      const { data: users, error: listError } = await admin.auth.admin.listUsers()
      if (listError) return { success: false, error: listError.message }
      
      const existingUser = users.users.find(u => u.email === formData.email)
      if (!existingUser) return { success: false, error: 'User lookup failed' }
      
      // Use the existing user ID
      return await completeDoctorSetup(admin, existingUser.id, formData)
    }
    return { success: false, error: authError.message }
  }

  return await completeDoctorSetup(admin, userData.user.id, formData)
}

/**
 * Helper to finalize profile and doctor entry
 */
async function completeDoctorSetup(admin: any, userId: string, formData: any) {
  // 2. Update Profile Role
  const { error: profileError } = await admin
    .from('profiles')
    .update({ 
      role: 'doctor',
      full_name: formData.fullName 
    })
    .eq('id', userId)

  if (profileError) return { success: false, error: profileError.message }

  // 3. Upsert Doctor Entry (Insert or Update if exists)
  const { error: doctorError } = await admin
    .from('doctors')
    .upsert({
      profile_id: userId,
      department_id: formData.departmentId,
      specialization: formData.specialization,
      bio: formData.bio,
      phone: formData.phone,
      image_url: formData.imageUrl || null,
      is_active: true
    }, { onConflict: 'profile_id' })

  if (doctorError) return { success: false, error: doctorError.message }

  return { success: true }
}

/**
 * Server Action to update a doctor.
 */
export async function updateDoctorAction(id: string, formData: any) {
  const admin = createAdminClient()

  // 1. Update Profile (Name and Role)
  // First get the profile_id
  const { data: doctor, error: getError } = await admin
    .from('doctors')
    .select('profile_id')
    .eq('id', id)
    .single()

  if (getError) return { success: false, error: getError.message }

  const { error: profileError } = await admin
    .from('profiles')
    .update({ 
      full_name: formData.fullName,
      role: 'doctor' 
    })
    .eq('id', doctor.profile_id)

  if (profileError) return { success: false, error: profileError.message }

  // 2. Update Doctor Entry
  const { error: doctorError } = await admin
    .from('doctors')
    .update({
      department_id: formData.departmentId,
      specialization: formData.specialization,
      bio: formData.bio,
      phone: formData.phone,
      image_url: formData.imageUrl || null,
      is_active: formData.isActive
    })
    .eq('id', id)

  if (doctorError) return { success: false, error: doctorError.message }

  return { success: true }
}

/**
 * Server Action to delete a doctor and their auth account.
 */
export async function deleteDoctorAction(id: string) {
  const admin = createAdminClient()

  // 1. Get profile_id before deletion
  const { data: doctor, error: getError } = await admin
    .from('doctors')
    .select('profile_id')
    .eq('id', id)
    .single()

  if (getError) return { success: false, error: getError.message }

  // 2. Delete the Auth User (This will cascade to profiles and doctors if ON DELETE CASCADE is set)
  // Note: profiles and doctors have ON DELETE CASCADE usually.
  const { error: deleteError } = await admin.auth.admin.deleteUser(doctor.profile_id)

  if (deleteError) return { success: false, error: deleteError.message }

  return { success: true }
}
