import EventEmitter from "events";
import { Screen } from "../screen";
import { BoxUI } from "./box";
import { Widgets } from "blessed";

type Command = 'join' | 'msg' | 'clear-chat' | 'help';

export class CommandLogBox {
  private screen;
  private boxCreator;
  private events: EventEmitter;
  private ui: Widgets.BoxElement | undefined;

  private commandLog: string[] = [];

  private possibleCommands: Record<Command, (arg: string) => string> = {
    'join': (roomId: string) => `User joined room: ${roomId}`,
    'msg': (_: string) => '',
    'clear-chat': (_: string) => 'Clearing all chat messages',
    'help': (_: string) => 'help',
  };

  constructor(screen: Screen, boxCreator: BoxUI, events: EventEmitter) {
    this.screen = screen;
    this.boxCreator = boxCreator;
    this.events = events;
  }

  build() {
    this.ui = this.boxCreator.createBox({
      bottom: 1,
      left: '50%',
      width: '50%',
      height: '20%',
      label: 'Command Log',
      content: '',
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      vi: true,
      mouse: true,
    });

    this.registerForEvents();
    return this.ui;
  }

  private registerForEvents() {
    this.events.on('command', ({ cmd, args }: { cmd: string; args: string[] }) => {
      if (cmd in this.possibleCommands) {
        if (cmd === 'msg') return;
        const typedCmd = cmd as Command;
        const msg = this.possibleCommands[typedCmd](args[0] || '');
        if (msg) {
          this.commandLog.push(msg);
          this.ui?.pushLine(msg);
        }
      } else {
        const msg = `Unknown command: ${cmd}`;
        this.commandLog.push(msg);
        this.ui?.pushLine(msg);
      }

      this.ui?.setScrollPerc(100);
      this.screen.render();
    });
  }
}
