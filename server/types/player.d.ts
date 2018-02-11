declare module 'player' {
  class Player {
    constructor(playlist: string | string[]);
    add(filename: string): void;
    play(): void;
    stop(): void;
    on: {
      (type: 'playing', listener: (item: string) => void): void;
      (type: 'playend', listener: (item: string) => void): void;
      (type: 'error', listener: (err: Error) => void): void;
    };
  }

  export = Player;
}
