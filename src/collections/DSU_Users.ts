import type { CollectionConfig } from 'payload'

export const DSU_Users: CollectionConfig = {
  slug: 'dsu-users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
