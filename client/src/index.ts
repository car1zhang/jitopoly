import { Game, Log } from './game';
import { Player } from './player';
import type { GameMap, Country, Tile, PropertyTile, EventTile } from './map';
import { io } from 'socket.io-client';

let game: Game | null = null;

 // maybe make map an import and in a separate file
 
const placeholderMap: Tile[] = [
  {
    name: 'Start',
    icon: 'start.png',
    event: (player: Player) => {
      player.money += 300;
      game?.printLog(`${player.name} received $300 for passing start.`, player);
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
      game?.printLog(randomEvent.description, player);
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
      game?.printLog(randomEvent.description, player);
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
      game?.printLog(randomEvent.description, player);
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
          game?.printLog(`${player.name} is freed from jail`, player)
        }
        else {
          game?.printLog(`${player.name} is still in jail`, player)
        }
      }
      else{
        game?.printLog(`${player.name} is passing by jail`, player)
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
      game?.printLog(randomEvent.description, player);
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
      game?.printLog(randomEvent.description, player);
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
      game?.printLog(`${player.name} is on vacation`, player)
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
      game?.printLog(randomEvent.description, player);
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
      game?.printLog(randomEvent.description, player);
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
      game?.printLog(`${player.name} is sent to prison`, player)
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
      game?.printLog(randomEvent.description, player);
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
      game?.printLog(randomEvent.description, player);
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
      game?.printLog(randomEvent.description, player);
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

interface Update {
  type: string,
  player?: Player,
  tile?: Tile
}
const uid = (): string => // source https://dev.to/rahmanfadhil/how-to-generate-unique-id-in-javascript-1b13#comment-1ol48
  String(
    Date.now().toString(32) +
      Math.random().toString(16)
  ).replace(/\./g, '')

const randomUpdates: { [key: string]: (update: Update) => void } = {
  "player": (update: Update) => {
    game?.updatePlayer(update.player as Player);
    //game?.printLog('Move Forward', update.player as Player)
  },
  "tile": (update: Update) => {
    game?.updateTile(update.tile as PropertyTile);
    //game?.printLog()
  }
}

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

const joinRoom = document.getElementById("join-game") as HTMLElement | null;
const user = document.getElementById("username") as HTMLInputElement;
const gameRoom = document.getElementById("game-id") as HTMLInputElement;
const startToggle = document.getElementById("start-game") as HTMLButtonElement;
const moveToggle = document.getElementById("move") as HTMLButtonElement;
const endTurnToggle = document.getElementById("end-move") as HTMLButtonElement;
const buyPropertyToggle = document.getElementById('buy-property') as HTMLButtonElement;
const upgradeToggle = document.getElementById("upgradeHouse") as HTMLButtonElement;
const downgradeToggle = document.getElementById("downgradeHouse") as HTMLButtonElement;
const canvasToggle = document.getElementById('canvasWrapper') as HTMLCanvasElement;
const gameLogToggle = document.getElementById("gameLog") as HTMLDivElement;
const socket = io('http://localhost:8000')
let me: Player | null = null;

joinRoom?.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = user.value;
  const gameId = gameRoom.value;
  const hide = document.getElementById("join-div") as HTMLDivElement;
  me = new Player(uid(), username, '#000000', 1500, 0);
  socket.emit('join-game', gameId, me);
  hide.style.display = 'none';
  enableStartGameOption();
})
const enableStartGameOption = (): void => {
  startToggle.classList.remove('hidden');
}
startToggle.addEventListener('click', () => {
  socket.emit("get-player-list", gameRoom.value);
})
socket.on("player-data", (players) => {
  startToggle.classList.add('hidden');  
  const playerList: Player[] = [];
  players.forEach((elem: Player) => { 
    playerList.push(new Player(elem.id, elem.name, elem.color, elem.money, elem.position))
  })
  console.log(playerList);
  startGame(playerList); // assume that you would start the game after retrieving this data
})

const enableMove = (): void => {
  moveToggle.classList.remove("hidden");
  // this should also allow buying houses, upgrades etc to be part of the update list 
} 
moveToggle.addEventListener('click', () => {
  moveToggle.classList.add("hidden");
  socket.emit("update-game", gameRoom.value, {type: 'player', player: game?.makeMove()} as Update);



  // PROVIDE UPDATE HERE -> only calls the server with the update, no need to make a local update first


  const tileActionUpdates = game?.tileAction();
  if(tileActionUpdates){
    tileActionUpdates.forEach((player: Player) => {
      socket.emit("update-game", gameRoom.value, {type: 'player', player: player} as Update);
    })
  }
  else{
    // give buy option
    enableBuyProperty();
  }


  enableEndTurn();
})

const enableBuyProperty = (): void => {
  buyPropertyToggle.innerText = `Buy Property for $${game?.currentPropertyCost()}`;
  buyPropertyToggle.classList.remove("hidden");
  // the css of the three buttons may affect each other when one is not displayed
}
buyPropertyToggle.addEventListener('click', () => {
  buyPropertyToggle.classList.add("hidden");
  // only allow buy-property if player has enough money -> should update
  const newProperty = game?.buyProperty() as PropertyTile;
  socket.emit("update-game", gameRoom.value, {type: 'tile', tile: newProperty} as Update);
  socket.emit("update-game", gameRoom.value, {type: 'player', player: game?.getMe()} as Update);
})

upgradeToggle.addEventListener('click', () => {
  // only can be clicked if player has enough money and more houses to be added and you are owner
  // two updates, one on player, one on tile
  const upgradedTile = game?.upgradeHouse();
  socket.emit("update-game", gameRoom.value, {type: 'tile', tile: upgradedTile} as Update);
  socket.emit("update-game", gameRoom.value, {type: 'player', player: game?.getMe()} as Update);
})

downgradeToggle.addEventListener('click', () => {
  // only can be clicked if houses to be removed and you are owner
  const downgradedTile = game?.downgradeHouse();
  socket.emit("update-game", gameRoom.value, {type: 'tile', tile: downgradedTile} as Update);
  socket.emit("update-game", gameRoom.value, {type: 'player', player: game?.getMe()} as Update);
})


const enableEndTurn = (): void => {
  endTurnToggle.classList.remove("hidden");
}
endTurnToggle.addEventListener('click', () => {
  // remember end turn cannot happen if current player money is in the negative -> should just be unclickable
  buyPropertyToggle.classList.add("hidden");
  endTurnToggle.classList.add("hidden");
  socket.emit("new-turn", gameRoom.value);
})

const disableMove = (): void => {
  moveToggle.classList.add("hidden");
  // this should disable upgrades and stuff on the update list
}




const updateLocalGame = (update: Update): void => {
  switch(update.type){
    case "player":
      randomUpdates["player"](update);
      break;
    case "tile":
      randomUpdates["tile"](update);
    default:
      console.log("nothing");
  }
}

const startGame = (playerList: Player[]): void => {
  canvasToggle.classList.remove("hidden");
  game = new Game('gameCanvas', me as Player, playerList, placeholderMap, placeholderCountries);  
  game.printLog(`The game has started`);
  socket.emit("start-game", gameRoom.value); // need some gameupdate
}

socket.on("update-local-game", (change) => {
  // make updates
  const playerTurn: number = change.turn;
  const update: Update = change.update;
  if(update !== null) updateLocalGame(update);
  else (game?.checkPlayerTurn(playerTurn)) ? enableMove() : disableMove();
})
socket.on("new-players", (players) => {
  const playerList = document.getElementById("playerList") as HTMLElement;
  playerList.innerHTML='';
  players.forEach((player: Player): void => {
    playerList.innerHTML += `<p>${player.name}</p>`
  })
})
socket.on("receive-message", (actionLog: Log[]) => {
  gameLogToggle.innerHTML = ``;
  actionLog.forEach((curLog: Log) => {
    gameLogToggle.innerHTML += `<p>${curLog.message}</p>`;
  })
  game?.updateLog(actionLog);
})
gameLogToggle.addEventListener("logsChange", (event: Event) => {
  const updateLogs = (event as CustomEvent).detail as Log[];
  socket.emit("update-log", gameRoom.value, updateLogs)
})


window.addEventListener('load', () => {
  socket.on('connect', () => {
    console.log('You have connected to the server.')
  });
  
});