'use client';
import { RequireAuth } from '@/lib/auth';
import ManageProjectsPage from '@/app/projects/manage/page';

export default function AdminProjectsPage() {
  return (
    <RequireAuth>
      <ManageProjectsPage />
    </RequireAuth>
  );
}
