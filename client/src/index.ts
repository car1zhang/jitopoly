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
  { name: 'United Kingdom', flag: 'uk.png '}
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

  
  const game = new Game('gameCanvas', [new Player('1', 'Player 1', '#000000', 1500, 0)], [/* mapTile */], [/* mapCountries */]);
 // maybe make map an import and in a separate file
  const placeholderMap: Tile[] = [
    {
      name: 'Start',
      icon: 'start.png',
      event: (player: Player) => {
        player.money += 300;
        game.printLog(`${player.name} received $300 for landing on start.`, player);
      }
    },
    {
      name: 'Salvador',
      country: 'Brazil',
      basePrice: 60,
      upgradePrice: 50,
      rent: [2, 10, 30, 90, 160, 250],
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
      basePrice: 60,
      upgradePrice: 50,
      rent: [4, 20, 60, 180, 320, 450],
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
      name: 'Random', // this should be airport tile, probably create an airport tile to remove redundancy
      icon: 'random.png',
      event: (player: Player) => {
        //const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        //randomEvent.event(player);
        //game.printLog(randomEvent.description, player);
      }
    },
    {
      name: 'Tel Aviv',
      country: 'Israel',
      basePrice: 100,
      upgradePrice: 50,
      rent: [6, 30, 90, 270, 400, 550],
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
      name: 'Haifa',
      country: 'Israel',
      basePrice: 100,
      upgradePrice: 50,
      rent: [6, 30, 90, 270, 400, 550],
      houses: 0,
    },
    {
      name: 'Jerusalem',
      country: 'Israel',
      basePrice: 120,
      upgradePrice: 50,
      rent: [8, 40, 100, 300, 450, 600],
      houses: 0,
    },
    {
      name: 'Prison', // top right tile
      icon: 'prison.png',
      event: (player: Player) => {
        if (player.status == 'jailed'){
          // roll dices
          const diceRoll1: number = 1 + Math.floor(Math.random() * 6);
          const diceRoll2: number = 1 + Math.floor(Math.random() * 6);
          if(diceRoll1 == diceRoll2){
            player.status = 'active';
            game.printLog(`${player.name} is freed from jail`, player)
          }
          else {
            game.printLog(`${player.name} is still in jail`, player)
          }
        }
        else{
          game.printLog(`${player.name} is passing by jail`, player)
        }
      }
    },
    {
      name: 'Venice',
      country: 'Italy',
      basePrice: 140,
      upgradePrice: 100,
      rent: [10, 50, 150, 450, 625, 750],
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
      name: 'Milan',
      country: 'Italy',
      basePrice: 140,
      upgradePrice: 100,
      rent: [10, 50, 150, 450, 625, 750],
      houses: 0,
    },
    {
      name: 'Rome',
      country: 'Italy',
      basePrice: 160,
      upgradePrice: 100,
      rent: [12, 60, 180, 500, 700, 900],
      houses: 0,
    },
    {
      name: 'Random', // this should be airport tile
      icon: 'random.png',
      event: (player: Player) => {
        //const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        //randomEvent.event(player);
        //game.printLog(randomEvent.description, player);
      }
    },
    {
      name: 'Frankfurt',
      country: 'Germany',
      basePrice: 180,
      upgradePrice: 100,
      rent: [14, 70, 200, 550, 750, 950],
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
      name: 'Munich',
      country: 'Germany',
      basePrice: 180,
      upgradePrice: 100,
      rent: [14, 70, 200, 550, 750, 950],
      houses: 0,
    },
    {
      name: 'Berlin',
      country: 'Germany',
      basePrice: 200,
      upgradePrice: 100,
      rent: [16, 80, 220, 600, 800, 1000],
      houses: 0,
    },
    {
      name: 'Vacation',
      icon: 'vacation.png',
      event: (player: Player) => {
        player.status = 'vacation'; // what is the point of this
        game.printLog(`${player.name} is on vacation`, player)
      }
    },
    {
      name: 'Shenzhen',
      country: 'China',
      basePrice: 220,
      upgradePrice: 150,
      rent: [18, 90, 250, 700, 875, 1050],
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
      name: 'Beijing',
      country: 'China',
      basePrice: 220,
      upgradePrice: 150,
      rent: [18, 90, 250, 700, 875, 1050],
      houses: 0,
    },
    {
      name: 'Shanghai',
      country: 'China',
      basePrice: 240,
      upgradePrice: 150,
      rent: [20, 100, 300, 750, 925, 1100],
      houses: 0,
    },
    {
      name: 'Random', // this should be airport tile
      icon: 'random.png',
      event: (player: Player) => {
        //const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        //randomEvent.event(player);
        //game.printLog(randomEvent.description, player);
      }
    },
    {
      name: 'Lyon',
      country: 'France',
      basePrice: 260,
      upgradePrice: 150,
      rent: [22, 110, 330, 800, 975, 1150],
      houses: 0,
    },
    {
      name: 'Toulouse',
      country: 'France',
      basePrice: 260,
      upgradePrice: 150,
      rent: [22, 110, 330, 800, 975, 1150],
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
      name: 'Paris',
      country: 'France',
      basePrice: 280,
      upgradePrice: 150,
      rent: [24, 120, 360, 850, 1025, 1200],
      houses: 0,
    },
    {
      name: 'Go To Prison',
      icon: 'gotoprison.png',
      event: (player: Player) => {
        player.position = 10; // maybe change this
        player.status = 'jailed';
        game.printLog(`${player.name} is sent to prison`, player)
      }
    },
    {
      name: 'Liverpool',
      country: 'United Kingdom',
      basePrice: 300,
      upgradePrice: 200,
      rent: [26, 130, 390, 900, 1100, 1275],
      houses: 0,
    },
    {
      name: 'Manchester',
      country: 'United Kingdom',
      basePrice: 300,
      upgradePrice: 200,
      rent: [26, 130, 390, 900, 1100, 1275],
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
      name: 'London',
      country: 'United Kingdom',
      basePrice: 320,
      upgradePrice: 200,
      rent: [28, 150, 450, 1000, 1200, 1400],
      houses: 0,
    },
    {
      name: 'Random', // this should be airport tile
      icon: 'random.png',
      event: (player: Player) => {
        //const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        //randomEvent.event(player);
        //game.printLog(randomEvent.description, player);
      }
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
      name: 'San Francisco',
      country: 'United States',
      basePrice: 350,
      upgradePrice: 200,
      rent: [35, 175, 500, 1100, 1300, 1500],
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
      name: 'New York',
      country: 'United States',
      basePrice: 400,
      upgradePrice: 200,
      rent: [50, 200, 600, 1400, 1700, 2000],
      houses: 0,
    }
  ];
});