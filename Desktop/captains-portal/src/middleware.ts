// src/middleware.ts
// Next.js middleware — protects /admin/dashboard/* routes
// Any unauthenticated request gets redirected to /admin

import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/admin',
  },
})

export const config = {
  // Only protect the dashboard — /admin (login) stays public
  matcher: ['/admin/dashboard/:path*'],
}
