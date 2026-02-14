# Team Task Manager (Frontend)

A React frontend for managing teams and tasks. Users sign up, sign in, create or join a team, then manage tasks and team members from a dashboard. The app talks to a GraphQL backend via Apollo Client.

## What it does

- **Auth**: Register, login, logout. Session is persisted (token storage + refresh) so reloads don’t log you out.
- **Teams**: Create a team (if you have none), see your team, delete it (admin only).
- **Members**: View members and roles. Admins can invite members by email and set Admin/User role.
- **Tasks**: View a list of tasks, add new ones, delete (admin). Tasks can show status and assignee (assign/unassign/status are in the API; UI can be extended).

## Tech stack

- **React 19** + **TypeScript**
- **Vite** (dev server + build)
- **React Router** (login, register, dashboard)
- **Apollo Client** (GraphQL: queries, mutations, auth link, cache)
- **Context API** for app state (auth + team/tasks), no Redux

## Run it

Requires Node 18+.

```bash
npm install
npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:5173`). The app expects a GraphQL API (e.g. a separate backend); set its URL in your env or in `src/lib/apollo.ts` if needed.

Build for production:

```bash
npm run build
```

---

### Architecture & structure

**Why Context instead of Redux/Zustand?**  
The app has two clear domains (auth + team/tasks) and limited cross-cutting state. Context keeps the bundle small and the mental model simple. If we needed selectors, many slices, or devtools time-travel, we’d consider Zustand or Redux.

**Why is `TeamProvider` only around the Dashboard?**  
Team data is only used on the dashboard. Wrapping the whole app would cause every route (login, register) to be under that provider and re-render when team/task data changes. Scoping the provider to the dashboard limits re-renders and keeps auth and team concerns separated.

**How is the component hierarchy organized?**  
`App` → routes. Protected route wraps `Dashboard` → `TeamProvider` → `DashboardContent` (loading/error/empty/team view). `TaskList` and `TeamMemberList` (and modals like `InviteMember`) live inside that tree and consume `useTeam()`.

### State management & data flow

**Where does server state live?**  
In the context providers. `AuthContext` holds user + token; `TeamContext` holds teams, tasks, and derived values (`myRole`, `isAdmin`). Apollo Client does the actual fetching; our context exposes a stable API and loading/error state.

**How do you avoid unnecessary re-renders with Context?**  
(1) **Stable context value**: The object passed to `Provider` is built with `useMemo` and only changes when its dependencies (e.g. `team`, `tasks`, callbacks) change. (2) **Stable callbacks**: All context methods are wrapped in `useCallback` so they don’t get new references every render. (3) **Stable derived data**: We use `useMemo` for derived arrays (e.g. `teams`, `tasks`) and reuse constants for empty arrays instead of `?? []` so we don’t create new array references. (4) **Memoized consumers**: Components like `TaskList` and `TeamMemberList` are wrapped in `React.memo` so they don’t re-render when the parent re-renders unless their props (or consumed context) actually change.

**What’s the point of `React.memo` if the component uses context?**  
Context changes still re-render that consumer. `React.memo` helps when the **parent** re-renders for other reasons (e.g. local state in `DashboardContent`). Then the memoized child can skip re-rendering if its props are referentially equal and the context value it uses hasn’t changed.

### Performance

**Why `useCallback` for handlers passed as props?**  
If the child is memoized with `React.memo`, it re-renders when any prop reference changes. An inline function like `() => setModalOpen(false)` is a new function every render, so the child would always re-render. `useCallback` keeps the same function reference so the memo works.

**Why stable empty arrays (`EMPTY_TEAMS`, `EMPTY_TASKS`) in TeamContext?**  
Using `teamsData?.teams ?? []` creates a new `[]` every time when data is null. The context value’s `useMemo` would then see a new `teams` reference every render and think the value changed, triggering re-renders for all consumers. A module-level constant keeps the reference stable.

**How do you handle loading and errors?**  
Each context exposes `isLoading` and `error`. Components check these and render spinners or error messages before rendering main content. Mutations use local state (e.g. `submitting`, `createError`) for per-action feedback while the context holds global loading/error from queries.

### Auth & security

**How is the user kept logged in?**  
Access token is stored (e.g. in memory + optionally persisted). On app load, `AuthProvider` runs a restore effect: if a token exists, it checks expiry and either refreshes it (via a refresh mutation) or clears it. After a successful refresh/login, we schedule a proactive refresh before expiry.

**Why not put the token only in memory?**  
In-memory only would log the user out on every full reload. Storing the token (e.g. in localStorage) and restoring in the AuthProvider gives session persistence; refresh logic keeps the session valid. Token handling is centralized in a small auth module so we can swap storage or add httpOnly cookies later.

**How are protected routes implemented?**  
A `ProtectedRoute` component uses `useAuth()` and, if not authenticated (after loading), renders `<Navigate to="/login" />`. We don’t call `navigate()` during render; we use `useEffect` so redirects are a side effect and don’t cause extra render cycles.

### GraphQL & Apollo

**Why Apollo Client?**  
We need queries, mutations, and a single place to manage cache and auth (e.g. attaching the token, handling 401 and refresh). Apollo gives us `useQuery`/`useMutation`, an error link for global auth handling, and a normalized cache so we can refetch or update after mutations.

**How do you refetch after a mutation?**  
After mutations that change teams or tasks, we call `refetchTeams()` or `refetchTasks()` from the context. Those are the `refetch` functions from `useQuery`. We don’t manually write to the cache here; refetch keeps the UI in sync with the server and keeps the logic simple.

**Why `skip: !teamId` on the tasks query?**  
Tasks depend on the selected team. When there’s no team (e.g. user has no teams yet), we skip the tasks query to avoid sending an invalid or useless request. Once `teamId` exists, the query runs with that variable.

### Tradeoffs & improvements

**What would you add or change next?**  
(1) **Selective context consumption**: Split team “data” and “actions” into separate contexts so components that only call actions don’t re-render on data changes. (2) **Optimistic updates**: Update the Apollo cache or local state immediately on mutation and roll back on error. (3) **Error boundaries** around major sections so one component failure doesn’t break the whole app. (4) **Tests**: unit tests for context logic and hooks, integration tests for critical flows (login, create team, create task).

**Why not React Query instead of Apollo?**  
GraphQL is the API contract here; Apollo is the standard client for GraphQL in React. If the backend were REST, we’d likely use React Query or similar. Apollo also gives us the cache and the link chain (auth, errors) in one place.
