'use client';
import { RequireAuth } from '@/lib/auth';
import ManageDepartmentsPage from '@/app/departments/manage/page';

export default function AdminDepartmentsPage() {
  return (
    <RequireAuth>
      <ManageDepartmentsPage />
    </RequireAuth>
  );
}
