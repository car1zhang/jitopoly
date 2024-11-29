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
  owner?: Player;
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

  private tiles: Tile[] = [];
  private countries: Country[] = [];
}

export { GameMap };
export type { Tile, PropertyTile, EventTile, Country };
