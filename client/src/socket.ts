import { io } from 'socket.io-client';

export const socket = io({ autoConnect: true });

export default socket;
