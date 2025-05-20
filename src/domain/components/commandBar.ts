import blessed, { Widgets } from 'blessed';
import { EventEmitter } from 'events';
import { Screen } from "../screen";

export class CommandBar {
  private screen;
  private lastFocusedBox: Widgets.Node | null = null;
  private ui: Widgets.TextboxElement | undefined;
  public readonly events = new EventEmitter();

  constructor(screen: Screen) {
    this.screen = screen;
  }

  build() {
    this.ui = blessed.textbox({
      bottom: 0,
      left: 0,
      width: '100%',
      height: 1,
      hidden: true,
      inputOnFocus: true,
      style: {
        fg: 'white',
        bg: 'blue',
      },
    });

    this.screen.key(':', () => this.showCommandBar());

    this.attachCommandListener();
    return this.ui;

  }

  private showCommandBar = () => {
    if (this.ui) {
      this.lastFocusedBox = this.screen.focused;
      this.ui.show();
      this.ui.setValue(':');
      this.screen.render();
      this.ui.focus();
    }
  };

  private attachCommandListener() {
    this.ui?.on('submit', (value) => {
      const tokens = value.trim().replace(/^:/, '').split(' ');
      const cmd = tokens[0];
      const args = tokens.slice(1);

      // Emit the command and arguments
      this.events.emit('command', { cmd, args });

      // Built-in quit shortcut
      if (cmd === 'q' || cmd === 'quit') {
        process.exit(0);
      }

      this.ui?.clearValue();
      this.ui?.hide();
      if (this.lastFocusedBox) this.lastFocusedBox.focus();
      this.screen.render();
    });
  }
}