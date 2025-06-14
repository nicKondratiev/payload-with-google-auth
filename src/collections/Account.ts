import type { CollectionConfig } from 'payload'

export const Accounts: CollectionConfig = {
  slug: 'accounts',
  indexes: [
    {
      fields: ['provider', 'providerAccountId'],
      unique: true,
    },
  ],
  fields: [
    { name: 'type', type: 'text', required: true },
    { name: 'provider', type: 'text', required: true },
    { name: 'providerAccountId', type: 'text', required: true },
    { name: 'refreshToken', type: 'text', hidden: true },
    { name: 'accessToken', type: 'text', hidden: true },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
  ],
}
