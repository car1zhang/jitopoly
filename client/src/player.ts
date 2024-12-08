
class Player {
  public id: string;
  public name: string;
  public color: string; // hex color code
  public money: number;
  public status: 'active' | 'vacation' | 'jailed' | 'bankrupt' = 'active';
  public position: number; // position on map, index of map array (do we need this?)

  constructor(
    id: string,
    name: string,
    color: string,
    startingMoney: number,
    position: number
  ) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.money = startingMoney;
    this.position = position;
  }
}

export { Player };