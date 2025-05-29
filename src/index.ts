import { BoxUI } from './domain/components/box';
import { CommandBar } from './domain/components/commandBar';
import { CommandHelpTextUI } from './domain/components/commandHelpText';
import { CommandLogBox } from './domain/components/commandLog';
import { RoomsPanel } from './domain/components/roomsPanel';
import { UsersPanel } from './domain/components/usersPanel/usersPanel';
import { Screen } from './domain/screen';
import { User } from './domain/user/user';
import { SocketConnection } from './infrastructure/socket';


// ───── Prepare Logo ─────

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
  tags: true,
});



const commandHelpText = new CommandHelpTextUI(screen, boxUi);
const commands = [
  ['tab', 'Forward focus on panels'],
  ['shift+tab', 'Backward focus on panels'],
  [':q / :quit', 'Quit app'],
  [':clear', 'Clear chat log'],
  [':help', 'Show help info'],

  [':username', 'Changes your username'],
  [':join {room}', 'Joins a chat room'],
  [':msg {msg}', 'sends a message'],
];

// ───── Command Bar ─────
const commandBar = new CommandBar(screen);
const commandLogBox = new CommandLogBox(screen, boxUi, commandBar.events);

// ───── Init ─────
const user = new User(commandBar.events);
const socket = new SocketConnection(commandBar.events, user);

const roomsBox = new RoomsPanel(socket, boxUi, screen);
const usersBox = new UsersPanel(socket, boxUi, screen);

socket.initSocket(chatBox);

// ───── Add Boxes to Screen ─────
const components = [
  chatBox,
  usersBox.build(),
  roomsBox.build(),
  commandLogBox.build(),
  commandHelpText.build(commands),
  commandBar.build(),
];
screen.buildScreen(components)
screen.render();
