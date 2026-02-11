import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMutation } from "@apollo/client/react";
import {
  type User,
  getAccessToken,
  setAccessToken,
  clearTokens,
  isTokenExpired,
  scheduleRefresh,
} from "../lib/auth";
import {
  LOGIN_MUTATION,
  REFRESH_MUTATION,
  refreshAccessToken,
  type LoginData,
  type LoginVars,
  type RefreshData,
} from "../lib/apollo";
import { AuthContext } from "./authTypes";

// ── Provider ───────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [loginMutation] = useMutation<LoginData, LoginVars>(LOGIN_MUTATION);
  const [refreshMutation] = useMutation<RefreshData>(REFRESH_MUTATION, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    const restore = async () => {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      if (isTokenExpired(token)) {
        try {
          const { data } = await refreshMutation();
          if (data?.refresh) {
            setAccessToken(data.refresh.accessToken);
            setUser(data.refresh.user);
            scheduleRefresh(refreshAccessToken);
          } else {
            clearTokens();
          }
        } catch {
          clearTokens();
        }
      } else {
        try {
          const { data } = await refreshMutation();
          if (data?.refresh) {
            setAccessToken(data.refresh.accessToken);
            setUser(data.refresh.user);
            scheduleRefresh(refreshAccessToken);
          }
        } catch {
          scheduleRefresh(refreshAccessToken);
        }
      }
      setIsLoading(false);
    };

    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        const { data } = await loginMutation({
          variables: { input: { email, password } },
        });

        if (data?.login) {
          setAccessToken(data.login.accessToken);
          setUser(data.login.user);
          scheduleRefresh(refreshAccessToken);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Login failed. Please try again.";
        setError(message);
        throw err;
      }
    },
    [loginMutation],
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      error,
    }),
    [user, isLoading, login, logout, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
