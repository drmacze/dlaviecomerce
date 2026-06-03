import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AccountAccessPage } from '../../../src/components/account/AccountAccessPage';
import { DLAVIE_ACCESS_COOKIE } from '../../../src/lib/supabase/session';

export const metadata = {
  title: 'Register — DLavie Account',
  description: 'Create a DLavie Account for AI, commerce, and automation products.',
};

export default async function RegisterPage() {
  const cookieStore = await cookies();

  if (cookieStore.has(DLAVIE_ACCESS_COOKIE)) {
    redirect('/account/dashboard');
  }

  return <AccountAccessPage mode="register" />;
}
