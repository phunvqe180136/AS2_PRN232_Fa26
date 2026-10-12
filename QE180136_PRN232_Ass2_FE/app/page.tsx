'use client';
import Link from 'next/link';
import { Projects, Tasks, Stats, Departments } from '@/lib/services';
import { useAsync } from '@/lib/useAsync';
import { Spinner, EmptyState, SkeletonCards } from '@/components/States';
import { StatusBadge, TaskStatusBadge, PriorityBadge, TagBadge } from '@/components/Badges';
import {
  FolderKanban,
  Building2,
  CheckSquare2,
  Calendar,
  ArrowRight,
  PlusCircle,
  Sparkles,
  TrendingUp,
  Layers,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Tag as TagIcon,
} from 'lucide-react';

export default function HomePage() {
  const summary = useAsync(() => Stats.summary(), []);
  const projects = useAsync(() => Projects.list(), []);
  const tasks = useAsync(() => Tasks.list(), []);
  const departments = useAsync(() => Departments.list(), []);

  const activeProjects = projects.data?.filter((p) => p.isActive) ?? [];
  const recentTasks = tasks.data?.slice(0, 6) ?? [];

  return (
    <div className="space-y-8">
      {/* 1. Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-8 text-white shadow-xl shadow-indigo-950/20">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-20 top-0 h-40 w-40 rounded-full bg-violet-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-indigo-200 backdrop-blur-md border border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>PRN232 Assignment 1 • Task &amp; Team Management App</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Welcome to TaskMinder Platform 👋
            </h1>
            <p className="text-sm text-indigo-100/90 leading-relaxed">
              Full public CRUD management application for Departments, Projects, and Tasks with soft-delete &amp; PostgreSQL EF Core API integration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/projects/manage"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-extrabold text-indigo-900 shadow-md hover:bg-indigo-50 transition transform active:scale-95"
            >
              <PlusCircle className="h-4 w-4 text-indigo-600" />
              <span>Manage Projects</span>
            </Link>
            <Link
              href="/tasks/manage"
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-700/80 hover:bg-indigo-700 px-4 py-2.5 text-xs font-extrabold text-white border border-indigo-500/30 transition transform active:scale-95"
            >
              <CheckSquare2 className="h-4 w-4 text-indigo-300" />
              <span>Manage Tasks</span>
            </Link>
            <a
              href="https://tasktrack-api-qe180136.onrender.com/swagger"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 px-3.5 py-2.5 text-xs font-bold text-indigo-100 backdrop-blur-md transition"
            >
              <span>Swagger API</span>
              <ExternalLink className="h-3.5 w-3.5 text-indigo-300" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Summary Counts Section (From API) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
            <span>System Overview &amp; Summary Counts</span>
          </h2>
          {summary.loading && <span className="text-xs text-slate-400 font-medium">Refreshing stats...</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Departments */}
          <Link
            href="/departments"
            className="group rounded-3xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Departments
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">
                {summary.data?.totalDepartments ?? departments.data?.length ?? 0}
              </span>
              <span className="text-xs font-bold text-slate-400 block mt-0.5">
                Active Organizational Divisions
              </span>
            </div>
          </Link>

          {/* Card 2: Active Projects */}
          <Link
            href="/projects"
            className="group rounded-3xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Projects
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 group-hover:scale-110 transition-transform">
                <FolderKanban className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">
                {summary.data?.totalProjects ?? activeProjects.length}
              </span>
              <span className="text-xs font-bold text-slate-400 block mt-0.5">
                Company Initiatives
              </span>
            </div>
          </Link>

          {/* Card 3: Total Tasks */}
          <Link
            href="/tasks"
            className="group rounded-3xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Tasks
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                <CheckSquare2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">
                {summary.data?.totalTasks ?? tasks.data?.length ?? 0}
              </span>
              <span className="text-xs font-bold text-slate-400 block mt-0.5">
                Tracked Work Items
              </span>
            </div>
          </Link>

          {/* Card 4: Tasks Breakdown */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Status Breakdown
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-bold">
              <div className="rounded-xl bg-slate-50 p-2 text-slate-700">
                To-Do: <span className="text-amber-600">{summary.data?.tasksToDo ?? 0}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-2 text-slate-700">
                In-Progress: <span className="text-indigo-600">{summary.data?.tasksInProgress ?? 0}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-2 text-slate-700">
                Done: <span className="text-emerald-600">{summary.data?.tasksDone ?? 0}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-2 text-slate-700">
                Cancelled: <span className="text-rose-600">{summary.data?.tasksCancelled ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. List of Active Projects as Cards (Direct from API) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Active Projects
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
              {activeProjects.length}
            </span>
          </div>
          <Link href="/projects" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
            View All Projects <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {projects.loading && <SkeletonCards count={3} />}

        {projects.data && activeProjects.length === 0 && (
          <EmptyState
            title="No active projects"
            hint="Create a new project in Project Management."
            icon={<FolderKanban className="h-8 w-8 text-indigo-400" />}
            action={
              <Link href="/projects/manage" className="btn-primary">
                Create Project
              </Link>
            }
          />
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeProjects.slice(0, 6).map((p) => {
            const pId = p.projectId ?? p.projectID!;
            return (
              <Link
                key={pId}
                href={`/projects/${pId}`}
                className="group card-glass flex flex-col justify-between p-6 transition-all duration-300 hover:shadow-xl hover:border-indigo-500/30 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {p.projectName}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <Building2 className="h-3 w-3 text-slate-400" />
                        {p.departmentName ?? `Dept #${p.departmentId ?? p.departmentID}`}
                      </span>
                    </div>

                    <StatusBadge value={p.status} />
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-600">
                    {p.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{new Date(p.startDate).toLocaleDateString()}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
                    View Details <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. Recent Active Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            <CheckSquare2 className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Recent Tasks Overview
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
              {tasks.data?.length ?? 0}
            </span>
          </div>
          <Link href="/tasks" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
            View All Tasks <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {tasks.loading && <SkeletonCards count={3} />}

        <div className="grid grid-cols-1 gap-3.5">
          {recentTasks.map((t) => {
            const tId = t.taskId ?? t.taskID!;
            return (
              <Link
                key={tId}
                href={`/tasks/${tId}`}
                className="group card-glass flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 transition-all duration-200 hover:shadow-lg hover:border-indigo-500/30"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {t.title}
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">#{tId}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <FolderKanban className="h-3.5 w-3.5 text-slate-400" />
                      {t.projectName ?? `Project #${t.projectId ?? t.projectID}`}
                    </span>
                  </div>

                  {t.tags && t.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {t.tags.map((x) => (
                        <TagBadge
                          key={x.tagId ?? x.tagID}
                          name={x.tagName}
                          color={x.color}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <TaskStatusBadge value={t.status} />
                  <PriorityBadge value={t.priority} />
                  {t.dueDate && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Due {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  )}
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

