import { describe, expect, it, beforeEach } from 'vitest';
import {
  store,
  changeId,
  changeName,
  updateGamesList,
  updateBoard,
  resetBoard,
  setScore,
  setNextPiece,
  setStatus,
  updatePlayerData,
  updateSpectrum,
  resetGame,
} from '../src/redux';
import { EmptyCell } from '../src/globals';

describe('redux store', () => {
  beforeEach(() => {
    store.dispatch(resetBoard());
    store.dispatch(resetGame());
  });

  describe('user slice', () => {
    it('has initial id -1 and empty name', () => {
      const state = store.getState();
      expect(state.user.id).toBe(-1);
      expect(state.user.name).toBe('');
    });

    it('changeId updates user id', () => {
      store.dispatch(changeId(42));
      expect(store.getState().user.id).toBe(42);
    });

    it('changeName updates user name', () => {
      store.dispatch(changeName('Alice'));
      expect(store.getState().user.name).toBe('Alice');
    });
  });

  describe('gamesList slice', () => {
    it('starts empty', () => {
      expect(store.getState().gamesList).toEqual([]);
    });

    it('updateGamesList replaces list', () => {
      const games = [
        {
          id: 'room1',
          admin: { id: 1, name: 'Admin' },
          players: [],
          maxPlayers: 4,
          active: false,
        },
      ];
      store.dispatch(updateGamesList(games as any));
      expect(store.getState().gamesList).toHaveLength(1);
      expect(store.getState().gamesList[0].id).toBe('room1');
    });
  });

  describe('board slice', () => {
    it('initial board is 20x10 of EmptyCell', () => {
      const board = store.getState().board;
      expect(board).toHaveLength(20);
      expect(board[0]).toHaveLength(10);
      expect(board.flat().every((c) => c === EmptyCell)).toBe(true);
    });

    it('updateBoard replaces board', () => {
      const newBoard = [[EmptyCell, EmptyCell]] as any;
      store.dispatch(updateBoard(newBoard));
      expect(store.getState().board).toEqual(newBoard);
    });

    it('resetBoard restores 20x10 empty board', () => {
      store.dispatch(updateBoard([['I']] as any));
      store.dispatch(resetBoard());
      const board = store.getState().board;
      expect(board).toHaveLength(20);
      expect(board[0]).toHaveLength(10);
    });
  });

  describe('game slice', () => {
    it('initial state has score 0, null status', () => {
      const game = store.getState().game;
      expect(game.score).toBe(0);
      expect(game.status).toBeNull();
      expect(game.otherPlayersData).toEqual([]);
      expect(game.spectrums).toEqual({});
    });

    it('setScore updates score', () => {
      store.dispatch(setScore(100));
      expect(store.getState().game.score).toBe(100);
    });

    it('setNextPiece updates nextPiece', () => {
      store.dispatch(setNextPiece({ nextPiece: 'I', nextPieceShape: [[1, 1, 1, 1]] }));
      const { nextPiece } = store.getState().game;
      expect(nextPiece.nextPiece).toBe('I');
      expect(nextPiece.nextPieceShape).toEqual([[1, 1, 1, 1]]);
    });

    it('setStatus updates status', () => {
      store.dispatch(setStatus('win'));
      expect(store.getState().game.status).toBe('win');
      store.dispatch(setStatus('loose'));
      expect(store.getState().game.status).toBe('loose');
    });

    it('updatePlayerData adds and updates players', () => {
      store.dispatch(updatePlayerData({ id: 1, name: 'A', alive: true, score: 0 }));
      expect(store.getState().game.otherPlayersData).toHaveLength(1);
      expect(store.getState().game.otherPlayersData[0].name).toBe('A');

      store.dispatch(updatePlayerData({ id: 1, name: 'A2', alive: false, score: 50 }));
      expect(store.getState().game.otherPlayersData).toHaveLength(1);
      expect(store.getState().game.otherPlayersData[0].name).toBe('A2');
      expect(store.getState().game.otherPlayersData[0].score).toBe(50);
    });

    it('updateSpectrum sets spectrum for player', () => {
      store.dispatch(updateSpectrum({ playerId: 2, spectrum: [0, 1, 2, 3] }));
      expect(store.getState().game.spectrums[2]).toEqual([0, 1, 2, 3]);
    });

    it('resetGame restores initial game state', () => {
      store.dispatch(setScore(999));
      store.dispatch(setStatus('win'));
      store.dispatch(resetGame());
      expect(store.getState().game.score).toBe(0);
      expect(store.getState().game.status).toBeNull();
      expect(store.getState().game.otherPlayersData).toEqual([]);
      expect(store.getState().game.spectrums).toEqual({});
    });
  });
});
