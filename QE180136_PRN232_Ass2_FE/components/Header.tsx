'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  User,
  LogOut,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Layers,
  FolderKanban,
  Building2,
  CheckSquare2,
  Tag,
  Users,
} from 'lucide-react';

export function Header() {
  const router = useRouter();
  const { user, token, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 py-4">
      {/* Left: Greeting & Page Subtitle */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden rounded-xl p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            {user ? `Hello, ${user.fullName.split(' ')[0]} 👋` : 'Welcome to TaskTrack 👋'}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400">
            {user
              ? `Signed in as ${user.role === 1 ? 'Administrator' : 'Staff Member'}`
              : 'Sign in to access management tools & protected APIs'}
          </p>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <form onSubmit={handleSearch} className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
            placeholder="Search tasks, projects, departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Right: User State or Login/Register */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* Quick Admin Hub Link */}
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Admin Hub</span>
            </Link>

            {/* User Profile Pill & Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-100 transition-colors text-left"
              >
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-sm shadow-md shadow-indigo-500/20">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white ${
                      user.role === 1 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                </div>

                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {user.fullName}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 leading-tight">
                    <span>{user.role === 1 ? 'Administrator' : 'Staff'}</span>
                  </div>
                </div>
                <ChevronDown className="hidden sm:block h-4 w-4 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-100 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <span
                      className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        user.role === 1
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {user.role === 1 ? 'Admin' : 'Staff'}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      <LayoutDashboard className="h-4 w-4 text-indigo-600" />
                      Admin Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                      <User className="h-4 w-4 text-indigo-600" />
                      User Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin/accounts"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                      >
                        <ShieldCheck className="h-4 w-4 text-amber-600" />
                        Account Control
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all"
            >
              <UserPlus className="h-4 w-4" />
              <span>Register</span>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[73px] bottom-0 z-50 bg-white p-6 shadow-2xl space-y-6 overflow-y-auto animate-in slide-in-from-top-4">
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase text-slate-400 px-2">Navigation</div>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-sm font-semibold"
            >
              <Layers className="h-5 w-5 text-indigo-600" />
              <span>Public Dashboard</span>
            </Link>
            <Link
              href="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-sm font-semibold"
            >
              <FolderKanban className="h-5 w-5 text-indigo-600" />
              <span>Projects</span>
            </Link>
            <Link
              href="/departments"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-sm font-semibold"
            >
              <Building2 className="h-5 w-5 text-indigo-600" />
              <span>Departments</span>
            </Link>
            <Link
              href="/tasks"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-sm font-semibold"
            >
              <CheckSquare2 className="h-5 w-5 text-indigo-600" />
              <span>Tasks</span>
            </Link>
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-sm font-semibold"
            >
              <Search className="h-5 w-5 text-indigo-600" />
              <span>Search</span>
            </Link>
          </div>

          {user ? (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="text-xs font-bold uppercase text-slate-400 px-2">Admin & Management</div>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-bold"
              >
                <LayoutDashboard className="h-5 w-5 text-indigo-600" />
                <span>Admin Hub</span>
              </Link>
              <Link
                href="/admin/projects"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 text-sm text-slate-700 font-medium"
              >
                Manage Projects
              </Link>
              <Link
                href="/admin/departments"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 text-sm text-slate-700 font-medium"
              >
                Manage Departments
              </Link>
              <Link
                href="/admin/tasks"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 text-sm text-slate-700 font-medium"
              >
                Manage Tasks
              </Link>
              <Link
                href="/admin/tags"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 text-sm text-slate-700 font-medium"
              >
                Manage Tags
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/accounts"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-2 text-sm font-bold text-amber-700"
                >
                  Manage System Accounts (Admin)
                </Link>
              )}
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 text-sm text-slate-700 font-medium"
              >
                User Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left p-2 text-sm font-bold text-rose-600"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center font-bold text-sm bg-indigo-50 text-indigo-700 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center font-bold text-sm bg-indigo-600 text-white rounded-xl"
              >
                Register New Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

