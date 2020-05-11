'use strict'

const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

const botName = 'ChatCord Bot'

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'))
  
    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit('message', formatMessage(botName, `${user.username} has joined the chat`))

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    })
  })

  // Runs when client disconnects
  socket.on('disconnect', msg => {
    const user = userLeave(socket.id)

    if (user) {
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))
      
      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      })
    }
  })

  // Listen for chatMessage
  socket.on('chatMessage', message => {
    const user = getCurrentUser(socket.id)
    io.to(user.room).emit('message', formatMessage(user.username, message))
  })
})

const port = process.env.PORT || 8080

server.listen(port, () => console.log(`Listening on port: ${port}`))
