import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import Webcam from "react-webcam";
import "./App.css";

const serverUrl = "http://localhost:3030"; // Update with your server URL

function App() {
  const [roomId, setRoomId] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [socket, setSocket] = useState(null);

  const webcamRef = React.useRef(null);

  useEffect(() => {
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const handleJoinRoom = async () => {
    const response = await axios.post(`${serverUrl}/api/rooms`, {
      userName: "User",
      userId: "user-" + Math.random().toString(36).substring(7),
    });
    const newRoomId = response.data.roomId;
    setRoomId(newRoomId);
    setUserName("User");

    if (socket) {
      socket.emit("join-room", newRoomId, userId);
    }
  };

  const handleRequestJoin = () => {
    if (socket) {
      socket.emit("request-join", roomId, userName, userId);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Video Streaming App</h1>
        {roomId ? (
          <div>
            <p>Room ID: {roomId}</p>
            {roomId ? (
              <div>
                <Webcam audio={true} ref={webcamRef} />
                <button onClick={handleRequestJoin}>Join Room</button>
              </div>
            ) : (
              <input
                type="text"
                placeholder="Enter your username"
                onChange={(e) => setUserName(e.target.value)}
              />
            )}
          </div>
        ) : (
          <button onClick={handleJoinRoom}>Create Room</button>
        )}
      </header>
    </div>
  );
}

export default App;
