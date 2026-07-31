import { Suspense } from 'react';
import { AdminLogin } from '../../../src/components/admin/AdminLogin';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<main className="admin-auth-state"><span className="admin-loader" /><p>Memuat login…</p></main>}>
      <AdminLogin />
    </Suspense>
  );
}
