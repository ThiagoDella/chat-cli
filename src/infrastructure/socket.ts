import { text, Widgets } from 'blessed';
import EventEmitter from 'events';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { io } from 'socket.io-client';
import { User } from '../domain/user/user';

type Command = 'join' | 'msg' | 'username:changed';

const logoText = readFileSync(resolve(__dirname, './logo.txt')).toString();


export class SocketConnection {
  private _socket = io('http://localhost:3000');
  private CURRENT_ROOM = '';
  private events: EventEmitter;
  private user: User;
  private _logLineCount = 0;
  private chatBox: Widgets.BoxElement | undefined;
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

  appendLog(message: string | Widgets.TextElement[]) {
    if (!this.chatBox) return;
    let segments: Widgets.TextElement[];

    if (typeof message === 'string') {
      segments = [text({
        top: this._logLineCount,
        left: 0,
        content: message,
        tags: true,
      })];
    } else {
      segments = message;
    }


    // Ensure all segments share the same top value (same line)
    segments.forEach((segment) => {
      segment.top = this._logLineCount;
      this.chatBox!.append(segment);
    });

    if (this._logLineCount === 0) {
      this._logLineCount = 8; // accounts for logo.txt file
    } else {
      this._logLineCount++; // advance only once for the entire message line  
    }

    this.chatBox.setScrollPerc(100);
    this.chatBox.screen.render();

  }

  receiveMessage(payload) {
    const segments: Widgets.TextElement[] = [];

    const sender = payload.sender ? `${payload.sender}:` : '';
    const message = payload.message;

    const regex = /<link>(.*?)<\/link>/g;
    let lastIndex = 0;

    // Add sender as a bold segment
    if (sender) {
      const _text = sender === 'TalkTerms:' ?
        `{white-bg}{black-fg}${sender}{/black-fg}{/white-bg}`
        : `{bold}${sender}{/bold}`
      segments.push(text({
        left: 0,
        tags: true,
        content: _text,
      }));
    }

    const baseOffset = sender.length;
    let offset = baseOffset;

    // Parse message and inject text and links
    let match;
    while ((match = regex.exec(message)) !== null) {
      const start = match.index!;
      const end = regex.lastIndex;
      const url = match[1]; // the inner URL

      // Add plain text before the link
      if (start > lastIndex) {
        const textChunk = message.slice(lastIndex, start);
        segments.push(text({
          left: offset,
          tags: true,
          content: ` ${textChunk}`,
        }));
        offset += textChunk.length;
      }

      // Add link without the <link> tags
      const linkNode = text({
        left: offset,
        tags: true,
        content: `{blue-fg}{underline}${url}{/underline}{/blue-fg}`,
        mouse: true,
        clickable: true,
        style: {
          hover: { bg: 'gray' },
        },
      });

      linkNode.on('click', () => open(url));
      segments.push(linkNode);
      offset += url.length;

      lastIndex = end;
    }

    // Add remaining text after the last link
    if (lastIndex < message.length) {
      const remaining = message.slice(lastIndex);
      segments.push(text({
        left: offset,
        tags: true,
        content: ` ${remaining}`,
      }));
    }

    this.appendLog(segments);
  }


  initSocket(chatBox: Widgets.BoxElement) {
    this.chatBox = chatBox;
    // Initialize logo
    setTimeout(() => {
      this.receiveMessage({ message: logoText });
      this._socket.on('newMessage', (payload) => this.receiveMessage(payload));

      this._socket.on('joinedRoom', (payload) => this.receiveMessage(
        {
          sender: 'TalkTerms',
          message: `${payload.username} joined the room "${payload.roomId}"`
        }));
    }, 0);

  }
}