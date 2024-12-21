const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors:  {
        origin: 'http://localhost:3000'
    }
})

io.on('connection', (socket) => {
    console.log(socket.id)
    socket.on("join-game", (username) => {
        io.emit("receive-message", `${username} has joined the game.`)
    })
})


httpServer.listen(8000, () => {
    console.log("Connected to the server")
})