import { Game } from './game';
import { Player } from './player';
import type { GameMap, Country, Tile, PropertyTile, EventTile } from './map';

const placeholderCountries: Country[] = [
  { name: 'Brazil', flag:'brazil.png' },
  { name: 'Italy', flag: 'italy.png' },
  { name: 'Pakistan', flag: 'pakistan.png' },
  { name: 'India', flag: 'india.png' },
  { name: 'China', flag: 'china.png' },
  { name: 'France', flag: 'france.png' },
  { name: 'Germany', flag: 'germany.png' },
  { name: 'United States', flag: 'us.png' },
];

interface RandomEvent {
  description: string;
  event: (player: Player) => void;
}

const randomEvents: RandomEvent[] = [
  {
    description: 'received $100 on a parlay.',
    event: (player: Player) => {
      player.money += 100;
    }
  },
  {
    description: 'lost $100 on a parlay.',
    event: (player: Player) => {
      player.money -= 100;
    }
  },
  {
    description: 'received $20 from a friend.',
    event: (player: Player) => {
      player.money += 20;
    }
  },
  {
    description: 'lost $20 to a friend.',
    event: (player: Player) => {
      player.money -= 20;
    }
  }
];

window.addEventListener('load', () => {
  const game = new Game('gameCanvas', [new Player('1', 'Player 1', '#000000', 1500)], [], []);

  const placeholderMap: Tile[] = [
    {
      name: 'Start',
      icon: 'start.png',
      event: (player: Player) => {
        player.money += 100;
        game.printLog(`${player.name} received $300 for landing on start.`, player);
      }
    },
    {
      name: 'Salvador',
      country: 'Brazil',
      basePrice: 100,
      upgradePrice: 50,
      houses: 0,
    },
    {
      name: 'Random',
      icon: 'random.png',
      event: (player: Player) => {
        const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        randomEvent.event(player);
        game.printLog(randomEvent.description, player);
      }
    },
    {
      name: 'Rio',
      country: 'Brazil',
      basePrice: 100,
      upgradePrice: 50,
      houses: 0,
    }
  ];
});