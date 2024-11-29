import type { Tile, Country } from './map';
import { GameMap } from './map';
import { Player } from './player';
import { Trade } from './trade';

interface Log {
  player?: Player;
  message: string;
}

class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvasId: string, players: Player[], mapTiles: Tile[], mapCountries: Country[]) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    
    this.players = players;
    this.me = this.players[0];
    this.map = new GameMap(mapTiles, mapCountries);
    
    // Set canvas size
    this.canvas.width = 800;
    this.canvas.height = 800;
    
    // Start game loop
    this.gameLoop();
  }


  private drawCanvas = (): void => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  }

  private gameLoop = (): void => {
    this.drawCanvas();
    
    // Request next frame
    requestAnimationFrame(this.gameLoop);
  }

  public printLog = (message: string, player?: Player): void => {
    this.logs.push({ message, player });
  }

  private me: Player;
  private map: GameMap;
  private players: Player[] = [];
  private currentTurn= 0;
  private activeTrades: Trade[] = [];
  private logs: Log[] = [];
}

export { Game };