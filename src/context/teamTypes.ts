import { createContext } from "react";
import type { Team, Task, TeamRole } from "../types/team";

export interface TeamState {
  team: Team | null;
  tasks: Task[];
  myRole: TeamRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  deleteTask: (id: string) => Promise<void>;
  inviteMember: (email: string, role: TeamRole) => Promise<void>;
  refetchTeam: () => void;
  refetchTasks: () => void;
}

export const TeamContext = createContext<TeamState | undefined>(undefined);
