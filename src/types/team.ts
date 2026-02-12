// ── Team & Task types ─────────────────────────────────────────────

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

export interface TeamMember {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  role: TeamRole;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignee?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

// ── GraphQL data shapes ───────────────────────────────────────────

export interface MyTeamData {
  myTeam: Team;
}

export interface TasksData {
  tasks: Task[];
}

export interface DeleteTaskData {
  deleteTask: boolean;
}

export interface DeleteTaskVars {
  id: string;
}

export interface InviteMemberData {
  inviteMember: TeamMember;
}

export interface InviteMemberVars {
  input: {
    email: string;
    role: TeamRole;
  };
}
