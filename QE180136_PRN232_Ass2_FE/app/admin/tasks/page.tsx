'use client';
import { RequireAuth } from '@/lib/auth';
import ManageTasksPage from '@/app/tasks/manage/page';

export default function AdminTasksPage() {
  return (
    <RequireAuth>
      <ManageTasksPage />
    </RequireAuth>
  );
}
