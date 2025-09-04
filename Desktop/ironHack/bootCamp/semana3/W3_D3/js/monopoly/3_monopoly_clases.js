const board = [
  100, -10, 0, 0, -40, -10, -10, 5, 0, -10, -50, -10, 0, 0, -50, -10,
];

let dice = 0;

class Player {
  constructor(name, color) {
    this.name = name;
    this.color = color;
    this.position = 0;
    this.cash = 1000;
  }
  move() {
    dice = Math.ceil(Math.random() * 6);
    this.position = (this.position + dice) % board.length;
    this.cash += board[this.position];
    this.displayInfo();
  }
  displayInfo() {
    if (this.cash < 0) {
      console.log(`GAME OVER ${this.name.toUpperCase()}`);
    } else {
      console.log(
        `${this.name} está en la posición ${this.position} y tiene ${this.cash} dólares.`
      );
    }
  }
}

let player1 = new Player("Joao", "green");
console.log(player1);
let player2 = new Player("Ana", "red");
console.log(player2);
let player3 = new Player("Alejandro", "blue");
console.log(player3);

// RONDA 1
player1.move();
player2.move();
player3.move();

// RONDA 2
player1.move();
player2.move();
player3.move();

// RONDA 3
player1.move();
player2.move();
player3.move();

// RONDA 4
player1.move();
player2.move();
player3.move();
