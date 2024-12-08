import type { Player } from "./player";

interface Country {
  name: string;
  flag: string; // path to flag image
}

interface PropertyTile {
  name: string;
  country: string;
  basePrice: number;
  upgradePrice: number;
  houses: number;
  rent: number[]; // different rent prices, consumes 6 numbers
  owner?: Player; // if houses>0, owner? exists assume if house is 1 the property is owned
}

interface EventTile {
  name: string;
  icon: string;
  event: (player: Player) => void;
}

type Tile = PropertyTile | EventTile;

class GameMap { // list of tiles must be divisible by 4

  constructor(tiles: Tile[], countries: Country[]) {
    this.tiles = tiles;
    this.countries = countries;
  }

  public mapSize = (): number => {
    return this.tiles.length;
  }
  public getTile = (indx:number): Tile => {
    return this.tiles[indx];
  }
  public updateTiles = (newTile:Tile): void => {
    for(let i=0;i<this.tiles.length;i++){
      if(this.tiles[i].name == newTile.name){
        this.tiles[i]=newTile;
        return;
      }
    }
  }

  private tiles: Tile[] = [];
  private countries: Country[] = []; // contains addresses to png?
}

export { GameMap };
export type { Tile, PropertyTile, EventTile, Country };
