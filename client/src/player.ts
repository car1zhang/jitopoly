
class Player {
  public id: string;
  public name: string;
  public color: string; // hex color code
  public money: number;
  public status: 'active' | 'vacation' | 'jailed' | 'bankrupt' = 'active';

  constructor(
    id: string,
    name: string,
    color: string,
    startingMoney: number
  ) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.money = startingMoney;
  }
}

export { Player };