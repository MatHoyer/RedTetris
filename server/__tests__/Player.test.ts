import { describe, it, expect, vi } from 'vitest';
import { Player } from '../src/game/Player';
import { Board } from '../src/game/Board';

describe('Player', () => {
  it('should initialize with the correct id, name, and socketId', () => {
    // Given
    const id = 1;
    const name = 'Player1';
    const socketId = 'socket123';
    const player = new Player(id, name, socketId);

    // Then
    expect(player.id).toBe(id);
    expect(player.name).toBe(name);
    expect(player.socketId).toBe(socketId);
    expect(player.board).toBeInstanceOf(Board);
    expect(player.tickRate).toBe(200);
    expect(player.tickInterval).toBeNull();
    expect(player.alive).toBe(true);
  });

  it('should start and stop the tick interval', () => {
    // Given
    const player = new Player(1, 'Player1', 'socket123');
    vi.useFakeTimers();

    // When
    player.start();
    vi.advanceTimersByTime(200);

    // Then
    expect(player.tickInterval).not.toBeNull();

    // When
    player.stop();

    // Then
    expect(player.tickInterval).toBeNull();
    vi.useRealTimers();
  });

  it('should return the correct payload', () => {
    // Given
    const player = new Player(1, 'Player1', 'socket123');
    const boardPayload = player.board.toPayload();

    // When
    const payload = player.toPayload();

    // Then
    expect(payload).toEqual({
      id: player.id,
      name: player.name,
      alive: player.alive,
      board: boardPayload,
    });
  });
});
