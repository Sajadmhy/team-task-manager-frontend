import {
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  MY_TEAM_QUERY,
  TASKS_QUERY,
  DELETE_TASK_MUTATION,
  INVITE_MEMBER_MUTATION,
} from "../lib/apollo";
import { useAuth } from "./useAuth";
import { TeamContext } from "./teamTypes";
import {
  TeamRole,
  type MyTeamData,
  type TasksData,
  type DeleteTaskData,
  type DeleteTaskVars,
  type InviteMemberData,
  type InviteMemberVars,
} from "../types/team";

// ── Provider ──────────────────────────────────────────────────────

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const {
    data: teamData,
    loading: teamLoading,
    error: teamError,
    refetch: refetchTeam,
  } = useQuery<MyTeamData>(MY_TEAM_QUERY);

  const {
    data: tasksData,
    loading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useQuery<TasksData>(TASKS_QUERY);

  const [deleteTaskMutation] = useMutation<DeleteTaskData, DeleteTaskVars>(
    DELETE_TASK_MUTATION,
  );

  const [inviteMemberMutation] = useMutation<
    InviteMemberData,
    InviteMemberVars
  >(INVITE_MEMBER_MUTATION);

  // Derive current user's role from the members list
  const myRole = useMemo(() => {
    if (!teamData?.myTeam?.members || !user) return null;
    const me = teamData.myTeam.members.find((m) => m.user.id === user.id);
    return me?.role ?? null;
  }, [teamData, user]);

  const isAdmin = myRole === TeamRole.ADMIN;

  const deleteTask = useCallback(
    async (id: string) => {
      await deleteTaskMutation({ variables: { id } });
      await refetchTasks();
    },
    [deleteTaskMutation, refetchTasks],
  );

  const inviteMember = useCallback(
    async (email: string, role: TeamRole) => {
      await inviteMemberMutation({ variables: { input: { email, role } } });
      await refetchTeam();
    },
    [inviteMemberMutation, refetchTeam],
  );

  const errorMessage =
    teamError?.message || tasksError?.message || null;

  const value = useMemo<TeamState>(
    () => ({
      team: teamData?.myTeam ?? null,
      tasks: tasksData?.tasks ?? [],
      myRole,
      isAdmin,
      isLoading: teamLoading || tasksLoading,
      error: errorMessage,
      deleteTask,
      inviteMember,
      refetchTeam,
      refetchTasks,
    }),
    [
      teamData,
      tasksData,
      myRole,
      isAdmin,
      teamLoading,
      tasksLoading,
      errorMessage,
      deleteTask,
      inviteMember,
      refetchTeam,
      refetchTasks,
    ],
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}
