import './App.css';
import { Peer } from "peerjs"
import { useState } from 'react';
import { useEffect } from 'react';


function App() {

  // const peer = useRef(null);
  const [peer, setPeer] = useState(null);
  const [connectingID, setConnectingID] = useState('');
  const [conn, setConn] = useState(null);

  const [data, setData] = useState(Math.floor(Math.random() * 1000));

  useEffect(() => {

    if (peer === null) {

      setPeer(new Peer(Math.floor(Math.random() * 1000), {
        host: "localhost",
        port: 9000,
        path: "/",
      }));

    } else {

      peer.on('connection', function(c) {
        setConn(c);
      });
    
      if (conn !== null) {
        conn.on('data', function(data) {
          console.log(data);
          setData(data.msg);
        });
      }
    }

    return () => {
      if (peer !== null) {
        peer.off("connection");
      }
      if (conn !== null) {
        conn.off('open');
        conn.off('data');
      }
    }
  
  }, [peer, conn, data]);

  function connect(e) {
    setConn(peer.connect(connectingID));
  }

  function send(e) {
    if (conn !== null) {
      conn.send({
        msg: data,
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
      <div>{data}</div>
      <div>My ID: {peer?.id}</div>
    </div>
  );
}

export default App;
