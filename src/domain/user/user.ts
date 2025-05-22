import { randomUUID } from "crypto";
import EventEmitter from "events";

type Command = 'username';


export class User {
  private events: EventEmitter;
  private user: string = randomUUID();
  private possibleUserCommands: Record<Command, (arg: string) => void> = {
    'username': (username) => this.setUsername(username),
  };

  constructor(events: EventEmitter) {
    this.events = events;
    this.registerForEvents();
  }

  setUsername(username: string) {
    const oldUsername = this.user;
    this.user = username;
    this.events.emit('command', { cmd: 'username:changed', args: { oldUsername, username } });
  }

  private registerForEvents() {
    this.events.on('command', ({ cmd, args }: { cmd: string; args: string[] }) => {
      if (cmd in this.possibleUserCommands) {
        const typedCmd = cmd as Command;
        this.possibleUserCommands[typedCmd](args[0] || '');
      }
    });
  }

  public get username(): string {
    return this.user;
  }

}