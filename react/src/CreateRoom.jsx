import React, { useState } from "react";

function CreateRoom({ onRoomCreated }) {
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");

  const handleCreateRoom = async () => {
    const response = await fetch("http://localhost:3030/api/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userName, userId }),
    });

    const data = await response.json();
    onRoomCreated(data.roomId);
  };

  return (
    <div>
      <h2>Create a Room</h2>
      <div>
        <label>
          Your Name:{" "}
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </label>
        <label>
          Your User ID:{" "}
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </label>
        <button onClick={handleCreateRoom}>Create Room</button>
      </div>
    </div>
  );
}

export default CreateRoom;
