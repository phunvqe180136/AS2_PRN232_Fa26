export interface DepartmentDto {
  departmentId: number;
  departmentName: string;
  departmentDescription: string;
  isActive: boolean;
  projectCount?: number | null;
  // Legacy aliases
  departmentID?: number;
}

export interface DepartmentDetailDto extends DepartmentDto {
  projects: ProjectDto[];
}

export interface ProjectDto {
  projectId: number;
  projectName: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  status: number;
  statusName?: string | null;
  departmentId: number;
  departmentName?: string | null;
  isActive: boolean;
  createdDate: string;
  createdById?: number | null;
  createdByName?: string | null;
  updatedById?: number | null;
  updatedByName?: string | null;
  // Legacy aliases
  projectID?: number;
  departmentID?: number;
}

export interface ProjectDetailDto extends ProjectDto {
  tasks: TaskDto[];
}

export interface TagBriefDto {
  tagId: number;
  tagName: string;
  color?: string | null;
  // Legacy alias
  tagID?: number;
}

export interface TaskDto {
  taskId: number;
  title: string;
  description?: string | null;
  status: number;
  statusName?: string | null;
  priority: number;
  priorityName?: string | null;
  dueDate?: string | null;
  projectId: number;
  projectName?: string | null;
  isActive: boolean;
  createdDate: string;
  modifiedDate?: string | null;
  tags: TagBriefDto[];
  createdById?: number | null;
  createdByName?: string | null;
  updatedById?: number | null;
  updatedByName?: string | null;
  // Legacy aliases
  taskID?: number;
  projectID?: number;
}

export interface TagDto {
  tagId: number;
  tagName: string;
  color?: string | null;
  // Legacy alias
  tagID?: number;
}

export interface DepartmentUpsertDto {
  departmentName: string;
  departmentDescription: string;
  isActive?: boolean;
}

export interface ProjectUpsertDto {
  projectName: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  status: number;
  departmentId: number;
  isActive?: boolean;
  departmentID?: number;
}

export interface TaskUpsertDto {
  title: string;
  description?: string | null;
  status: number;
  priority: number;
  dueDate?: string | null;
  projectId: number;
  isActive?: boolean;
  tagIds?: number[];
  projectID?: number;
  tagIDs?: number[];
}

export interface TagUpsertDto {
  tagName: string;
  color?: string | null;
}

export interface SummaryDto {
  totalDepartments: number;
  totalProjects: number;
  totalTasks: number;
  tasksToDo: number;
  tasksInProgress: number;
  tasksDone: number;
  tasksCancelled: number;
  overdueTasks: number;
  totalTags: number;
  totalAccounts?: number;
  departments?: number;
  projects?: number;
  tasks?: number;
}

// ----------------- Auth & Accounts Types -----------------

export interface User {
  accountId: number;
  fullName: string;
  email: string;
  role: number; // 0 = Staff, 1 = Admin
  roleName: string;
}

export interface AuthResponseDto {
  token: string;
  refreshToken?: string;
  accountId: number;
  fullName: string;
  email: string;
  role: number;
  roleName: string;
  expiresAt: string;
}

export interface RegisterRequestDto {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
  expiredToken?: string;
}

export interface AccountDto {
  accountId: number;
  fullName: string;
  email: string;
  role: number;
  roleName: string;
  createdDate: string;
  createdTasksCount: number;
}

export interface UpdateAccountDto {
  fullName: string;
  role: number;
}

export interface ProfileDto {
  accountId: number;
  fullName: string;
  email: string;
  role: number;
  roleName: string;
  createdDate: string;
  createdTasksCount: number;
}

export interface UpdateProfileRequestDto {
  fullName: string;
  currentPassword?: string;
  newPassword?: string;
}
