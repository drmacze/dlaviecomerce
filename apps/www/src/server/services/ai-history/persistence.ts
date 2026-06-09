export function shouldPersistAiHistory(input: {
  authenticated: boolean;
  serverHistoryEnabled: boolean;
  clientHistoryEnabled: boolean;
  mode: string;
}) {
  return input.authenticated && input.serverHistoryEnabled && input.clientHistoryEnabled && input.mode !== 'private';
}
