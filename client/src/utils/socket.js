// client/src/utils/socket.js
import { io } from 'socket.io-client';

let socket;
export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      withCredentials: false,
    });
  }
  return socket;
};
