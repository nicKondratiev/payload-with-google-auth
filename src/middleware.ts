import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'

const { auth } = NextAuth({ providers: [], session: { strategy: 'jwt' } })

export default auth((req) => {
  const url = req.nextUrl

  if (url.pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin/signin', req.url))
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
