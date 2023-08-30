import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Webcam from "react-webcam";
import "./App.css";
import CreateRoom from "./CreateRoom";

const socket = io("http://localhost:3030"); // Replace with your backend URL

function App() {
  const [roomId, setRoomId] = useState("");
  const [peers, setPeers] = useState([]);
  const webcamRef = useRef(null);
  const userStreamRef = useRef(null);

  useEffect(() => {
    socket.connect();

    // Handle user-connected event
    socket.on("user-connected", ({ signal, callerId }) => {
      const peer = new Peer({ initiator: false, trickle: false });
      peer.signal(signal);

      peer.on("signal", (returnSignal) => {
        socket.emit("returning-signal", { signal: returnSignal, callerId });
      });

      setPeers((prevPeers) => [...prevPeers, { peer, callerId }]);
    });

    // Handle receiving-returned-signal event
    socket.on("receiving-returned-signal", ({ signal, userId }) => {
      const item = peers.find((p) => p.callerId === userId);
      if (item) {
        item.peer.signal(signal);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [peers]);

  const handleJoinRoom = () => {
    setJoiningRoom(true);
    handleRoomCreated(roomId);
  };

  const handleRoomCreated = (createdRoomId) => {
    setRoomId(createdRoomId);
    socket.emit("join-room", createdRoomId, userId);
  };

  const handleWebcamStart = (stream) => {
    webcamRef.current.srcObject = stream;
    userStreamRef.current = stream;
    socket.emit("user-stream", stream);

    const peersToConnect = peers.filter((p) => !p.peer.destroyed);
    peersToConnect.forEach((peerObj) => {
      const { peer, callerId } = peerObj;
      peer.addStream(stream);

      const signalData = {
        userToSignal: callerId,
        callerId: socket.id,
        signal: peer.signal(),
      };
      socket.emit("sending-signal", signalData);
    });
  };

  const handleWebcamError = (error) => {
    console.error("Webcam error:", error);
  };

  return (
    <div className="App">
      {roomId ? (
        <div>
          <h2>Room ID: {roomId}</h2>
          <Webcam
            audio={true}
            video={true}
            onUserMedia={handleWebcamStart}
            onUserMediaError={handleWebcamError}
            ref={webcamRef}
          />
          {peers.map((peerObj) => {
            const { peer, callerId } = peerObj;
            return <video key={callerId} playsInline autoPlay />;
          })}
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={handleJoinRoom}>Join Room</button>
        </div>
      )}
    </div>
  );
}

export default App;





// import React, { useState, useEffect } from "react";
// import io from "socket.io-client";
// import Webcam from "react-webcam";
// import "./App.css";
// import CreateRoom from "./CreateRoom";

// const socket = io("http://localhost:3030"); // Replace with your backend URL

// function App() {
//   const [roomId, setRoomId] = useState("");
//   const [userId, setUserId] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [messageInput, setMessageInput] = useState("");
//   const [peers, setPeers] = useState([]);
//   const [joiningRoom, setJoiningRoom] = useState(false);

//   const webcamRef = React.useRef(null);

//   useEffect(() => {
//     socket.connect();

//     socket.on("createMessage", (message) => {
//       setMessages((prevMessages) => [...prevMessages, message]);
//     });

//     socket.on("user-stream", (stream) => {
//       const peer = addUserVideo(stream, socket.id);
//       setPeers((prevPeers) => [...prevPeers, { peer, userId: socket.id }]);
//     });

//     socket.on("sending-signal", ({ userToSignal, callerId, signal }) => {
//       const peer = addUserVideo(null, userToSignal);
//       peer.signal(signal);
//     });

//     socket.on("returning-signal", ({ userId, signal }) => {
//       const item = peers.find((p) => p.userId === userId);
//       if (item) {
//         item.peer.signal(signal);
//       }
//     });

//     navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
//       webcamRef.current.srcObject = stream;
//       if (joiningRoom) {
//         socket.emit("user-stream", stream);
//       }

//       socket.on("receiving-stream", ({ userId, stream }) => {
//         const peer = addUserVideo(stream, userId);
//         setPeers((prevPeers) => [...prevPeers, { peer, userId }]);
//       });

//       socket.on("receiving-returned-signal", ({ userId, signal }) => {
//         const item = peers.find((p) => p.userId === userId);
//         item.peer.signal(signal);
//       });
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, [peers, joiningRoom]);

  // const handleJoinRoom = () => {
  //   setJoiningRoom(true);
  //   handleRoomCreated(roomId);
  // };

  // const handleRoomCreated = (createdRoomId) => {
  //   setRoomId(createdRoomId);
  //   socket.emit("join-room", createdRoomId, userId);
  // };

//   const sendMessage = () => {
//     if (messageInput.trim() !== "") {
//       socket.emit("message", messageInput);
//       setMessageInput("");
//     }
//   };

//   const createPeer = (userToSignal, callerId, stream) => {
//     const peer = new SimplePeer({
//       initiator: true,
//       trickle: false,
//       stream: stream,
//     });

//     peer.on("signal", (signal) => {
//       socket.emit("sending-signal", { userToSignal, callerId, signal });
//     });

//     return peer;
//   };

//   const addUserVideo = (stream, userId) => {
//     const peer = new SimplePeer({
//       initiator: false,
//       trickle: false,
//       stream: stream,
//     });

//     peer.on("signal", (signal) => {
//       socket.emit("returning-signal", { signal, userId });
//     });

//     return peer;
//   };

//   return (
//     <div className="App">
//       <h1>Video Chat App</h1>
//       {roomId ? (
//         <div>
//           <h2>Room ID: {roomId}</h2>
//           <div>
//             <div className="video-grid">
//               <Webcam ref={webcamRef} muted />
//               {peers.map((peerObj) => {
//                 const { peer, userId } = peerObj;
//                 return <video key={userId} playsInline autoPlay />;
//               })}
//             </div>
//             <ul>
//               {messages.map((message, index) => (
//                 <li key={index}>{message}</li>
//               ))}
//             </ul>
//             <div>
//               <input
//                 type="text"
//                 value={messageInput}
//                 onChange={(e) => setMessageInput(e.target.value)}
//               />
//               <button onClick={sendMessage}>Send</button>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div>
//           <CreateRoom onRoomCreated={handleRoomCreated} />
//           {!joiningRoom && (
//             <div>
//               <input
//                 type="text"
//                 placeholder="Enter Room ID"
//                 value={roomId}
//                 onChange={(e) => setRoomId(e.target.value)}
//               />
//               <button onClick={handleJoinRoom}>Join Room</button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
