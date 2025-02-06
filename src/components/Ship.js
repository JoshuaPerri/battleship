
export default function Ship({ship, gap, padding, color, zIndex}) {

  let lengthString = "calc(" + (ship.length * 100) + "% + " + ((gap * (ship.length - 1)) + (2 * padding * (ship.length - 1))) + "px)";

  return (
    <div
      className='PlacedShip' 
      style={{
        width:  ship.orientation === "ver" ? '100%': lengthString,
        height: ship.orientation === "ver" ? lengthString: "100%",
        backgroundColor: color,
        zIndex: zIndex,
        borderRadius: ship.orientation === "ver" ? "50% / 50px" : "50px / 50%",
        pointerEvents: "none"
      }}
    />
  );
}