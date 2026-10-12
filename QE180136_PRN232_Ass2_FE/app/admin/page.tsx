'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RequireAuth, useAuth } from '@/lib/auth';
import { Stats } from '@/lib/services';
import { SummaryDto } from '@/lib/types';
import {
  Building2,
  FolderKanban,
  CheckSquare2,
  Tag,
  Users,
  Shield,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Lock,
  Layers,
} from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <RequireAuth>
      <AdminDashboardContent />
    </RequireAuth>
  );
}

function AdminDashboardContent() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<SummaryDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Stats.summary()
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to fetch summary:', err))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      title: 'Departments',
      value: stats?.totalDepartments ?? 0,
      icon: Building2,
      href: '/admin/departments',
      color: 'from-blue-600 to-indigo-600',
      bgColor: 'bg-blue-50 text-blue-700',
      description: 'Active enterprise business divisions',
    },
    {
      title: 'Projects',
      value: stats?.totalProjects ?? 0,
      icon: FolderKanban,
      href: '/admin/projects',
      color: 'from-purple-600 to-pink-600',
      bgColor: 'bg-purple-50 text-purple-700',
      description: 'Initiatives across all departments',
    },
    {
      title: 'Tasks',
      value: stats?.totalTasks ?? 0,
      icon: CheckSquare2,
      href: '/admin/tasks',
      color: 'from-emerald-600 to-teal-600',
      bgColor: 'bg-emerald-50 text-emerald-700',
      description: `${stats?.tasksDone ?? 0} completed, ${stats?.tasksInProgress ?? 0} in progress`,
    },
    {
      title: 'Tags',
      value: stats?.totalTags ?? 0,
      icon: Tag,
      href: '/admin/tags',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50 text-amber-700',
      description: 'Custom color-coded labels for tasks',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-400/20">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Assignment 2 • Authenticated Management Console</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Hello, {user?.fullName} 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              You are signed in with{' '}
              <span className={`font-bold ${isAdmin ? 'text-purple-300' : 'text-blue-300'}`}>
                {user?.roleName}
              </span>{' '}
              role privileges. All write operations (Create, Edit, Delete) across the platform are now authenticated with JWT.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/tasks"
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95"
            >
              <CheckSquare2 className="h-4 w-4" />
              <span>Manage Tasks</span>
            </Link>
            {isAdmin && (
              <Link
                href="/admin/accounts"
                className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition-all hover:scale-105 active:scale-95"
              >
                <Users className="h-4 w-4" />
                <span>Manage Accounts</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.bgColor} group-hover:scale-110 transition-transform`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  {loading ? '...' : card.value}
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                  Total {card.title}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium">
                  {card.description}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Accounts & Task Progress Split Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Management Sections Grid */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Protected Management Modules</h2>
              <p className="text-xs text-slate-400">
                Direct access to all authenticated CRUD controllers
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              JWT Protected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/admin/departments"
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-200 transition-all flex items-start gap-4"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Departments Management</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Create, edit and delete company business divisions
                </div>
              </div>
            </Link>

            <Link
              href="/admin/projects"
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-200 transition-all flex items-start gap-4"
            >
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <FolderKanban className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Projects Management</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Assign projects to departments, edit timelines &amp; statuses
                </div>
              </div>
            </Link>

            <Link
              href="/admin/tasks"
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-200 transition-all flex items-start gap-4"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckSquare2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Tasks Management</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Full CRUD with multi-tag selector, priorities and soft delete
                </div>
              </div>
            </Link>

            <Link
              href="/admin/tags"
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-200 transition-all flex items-start gap-4"
            >
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Tags Management</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Create and style tags with custom hex color palettes
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Right: Account & RBAC Privileges Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Users className="h-5 w-5 text-indigo-600" />
                <span>Accounts &amp; RBAC</span>
              </div>
              {isAdmin ? (
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  Admin Access
                </span>
              ) : (
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Staff Only
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              {isAdmin
                ? 'As an Administrator, you have full privileges to list, update roles, and safely delete system accounts.'
                : 'Staff accounts can perform write operations on Departments, Projects, Tasks, and Tags, but Account Management is restricted to Admins.'}
            </p>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total System Accounts:</span>
                <span className="font-bold text-slate-900">{stats?.totalAccounts ?? 6}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Your Role:</span>
                <span className="font-bold text-indigo-600">{user?.roleName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Account ID:</span>
                <span className="font-mono text-slate-900">#{user?.accountId}</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            {isAdmin ? (
              <Link
                href="/admin/accounts"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
              >
                <Users className="h-4 w-4" />
                <span>Open Accounts Console</span>
              </Link>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-100 text-slate-400 text-center text-xs font-semibold flex items-center justify-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                <span>Accounts Restricted (Admin Only)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
