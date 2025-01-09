const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')

let games = {}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors:  {
        origin: 'http://localhost:3000'
    }
})

io.on('connection', (socket) => {
    socket.on("join-game", (gameId, player) => {
        if(games[gameId] && games[gameId].started){
            socket.emit("full-game")
            console.log(player)
        }
        else{
            socket.join(gameId)
            console.log(`User ${player.name} has joined the game room ${gameId}`)
            if(!games[gameId]){
                games[gameId] = {
                    players: [],
                    turn: 0,
                    started: false
                }
            }
            games[gameId].players.push(player)
            console.log(games[gameId].players)
            io.to(gameId).emit("new-players", games[gameId].players)
        }
    })
    socket.on("get-player-list", (gameId) => {
        console.log(`Grabbing all player-data in the room ${gameId}`)
        io.to(gameId).emit("player-data", games[gameId].players)
    })
    socket.on("start-game", (gameId) => {
        const playerTurn = games[gameId].turn
        console.log(`Starting the game. It is player ${playerTurn}'s turn.`)
        games[gameId].started = true;
        io.to(gameId).emit("update-local-game", 
            {
                turn: playerTurn,
                update: null
            })
    })
    socket.on("new-turn", (gameId) => {
        const playerTurn = (games[gameId].turn + 1) % games[gameId].players.length
        games[gameId].turn = playerTurn
        console.log(`It is player ${playerTurn}'s turn.`)
        console.log(games[gameId].players)
        io.to(gameId).emit("update-local-game", 
            {
                turn: playerTurn,
                update: null
            })
    })
    socket.on("update-game", (gameId, gameUpdate) => {
        const playerTurn = games[gameId].turn 
        console.log(`Updating game`) // yes
        io.to(gameId).emit("update-local-game", 
            {
                turn: playerTurn,
                update: gameUpdate
            })
        //  single updates only
    })
    socket.on("quit-game", (gameId, playerId, gameUpdate, callback) => {
        // remove player with playerId
        const playerIndex = games[gameId].players.findIndex(player => player.id == playerId)
        if(playerIndex != -1){
            if(games[gameId].turn == games[gameId].players.length - 1){
                // if last player
                games[gameId].turn = 0;
            }
            games[gameId].turn -= 1;
            games[gameId].players.splice(playerIndex, 1)
            console.log(`Player with id ${playerId} has quit the game in room ${gameId}`)


            if(games[gameId].players.length == 1){
                io.to(gameId).emit("end-game", games[gameId].players[0])
                console.log(`The winner of the game is ${games[gameId].players[0]}`)
            }
            else{
                io.to(gameId).emit("update-local-game",
                    {
                        turn: games[gameId].turn,
                        update: gameUpdate
                    }, () => {
                        console.log('new turn now')
                        callback();
                    }
                )
            }
        }
    })
    socket.on("update-log", (gameId, updateLog) => {
        io.to(gameId).emit("receive-message", updateLog)
    })
    socket.on("disconnect", () => {
        console.log('a user disconnected')
    })
})


httpServer.listen(8000, () => {
    console.log("Connected to the server")
})