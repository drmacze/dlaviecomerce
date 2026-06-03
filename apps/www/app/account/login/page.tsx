import { AccountAccessPage } from '../../../src/components/account/AccountAccessPage';

export const metadata = {
  title: 'Login — DLavie Account',
  description: 'Access your DLavie Account for AI, commerce, and automation products.',
};

export default function LoginPage() {
  return <AccountAccessPage mode="login" />;
}
