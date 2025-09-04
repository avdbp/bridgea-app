const board = [
  100, -10, 0, 0, -40, -10, -10, 5, 0, -10, -50, -10, 0, 0, -50, -10,
];

let dice = 0;

let player1_name = "Joao";
let player1_pos = 0;
let player1_color = "green";
let player1_cash = 1000;

let player2_name = "Ana";
let player2_pos = 0;
let player2_color = "red";
let player2_cash = 1000;

let player3_name = "Alejandro";
let player3_pos = 0;
let player3_color = "blue";
let player3_cash = 1000;

// TURNO 1
// Jugador 1 tira el dado
dice = Math.ceil(Math.random() * 6);
console.log("TIRADA JUGADOR 1:", dice);
// Actualizar posición del jugador
player1_pos = (player1_pos + dice) % board.length;
// Actualizar el cash
player1_cash += board[player1_pos];
if (player1_cash < 0) {
  console.log("GAME OVER PLAYER 1");
} else {
  console.log("Dinero jugador 1:", player1_cash);
  console.log("Posición jugador 1:", player1_pos);
}

// TURNO 2
// Jugador 2 tira el dado
dice = Math.ceil(Math.random() * 6);
console.log("TIRADA JUGADOR 2:", dice);
// Actualizar posición del jugador
player2_pos = (player2_pos + dice) % board.length;
// Actualizar el cash
player2_cash += board[player2_pos];
if (player2_cash < 0) {
  console.log("GAME OVER PLAYER 2");
} else {
  console.log("Dinero jugador 2:", player2_cash);
  console.log("Posición jugador 2:", player2_pos);
}

// TURNO 3
// Jugador 3 tira el dado
dice = Math.ceil(Math.random() * 6);
console.log("TIRADA JUGADOR 3:", dice);
// Actualizar posición del jugador
player3_pos = (player3_pos + dice) % board.length;
// Actualizar el cash
player3_cash += board[player3_pos];
if (player3_cash < 0) {
  console.log("GAME OVER PLAYER 3");
} else {
  console.log("Dinero jugador 3:", player3_cash);
  console.log("Posición jugador 3:", player3_pos);
}

// ¡Muchas líneas de código para una única ronda!
