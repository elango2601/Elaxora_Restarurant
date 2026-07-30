import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Define the secret key
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || 'super_secret_jwt_key_here'
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('elaxora_token')?.value;
  const path = request.nextUrl.pathname;
  
  // Dashboard roots
  const isDashboard = path.startsWith('/admin') || 
                      path.startsWith('/staff') || 
                      path.startsWith('/kitchen') || 
                      path.startsWith('/delivery');
                      
  if (!isDashboard) {
    return NextResponse.next();
  }

  // 1. Unauthenticated -> Redirect to Login
  console.log(`Middleware running for path: ${path}`);
  console.log(`Cookie present: ${!!token}`);
  if (!token) {
    console.log('No token found! Redirecting to login.');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // 2. Validate token
    console.log(`Middleware trying to verify token: ${token.substring(0, 20)}...`);
    console.log(`Using Secret Key ENV: ${process.env.JWT_SECRET_KEY}`);
    const { payload } = await jwtVerify(token, SECRET_KEY);
    
    // Type casting
    const role = (payload.role as string || '').toLowerCase();
    console.log(`Token verification SUCCESS. Extracted role: ${role}`);

    // Role-based routing
    if (path.startsWith('/admin') && role !== 'admin') {
      console.log(`RBAC Failure: User is ${role} but tried to access /admin`);
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (path.startsWith('/kitchen') && role !== 'admin' && role !== 'kitchen') {
      console.log(`RBAC Failure: User is ${role} but tried to access /kitchen`);
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (path.startsWith('/staff') && role !== 'admin' && role !== 'staff') {
      console.log(`RBAC Failure: User is ${role} but tried to access /staff`);
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (path.startsWith('/delivery') && role !== 'admin' && role !== 'delivery') {
      console.log(`RBAC Failure: User is ${role} but tried to access /delivery`);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid or expired token
    console.error('Middleware JWT Error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/staff/:path*',
    '/kitchen/:path*',
    '/delivery/:path*'
  ],
};
