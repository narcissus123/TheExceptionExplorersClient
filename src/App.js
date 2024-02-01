import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [chatRoomNo, setChatRoomNo] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [activity, setActivity] = useState("");
  const [roomList, setRoomList] = useState("");
  const [userList, setUserList] = useState("");

  useEffect(() => {
    const newSocket = io("ws://localhost:3500");

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      console.log("useerList", socket, username);
      // sets up an event listener for the onmessage event of the WebSocket.
      socket.on("message", (data) => {
        setActivity("");
        const { name, text, time } = data;
        console.log("name, text, time", name, text, time);
        let messageClassName = "post";
        if (name === username) {
          messageClassName += " post--left";
        }
        console.log("1", name);
        console.log("2", username);
        if (name !== username && name !== "Admin") {
          messageClassName += " post--right";
        }

        console.log("roomList", roomList);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text,
            name,
            time,
            className: messageClassName,
          },
        ]);
      });

      console.log("messages", messages);
      console.log("message", message);

      // sets up an event listener for the activity event broadcasted from server
      socket.on("activity", (name) => {
        console.log("name", name);
        setActivity(`${name} is typing...`);

        // Clear is typing after 3 seconds
        setTimeout(() => {
          setActivity("");
        }, 3000);
      });

      socket.on("userList", ({ users }) => {
        // setUserList("");
        let textContent = "";
        if (users) {
          users.forEach((user, i) => {
            textContent += user.name;
            if (users.length > 1 && i !== users.length - 1) {
              textContent += ",";
            }
          });
        }
        console.log(textContent);
        setUserList(textContent);
      });

      socket.on("roomList", ({ rooms }) => {
        // showRooms(rooms);
        // setRoomList("");
        let textContent = "";
        if (rooms) {
          rooms.forEach((room, i) => {
            textContent += room;
            if (rooms.length > 1 && i !== rooms.length - 1) {
              textContent += ",";
            }
          });
        }
        console.log(textContent);
        setRoomList(textContent);
      });
    }
  }, [socket]);

  const handleUsername = (e) => {
    console.log("username", username);
    setUsername(e.target.value);
    console.log("username", username);
    // Emit activity event to server when user types
    // socket.emit("activity", socket.id.substring(0, 5));
  };

  const handleChatRoom = (e) => {
    setChatRoomNo(e.target.value);
    // Emit activity event to server when user types
    // socket.emit("activity", socket.id.substring(0, 5));
  };

  const handleInput = (e) => {
    setMessage(e.target.value);

    socket.emit("activity", {
      name: username,
    });
  };

  const handleJoinForm = (e) => {
    e.preventDefault();
    console.log("e.target.name.value:", username, chatRoomNo);
    if (username && chatRoomNo) {
      // Emit eneterRoom event to server when user types
      socket.emit("enterRoom", {
        name: username,
        room: chatRoomNo,
      });
      setUsername("");
      setChatRoomNo("");
      // setMessages("");
    }
  };

  const handlemsgForm = (e) => {
    e.preventDefault();

    if (e.target.message.value) {
      // Emit message event to server when user types
      socket.emit("message", {
        name: username,
        text: e.target.message.value,
      });
      setMessage("");
    }
  };

  return (
    <main>
      <form className="form-join" onSubmit={handleJoinForm}>
        <input
          type="text"
          className="name"
          maxLength="8"
          placeholder="Your name"
          size="5"
          value={username}
          onChange={handleUsername}
          required
        />
        <input
          type="text"
          className="room"
          placeholder="Chat room"
          size="5"
          value={chatRoomNo}
          onChange={handleChatRoom}
          required
        />
        <button className="join" type="submit">
          Join
        </button>
      </form>
      <ul className="chat-display">
        {messages.map((msg, index) => {
          return (
            <>
              {msg.name !== "Admin" ? (
                <li key={index} className={msg.className}>
                  <div
                    className={`post__header ${
                      msg.name === username
                        ? "post__header--user"
                        : "post__header--reply"
                    }`}
                  >
                    <span className="post__header--name">{msg.name}</span>
                    <span className="post__header--time">{msg.time}</span>
                  </div>
                  <div className="post__text">{msg.text}</div>
                </li>
              ) : (
                <li key={index} className={msg.className}>
                  <div className="post__text">{msg.text}</div>
                </li>
              )}
            </>
          );
        })}
      </ul>
      <p className="user-list">
        <em>Users in {chatRoomNo}:</em>
        {userList}
      </p>
      <p className="room-list">
        <em>Active Rooms:</em>
        {roomList}
      </p>
      <p className="activity">{activity}</p>
      <form className="form-msg" onSubmit={handlemsgForm}>
        <input
          type="text"
          placeholder="Your message"
          name="message"
          className="message"
          onChange={handleInput}
          value={message}
          required
        />
        <button type="submit">Send</button>
      </form>
    </main>
  );
}

export default App;
