import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/',
  '/dashboard(.*)',
  '/api/data(.*)',
  '/api/gemini(.*)'
]);

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/unauthorized',
  '/api/test-data(.*)'
]);

export default clerkMiddleware((auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // For protected routes, check authentication
  if (isProtectedRoute(req)) {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // Double-check email domain restriction
    try {
      const { user } = auth();
      if (user?.emailAddresses?.[0]?.emailAddress) {
        const email = user.emailAddresses[0].emailAddress;
        if (!email.endsWith('@aot.edu.in')) {
          console.log(`🚫 Unauthorized access attempt: ${email}`);
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        } else {
          console.log(`✅ Authorized access: ${email}`);
        }
      }
    } catch (error) {
      console.error('Error checking user email:', error);
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
