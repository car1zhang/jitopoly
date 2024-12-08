import type { Tile, Country, EventTile, PropertyTile } from './map';
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
    this.me = this.players[0]; // how will this work using socket
    this.map = new GameMap(mapTiles, mapCountries);
    
    // Set canvas size
    this.canvas.width = 800;
    this.canvas.height = 800;
    
    // Start game loop
    this.gameLoop();
  }

  public updateMapWithTile = (newTile: Tile): void => {
    this.map.updateTiles(newTile);
  }

  public tileAction = (newTile: Tile): void => {
    if('country' in newTile){
      if(newTile.houses > 0){
        // owned by someone
        if(this.me != newTile.owner){
          const currentRent = newTile.rent[newTile.houses];
          this.me.money -= currentRent; // check if money is in negatives
          this.printLog(`${this.me.name} pays ${newTile.owner} $${currentRent} for rent`, this.me);
        }
      }
      else{
        // give option to buy house
      }
    }
    else{
      newTile.event(this.me);
    }
  }

  public buyHouse = (newTile: PropertyTile): void => {
    if(newTile.houses == 0){
      newTile.owner = this.me;
      const playerMoney:number = this.me.money;
      const houseCost:number = newTile.basePrice;
      if(playerMoney > houseCost){
        this.me.money -= houseCost;
        newTile.owner = this.me;
        newTile.houses = 1;
        this.printLog(`${this.me.name} bought property in ${newTile.name}`, this.me);
        this.updateMapWithTile(newTile);
      }
      else{
        // can't buy
        // add option to sell house/mortage
      }
    }
  }

  public upgradeHouse = (newTile: PropertyTile): void => {
    const upgradeCost = newTile.upgradePrice;
    if(newTile.houses < 5 && this.me.money >= upgradeCost){
      newTile.houses+=1;
      this.me.money -= upgradeCost;
      this.printLog(`${this.me.name} upgraded house to level ${newTile.houses}`, this.me);
      this.updateMapWithTile(newTile);
    }
  }

  public downgradeHouse = (newTile: PropertyTile): void => {
    if(newTile.houses > 0){
      if(this.me == newTile.owner){
        // sell back for 80%
        if(newTile.houses == 1){
          this.me.money += Math.floor(0.8 * newTile.basePrice);
          newTile.owner = undefined;
        }
        else{
          this.me.money += Math.floor(0.8 * newTile.upgradePrice);
        }
        newTile.houses-=1;
      }
    }
  }

  public makeMove = (): void => {
    const rollDice1:number = Math.floor(Math.random() * 6) + 1;
    const rollDice2:number = Math.floor(Math.random() * 6) + 1;
    const moveForward = rollDice1 + rollDice2;
    const newPosition:number = (this.me.position + moveForward) % this.map.mapSize();
    const originalPosition:number = this.me.position;
    this.me.position = newPosition;

    const newTile:Tile = this.map.getTile(newPosition);
    this.printLog(`${this.me.name} moves forward ${moveForward} squares`, this.me);

    if(originalPosition > newPosition && newPosition != 0){
      const startTile = this.map.getTile(0) as EventTile;
      startTile.event(this.me);
    }
    this.tileAction(newTile);
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
  private currentTurn= 0; // add this in later
  private activeTrades: Trade[] = [];
  private logs: Log[] = [];
}

export { Game };