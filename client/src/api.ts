import socket from './socket';

const headers = () => ({
  'Content-Type': 'application/json',
  'x-socket-id': socket.id ?? '',
});

export const api = {
  getHighScores: (page: number, limit: number) =>
    fetch(`/api/high-scores?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`),

  updatePlayer: (name: string) =>
    fetch('/api/player', { method: 'PUT', headers: headers(), body: JSON.stringify({ name }) }),

  getGames: () => fetch('/api/games', { headers: headers() }),

  createGame: (roomName: string, maxPlayers: number) =>
    fetch('/api/games', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ roomName, maxPlayers }),
    }),

  joinGame: (roomName: string) =>
    fetch(`/api/games/${encodeURIComponent(roomName)}/join`, { method: 'POST', headers: headers() }),

  leaveGame: (roomName: string) =>
    fetch(`/api/games/${encodeURIComponent(roomName)}/leave`, { method: 'POST', headers: headers() }),

  leaveAll: () => fetch('/api/games/leave-all', { method: 'POST', headers: headers() }),

  startGame: (roomName: string) =>
    fetch(`/api/games/${encodeURIComponent(roomName)}/start`, { method: 'POST', headers: headers() }),

  restartGame: (roomName: string) =>
    fetch(`/api/games/${encodeURIComponent(roomName)}/restart`, { method: 'POST', headers: headers() }),
};
