// SCOPE
// Alcance de una variable

// Scope global
let nombreUsuario = "Andrea";
// console.log(nombreUsuario);

// Scope de función
function movePlayer() {
  console.log(nombreUsuario);
  let mailUsuario = "andrea.fabregas@ironhack.com";
  // var mailUsuario = "andrea.fabregas@ironhack.com";
  // const mailUsuario = "andrea.fabregas@ironhack.com";
  // console.log(mailUsuario);
}

movePlayer();
// console.log(mailUsuario);

// Scope de bloque
for (let i = 0; i < 10; i++) {
  var edadUsuario_var = 23;
  let edadUsuario_let = 32;
  const edadUsuario_const = 48;
}

console.log(edadUsuario_var);
// console.log(edadUsuario_let);
// console.log(edadUsuario_const);

// VAR: Permite redeclarar sin errores
let nombre1 = "Ana";
var nombre2 = "Carlos";

// let nombre1 = "Julián";
var nombre2 = "Alejandro";
console.log(nombre2);

// HOISTING
// Las funciones se pueden ejecutar antes de declarar

// console.log("let:", variableLet);
// let variableLet = "valor";

// console.log(variableConst);
// const variableConst = "valor";

console.log(variableVar);
var variableVar = "valor";

// SHADOWING
let lost = true;
const mensajeFinal = "A";

if (lost) {
  const mensajeFinal = "Has perdido";
  console.log(mensajeFinal);
}

if (lost) {
  const mensajeFinal = "Hola";
  console.log(mensajeFinal);
}

console.log(mensajeFinal);

// ---------------------------------------------------------------- //
//                    HERENCIA DE CLASES                            //
// ---------------------------------------------------------------- //

class Animal {
  constructor(name, color, sound) {
    this.name = name;
    this.color = color;
    this.sound = sound;
  }
  scream(intensity) {
    console.log(`${this.sound}${"!".repeat(intensity)}`);
  }
}

let yuna = new Animal("Yuna", "canela", "guau");
console.log(yuna);
yuna.scream(8);

let lola = new Animal("Lola", "blanco", "bark");
console.log(lola);
lola.scream(4);

class Cat extends Animal {
  constructor(name, color) {
    super(name, color, "miau");
    this.eatenMouses = 0;
  }
  eatMouse() {
    this.eatenMouses++;
  }
  getMouses() {
    console.log(`${this.name} se ha comido ${this.eatenMouses} ratones.`);
  }
  // scream(intensity) {
  //   console.log(`${this.sound}${"*".repeat(intensity)}`);
  // }
}

let garfield = new Cat("Garfield", "orange");
console.log(garfield);
garfield.scream(1);

garfield.eatMouse();
garfield.eatMouse();
garfield.eatMouse();
garfield.eatMouse();
garfield.eatMouse();

garfield.getMouses();
garfield.scream(18);
yuna.scream(20);
