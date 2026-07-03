import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './api';

class GameSocket {
  static socket: Socket | null = null;
  static callbacks: { [event: string]: Function[] } = {};

  static async initialize() {
    if (this.socket) {
      return; // Already initialized
    }

    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      console.warn('SocketInit: No access token found');
      return;
    }

    // Connect to the base URL (e.g. http://localhost:3000) not the /api/v1 prefix
    // By extracting origin from BASE_URL or just passing it directly
    let socketUrl = BASE_URL;
    if (socketUrl.endsWith('/api/v1')) {
      socketUrl = socketUrl.replace('/api/v1', '');
    }

    this.socket = io(socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected! ID:', this.socket?.id);
    });

    this.socket.on('connect_error', async (err) => {
      console.error('Socket connect_error:', err.message);
      if (err.message.toLowerCase().includes('auth') || err.message.toLowerCase().includes('token')) {
        console.warn('Socket Auth Failed. Token might be expired.');
        // If token expires, we should ideally trigger a refresh via the api.ts interceptor
        // For now, we wait for the next successful API call to update the token and reconnect.
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
    });

    // ── Universal Game Event Listener ──
    this.socket.on('game_event', (payload) => {
      console.log('Received game_event payload:', payload);
      const cbs = this.callbacks['game_event'] || [];
      cbs.forEach(cb => cb(payload));
    });

    // ── Partner Joined Listener ──
    this.socket.on('partner_joined', (payload) => {
      console.log('Partner joined!', payload);
      const cbs = this.callbacks['partner_joined'] || [];
      cbs.forEach(cb => cb(payload));
    });

    // ── Remote Card Engine Event Listeners ──
    const cardEvents = [
      'card_received',
      'card_seen',
      'card_accepted',
      'card_deflected',
      'card_completed_by_receiver',
      'card_confirmed',
      'card_rejected',
      'card_reminder',
      'deflect_card_used',
      'card_reversed',
      'card_timeout_extended'
    ];

    cardEvents.forEach(evt => {
      this.socket?.on(evt, (payload) => {
        console.log(`Received remote socket event [${evt}] with payload:`, payload);
        const cbs = this.callbacks['game_event'] || [];
        cbs.forEach(cb => cb({ eventType: evt.toUpperCase(), data: payload }));
      });
    });
  }

  static joinRoom(roomCode: string) {
    if (this.socket && this.socket.connected) {
      console.log('Emitting join_room with code:', roomCode);
      this.socket.emit('join_room', roomCode);
    } else {
      console.warn('joinRoom called but socket is not connected yet.');
      // Wait a bit or try after connection
      if (this.socket) {
        this.socket.once('connect', () => {
          console.log('Socket connected, emitting join_room with code:', roomCode);
          this.socket?.emit('join_room', roomCode);
        });
      }
    }
  }

  static sendGameEvent(roomCode: string, eventType: string, data: any) {
    if (this.socket && this.socket.connected) {
      const payload = { roomCode, eventType, data };
      console.log('Emitting game_event:', payload);
      this.socket.emit('game_event', payload);
    } else {
      console.warn('Cannot send game_event, socket is not connected');
    }
  }

  static on(event: 'game_event' | 'partner_joined', callback: Function) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  static off(event: 'game_event' | 'partner_joined', callback: Function) {
    if (!this.callbacks[event]) return;
    this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
  }

  static disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default GameSocket;
