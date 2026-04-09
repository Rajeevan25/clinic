'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function registerPatientAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  if (!email || !password || !fullName) {
    return { error: 'Missing required fields' }
  }

  const supabaseAdmin = createAdminClient()

  // 1. Create user with auto-confirmation
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // This is the secret sauce for auto-confirm
    user_metadata: {
      full_name: fullName
    }
  })

  if (error) {
    console.error('Registration Error:', error.message)
    return { error: error.message }
  }

  return { success: true, user: data.user }
}
