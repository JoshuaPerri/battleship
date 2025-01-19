import './App.css';
import { Peer } from "peerjs"
import { useState } from 'react';
import { useEffect } from 'react';


function App() {

  // const peer = useRef(null);
  const [peer, setPeer] = useState(null);
  const [connectingID, setConnectingID] = useState('');
  const [myID, setMyID] = useState('');
  const [msg, setMSG] = useState('');
  const [conn, setConn] = useState(null);

  useEffect(() => {
    if (peer === null) {
      setPeer(new Peer(Math.floor(Math.random() * 1000), {
        host: "localhost",
        port: 9000,
        path: "/",
      }));
    } else {
      peer.on('open', function(id) {
        setMyID(id);
      });
    
      peer.on('connection', function(c) {
        setConn(c);
      });
    
      if (conn !== null) {
        conn.on('open', function() {
    
          // Receive messages
          conn.on('data', function(data) {
            console.log(data);
            setMSG(data.msg);
          });

          // Send messages
          // conn.send({
          //   msg: "Message",
          //   id: myID,
          // });
        });
      }
    }
  }, [peer, conn])

  function connect(e) {
    console.log(connectingID)
    setConn(peer.connect(connectingID));
  }

  function send(e) {
    if (conn !== null) {
      conn.send({
        msg: "Message",
        id: myID,
      });
    }
  }

  return (
    <div className="App">
      <input onChange={(e) => {setConnectingID(e.currentTarget.value)}}/>
      <button 
        onClick={(e) => connect(e)}
        style={{display: conn === null ? "inline" : "hidden"}}
      >
        Connect
      </button>
      <button 
        onClick={(e) => send(e)}
      >
        Send
      </button>
      <div>{msg}</div>
      <div>My ID: {myID}</div>
    </div>
  );
}

export default App;
