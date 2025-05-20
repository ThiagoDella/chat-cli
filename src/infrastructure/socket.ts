import { Widgets } from 'blessed';
import EventEmitter from 'events';
import { io } from 'socket.io-client';

// const socket = io('http://localhost:3000');

// let CURRENT_ROOM = '';

// export const sendMessage = (message: string) => {
//   if (CURRENT_ROOM) {
//     socket.emit('sendMessage', { roomId: CURRENT_ROOM, message: message.trim() });
//   }
// }

// export const joinRoom = (roomId: string) => {
//   const room = roomId.trim();
//   if (room) {
//     CURRENT_ROOM = roomId;
//     socket.emit('joinRoom', { roomId: room, username: 'Thiago' });
//   }
// }

// export const initSocket = (logBox) => {
//   // Listen for server response
//   socket.on('newMessage', (payload) => {
//     appendLog(`${payload.sender}: ${payload.message}`);
//   });

//   socket.on('userJoined', (payload) => {
//     appendLog(`${payload.username}: joined the room ${payload.roomId}.`);
//   });

//   // Helper to append text to log box
//   function appendLog(message: string) {
//     logBox.setContent(logBox.getContent() + message + '\n');
//     logBox.setScrollPerc(100);
//   }

// }

type Command = 'join' | 'msg';


export class SocketConenction {
  private socket = io('http://localhost:3000');
  private CURRENT_ROOM = '';
  private events: EventEmitter;
  private possibleUserCommands: Record<Command, (arg: string[]) => void> = {
    'join': (roomId) => this.joinRoom(roomId),
    'msg': (msg) => this.sendMessage(msg),
  };

  constructor(events: EventEmitter) {
    this.events = events;
    this.registerForEvents();
  }

  private registerForEvents() {
    this.events.on('command', ({ cmd, args }: { cmd: Command; args: string[] }) => {
      if (cmd in this.possibleUserCommands) {
        this.possibleUserCommands[cmd](args)
      }
    });
  }

  joinRoom(roomId: string[]) {
    const room = roomId[0].trim();
    if (room) {
      this.CURRENT_ROOM = room;
      this.socket.emit('joinRoom', { roomId: room, username: 'Thiago' });
    }
  }

  sendMessage(message: string[]) {
    if (this.CURRENT_ROOM) {
      this.socket.emit('sendMessage', { roomId: this.CURRENT_ROOM, message: message.join(' ').trim() });
    }
  }


  initSocket(chatBox: Widgets.BoxElement) {

    this.socket.on('newMessage', (payload) => {
      appendLog(`${payload.sender}: ${payload.message}`);
    });

    this.socket.on('userJoined', (payload) => {
      appendLog(`${payload.username}: joined the room ${payload.roomId}.`);
    });

    // Helper to append text to log box
    function appendLog(message: string) {
      chatBox.setContent(chatBox.getContent() + message + '\n');
      chatBox.setScrollPerc(100);
    }
  }
}