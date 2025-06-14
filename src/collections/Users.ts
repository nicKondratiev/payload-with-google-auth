import type { CollectionConfig } from 'payload'
import { auth, signOut } from '@/auth'

interface CustomUser {
  id: string
  name?: string | null
  image?: string | null
  email?: string | null
  emailVerified?: string | null
  role?: 'admin' | 'editor'
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    create: ({ req }) => req.user?.role === 'admin',
    read: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req, id }) => {
      const isAdmin = req.user?.role === 'admin'
      const isSelf = req.user?.id === id
      return isAdmin && !isSelf
    },
  },
  hooks: {
    beforeChange: [
      ({ req, data, originalDoc }) => {
        if (
          originalDoc?.id === req.user?.id &&
          originalDoc.role === 'admin' &&
          data.role &&
          data.role !== 'admin'
        ) {
          throw new Error('Admins cannot demote themselves.')
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        if (req.user?.id === id) {
          throw new Error('Admins cannot delete themselves.')
        }

        const accounts = await req.payload.find({
          collection: 'accounts',
          where: {
            user: {
              equals: id,
            },
          },
        })

        for (const account of accounts.docs) {
          await req.payload.delete({
            collection: 'accounts',
            id: account.id,
          })
        }
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', admin: { width: '50%' } },
        {
          name: 'role',
          admin: { width: '50%' },
          type: 'select',
          options: [
            {
              label: 'Admin',
              value: 'admin',
            },
            {
              label: 'Editor',
              value: 'editor',
            },
          ],
          defaultValue: 'editor',
          access: {
            update: ({ req, data, siblingData, id }) => {
              const isAdmin = req.user?.role === 'admin'
              const isSelf = req.user?.id === id
              return isAdmin && !isSelf
            },
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', admin: { width: '50%' } },
        { name: 'image', type: 'text', admin: { width: '50%' } },
        {
          name: 'emailVerified',
          type: 'date',
          hidden: true,
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'accounts',
      type: 'join',
      collection: 'accounts',
      on: 'user',
    },
  ],
  endpoints: [
    {
      path: '/logout',
      method: 'post',
      handler: async () => {
        await signOut({ redirect: false })
        return Response.json({
          message: 'You have been logged out successfully.',
        })
      },
    },
  ],
  auth: {
    disableLocalStrategy: true,
    strategies: [
      {
        name: 'authjs',
        authenticate: async ({ payload }) => {
          const session = await auth()
          if (!session || !session?.user?.id) {
            return { user: null }
          }

          const user = await payload.findByID({
            collection: 'users',
            id: Number(session.user.id),
            disableErrors: true,
          })

          if (!user) {
            return { user: null }
          }

          const safeUser = {
            ...user,
            collection: 'users',
            email: user?.email ?? undefined,
            name: user?.name ?? undefined,
            image: user?.image ?? undefined,
            emailVerified: user?.emailVerified ?? undefined,
          }

          return { user: safeUser }
        },
      },
    ],
  },
}
