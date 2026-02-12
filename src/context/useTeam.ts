import { useContext } from "react";
import { TeamContext, type TeamState } from "./teamTypes";

export function useTeam(): TeamState {
  const ctx = useContext(TeamContext);
  if (!ctx) {
    throw new Error("useTeam must be used within a <TeamProvider>");
  }
  return ctx;
}
