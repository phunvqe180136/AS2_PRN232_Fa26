'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  CheckSquare2,
  Tag,
  Search,
  ShieldCheck,
  User,
  LogOut,
  LogIn,
  Layers,
  Settings,
  Shield,
  FileText,
} from 'lucide-react';
import clsx from 'clsx';

const publicNavItems = [
  { name: 'Public Feed', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Departments', href: '/departments', icon: Building2 },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare2 },
  { name: 'Global Search', href: '/search', icon: Search },
];

const adminNavItems = [
  { name: 'Admin Hub', href: '/admin', icon: Settings },
  { name: 'Manage Projects', href: '/admin/projects', icon: FolderKanban },
  { name: 'Manage Depts', href: '/admin/departments', icon: Building2 },
  { name: 'Manage Tasks', href: '/admin/tasks', icon: CheckSquare2 },
  { name: 'Manage Tags', href: '/admin/tags', icon: Tag },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, token, isAdmin, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between border-r border-slate-200/80 bg-white min-h-screen p-6 select-none">
      <div className="space-y-7">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
              Task<span className="text-indigo-600">Track</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block -mt-1">
              Assignment 2 • RBAC
            </span>
          </div>
        </Link>

        {/* Public Navigation Menu */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Public View
          </div>
          {publicNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200',
                  active
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <Icon
                  className={clsx(
                    'h-4 w-4 transition-colors',
                    active ? 'text-white' : 'text-slate-400'
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Protected Admin & Management Section */}
        <div className="space-y-1 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Admin & Management
            </span>
            {user && (
              <span
                className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                  isAdmin
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isAdmin ? 'Admin' : 'Staff'}
              </span>
            )}
          </div>

          {adminNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200',
                  active
                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <Icon
                  className={clsx(
                    'h-4 w-4 transition-colors',
                    active ? 'text-indigo-600' : 'text-slate-400'
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Accounts link (Admin only) */}
          {isAdmin && (
            <Link
              href="/admin/accounts"
              className={clsx(
                'flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200',
                isActive('/admin/accounts')
                  ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200/60 shadow-sm'
                  : 'text-amber-700 hover:bg-amber-50/60'
              )}
            >
              <ShieldCheck
                className={clsx(
                  'h-4 w-4 transition-colors',
                  isActive('/admin/accounts') ? 'text-amber-700' : 'text-amber-500'
                )}
              />
              <span>Accounts (Admin)</span>
            </Link>
          )}

          {/* User Profile */}
          {user && (
            <Link
              href="/profile"
              className={clsx(
                'flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200',
                isActive('/profile')
                  ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <User
                className={clsx(
                  'h-4 w-4 transition-colors',
                  isActive('/profile') ? 'text-indigo-600' : 'text-slate-400'
                )}
              />
              <span>My Profile</span>
            </Link>
          )}
        </div>
      </div>

      {/* Bottom User Card / Session Widget */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        {user ? (
          <div className="rounded-3xl bg-slate-900 p-4 text-white shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500 font-bold text-white">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate text-white">{user.fullName}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  user.role === 1
                    ? 'bg-amber-400/20 text-amber-300'
                    : 'bg-emerald-400/20 text-emerald-300'
                }`}
              >
                {user.role === 1 ? 'Admin Role' : 'Staff Role'}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-1.5">
              <Shield className="h-4 w-4 text-indigo-200" />
              <h4 className="text-xs font-black">Authentication Required</h4>
            </div>
            <p className="text-[11px] text-indigo-100/90 leading-snug mb-3">
              Log in with an Admin or Staff account to create, edit, or delete items.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                className="py-2 rounded-xl bg-white text-indigo-700 text-center text-xs font-bold hover:bg-indigo-50 transition"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="py-2 rounded-xl bg-indigo-500/50 text-white text-center text-xs font-bold hover:bg-indigo-500/70 transition border border-white/20"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

