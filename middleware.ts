import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase auth cookie on every request so Server Components
// and route handlers see a live session.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getUser();

  return response;
}

// The Stripe webhook is excluded: it arrives with no cookie, and refreshing
// the session there would 307 the delivery, which Stripe reads as a failure.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|api/stripe/webhook|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
