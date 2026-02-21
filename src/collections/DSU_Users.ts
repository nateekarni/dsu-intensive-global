import type { CollectionConfig } from 'payload'

export const DSU_Users: CollectionConfig = {
  slug: 'dsu-users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    // Only admins can see all users; students can only see their own profile
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { id: { equals: user.id } }
    },
    // Anyone can register (based on your setup), but we can restrict creation in Payload UI to admins
    create: () => true,
    // Users can update their own profile; admins can update anyone
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { id: { equals: user.id } }
    },
    // Only admins can delete users
    delete: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin'
    },
    // Only admins can access the Payload admin UI
    admin: ({ req: { user } }) => {
       if (!user) return false
       return user.role === 'admin'
    }
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Student', value: 'student' },
      ],
      defaultValue: 'student',
      required: true,
      saveToJWT: true,
      access: {
        // Only admins can manually change a user's role
        update: ({ req: { user } }) => {
          if (!user) return false
          return user.role === 'admin'
        },
      },
    }
  ],
}
