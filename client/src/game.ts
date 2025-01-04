import type { Tile, Country, EventTile, PropertyTile } from './map';
import { GameMap } from './map';
import { Player } from './player';
import { Trade } from './trade';
import { Canvas, FabricText, FabricImage, Rect, Group} from 'fabric';

interface Log {
  player?: Player;
  message: string;
}

class Game {
  private canvas: Canvas;
  private cornerSize: number;
  private tileSize: number;
  private activeTile: Tile | null;

  constructor(canvasId: string, me: Player, players: Player[], mapTiles: Tile[], mapCountries: Country[]) {
    this.canvas = new Canvas(canvasId);
    
    this.players = players;
    this.me = me;
    this.map = new GameMap(mapTiles, mapCountries);
 
    // Set canvas size
    this.canvas.setDimensions({ width: 800, height: 800 });
    this.canvas.selection = false;
    // set corner and tile sizes
    this.cornerSize = 100;
    this.tileSize = 600 / (this.map.mapSize() / 4 - 1);
    this.activeTile = null;
    // Start game loop
    this.gameLoop();
  }

  public updateMapWithTile = (newTile: Tile): void => {
    this.map.updateTiles(newTile);
  }

  public tileAction = (): void => {
    const newTile:Tile = this.map.getTile(this.me.position);

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

  public makeMove = (): Player => { // this function should return a player, not directly update it
    const originalPlayer = this.me;
    const rollDice1 = Math.floor(Math.random() * 6) + 1;
    const rollDice2 = Math.floor(Math.random() * 6) + 1;
    const moveForward = rollDice1 + rollDice2;
    const newPosition = (this.me.position + moveForward) % this.map.mapSize();
    const originalPosition = this.me.position;
    originalPlayer.position = newPosition;

    const newTile:Tile = this.map.getTile(newPosition);
    //this.printLog(`${this.me.name} moves forward ${moveForward} squares`, this.me);

    if(originalPosition > newPosition && newPosition != 0){
      const startTile = this.map.getTile(0) as EventTile;
      startTile.event(originalPlayer);
    }
    return originalPlayer;
  }

  public updatePlayer = (newPlayer: Player): void => {
    const findIndex = this.players.findIndex(player => player.id == newPlayer.id)
    console.log(this.players[findIndex], newPlayer, "updating player here");
    this.players[findIndex] = newPlayer;
  }

  public checkPlayerTurn = (ind: number): boolean => {
    const cur = this.players[ind];
    return (this.me.id == cur.id);
  }
  private showPropertyPopup = (tile: Tile, x: number, y: number): void => {
    const popup = document.getElementById('popup');
    if(popup){
      if(this.activeTile === tile){
        this.closePropertyPopup();
        return;
      }
      popup.style.left = `${x}px`;
      popup.style.top = `${y + 100}px`;
      popup.classList.remove('hidden');
      this.activeTile = tile;
      document.removeEventListener('mousedown', this.handlePopupClick);
      setTimeout(() => {
        document.addEventListener('mousedown', this.handlePopupClick);
      }, 0);
    }
  }
  private handlePopupClick = (event: MouseEvent): void => {
    const popup = document.getElementById('popup');
    const clickEvent = event.target as HTMLElement;
    if(popup && !popup.contains(clickEvent)) this.closePropertyPopup();
  }
  private closePropertyPopup = (): void => {
    this.activeTile = null;
    const popup = document.getElementById('popup') as HTMLDivElement;
    popup.classList.add('hidden');
    document.removeEventListener('mousedown', this.handlePopupClick);
  }

  private drawCanvas = (): void => {
    let currentTile = 0;
    let sideTiles = this.map.mapSize() / 4;
    let x=0, y=0;
    // draw top row
    for(let top=0; top<sideTiles; top++){
      if(top == 0){
        this.drawTile(x, y, this.cornerSize, this.cornerSize, this.map.getTile(currentTile));
        x+=this.cornerSize;
      }
      else{
        this.drawTile(x, y, this.tileSize, this.cornerSize, this.map.getTile(currentTile));
        x+=this.tileSize;
      }
      currentTile++;
    }
    // draw right column
    for(let right=0; right<sideTiles; right++){
      if(right == 0){
        this.drawTile(x, y, this.cornerSize, this.cornerSize, this.map.getTile(currentTile));
        y+=this.cornerSize;
      }
      else{
        this.drawTile(x, y, this.cornerSize, this.tileSize, this.map.getTile(currentTile));
        y+=this.tileSize;
      }
      currentTile++;
    }
    // draw bottom row
    for(let bottom=0; bottom<sideTiles; bottom++){
      if(bottom == 0){
        this.drawTile(x, y, this.cornerSize, this.cornerSize, this.map.getTile(currentTile));
        x-=this.tileSize;
      }
      else if(bottom == sideTiles-1){
        this.drawTile(x, y, this.tileSize, this.cornerSize, this.map.getTile(currentTile));
        x-=this.cornerSize;
      }
      else{
        this.drawTile(x, y, this.tileSize, this.cornerSize, this.map.getTile(currentTile));
        x-=this.tileSize;
      }
      currentTile++;
    }
    // draw left column
    for(let left=0; left<sideTiles; left++){
      if(left == 0){
        this.drawTile(x, y, this.cornerSize, this.cornerSize, this.map.getTile(currentTile));
        y-=this.tileSize;
      }
      else{
        this.drawTile(x, y, this.cornerSize, this.tileSize, this.map.getTile(currentTile));
        y-=this.tileSize;
      }
      currentTile++;
    }
  }
  private drawTile = (x: number, y: number, width: number, height: number, tile: Tile): void => {
    const rect = new Rect({
      left: x,
      top: y,
      fill: 'yellow',
      width: width,
      height: height,
      stroke: 'black',
      strokeWidth: 1,
      hoverCursor: (tile as PropertyTile).country ? 'pointer' : 'default'
    })
    const text = new FabricText(tile.name, {
      left: x+10,
      top: y+10,
      fontSize: 14,
      fill: 'black'
    })
    //const img = new FabricImage()
    // first determine the type of tile, then find the icon

    const createTile = new Group([rect, text], {
      left: x,
      top: y,
      selectable: false,
      hasControls: false,
      hoverCursor: (tile as PropertyTile).country ? 'pointer' : 'default'
    })
    // do something with tile

    if((tile as PropertyTile).country){
      createTile.on('mousedown', (e) => {
        console.log('Tile clicked', tile, e);
        const canvasRect = createTile.getBoundingRect();
        const canvasElement = this.canvas.upperCanvasEl;
        const canvasBound = canvasElement.getBoundingClientRect();
        this.showPropertyPopup(tile, canvasRect.left +  canvasBound.left, canvasRect.top + canvasBound.top);
      })
    }
    this.canvas.add(createTile);
  }
  private gameLoop = (): void => {
    this.drawCanvas();
    // Request next frame
    //requestAnimationFrame(this.gameLoop);
  }
  public printLog = (message: string, player?: Player): void => {
    this.logs.push({ message, player });
  }
  // should we even have me as a player? how would update another player's me? -> they could do this if the id of me is the same (like checkplayerturn)
  // also players still contains yourself, so make sure that they are consistent
  private me: Player;
  private map: GameMap;
  private players: Player[] = [];
  private currentTurn= 0; // add this in later
  private activeTrades: Trade[] = [];
  private logs: Log[] = [];
}

export { Game };