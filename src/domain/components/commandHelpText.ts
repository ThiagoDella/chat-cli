import { Screen } from "../screen";
import { BoxUI } from "./box";

export class CommandHelpTextUI {
  private screen;
  private boxCreator;

  constructor(screen: Screen, boxCreator: BoxUI) {
    this.screen = screen;
    this.boxCreator = boxCreator;
  }

  private formatCommands(cmds: string[][], colWidths: number[]) {
    return cmds
      .map(row =>
        row
          .map((col, i) => col.padEnd(colWidths[i]))
          .join('  ')
      )
      .join('\n');
  }

  build(commands: Array<string[]>) {
    const ui = this.boxCreator.createBox({
      bottom: 1,
      left: 0,
      width: '50%',
      height: '20%',
      label: 'Commands',
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      mouse: true,
      vi: true,
    });

    const commandsText = this.formatCommands(commands, [12, 30]);
    ui.setContent(commandsText);
    return ui;
  }

}