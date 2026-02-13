import {
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  MY_TEAMS_QUERY,
  CREATE_TEAM_MUTATION,
  UPDATE_TEAM_MUTATION,
  DELETE_TEAM_MUTATION,
  TASKS_QUERY,
  CREATE_TASK_MUTATION,
  UPDATE_TASK_MUTATION,
  DELETE_TASK_MUTATION,
  ASSIGN_TASK_MUTATION,
  UNASSIGN_TASK_MUTATION,
  UPDATE_TASK_STATUS_MUTATION,
  ADD_TEAM_MEMBER_MUTATION,
  UPDATE_MEMBER_ROLE_MUTATION,
  REMOVE_MEMBER_MUTATION,
} from "../lib/apollo";
import { useAuth } from "./useAuth";
import { TeamContext, type TeamState } from "./teamTypes";
import {
  TeamRole,
  type TeamsData,
  type CreateTeamData,
  type CreateTeamVars,
  type UpdateTeamData,
  type UpdateTeamVars,
  type DeleteTeamData,
  type DeleteTeamVars,
  type TasksData,
  type TasksVars,
  type CreateTaskData,
  type CreateTaskVars,
  type UpdateTaskData,
  type UpdateTaskVars,
  type DeleteTaskData,
  type DeleteTaskVars,
  type AssignTaskData,
  type AssignTaskVars,
  type UnassignTaskData,
  type UnassignTaskVars,
  type UpdateTaskStatusData,
  type UpdateTaskStatusVars,
  type TaskStatus,
  type AddTeamMemberData,
  type AddTeamMemberVars,
  type UpdateMemberRoleData,
  type UpdateMemberRoleVars,
  type RemoveMemberData,
  type RemoveMemberVars,
} from "../types/team";

// ── Provider ──────────────────────────────────────────────────────

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // ── Queries ──────────────────────────────────────────────────────

  const {
    data: teamsData,
    loading: teamsLoading,
    error: teamsError,
    refetch: refetchTeams,
  } = useQuery<TeamsData>(MY_TEAMS_QUERY);

  // Use the first team the user belongs to as the active team
  const team = teamsData?.teams?.[0] ?? null;
  const teamId = team?.id;

  const {
    data: tasksData,
    loading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useQuery<TasksData, TasksVars>(TASKS_QUERY, {
    variables: { teamId: teamId! },
    skip: !teamId,
  });

  // ── Team mutations ──────────────────────────────────────────────

  const [createTeamMutation] = useMutation<CreateTeamData, CreateTeamVars>(
    CREATE_TEAM_MUTATION,
  );

  const [updateTeamMutation] = useMutation<UpdateTeamData, UpdateTeamVars>(
    UPDATE_TEAM_MUTATION,
  );

  const [deleteTeamMutation] = useMutation<DeleteTeamData, DeleteTeamVars>(
    DELETE_TEAM_MUTATION,
  );

  // ── Member mutations ────────────────────────────────────────────

  const [addTeamMemberMutation] = useMutation<AddTeamMemberData, AddTeamMemberVars>(
    ADD_TEAM_MEMBER_MUTATION,
  );

  const [updateMemberRoleMutation] = useMutation<UpdateMemberRoleData, UpdateMemberRoleVars>(
    UPDATE_MEMBER_ROLE_MUTATION,
  );

  const [removeMemberMutation] = useMutation<RemoveMemberData, RemoveMemberVars>(
    REMOVE_MEMBER_MUTATION,
  );

  // ── Task mutations ──────────────────────────────────────────────

  const [createTaskMutation] = useMutation<CreateTaskData, CreateTaskVars>(
    CREATE_TASK_MUTATION,
  );

  const [updateTaskMutation] = useMutation<UpdateTaskData, UpdateTaskVars>(
    UPDATE_TASK_MUTATION,
  );

  const [deleteTaskMutation] = useMutation<DeleteTaskData, DeleteTaskVars>(
    DELETE_TASK_MUTATION,
  );

  const [assignTaskMutation] = useMutation<AssignTaskData, AssignTaskVars>(
    ASSIGN_TASK_MUTATION,
  );

  const [unassignTaskMutation] = useMutation<UnassignTaskData, UnassignTaskVars>(
    UNASSIGN_TASK_MUTATION,
  );

  const [updateTaskStatusMutation] = useMutation<
    UpdateTaskStatusData,
    UpdateTaskStatusVars
  >(UPDATE_TASK_STATUS_MUTATION);

  // Derive current user's role from the members list
  const myRole = useMemo(() => {
    if (!team?.members || !user) return null;
    const me = team.members.find((m) => m.user.id === user.id);
    return me?.role ?? null;
  }, [team, user]);

  const isAdmin = myRole === TeamRole.ADMIN;

  // ── Team callbacks ──────────────────────────────────────────────

  const createTeam = useCallback(
    async (name: string) => {
      await createTeamMutation({ variables: { input: { name } } });
      await refetchTeams();
    },
    [createTeamMutation, refetchTeams],
  );

  const updateTeam = useCallback(
    async (id: string, name: string) => {
      await updateTeamMutation({ variables: { id, input: { name } } });
      await refetchTeams();
    },
    [updateTeamMutation, refetchTeams],
  );

  const deleteTeam = useCallback(
    async (id: string) => {
      await deleteTeamMutation({ variables: { id } });
      await refetchTeams();
    },
    [deleteTeamMutation, refetchTeams],
  );

  // ── Member callbacks ────────────────────────────────────────────

  const addTeamMember = useCallback(
    async (userId: string, role: TeamRole) => {
      if (!teamId) throw new Error("No team found");
      await addTeamMemberMutation({
        variables: { input: { userId, teamId, role } },
      });
      await refetchTeams();
    },
    [addTeamMemberMutation, teamId, refetchTeams],
  );

  const updateMemberRole = useCallback(
    async (memberId: string, role: TeamRole) => {
      await updateMemberRoleMutation({
        variables: { input: { memberId, role } },
      });
      await refetchTeams();
    },
    [updateMemberRoleMutation, refetchTeams],
  );

  const removeMember = useCallback(
    async (memberId: string) => {
      await removeMemberMutation({ variables: { memberId } });
      await refetchTeams();
    },
    [removeMemberMutation, refetchTeams],
  );

  // ── Task callbacks ──────────────────────────────────────────────

  const createTask = useCallback(
    async (title: string, description?: string) => {
      if (!teamId) throw new Error("No team found");
      await createTaskMutation({
        variables: { input: { teamId, title, description } },
      });
      await refetchTasks();
    },
    [createTaskMutation, teamId, refetchTasks],
  );

  const updateTask = useCallback(
    async (id: string, input: { title?: string; description?: string }) => {
      await updateTaskMutation({ variables: { id, input } });
      await refetchTasks();
    },
    [updateTaskMutation, refetchTasks],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      await deleteTaskMutation({ variables: { id } });
      await refetchTasks();
    },
    [deleteTaskMutation, refetchTasks],
  );

  const assignTask = useCallback(
    async (taskId: string, userId: string) => {
      await assignTaskMutation({ variables: { input: { taskId, userId } } });
      await refetchTasks();
    },
    [assignTaskMutation, refetchTasks],
  );

  const unassignTask = useCallback(
    async (taskId: string) => {
      await unassignTaskMutation({ variables: { taskId } });
      await refetchTasks();
    },
    [unassignTaskMutation, refetchTasks],
  );

  const updateTaskStatus = useCallback(
    async (taskId: string, status: TaskStatus) => {
      await updateTaskStatusMutation({ variables: { taskId, status } });
      await refetchTasks();
    },
    [updateTaskStatusMutation, refetchTasks],
  );

  // ── Context value ───────────────────────────────────────────────

  const errorMessage =
    teamsError?.message || tasksError?.message || null;

  const value = useMemo<TeamState>(
    () => ({
      team,
      teams: teamsData?.teams ?? [],
      tasks: tasksData?.tasks ?? [],
      myRole,
      isAdmin,
      isLoading: teamsLoading || tasksLoading,
      error: errorMessage,
      createTeam,
      updateTeam,
      deleteTeam,
      addTeamMember,
      updateMemberRole,
      removeMember,
      createTask,
      updateTask,
      deleteTask,
      assignTask,
      unassignTask,
      updateTaskStatus,
      refetchTeams,
      refetchTasks,
    }),
    [
      team,
      teamsData,
      tasksData,
      myRole,
      isAdmin,
      teamsLoading,
      tasksLoading,
      errorMessage,
      createTeam,
      updateTeam,
      deleteTeam,
      addTeamMember,
      updateMemberRole,
      removeMember,
      createTask,
      updateTask,
      deleteTask,
      assignTask,
      unassignTask,
      updateTaskStatus,
      refetchTeams,
      refetchTasks,
    ],
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}
