import { AccountAccessPage } from '../../../src/components/account/AccountAccessPage';

export const metadata = {
  title: 'Register — DLavie Account',
  description: 'Create a DLavie Account for AI, commerce, and automation products.',
};

export default function RegisterPage() {
  return <AccountAccessPage mode="register" />;
}
