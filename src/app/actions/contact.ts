'use server'

import { z } from 'zod'

export const runtime = 'edge'

const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export type ContactState = {
  success?: boolean
  message?: string
  errors?: {
    name?: string[]
    email?: string[]
    subject?: string[]
    message?: string[]
  }
}

export async function submitContactForm(
  prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const validatedFields = ContactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // const { name, email, subject, message } = validatedFields.data

  try {
    // Mocking an ongoing process without Supabase
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      message: 'Thank you! Your message has been sent successfully.',
    }
  } catch (err) {
    console.error('Server Error:', err)
    return {
      success: false,
      message: 'An unexpected error occurred.',
    }
  }
}
