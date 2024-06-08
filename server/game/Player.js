import { Board } from "./Board.js";
import { Logger } from "./Logger.js";

export class Player {
  constructor(id, name, socket) {
    this.socket = socket || null;
    this.id = id;
    this.name = name || "";
    this.board = new Board();
    this.tickRate = 200;
    this.tickInterval = null;
    this.alive = true;
    Logger.info(`new player: ${this.id} - ${this.name} - ${this.socket.id}`);
  }

  start() {
    const tick = () => {
      if (!this.board.moveCurrPieceDown()) {
        this.alive = false;
        this.stop();
      } else this.board.moveCurrPieceDown();
    };

    this.tickInterval = setInterval(tick, this.tickRate);
  }

  stop() {
    clearInterval(this.tickInterval);
  }
}
