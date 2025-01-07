const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')

let games = {} // i will use mongodb: take gameID: players[] and turn

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors:  {
        origin: 'http://localhost:3000'
    }
})

io.on('connection', (socket) => {
    socket.on("join-game", (gameId, player) => {
        socket.join(gameId)
        console.log(`User ${player.name} has joined the game room ${gameId}`)
        if(!games[gameId]){
            games[gameId] = {
                players: [],
                turn: 0
            }
        }
        games[gameId].players.push(player)
        console.log(games[gameId].players)
        io.to(gameId).emit("new-players", games[gameId].players)
    })
    socket.on("get-player-list", (gameId) => {
        console.log(`Grabbing all player-data in the room ${gameId}`)
        io.to(gameId).emit("player-data", games[gameId].players)
    })
    socket.on("start-game", (gameId) => {
        const playerTurn = games[gameId].turn
        console.log(`Starting the game. It is player ${playerTurn}'s turn.`)
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