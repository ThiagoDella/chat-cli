import { Widgets } from "blessed";
import { BoxUI } from "./box";
import { SocketConenction } from "../../infrastructure/socket";
import { Screen } from "../screen";

type RoomMap = Map<string, { [socketId: string]: string }>;

export class RoomsPanel {
  private ui: Widgets.BoxElement | undefined;
  private rooms: RoomMap = new Map();
  private currentRoom = null;

  constructor(private io: SocketConenction, private boxCreator: BoxUI, private screen: Screen) {
    this.registerToServerEvents();
  }

  registerToServerEvents() {
    this.io.socket.on('fetchRooms', (rooms) => {
      if (rooms) {
        this.rooms = new Map(rooms);
        this.updateRoomUI()
      }
    });

    this.io.socket.on('joinedRoom', (payload) => {
      this.rooms.set(payload.roomId, payload.users);
      this.currentRoom = payload.roomId;
      this.updateRoomUI();
    });
  }

  build() {
    this.ui = this.boxCreator.createBox({
      top: '40%',
      left: '50%',
      width: '50%',
      height: '40%',
      label: 'Chat rooms',
      content: '',
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      input: true,
      vi: true,
      mouse: true,
      tags: true,
      scrollbar: {
        ch: '│',
        track: {
          bg: 'grey',
        },
        style: {
          inverse: true,
        }
      },
    });

    this.ui.on('element click', () => {
      console.log('click');

      this.ui?.focus();
    })
    this.ui.on('wheeldown', () => {
      this.ui?.scroll(1);
      this.screen.render();
    });

    this.ui.on('wheelup', () => {
      this.ui?.scroll(-1);
      this.screen.render();
    });

    return this.ui;
  }

  private updateRoomUI() {
    if (!this.ui) return;

    const sortedRooms = new Map(
      [...this.rooms.entries()].sort(([, usersA], [, usersB]) =>
        Object.keys(usersB).length - Object.keys(usersA).length // descending
      )
    );

    const lines = [...sortedRooms.entries()].map(([roomId, users]) => {
      const line = `${roomId} — ${Object.keys(users).length} user(s)`;
      if (roomId === this.currentRoom) {
        return `{white-bg}{black-fg}${line}{/black-fg}{/white-bg}`; // highlighted
      }
      return line
    }).join('\n');
    this.ui.setContent(lines);
    this.ui.screen?.render();
  }
}