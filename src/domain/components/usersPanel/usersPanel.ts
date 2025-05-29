import { Widgets } from "blessed";
import { SocketConnection } from "../../../infrastructure/socket";
import { Screen } from "../../screen";
import { BoxUI } from "./../box";
import { UsersRoomList } from "./usersPanel.types";

export class UsersPanel {
  private ui: Widgets.BoxElement | undefined;
  private listOfUsersinRoom: UsersRoomList = {};
  constructor(private io: SocketConnection, private boxCreator: BoxUI, private screen: Screen) {
    this.registerToServerEvents();
  }


  registerToServerEvents() {
    this.io.socket.on('joinedRoom', (payload) => this.updaterUsersList(payload.users));

    this.io.socket.on('updateUserList', (payload) => this.updaterUsersList(payload.users));
  }

  private updaterUsersList(users: UsersRoomList) {
    this.listOfUsersinRoom = users;
    this.updateUsersUIList();
  }

  private updateUsersUIList() {
    if (!this.ui) return;
    const users = Object.keys(this.listOfUsersinRoom);

    if (!users) {
      this.ui.setContent('You are the only one here.');
      this.ui.screen?.render();
    }

    const lines = users.map((socketId) => {
      if (socketId !== this.io.socket.id) {
        const line = `${this.listOfUsersinRoom[socketId]}`;
        return line
      }
    }).filter(user => user).join('\n');
    this.ui.setContent(lines);
    this.ui.screen?.render();
  }

  build() {
    this.ui = this.boxCreator.createBox({
      top: '40%',
      left: 0,
      width: '50%',
      height: '40%',
      label: 'People in this room',
      content: 'You are currently not connected to a room.',
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

    // Doesn't work in every terminal, focus with tab/alt+tab is
    // globally defined as fallback.
    this.ui.on('element click', () => {
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
}