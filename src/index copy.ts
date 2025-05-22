import blessed, { Widgets } from 'blessed';
import * as fs from 'fs';
import { initSocket, joinRoom, sendMessage } from './infrastructure/socket';
import { Screen } from './domain/screen';

// Simple logging helper to file without overriding process.stdout
const logStream = fs.createWriteStream('debug.log', { flags: 'a' });
function logToFile(...args: any[]) {
  logStream.write(args.map(String).join(' ') + '\n');
}

// ───── Create Screen ─────
const screen = new Screen();

// ───── Box Creators ─────
const createBox = (opts: Partial<Widgets.BoxOptions>) => {
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
      screen.render();
    }, 400);
  });

  box.on('blur', () => {
    if (blinkInterval) clearInterval(blinkInterval);
    box.style.border.fg = 'white';
    screen.render();
  });

  return box;
};

// ───── Boxes ─────
const chatBox = createBox({
  top: 0,
  left: 0,
  width: '100%',
  height: '40%',
  label: 'Chat messages',
  content: '',
});

const usersBox = createBox({
  top: '40%',
  left: 0,
  width: '50%',
  height: '40%',
  label: 'People in this room',
  content: '',
});

const roomsBox = createBox({
  top: '40%',
  left: '50%',
  width: '50%',
  height: '40%',
  label: 'Chat rooms',
  content: '',
});

const commandLogBox = createBox({
  bottom: 1,
  left: '50%',
  width: '50%',
  height: '20%',
  label: 'Command Log',
  content: '',
});

const commandBox = createBox({
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

// Manually format command list as a string with padding
const commands = [
  ['Command', 'Description'],
  [':q / :quit', 'Quit app'],
  [':clear', 'Clear chat log'],
  [':help', 'Show help info'],
];

// Function to create fixed width columns (e.g. 12 chars)
function formatCommands(cmds: string[][], colWidths: number[]) {
  return cmds
    .map(row =>
      row
        .map((col, i) => col.padEnd(colWidths[i]))
        .join('  ') // double space between columns
    )
    .join('\n');
}

// Example usage
const commandsText = formatCommands(commands, [12, 30]);
commandBox.setContent(commandsText);
// ───── Command Bar ─────
const commandBar = blessed.textbox({
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
// screen.append(commandBar);

let lastFocusedBox: Widgets.Node | null = null;

const showCommandBar = () => {
  lastFocusedBox = screen.focused;
  commandBar.show();
  commandBar.setValue(':');
  screen.render();
  commandBar.focus();
};

screen.key(':', showCommandBar);

commandBar.on('submit', (value) => {
  // Split input on space, first token = command, rest = args
  const tokens = value.trim().replace(/^:/, '').split(' ');
  const cmd = tokens[0];
  const args = tokens.slice(1);

  logToFile(`Command submitted: ${cmd} ${args.join(' ')}`);

  switch (cmd) {
    case 'q':
    case 'quit':
      process.exit(0);
      break;
    case 'join':
      if (args.length === 0 || !args[0].trim()) {
        commandLogBox.setContent('Error: No room ID provided for join command.');
      } else {
        joinRoom(args[0]);
      }
      break;
    case 'msg':
      if (args.length === 0 || !args.join(' ').trim()) {
        commandLogBox.setContent('Error: No message provided for msg command.');
      } else {
        const message = args.join(' ');
        sendMessage(message);
      }
      break;
    case 'username':
      if (args.length === 0 || !args[0].trim()) {
        commandLogBox.setContent('Error: Impossible to change name.');
      } else {
        joinRoom(args[0]);
      }
      break;
    case 'clear':
      commandLogBox.setContent('');
      break;
    case 'help':
      commandLogBox.setContent([
        'Available commands:',
        ':q / :quit       - Quit app',
        ':join <roomId>   - Join chat room',
        ':clear           - Clear chat',
        ':help            - Show this help',
      ].join('\n'));
      break;
    default:
      commandLogBox.setContent(`Unknown command: ${cmd}`);
  }

  commandBar.clearValue();
  commandBar.hide();
  if (lastFocusedBox) lastFocusedBox.focus();
  screen.render();
});

commandBar.key('escape', () => {
  commandBar.hide();
  commandBar.clearValue();
  if (lastFocusedBox) lastFocusedBox.focus();
  screen.render();
});

// ───── Add Boxes to Screen ─────
// const components = [chatBox, usersBox, roomsBox, commandBox, commandLogBox, commandBar];
const components = [chatBox];
screen.buildScreen(components)

// ───── Focus Navigation ─────
let focusIndex = 0;
const focusNext = () => {
  focusIndex = (focusIndex + 1) % components.length;
  components[focusIndex].focus();
};
const focusPrev = () => {
  focusIndex = (focusIndex - 1 + components.length) % components.length;
  components[focusIndex].focus();
};

screen.key('tab', () => {
  focusNext();
  screen.render();
});

screen.key('S-tab', () => {
  focusPrev();
  screen.render();
});

// ───── Global Exit ─────
screen.key(['escape', 'q', 'C-c'], () => {
  logToFile('Exiting chat-cli');
  process.exit(0);
});

// ───── Init ─────
chatBox.focus();
screen.render();
initSocket(chatBox);
logToFile('chat-cli UI started');
