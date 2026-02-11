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

// ── Mutation result types ──────────────────────────────────────────

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

export interface RefreshData {
  refresh: { accessToken: string; user: User };
}

// ── GraphQL operations ─────────────────────────────────────────────

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
