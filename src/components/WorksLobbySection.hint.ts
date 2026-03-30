import type { WorksLobbyPhase } from './WorksLobbySection.logic';

export const WORKS_LOBBY_CTA_HINT_DELAY_MS = 5000;

export function shouldScheduleWorksLobbyHint(
  phase: WorksLobbyPhase,
  showButton: boolean,
  isDismissed: boolean,
) {
  return phase === 'holding' && showButton && !isDismissed;
}

export function shouldHideWorksLobbyHint(phase: WorksLobbyPhase) {
  return phase !== 'holding';
}
