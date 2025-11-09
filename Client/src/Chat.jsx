import React, { useState, useEffect, useRef } from "react";
import music from './iphone-sms-tone-original-mp4-5732.mp3';

export const Chat = ({ socket, username, room }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const notification = useRef(new Audio(music));
  const containerRef = useRef(null);

  const sendMessage = async () => {
    if (currentMessage.trim() !== "") {

      const messageData = {
        id: Date.now(),
        room: room,
        author: username,
        message: currentMessage,
        time: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
      notification.current.play();
    }
  };

  useEffect(() => {
    const receiveHandler = (data) => {
      setMessageList((list) => [...list, data]);
      notification.current.play();
    };

    socket.on("receive_message", receiveHandler);

    return () => {
      socket.off("receive_message", receiveHandler);
    };
  }, [socket]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messageList]);

  return (
    <div className="chat_container">
      <h1>Welcome {username}</h1>

      <div className="chat_box">
        <div
          className="auto-scrolling-div"
          ref={containerRef}
          style={{
            height: "450px",
            overflowY: "auto",
          }}
        >
          {messageList.map((data) => (
            <div
              key={data.id}
              className="message_content"
              id={username === data.author ? "you" : "other"}
            >
              <div>
                <div className="msg" id={username === data.author ? "y" : "b"}>
                  <p>{data.message}</p>
                </div>
                <div className="msg_detail">
                  <p>{data.author}</p>
                  <p>{data.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="chat_body">
          <input
            value={currentMessage}
            type="text"
            placeholder="Type Your Message"
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>&#9658;</button>
        </div>
      </div>
    </div>
  );
};
