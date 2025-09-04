const board = [
  100, -10, 0, 0, -40, -10, -10, 5, 0, -10, -50, -10, 0, 0, -50, -10,
];

let dice = 0;

player1 = {
  name: "Joao",
  color: "green",
  position: 0,
  cash: 1000,
  move() {
    dice = Math.ceil(Math.random() * 6);
    this.position = (this.position + dice) % board.length;
    this.cash += board[this.position];
    this.displayInfo();
  },
  displayInfo() {
    if (this.cash < 0) {
      console.log(`GAME OVER ${this.name.toUpperCase()}`);
    } else {
      console.log(
        `${this.name} está en la posición ${this.position} y tiene ${this.cash} dólares.`
      );
    }
  },
};

player2 = {
  name: "Ana",
  color: "red",
  position: 0,
  cash: 1000,
  move() {
    dice = Math.ceil(Math.random() * 6);
    this.position = (this.position + dice) % board.length;
    this.cash += board[this.position];
    this.displayInfo();
  },
  displayInfo() {
    if (this.cash < 0) {
      console.log(`GAME OVER ${this.name.toUpperCase()}`);
    } else {
      console.log(
        `${this.name} está en la posición ${this.position} y tiene ${this.cash} dólares.`
      );
    }
  },
};

player3 = {
  name: "Alejandro",
  color: "blue",
  position: 0,
  cash: 1000,
  move() {
    dice = Math.ceil(Math.random() * 6);
    this.position = (this.position + dice) % board.length;
    this.cash += board[this.position];
    this.displayInfo();
  },
  displayInfo() {
    if (this.cash < 0) {
      console.log(`GAME OVER ${this.name.toUpperCase()}`);
    } else {
      console.log(
        `${this.name} está en la posición ${this.position} y tiene ${this.cash} dólares.`
      );
    }
  },
};

// RONDA 1
// TURNO 1
player1.move();
// TURNO 2
player2.move();
// TURNO 3
player3.move();

// RONDA 2
// TURNO 1
player1.move();
// TURNO 2
player2.move();
// TURNO 3
player3.move();
