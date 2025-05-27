import { Widgets } from 'blessed';
import EventEmitter from 'events';
import { io } from 'socket.io-client';
import { User } from '../domain/user/user';

type Command = 'join' | 'msg' | 'username:changed';


export class SocketConenction {
  private _socket = io('http://localhost:3000');
  private CURRENT_ROOM = '';
  private events: EventEmitter;
  private user: User;
  private possibleUserCommands: Record<Command, (arg: string[]) => void> = {
    'join': (roomId) => this.joinRoom(roomId),
    'msg': (msg) => this.sendMessage(msg),
    'username:changed': (username) => this.changeUsername(username),
  };

  get socket() {
    return this._socket;
  }

  constructor(events: EventEmitter, user: User) {
    this.events = events;
    this.user = user;
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
      this._socket.emit('joinRoom', { roomId: room, username: this.user.username });
    }
  }

  sendMessage(message: string[]) {
    if (this.CURRENT_ROOM) {
      this._socket.emit('sendMessage', { roomId: this.CURRENT_ROOM, message: message.join(' ').trim() });
    }
  }

  changeUsername({ username }: { oldUsername: string, username: string }) {
    if (this.CURRENT_ROOM) {
      this._socket.emit('changeUsername', { roomId: this.CURRENT_ROOM, username });
    }
  }

  initSocket(chatBox: Widgets.BoxElement) {

    this._socket.on('newMessage', (payload) => {
      appendLog(`${payload.sender}: ${payload.message}`);
    });

    this._socket.on('userJoined', (payload) => {
      appendLog(`${payload.username}: joined the room "${payload.roomId}".`);
    });

    // Helper to append text to log box
    function appendLog(message: string) {
      chatBox.setContent(chatBox.getContent() + message + '\n');
      chatBox.setScrollPerc(100);
    }
  }
}