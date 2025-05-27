import blessed, { Widgets } from "blessed";

export class Screen {
  private readonly screen: Widgets.Screen;
  private focusableNodes: (Widgets.Node & { focus: () => void })[] = [];
  private focusedIndex = 0;

  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'chat-cli',
      mouse: true,
      sendFocus: true,
    });

    this.screen.key(['escape', 'q', 'C-c'], () => {
      process.exit(0);
    });

    this.screen.key('tab', () => {
      this.focusNext();
    });

    this.screen.key(['S-tab', 'shift-tab'], () => {
      this.focusPrevious();
    });
  }

  private focusNext() {
    if (this.focusableNodes.length === 0) return;

    this.focusedIndex = (this.focusedIndex + 1) % this.focusableNodes.length;
    this.focusableNodes[this.focusedIndex].focus();
    this.render();
  }

  private focusPrevious() {
    if (this.focusableNodes.length === 0) return;

    this.focusedIndex =
      (this.focusedIndex - 1 + this.focusableNodes.length) %
      this.focusableNodes.length;
    this.focusableNodes[this.focusedIndex].focus();
    this.render();
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

  isFocusable(node: Widgets.Node): node is Widgets.Node & { focus: () => void } {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return typeof (node as any).focus === 'function';
  }


  buildScreen(components: Widgets.Node[]) {
    components.forEach(box => {
      this.append(box);

      if (this.isFocusable(box)) {
        this.focusableNodes.push(box);
      }
    });

    if (this.focusableNodes.length > 0) {
      this.focusableNodes[0].focus();
    }
  }

  render() {
    this.screen.render();
  }
};
