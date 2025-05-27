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

  private splitCommandsForColumns(cmds: string[][]): string[][] {
    const half = Math.ceil(cmds.length / 2);
    const left = cmds.slice(0, half);
    const right = cmds.slice(half);
    const maxRows = Math.max(left.length, right.length);

    const rows: string[][] = [];
    for (let i = 0; i < maxRows; i++) {
      const leftRow = left[i] || ['', ''];
      const rightRow = right[i] || ['', ''];
      rows.push([...leftRow, ...rightRow]); // flatten into 4 cols
    }
    return rows;
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

    const cmds4cols = this.splitCommandsForColumns(commands);
    const commandsText = this.formatCommands(cmds4cols, [10, 25, 10, 25]);
    ui.setContent(commandsText);
    return ui;
  }

}