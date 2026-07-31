import type { ReactNode } from 'react';
import { AdminShell } from '../../../src/components/admin/AdminShell';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
