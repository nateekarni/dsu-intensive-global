import type { CollectionConfig } from 'payload'

export const DSU_Media: CollectionConfig = {
  slug: 'dsu-media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
