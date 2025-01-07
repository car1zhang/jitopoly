import type { Tile, Country, EventTile, PropertyTile } from './map';
import { GameMap } from './map';
import { Player } from './player';
import { Trade } from './trade';
import { Canvas, FabricText, FabricImage, Rect, Circle, Group} from 'fabric';

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

  public tileAction = (): Player[] | null => {
    const newTile:Tile = this.map.getTile(this.me.position);
    let updatePlayers = [] as Player[];
    if('country' in newTile){
      this.activeTile = newTile;
      if(newTile.houses > 0 && newTile.owner){
        // owned by someone
        const tileOwner = newTile.owner;
        if(this.me.id != tileOwner.id){
          const currentRent = newTile.rent[newTile.houses];
          this.me.money -= currentRent; // check if money is in negatives
          tileOwner.money += currentRent;
          updatePlayers.push(this.me);
          updatePlayers.push(tileOwner);
          this.printLog(`${this.me.name} pays ${tileOwner.name} $${currentRent} for rent`);
          return updatePlayers;
        }
      }
      else{
        // give option to buy house
        return null;
      }
    }
    // eventTile
    (newTile as EventTile).event(this.me);
    // does this update this.me directly? -> also assumes EventTile only changes currentUser
    updatePlayers.push(this.me);
    return updatePlayers;
  }
  public buyProperty = (): PropertyTile => {
    // only can be called if player has enough money (has to be clicked)
    const property = this.map.getTile(this.me.position) as PropertyTile;
    property.owner = this.me;
    property.houses = 1;
    const propertyCost:number = property.basePrice;
    this.me.money -=  propertyCost;
    this.printLog(`${this.me.name} bought property in ${property.name}`, this.me);

    // options to sell house/mortgage
    return property;
  }
  public upgradeHouse = (): PropertyTile => {
    const tile = this.activeTile as PropertyTile;
    const upgradeCost = tile.upgradePrice;
    tile.houses++;
    this.me.money -= upgradeCost;
    this.printLog(`${this.me.name} upgraded house in ${tile.name} to level ${tile.houses}`, this.me);
    return tile;
  }
  public downgradeHouse = (): PropertyTile => {
    // sell back for 80%
    const tile = this.activeTile as PropertyTile;
    if(tile.houses == 1){
      this.me.money += Math.floor(0.8 * tile.basePrice);
      tile.owner = undefined;
      this.printLog(`${this.me.name} downgraded house in ${tile.name} to level ${tile.houses}`, this.me);
    }
    else{
      this.me.money += Math.floor(0.8 * tile.upgradePrice);
      this.printLog(`${this.me.name} sells house in ${tile.name}`, this.me);
    }
    tile.houses-=1;
    return tile;
  }
  public makeMove = (): Player => {
    const rollDice1 = Math.floor(Math.random() * 6) + 1;
    const rollDice2 = Math.floor(Math.random() * 6) + 1;
    const moveForward = rollDice1 + rollDice2;
    const newPosition = (this.me.position + moveForward) % this.map.mapSize();
    const originalPosition = this.me.position;
    this.me.position = newPosition;

    const newTile:Tile = this.map.getTile(newPosition); // what is this for?

    if(originalPosition > newPosition && newPosition != 0){
      const startTile = this.map.getTile(0) as EventTile;
      startTile.event(this.me);
    }
    this.printLog(`${this.me.name} moves forward ${moveForward} squares`)
    return this.me;
  }

  public updatePlayer = (newPlayer: Player): void => {
    const findIndex = this.players.findIndex(player => player.id == newPlayer.id)
    console.log(this.players[findIndex], newPlayer, "updating player here");
    this.players[findIndex] = newPlayer;
    // update board

  }

  public updateTile = (newTile: PropertyTile): void => {
    // this should only be for propertyTile
    this.map.updateTiles(newTile);
    // update board
  }
  
  public checkPlayerTurn = (ind: number): boolean => {
    const cur = this.players[ind];
    return (this.me.id == cur.id);
  }
  public getMe = (): Player => {
    return this.me;
  }
  public getPlayers = (): Player[] => {
    return this.players;
  }
  public currentPropertyCost = (): number => {
    return (this.activeTile as PropertyTile).basePrice;
  }

  private showPropertyPopup = (tile: PropertyTile, x: number, y: number): void => {
    const popup = document.getElementById('popup') as HTMLDivElement;
    if(this.activeTile === tile){
      this.closePropertyPopup();
      return;
    }
    this.activeTile = tile;
    popup.style.left = `${x}px`;
    popup.style.top = `${y + 100}px`;
    popup.classList.remove('hidden');
    this.updatePopup(tile);
    document.removeEventListener('mousedown', this.handlePopupClick);
    setTimeout(() => {
      document.addEventListener('mousedown', this.handlePopupClick);
    }, 0);
  }
  private handlePopupClick = (event: MouseEvent): void => {
    const popup = document.getElementById('popup');
    const clickEvent = event.target as HTMLElement;
    if(popup && !popup.contains(clickEvent)) this.closePropertyPopup();
  }
  private updatePopup = (tile: PropertyTile): void => {
    const tileName = document.getElementById('tileName') as HTMLHeadingElement;
    tileName.innerText = tile.name;
    const priceList = document.getElementById('costList') as HTMLDivElement;
    priceList.innerHTML = `<div class="propertyCost"><p>houses</p><p>rent</p></div>`
    tile.rent.forEach((cost : number, houseNum : number) => {
      if(houseNum == 0) priceList.innerHTML += `<div class="propertyCost"><p>with rent</p><p>${cost}</p></div>`;
      else priceList.innerHTML += `<div class="propertyCost"><p>with ${houseNum} house</p><p>${cost}</p></div>`;
    })
    // enable upgrade buttons etc
    const propertyOptions = document.getElementById("propertyOptions") as HTMLDivElement;
    propertyOptions.classList.add("hidden");
    if(tile.owner && tile.owner.id == this.me.id){
      propertyOptions.classList.remove("hidden");
      // disable upgrade/downgrade
      const upgradeHouse = document.getElementById("upgradeHouse") as HTMLButtonElement;
      const downgradeHouse = document.getElementById("downgradeHouse") as HTMLButtonElement;
      upgradeHouse.disabled = false, downgradeHouse.disabled = false;
      if(this.me.money < tile.upgradePrice || tile.houses == 5){
        upgradeHouse.disabled = true;
      }
      if(tile.houses < 1){
        downgradeHouse.disabled = true;
      }
    }
  }

  private closePropertyPopup = (): void => {
    this.activeTile = null;
    const popup = document.getElementById('popup') as HTMLDivElement;
    popup.classList.add('hidden');
    document.removeEventListener('mousedown', this.handlePopupClick);
  }
  /*private getTileCoordinate = (tile: Tile): => {
    const tileSides = this.map.mapSize() / 4;
    if(tilePosition < tileSides){

    }
  }*/

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
    const titleText = new FabricText(tile.name, {
      left: x+10,
      top: y+10,
      fontSize: 14,
      fill: 'black'
    })
    //const img = new FabricImage()
    // first determine the type of tile, then find the icon

    //const 

    const createTile = new Group([rect, titleText], {
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
        this.showPropertyPopup(tile as PropertyTile, canvasRect.left +  canvasBound.left, canvasRect.top + canvasBound.top);
      })
    }
    this.canvas.add(createTile);
  }
  private drawPlayers = (): void => {
    // create player markers
    this.players.forEach((player: Player) => {
      const playerMarker = new Circle({
        left: this.cornerSize/2,
        top: this.cornerSize/2,
        radius: 15,
        fill: player.color,
        stroke: 'black',
        strokeWidth: 1,
        selectable: false,
        hasControls: false,
        hoverCursor: 'default'
      })
      //playerMarker.set({ id: player.id });
      this.canvas.add(playerMarker);
    })
  }
  private gameLoop = (): void => {
    this.drawCanvas();
    this.drawPlayers();
    // Request next frame
    //requestAnimationFrame(this.gameLoop);
  }
  public printLog = (message: string, player?: Player): void => {
    this.logs.push({ message, player });
    const event = new CustomEvent('logsChange', { detail: this.logs })
    const gameLog = document.getElementById("gameLog") as HTMLDivElement;
    gameLog.dispatchEvent(event);
  }
  public updateLog = (newLog: Log[]): void => {
    this.logs = newLog;
  }

  // should we even have me as a player? how would update another player's me? -> they could do this if the id of me is the same (like checkplayerturn)
  // also players still contains yourself, so make sure that they are consistent
  private me: Player;
  private map: GameMap;
  private players: Player[] = [];
  //private playerMarkers: { [playerID: string]: Circle } = {};
  private currentTurn= 0; // add this in later
  private activeTrades: Trade[] = [];
  private logs: Log[] = [];
}

export { Game, Log };