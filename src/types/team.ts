// ── Enums ─────────────────────────────────────────────────────────

export const TeamRole = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type TeamRole = (typeof TeamRole)[keyof typeof TeamRole];

export const TaskStatus = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

// ── Domain types ──────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: TeamRole;
  joinedAt?: string;
}

export interface Team {
  id: string;
  name: string;
  createdAt?: string;
  members: TeamMember[];
}

/** Team membership as seen from a user's perspective (Me query) */
export interface UserTeamMembership {
  id: string;
  role: TeamRole;
  joinedAt: string;
  team: { id: string; name: string };
}

export interface AssignedUser {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  assignedUser?: AssignedUser | null;
}

export interface TaskDetail extends Task {
  team: {
    id: string;
    name: string;
  };
  assignmentHistory: AssignmentRecord[];
}

export interface AssignmentRecord {
  id: string;
  fromUser: { id: string; name: string } | null;
  toUser: { id: string; name: string } | null;
  changedBy: { id: string; name: string };
  changedAt: string;
}

export interface AssignmentHistoryRecord {
  id: string;
  fromUser: { id: string; name: string; email: string } | null;
  toUser: { id: string; name: string; email: string } | null;
  changedBy: { id: string; name: string };
  changedAt: string;
}

// ── Auth GraphQL shapes ──────────────────────────────────────────

export interface MeData {
  me: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    teams: UserTeamMembership[];
  };
}

export interface LogoutData {
  logout: {
    success: boolean;
    message: string;
  };
}

// ── Team GraphQL shapes ─────────────────────────────────────────

export interface TeamsData {
  teams: Team[];
}

export interface GetTeamData {
  team: Team & {
    tasks: {
      id: string;
      title: string;
      status: TaskStatus;
      assignedUser: { id: string; name: string } | null;
    }[];
  };
}

export interface GetTeamVars {
  id: string;
}

export interface CreateTeamData {
  createTeam: {
    id: string;
    name: string;
  };
}

export interface CreateTeamVars {
  input: {
    name: string;
  };
}

export interface UpdateTeamData {
  updateTeam: {
    id: string;
    name: string;
  };
}

export interface UpdateTeamVars {
  id: string;
  input: {
    name: string;
  };
}

export interface DeleteTeamData {
  deleteTeam: {
    success: boolean;
    message: string;
  };
}

export interface DeleteTeamVars {
  id: string;
}

// ── Team Members GraphQL shapes ─────────────────────────────────

export interface TeamMembersData {
  teamMembers: TeamMember[];
}

export interface TeamMembersVars {
  teamId: string;
}

export interface AddTeamMemberData {
  addTeamMember: TeamMember;
}

export interface AddTeamMemberVars {
  input: {
    userId: string;
    teamId: string;
    role: TeamRole;
  };
}

export interface UpdateMemberRoleData {
  updateTeamMemberRole: {
    id: string;
    role: TeamRole;
    user: { id: string; name: string };
  };
}

export interface UpdateMemberRoleVars {
  input: {
    memberId: string;
    role: TeamRole;
  };
}

export interface RemoveMemberData {
  removeTeamMember: {
    success: boolean;
    message: string;
  };
}

export interface RemoveMemberVars {
  memberId: string;
}

// ── Task GraphQL shapes ─────────────────────────────────────────

export interface TasksData {
  tasks: Task[];
}

export interface TasksVars {
  teamId: string;
}

export interface TaskDetailData {
  task: TaskDetail;
}

export interface TaskDetailVars {
  id: string;
}

export interface TaskHistoryData {
  taskAssignmentHistory: AssignmentHistoryRecord[];
}

export interface TaskHistoryVars {
  taskId: string;
}

export interface CreateTaskData {
  createTask: {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    createdAt: string;
  };
}

export interface CreateTaskVars {
  input: {
    teamId: string;
    title: string;
    description?: string;
  };
}

export interface UpdateTaskData {
  updateTask: {
    id: string;
    title: string;
    description?: string;
    updatedAt: string;
  };
}

export interface UpdateTaskVars {
  id: string;
  input: {
    title?: string;
    description?: string;
  };
}

export interface DeleteTaskData {
  deleteTask: {
    success: boolean;
    message: string;
  };
}

export interface DeleteTaskVars {
  id: string;
}

export interface AssignTaskData {
  assignTask: {
    id: string;
    status: TaskStatus;
    assignedUser: AssignedUser;
  };
}

export interface AssignTaskVars {
  input: {
    taskId: string;
    userId: string;
  };
}

export interface UnassignTaskData {
  unassignTask: {
    id: string;
    status: TaskStatus;
    assignedUser: { id: string; name: string } | null;
  };
}

export interface UnassignTaskVars {
  taskId: string;
}

export interface UpdateTaskStatusData {
  updateTaskStatus: {
    id: string;
    status: TaskStatus;
    updatedAt: string;
  };
}

export interface UpdateTaskStatusVars {
  taskId: string;
  status: TaskStatus;
}
