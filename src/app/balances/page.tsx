import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClientWrapper from './client';

/**
 * Server component that fetches initial dashboard data
 * and passes it to a Client Component for real-time updates
 */
export default async function BalanceDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Handle cookie setting errors silently
          }
        },
      },
    }
  );

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Get user's business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user.id)
    .single();

  if (businessError || !business) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">No business found</h1>
          <p className="mt-2 text-gray-600">Please create a business first.</p>
        </div>
      </div>
    );
  }

  return <DashboardClientWrapper businessId={business.id} businessName={business.name} />;
}
