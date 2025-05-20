import blessed, { Widgets } from "blessed";
import { Screen } from "../screen";

export class BoxUI {
  private screen;
  constructor(screen: Screen) {
    this.screen = screen;
  }
  createBox = (opts: Partial<Widgets.BoxOptions>) => {
    const _opts = {
      scrollable: true,
      keys: true,
      mouse: true,
      vi: true,
      alwaysScroll: true,
      border: 'line',
      style: {
        fg: 'white',
        bg: opts.style?.bg ?? undefined,
        border: { fg: 'white' },
      },
      ...opts,
    };

    const box = blessed.box(_opts);

    let blinkInterval: NodeJS.Timer | null = null;
    let toggle = false;

    box.on('focus', () => {
      blinkInterval = setInterval(() => {
        toggle = !toggle;
        box.style.border.fg = toggle ? 'red' : 'yellow';
        this.screen.render();
      }, 400);
    });

    box.on('blur', () => {
      if (blinkInterval) clearInterval(blinkInterval);
      box.style.border.fg = 'white';
      this.screen.render();
    });

    return box;
  };
}