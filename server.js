const path =require('path');

const http=require('http');

const express=require('express');
const socketio=require('socket.io');
const app=express();
const server =http.createServer(app);

const io=socketio(server);
const formatMessage=require('./utils/messages');
const {userJoin,getCurrentUser,userLeave,getRoomUsers}=require('./utils/users');

//Set static Folder
 app.use(express.static(path.join(__dirname,'public'))); 
 
 const botName='Chat Bot';
 //Run when client connects
 io.on('connection',socket=>{
     socket.on('joinRoom',({username,room})=>{
      const user=userJoin(socket.id,username,room);

      socket.join(user.room);


    socket.emit
    ('message',formatMessage(botName,'Welcome to Real Time Chat'));

     //Broadcast When A user connects
     socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));

     //Send Users Room And Info
     io.to(user.room).emit('roomUsers',{
         room: user.room,
         users:getRoomUsers(user.room)
        });
     });
 
    
    //Listen For chatMessage
    socket.on('chatMessage',msg=>{
        const user=getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });
    
    //When client Disconnects
    socket.on('disconnect',()=>{
        const user=userLeave(socket.id);
        if(user){

            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));
        }
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users:getRoomUsers(user.room)
        });
 });
 });
const port=3000 || process.env.port;

app.listen();

server.listen(port,()=>console.log(`Server is Running at port ${port}`));
