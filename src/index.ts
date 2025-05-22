import { BoxUI } from './domain/components/box';
import { CommandBar } from './domain/components/commandBar';
import { CommandHelpTextUI } from './domain/components/commandHelpText';
import { CommandLogBox } from './domain/components/commandLog';
import { Screen } from './domain/screen';
import { User } from './domain/user/user';
import { SocketConenction } from './infrastructure/socket';


// ───── Create Screen ─────
const screen = new Screen();

// ───── Boxes ─────
const boxUi = new BoxUI(screen);

const chatBox = boxUi.createBox({
  top: 0,
  left: 0,
  width: '100%',
  height: '40%',
  label: 'Chat messages',
  content: '',
});

const usersBox = boxUi.createBox({
  top: '40%',
  left: 0,
  width: '50%',
  height: '40%',
  label: 'People in this room',
  content: '',
});

const roomsBox = boxUi.createBox({
  top: '40%',
  left: '50%',
  width: '50%',
  height: '40%',
  label: 'Chat rooms',
  content: '',
});

const commandHelpText = new CommandHelpTextUI(screen, boxUi);
const commands = [
  ['Command', 'Description'],
  [':q / :quit', 'Quit app'],
  [':clear', 'Clear chat log'],
  [':help', 'Show help info'],
];

// ───── Command Bar ─────
const commandBar = new CommandBar(screen);
const commandLogBox = new CommandLogBox(screen, boxUi, commandBar.events);

// ───── Add Boxes to Screen ─────
const components = [
  chatBox,
  usersBox,
  roomsBox,
  commandLogBox.build(),
  commandHelpText.build(commands),
  commandBar.build(),
];
screen.buildScreen(components)

// ───── Init ─────
screen.render();
const user = new User(commandBar.events);
const socket = new SocketConenction(commandBar.events, user);
socket.initSocket(chatBox);

