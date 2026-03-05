import { io } from 'socket.io-client';

export const socket = io({ autoConnect: false });

export default socket;
