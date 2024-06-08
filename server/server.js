import express from "express";
import http from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import { GameManager } from "./game/GameManager.js";
import { Logger } from "./logger.js";
import events from "../events/index.js";
import { createGame } from "./io/createGame.js";
import { updateGameList } from "./io/updateGameList.js";
import { updatePlayerName } from "./io/updatePlayer.js";
import { joinGame } from "./io/joinGame.js";
import { leaveGame } from "./io/leaveGame.js";

const port = process.env.APP_PORT || 3004;

async function createMainServer() {
  const app = express();
  const server = http.createServer(app);
  const logger = new Logger(console);
  const io = new Server(server);
  const gameManager = new GameManager();

  io.on("connection", (socket) => {
    const p = gameManager.createPlayer(logger, null, socket);
    socket.emit(events.PLAYER_CREATED, { id: p.id });
    socket.on(events.NEW_GAME, (evt) =>
      createGame(io, socket, gameManager, logger, evt),
    );
    socket.on(events.UPDATE_GAMES_LIST, () => updateGameList(io, gameManager));
    socket.on(events.PLAYER_UPDATED, (evt) =>
      updatePlayerName(socket, gameManager, evt),
    );
    socket.on(events.JOIN_GAME, (evt) => {
      joinGame(io, socket, gameManager, evt);
    });
    socket.on(events.LEAVE_GAME, (evt) => {
      leaveGame(io, socket, gameManager, evt);
    });

    socket.on("disconnect", () => logger.info(`client left`));
  });

  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: {
        server,
      },
    },
    appType: "spa",
  });
  app.use(vite.middlewares);
  server.listen(port, () => {
    console.log(`RedTetris running on http://localhost:${port}`);
  });
}
createMainServer();
