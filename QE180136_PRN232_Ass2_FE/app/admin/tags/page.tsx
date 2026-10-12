'use client';
import { RequireAuth } from '@/lib/auth';
import ManageTagsPage from '@/app/tags/manage/page';

export default function AdminTagsPage() {
  return (
    <RequireAuth>
      <ManageTagsPage />
    </RequireAuth>
  );
}
