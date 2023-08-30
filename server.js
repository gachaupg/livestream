

// const express = require("express")
// const app = express()
// const server = require("http").Server(app)
// const io = require("socket.io")(server)
// const { v4: uuidV4 } = require("uuid")
// const { ExpressPeerServer } = require("peer")
// const peerServer = ExpressPeerServer(server, {debug: true})

// app.set('view engine', 'ejs')
// app.use(express.static("public"))
// app.use('/peerjs', peerServer)

// app.get("/",(req, res)=>{
//      res.redirect(`/${uuidV4()}`)
// })

// app.get("/:roomId", (req, res) =>{
//      res.render('room', {roomId: req.params.roomId})
// })


// io.on('connection', socket => {
//      socket.on('join-room', (roomId, userId) => {
//           socket.join(roomId)
//           socket.to(roomId).broadcast.emit('user-connected', userId)

//           socket.on('disconnect', () =>{
//                socket.to(roomId).broadcast.emit('user-disconnected', userId)
//           })

//            socket.on('message', message => {
//                io.to(roomId).emit('createMessage', message )
//            })
//      })
// })
// const PORT=3030
// server.listen(process.env.PORT || 3030,()=>{
// console.log(PORT);
// })

// const express = require("express");
// const cors = require("cors");
// const app = express();
// const http = require("http").createServer(app);
// const io = require("socket.io")(http);
// const { v4: uuidV4 } = require("uuid");
// const { ExpressPeerServer } = require("peer");
// const peerServer = ExpressPeerServer(http, { debug: true });
// const path = require("path");

// const PORT = process.env.PORT || 3030;

// const corsOptions = {
//      origin:'*', 
//      credentials:true,            //access-control-allow-credentials:true
//      optionSuccessStatus:200,
// };

// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.static("public"));
// app.use("/peerjs", peerServer);
// app.use(express.json({ limit: "30mb", extended: true }));
// app.use(express.urlencoded({ limit: "30mb", extended: true }));
// app.use(cors());

// app.post("/api/rooms", (req, res) => {
//   const { userName, userId } = req.body;
//   const roomId = uuidV4();
//   res.json({ roomId });

//   io.emit("new-user-room", { roomId, userName, userId });
// });

// io.on("connection", (socket) => {
//   socket.on("join-room", (roomId, userId) => {
//     socket.join(roomId);
//     socket.to(roomId).broadcast.emit("user-connected", userId);

//     socket.on("disconnect", () => {
//       socket.to(roomId).broadcast.emit("user-disconnected", userId);
//     });

//     socket.on("message", (message) => {
//       io.to(roomId).emit("createMessage", message);
//     });
//   });

//   socket.on("request-join", (roomId, userName, userId) => {
//     socket.join(roomId);
//     io.to(roomId).emit("user-joined", { userId, userName });
//   });
// });

// // Serve the React app
// app.use(express.static(path.join(__dirname, "client", "build")));

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "client", "build", "index.html"));
// });

// http.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);
// });





const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3030;
const corsOptions = {
     origin:'*', 
     credentials:true,            //access-control-allow-credentials:true
     optionSuccessStatus:200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static("public"));
app.use("/peerjs", peerServer);
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });

    socket.on("sending-signal", (data) => {
      io.to(data.userToSignal).emit("user-connected", {
        signal: data.signal,
        callerId: data.callerId,
      });
    });

    socket.on("returning-signal", (data) => {
      io.to(data.callerId).emit("receiving-returned-signal", {
        signal: data.signal,
        userId: socket.id,
      });
    });

    socket.on("user-stream", (stream) => {
      socket.to(roomId).broadcast.emit("receiving-stream", {
        userId: socket.id,
        stream,
      });
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
