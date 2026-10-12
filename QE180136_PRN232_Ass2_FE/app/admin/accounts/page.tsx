'use client';
import { useState, useEffect } from 'react';
import { RequireAuth, useAuth } from '@/lib/auth';
import { Accounts } from '@/lib/services';
import { AccountDto } from '@/lib/types';
import { useToast } from '@/components/Toast';
import { Modal } from '@/components/Modal';
import { getErrorMessage } from '@/lib/api';
import {
  Users,
  Shield,
  ShieldCheck,
  User,
  Edit2,
  Trash2,
  Calendar,
  ListTodo,
  AlertTriangle,
  Mail,
  CheckCircle2,
} from 'lucide-react';

export default function AdminAccountsPage() {
  return (
    <RequireAuth adminOnly={true}>
      <AccountsContent />
    </RequireAuth>
  );
}

function AccountsContent() {
  const { user } = useAuth();
  const toast = useToast();

  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountDto | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editRole, setEditRole] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState<AccountDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await Accounts.list();
      setAccounts(data);
    } catch (err) {
      toast.push('error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (acc: AccountDto) => {
    setEditingAccount(acc);
    setEditFullName(acc.fullName);
    setEditRole(acc.role);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    if (!editFullName.trim()) {
      toast.push('error', 'Full Name is required.');
      return;
    }

    setSaving(true);
    try {
      const updated = await Accounts.update(editingAccount.accountId, {
        fullName: editFullName.trim(),
        role: editRole,
      });

      setAccounts((prev) =>
        prev.map((a) => (a.accountId === updated.accountId ? updated : a))
      );
      toast.push('success', `Account #${updated.accountId} updated successfully!`);
      setEditModalOpen(false);
    } catch (err) {
      toast.push('error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (acc: AccountDto) => {
    setDeletingAccount(acc);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAccount) return;

    setDeleting(true);
    try {
      await Accounts.remove(deletingAccount.accountId);
      setAccounts((prev) => prev.filter((a) => a.accountId !== deletingAccount.accountId));
      toast.push('success', 'Account deleted successfully!');
      setDeleteModalOpen(false);
    } catch (err) {
      toast.push('error', getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-800 text-[11px] font-extrabold uppercase px-2.5 py-0.5 tracking-wider">
              <ShieldCheck className="h-3 w-3" />
              Admin Only
            </span>
            <span className="text-xs font-bold text-slate-400">RBAC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            System Accounts Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage user accounts, assign roles (Admin / Staff), and review audit history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-700">
            Total Accounts: <span className="text-purple-600 font-extrabold">{accounts.length}</span>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="rounded-3xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm font-medium">
            No accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Created Tasks</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc) => {
                  const isCurrent = user?.accountId === acc.accountId;
                  return (
                    <tr
                      key={acc.accountId}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">
                        #{acc.accountId}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                            {acc.fullName ? acc.fullName[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              {acc.fullName}
                              {isCurrent && (
                                <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600 text-xs">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {acc.email}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                            acc.role === 1
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          <Shield className="h-3 w-3" />
                          {acc.roleName}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                            acc.createdTasksCount > 0 ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        >
                          <ListTodo className="h-3.5 w-3.5" />
                          {acc.createdTasksCount} tasks
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500">
                        {acc.createdDate ? new Date(acc.createdDate).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(acc)}
                            className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Role / Name"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(acc)}
                            disabled={isCurrent}
                            className={`p-2 rounded-xl transition-colors ${
                              isCurrent
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={isCurrent ? 'Cannot delete current account' : 'Delete Account'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Account Modal */}
      {editingAccount && (
        <Modal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Edit Account #${editingAccount.accountId}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Role Assignment
              </label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value={0}>Staff (Role 0) — Standard Write Permissions</option>
                <option value={1}>Admin (Role 1) — Full System &amp; Account Control</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-70"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAccount && (
        <Modal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Confirm Delete Account"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed">
              Are you sure you want to delete the account for{' '}
              <span className="font-bold text-slate-900">{deletingAccount.fullName}</span> (
              {deletingAccount.email})?
            </p>

            {deletingAccount.createdTasksCount > 0 ? (
              <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800">
                    Warning: User has created {deletingAccount.createdTasksCount} tasks!
                  </p>
                  <p className="text-amber-700 mt-0.5">
                    Per Assignment 2 requirements, deletion will be rejected with HTTP 400 because this user has created active tasks in the system.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200 text-slate-600 text-xs">
                This account has 0 created tasks and is safe to be deleted.
              </div>
            )}

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm disabled:opacity-70"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
