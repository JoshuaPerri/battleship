import '../styles/ConnectionManager.css';
import { Peer } from "peerjs"
import { useRef, useEffect } from "react"

export default function ConnectionManager({conState, setConState}) {

  const conID = useRef("");
  const playerName = useRef("");
  const playerColour = useRef("#000000");

  useEffect(() => {

    // Not connected to brokering server
    if (conState.peer === null) {

      // Open connection to brokering server
      // var peer = new Peer(Math.floor(Math.random() * 1000), {
      //   host: "localhost",
      //   port: 9000,
      //   path: "/",
      // });
      var peer = new Peer();

      // Update state with connection
      setConState({
        ...conState,
        peer: peer,
      });

    // Connected to brokering server
    } else {
      // Set up hooks for opening p2p connections

      // When user connects to brokering server
      conState.peer.on('open', function(id) {

        // Save user id from brokering server
        setConState({
          ...conState,
          myID: id,
        });

        console.log("Connected to Server");
      });

      // When an error occurs when connecting or after connection is opened
      conState.peer.on('error', function(e) {
        console.log(e.type);
      });

      // When a p2p connection is recieved
      conState.peer.on('connection', function(c) {

        // =========================================================================
        // Player num should be set with a different system, temporarily set sender to 0 and reciever to 1
        setConState({
          ...conState,
          con: c,
          conID: c.peer,
          playerNum: 1, 
        });

        console.log("Connection Received");
      });

      // p2p connection is open
      if (conState.con !== null) {

        // When a p2p connection is opened (sending or recieving)
        conState.con.on("open", (e) => {
          setConState({
            ...conState,
            status: "waiting",
          });

          conState.con.send(
            {
              type: "set-player-data",
              data: {
                playerName: playerName.current,
                playerColour: playerColour.current,
              }
            }
          );

          console.log("Connection open", conState.playerNum);

          // Wait so user can see that a connection has been established
          setTimeout(() => {
            setConState({
              ...conState,
              status: "connected",
            });
            console.log("Timeout complete");
          }, 2000);
        });
      }
    }

    // Clean up
    return () => {
      if (conState.peer !== null) {

        conState.peer.off("open");
        conState.peer.off('error');
        conState.peer.off('connection');

      }
      if (conState.con !== null) {

        conState.con.off("open");

      }
    }

  }, [conState, setConState]);

  function connect(e) {

    // Attempt connection to user with id
    var con = conState.peer.connect(conID.current);

    // =========================================================================
    // Player num should be set with a different system, temporarily set sender to 0 and reciever to 1
    setConState({
      ...conState,
      con: con,
      conID: conID.current,
      playerNum: 0,
    });

    console.log("Connection sent");
  }

  function copy(e) {
    navigator.clipboard.writeText(conState.myID);
  }

  return (
    <div className='ConnectionManager'>
      <div className='modal'>
        <h1 className='connection-header'>Connection Menu</h1>
        <div className='id-input-group'>

          <div>Your connection ID is:</div>
          <div className='id-display'>{conState.myID}</div>
          <button onClick={(e) => copy(e)}>Copy</button>

        </div>
        <div className='id-input-group'>
          <input
            className='id-input'
            onChange={(e) => {playerName.current = e.currentTarget.value}}
            placeholder='Enter your display name'
          />
          <input
            className='colour-input'
            type='color'
            onChange={(e) => {playerColour.current = e.currentTarget.value}}
          />
        </div>
        <div className='id-input-group'>
          <input
            className='id-input'
            onChange={(e) => {conID.current = e.currentTarget.value}}
            placeholder="Enter your opponent's ID"
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
