import { createContext } from "react";
import type { Team, Task, TeamRole, TaskStatus } from "../types/team";

export interface TeamState {
  /** Currently active team (first team the user belongs to) */
  team: Team | null;
  /** All teams the user belongs to */
  teams: Team[];
  tasks: Task[];
  myRole: TeamRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;

  // Team operations
  createTeam: (name: string) => Promise<void>;
  updateTeam: (id: string, name: string) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;

  // Member operations
  addTeamMember: (userId: string, role: TeamRole) => Promise<void>;
  updateMemberRole: (memberId: string, role: TeamRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;

  // Task operations
  createTask: (title: string, description?: string) => Promise<void>;
  updateTask: (id: string, input: { title?: string; description?: string }) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  assignTask: (taskId: string, userId: string) => Promise<void>;
  unassignTask: (taskId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;

  // Refetch helpers
  refetchTeams: () => void;
  refetchTasks: () => void;
}

export const TeamContext = createContext<TeamState | undefined>(undefined);
