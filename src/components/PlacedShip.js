import '../styles/PlacedShip.css';

// When a ship is placed on the board, this component is displayed
export default function PlacedShip({ship}) {

  // Calculated length for element based on the ships length
  let lengthString = "calc(" + (ship.length * 100) + "% + " + (2 * (ship.length - 1)) + "px)";

  return (
    <div
      className='PlacedShip' 
      style={{
        width:  ship.orientation === "ver" ? '100%': lengthString,
        height: ship.orientation === "ver" ? lengthString: "100%",
      }}
    />
  )
}