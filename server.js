const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

const server = http.createServer(app);
const io = require('socket.io')(server);

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception!! Shutting Down');
  console.log(err.name, err.message);
  process.exit(1);
});

const DB = process.env.DATABASE_CLOUD;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log('Database Connected Successfully'));

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`App running on port ${port}`));

io.on('connection', (socket) => {
  //Get the chatID of the user and join in a room of the same chatID
  chatID = socket.handshake.query.chatID;
  socket.join(chatID);

  //Leave the room if the user closes the socket
  socket.on('disconnect', () => {
    socket.leave(chatID);
  });

  //Send message to only a particular user
  socket.on('send_message', (message) => {
    receiverChatID = message.receiverChatID;
    senderChatID = message.senderChatID;
    content = message.content;

    //Send message to only that particular room
    socket.in(receiverChatID).emit('receive_message', {
      content: content,
      senderChatID: senderChatID,
      receiverChatID: receiverChatID,
    });
  });
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION!! Closing Server then shutting down');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
