import blessed, { Widgets } from "blessed";

export class Screen {
  private readonly screen: Widgets.Screen;

  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'chat-cli',
    });

    this.screen.key(['escape', 'q', 'C-c'], () => {
      process.exit(0);
    });
  }

  get focused() {
    return this.screen.focused;
  }

  key(...args: Parameters<Widgets.Screen["key"]>) {
    return this.screen.key(...args);
  }

  append(node: Widgets.Node) {
    return this.screen.append(node);
  }

  buildScreen(components: Widgets.Node[]) {
    components.forEach((box) => this.append(box));
  }

  render() {
    this.screen.render();
  }
};
