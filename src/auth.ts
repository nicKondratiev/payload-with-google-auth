import NextAuth from 'next-auth'
import { PayloadAuthAdapter } from './auth/payloadAuthAdapter'
import Google from 'next-auth/providers/google'
import { getPayload } from 'payload'
import payloadConfig from './payload.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PayloadAuthAdapter(),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid profile email https://www.googleapis.com/auth/userinfo.profile',
        },
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, token }) {
      return { ...session, user: { ...session.user, id: token.sub } }
    },
    async signIn({ user, account, profile }) {
      const payload = await getPayload({ config: payloadConfig })
      console.log('SignIn - User:', user)
      console.log('SignIn - Account:', account)
      console.log('SignIn - Profile:', profile)

      const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) || []
      const editorEmails = process.env.EDITOR_EMAILS?.split(',').map((e) => e.trim()) || []

      // Check if the user exists in Payload
      const existingUser = await payload
        .find({
          collection: 'users',
          where: { email: { equals: user.email } },
        })
        .then((res) => res.docs[0])

      if (existingUser) {
        // Check if the Google account is already linked
        const existingAccount = await payload.find({
          collection: 'accounts',
          where: {
            provider: { equals: account?.provider },
            providerAccountId: { equals: account?.providerAccountId },
            user: { equals: String(existingUser.id) }, // Ensure string ID
          },
        })

        if (existingAccount.docs.length === 0 && account) {
          // Link the Google account to the existing user
          await payload.create({
            collection: 'accounts',
            data: {
              user: Number(existingUser.id), // Ensure string ID
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              type: account.type,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
            },
          })
        }

        // Update user details if necessary
        const updates: any = {}
        if (profile?.name && (!existingUser.name || existingUser.name !== profile.name)) {
          updates.name = profile.name
        }
        if (profile?.picture && (!existingUser.image || existingUser.image !== profile.picture)) {
          updates.image = profile.picture
        }
        if (Object.keys(updates).length > 0) {
          await payload.update({
            collection: 'users',
            id: String(existingUser.id), // Ensure string ID
            data: updates,
          })
        }
        return true
      }

      // For new users, restrict to admin/editor emails
      if (
        !user.email ||
        (!adminEmails.includes(user.email) && !editorEmails.includes(user.email))
      ) {
        console.log('SignIn - Unauthorized email:', user.email)
        return '/signin?error=UnauthorizedEmail'
      }

      // Create new user if authorized
      const newUser = await payload.create({
        collection: 'users',
        data: {
          email: user.email,
          role: adminEmails.includes(user.email) ? 'admin' : 'editor',
        },
      })
      const updates: any = {}
      if (profile?.name) updates.name = profile.name
      if (profile?.picture) updates.image = profile.picture
      if (Object.keys(updates).length > 0) {
        await payload.update({
          collection: 'users',
          id: String(newUser.id), // Ensure string ID
          data: updates,
        })
      }

      // Link the Google account to the new user
      if (account) {
        await payload.create({
          collection: 'accounts',
          data: {
            user: Number(newUser.id), // Ensure string ID
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            type: account.type,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
          },
        })
      }

      return true
    },
  },
})

// import NextAuth from 'next-auth'
// import { PayloadAuthAdapter } from './auth/payloadAuthAdapter'
// import Google from 'next-auth/providers/google'
// import { getPayload } from 'payload'
// import payloadConfig from './payload.config'

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   adapter: PayloadAuthAdapter(),
//   providers: [
//     Google({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       authorization: {
//         params: {
//           scope: 'openid profile email https://www.googleapis.com/auth/userinfo.profile',
//         },
//       },
//     }),
//   ],
//   session: { strategy: 'jwt' },
//   callbacks: {
//     async session({ session, token }) {
//       return { ...session, user: { ...session.user, id: token.sub } }
//     },
//     async signIn({ user, account, profile }) {
//       const payload = await getPayload({ config: payloadConfig }) // Initialize Payload client

//       const adminEmails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) || []
//       const editorEmails = process.env.EDITOR_EMAILS?.split(',').map((e) => e.trim()) || []

//       // Check if the user exists in Payload (admin-created or otherwise)
//       const existingUser = await payload
//         .find({
//           collection: 'users',
//           where: { email: { equals: user.email } },
//         })
//         .then((res) => res.docs[0])

//       if (existingUser) {
//         // User exists (admin-created or previously signed in), allow sign-in
//         const updates: any = {}
//         if (profile?.name && (!existingUser.name || existingUser.name !== profile.name)) {
//           updates.name = profile.name
//         }
//         if (profile?.picture && (!existingUser.image || existingUser.image !== profile.picture)) {
//           updates.image = profile.picture
//         }
//         if (Object.keys(updates).length > 0) {
//           await payload.update({
//             collection: 'users',
//             id: existingUser.id,
//             data: updates,
//           })
//         }
//         return true
//       }

//       // For new users, restrict to admin/editor emails
//       if (
//         !user.email ||
//         (!adminEmails.includes(user.email) && !editorEmails.includes(user.email))
//       ) {
//         return '/signin?error=UnauthorizedEmail'
//       }

//       // Create new user if authorized
//       const newUser = await payload.create({
//         collection: 'users',
//         data: {
//           email: user.email,
//           role: adminEmails.includes(user.email) ? 'admin' : 'editor',
//         },
//       })
//       const updates: any = {}
//       if (profile?.name) updates.name = profile.name
//       if (profile?.picture) updates.image = profile.picture
//       if (Object.keys(updates).length > 0) {
//         await payload.update({
//           collection: 'users',
//           id: newUser.id,
//           data: updates,
//         })
//       }

//       return true
//     },
//   },
// })

// import NextAuth from 'next-auth'
// import { PayloadAuthAdapter } from './auth/payloadAuthAdapter'
// import Google from 'next-auth/providers/google'

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   adapter: PayloadAuthAdapter(),
//   providers: [
//     Google({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
//   session: { strategy: 'jwt' },
//   callbacks: {
//     async session({ session, token }) {
//       return { ...session, user: { ...session.user, id: token.sub } }
//     },
//   },
//   pages: {
//     error: 'admin/signin',
//   },
// })
