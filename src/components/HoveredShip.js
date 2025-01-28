import '../styles/HoveredShip.css';

// When a ship is selected and the player hovers over the board, this component is displayed
export default function HoveredShip({ship, canPlaceShip}) {

  // Calculated length for element based on the ships length
  let lengthString = "calc(" + (ship.length * 100) + "% + " + (2 * (ship.length - 1)) + "px)"

  return (
    <div
      className='HoveredShip' 
      style={{
        width:  ship.orientation === "ver" ? '100%': lengthString,
        height: ship.orientation === "ver" ? lengthString: "100%",
        backgroundColor: canPlaceShip ? "green" : "red",
      }}
    />
  )
}