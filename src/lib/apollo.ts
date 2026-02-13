import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  Observable,
  gql,
} from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { type User, getAccessToken, setAccessToken, clearTokens } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/graphql";

// ── Auth result types ────────────────────────────────────────────

export interface LoginData {
  login: { accessToken: string; user: User };
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginVars {
  input: LoginInput;
}

export interface RegisterData {
  register: { accessToken: string; user: User };
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterVars {
  input: RegisterInput;
}

export interface RefreshData {
  refresh: { accessToken: string; user: User };
}

export interface LogoutData {
  logout: { success: boolean; message: string };
}

// ── Auth operations ───────────────────────────────────────────────

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      createdAt
      teams {
        id
        role
        joinedAt
        team { id name }
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        id
        email
        name
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user {
        id
        email
        name
      }
    }
  }
`;

export const REFRESH_MUTATION = gql`
  mutation Refresh {
    refresh {
      accessToken
      user {
        id
        email
        name
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

// ── Team operations ──────────────────────────────────────────────

export const MY_TEAMS_QUERY = gql`
  query MyTeams {
    teams {
      id
      name
      createdAt
      members {
        id
        role
        user {
          id
          name
          email
        }
      }
    }
  }
`;

export const GET_TEAM_QUERY = gql`
  query GetTeam($id: ID!) {
    team(id: $id) {
      id
      name
      createdAt
      members {
        id
        role
        user { id name email }
      }
      tasks {
        id
        title
        status
        assignedUser { id name }
      }
    }
  }
`;

export const CREATE_TEAM_MUTATION = gql`
  mutation CreateTeam($input: CreateTeamInput!) {
    createTeam(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_TEAM_MUTATION = gql`
  mutation UpdateTeam($id: ID!, $input: UpdateTeamInput!) {
    updateTeam(id: $id, input: $input) {
      id
      name
    }
  }
`;

export const DELETE_TEAM_MUTATION = gql`
  mutation DeleteTeam($id: ID!) {
    deleteTeam(id: $id) {
      success
      message
    }
  }
`;

// ── Team Member operations ───────────────────────────────────────

export const GET_TEAM_MEMBERS_QUERY = gql`
  query GetTeamMembers($teamId: ID!) {
    teamMembers(teamId: $teamId) {
      id
      role
      joinedAt
      user { id name email }
    }
  }
`;

export const ADD_TEAM_MEMBER_MUTATION = gql`
  mutation AddTeamMember($input: AddTeamMemberInput!) {
    addTeamMember(input: $input) {
      id
      role
      user { id name email }
    }
  }
`;

export const UPDATE_MEMBER_ROLE_MUTATION = gql`
  mutation UpdateMemberRole($input: UpdateTeamMemberRoleInput!) {
    updateTeamMemberRole(input: $input) {
      id
      role
      user { id name }
    }
  }
`;

export const REMOVE_MEMBER_MUTATION = gql`
  mutation RemoveMember($memberId: ID!) {
    removeTeamMember(memberId: $memberId) {
      success
      message
    }
  }
`;

// ── Task operations ──────────────────────────────────────────────

export const TASKS_QUERY = gql`
  query GetTeamTasks($teamId: ID!) {
    tasks(teamId: $teamId) {
      id
      title
      description
      status
      createdAt
      updatedAt
      assignedUser {
        id
        email
        name
      }
    }
  }
`;

export const TASK_QUERY = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      status
      createdAt
      updatedAt
      team {
        id
        name
      }
      assignedUser {
        id
        email
        name
      }
      assignmentHistory {
        id
        fromUser { id name }
        toUser   { id name }
        changedBy { id name }
        changedAt
      }
    }
  }
`;

export const TASK_HISTORY_QUERY = gql`
  query GetTaskHistory($taskId: ID!) {
    taskAssignmentHistory(taskId: $taskId) {
      id
      fromUser { id name email }
      toUser   { id name email }
      changedBy { id name }
      changedAt
    }
  }
`;

export const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      status
      createdAt
    }
  }
`;

export const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      title
      description
      updatedAt
    }
  }
`;

export const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      success
      message
    }
  }
`;

export const ASSIGN_TASK_MUTATION = gql`
  mutation AssignTask($input: AssignTaskInput!) {
    assignTask(input: $input) {
      id
      status
      assignedUser {
        id
        name
        email
      }
    }
  }
`;

export const UNASSIGN_TASK_MUTATION = gql`
  mutation UnassignTask($taskId: ID!) {
    unassignTask(taskId: $taskId) {
      id
      status
      assignedUser {
        id
        name
      }
    }
  }
`;

export const UPDATE_TASK_STATUS_MUTATION = gql`
  mutation UpdateTaskStatus($taskId: ID!, $status: TaskStatus!) {
    updateTaskStatus(taskId: $taskId, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

// ── Links ──────────────────────────────────────────────────────────

const httpLink = createHttpLink({
  uri: API_URL,
  credentials: "include", // send refresh-token cookie
});

const authLink = setContext((_, { headers }) => {
  const token = getAccessToken();
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

// Track in-flight refresh to avoid concurrent refresh calls
let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

function resolvePending(token: string | null) {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
}

/**
 * Attempt to refresh the access token by calling the refresh mutation
 * directly via the client. Uses `no-cache` to avoid stale cache results.
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const result = await client.mutate<RefreshData>({
      mutation: REFRESH_MUTATION,
      fetchPolicy: "no-cache",
    });

    const newToken = result.data?.refresh?.accessToken;
    if (newToken) {
      setAccessToken(newToken);
      return newToken;
    }
    return null;
  } catch {
    clearTokens();
    return null;
  }
}

const errorLink = onError(({ error, operation, forward }) => {
  // Only handle GraphQL authentication errors
  if (!CombinedGraphQLErrors.is(error)) return;

  const unauthError = error.errors.find(
    (err) =>
      err.extensions?.["code"] === "UNAUTHENTICATED" ||
      err.message.toLowerCase().includes("unauthenticated") ||
      err.message.toLowerCase().includes("jwt expired") ||
      err.message.toLowerCase().includes("token expired"),
  );

  if (!unauthError) return;

  // Don't try to refresh if we're already on the refresh mutation
  if (operation.operationName === "Refresh") return;

  if (isRefreshing) {
    // Queue this request until the in-flight refresh completes
    return new Observable((subscriber) => {
      pendingRequests.push((token: string | null) => {
        if (token) {
          operation.setContext(({ headers = {} }: { headers: Record<string, string> }) => ({
            headers: { ...headers, Authorization: `Bearer ${token}` },
          }));
        }
        forward(operation).subscribe(subscriber);
      });
    });
  }

  isRefreshing = true;

  return new Observable((subscriber) => {
    refreshAccessToken()
      .then((token) => {
        resolvePending(token);
        isRefreshing = false;

        if (token) {
          operation.setContext(({ headers = {} }: { headers: Record<string, string> }) => ({
            headers: { ...headers, Authorization: `Bearer ${token}` },
          }));
        }

        forward(operation).subscribe(subscriber);
      })
      .catch(() => {
        isRefreshing = false;
        resolvePending(null);
        subscriber.error(error);
      });
  });
});

// ── Client ─────────────────────────────────────────────────────────

export const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
  },
});
