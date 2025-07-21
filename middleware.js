import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that should always be accessible
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)', 
  '/unauthorized',
  '/auth-callback',
  '/auth-debug',
  '/auth-status', 
  '/auth-test',
  '/debug-auth',
  '/simple-sign-in',
  '/api/webhooks/(.*)',
]);

export default clerkMiddleware((auth, req) => {
  const { pathname } = req.nextUrl;
  
  console.log(`🛡️ Middleware: ${pathname}`);
  
  // Always allow public routes without any checks
  if (isPublicRoute(req)) {
    console.log(`🔓 Public route: ${pathname} - ALLOWED`);
    return;
  }
  
  // For all other routes, just log and continue
  // Let the page components handle authentication checks
  console.log(`🔄 Processing route: ${pathname} - CONTINUING TO PAGE`);
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
