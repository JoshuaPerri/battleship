import '../styles/ConnectionManager.css';
import { Peer } from "peerjs"
import { useRef, useEffect } from "react"

export default function ConnectionManager({conState, setConState}) {

  const conID = useRef("");

  useEffect(() => {
    if (conState.peer === null) {

      var peer = new Peer(Math.floor(Math.random() * 1000), {
        host: "localhost",
        port: 9000,
        path: "/",
      });

      setConState({
        ...conState,
        peer: peer,
      });
    
    } else {
      conState.peer.on('open', function(id) {
  
        setConState({
          ...conState,
          myID: id,
        });

        console.log("Connected to Server");
      });

      conState.peer.on('error', function(e) {
        console.log(e.type);
      });
    
      conState.peer.on('connection', function(c) {

        setConState({
          ...conState,
          con: c,
        });

        console.log("Connection Received");
      });

      if (conState.con !== null) {
        conState.con.on("open", (e) => {
          setConState({
            ...conState,
            status: "waiting",
          });
          setTimeout(() => {
            setConState({
              ...conState,
              status: "connected",
            });
            console.log("Timeout complete");
          }, 2000);
          console.log("Connection open");
        });
      }
    }
  }, [conState, setConState]);

  function connect(e) {

    var con = conState.peer.connect(conID.current);

    setConState({
      ...conState,
      con: con,
      conID: conID.current,
    });

    console.log("Connection sent");
  }

  return (
    <div className='ConnectionManager'>
      <div className='modal'>
        <h1 className='connection-header'>Connection Menu</h1>
        <div className='id-input-group'>

          <div>Your connection ID is:</div>
          <div className='id-display'>{conState.myID}</div>

        </div>
        <div className='id-input-group'>
          <input
            className='id-input'
            onChange={(e) => {conID.current = e.currentTarget.value}}
          />
          <button
            className='id-submit-button'
            onClick={(e) => connect(e)}
            style={{display: conState.con === null ? "inline" : "hidden"}}
          >
            Connect
          </button>
        </div>
        <div className='id-input-group' style={{visibility: conState.status === "disconnected" ? "hidden" : "visible"}}>
          <div>Successfully connected to user:</div>
          <div className='id-display'>{conState.conID}</div>
        </div>
      </div>
      

    </div>
  );
}
