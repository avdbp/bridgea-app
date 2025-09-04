// FUNCTION DECLARATION

function sumaTotal(num1, num2) {
  return num1 + num2;
}

const sumaFinal = sumaTotal(18, 12);
console.log(sumaFinal);

// FUNCTION EXPRESSION

const saludar = function (saludo) {
  console.log(saludo);
};

// Es lo mismo que esto:
// function saludar(saludo){
//     console.log(saludo);
// }

console.log(saludar);
saludar("Buenas tardes");

// ---------------------------------------------------
// CALLBACKS

function comerPostre() {
  console.log("Estoy tomando el postre.");
}

// Funciones con callbacks
// (callback es un placeholder):
function comer(callback) {
  console.log("Estoy comiendo.");
  callback();
}

function cenar(patata) {
  console.log("Estoy cenando.");
  patata();
}

// Al invocar la función pasamos la definición de la
// función como argumento:
comer(comerPostre);
cenar(comerPostre);

// Si no pasamos una función como argumento da error:
// comer("AAA");

// Callbacks con function expressions (funciones anónimas):
function guardarNombreUsuario(patata, funcionAnonima) {
  funcionAnonima(patata);
}

// Invocamos la función y definimos la función anónima
// directamente en el segundo argumento:
guardarNombreUsuario("user24", function (name) {
  console.log(`${name} guardado en la base de datos.`);
});

// Definimos la function expression y la pasamos
// como argumento:
const guardar = function (name) {
  console.log(`${name} guardado en la base de datos.`);
};

guardarNombreUsuario("user25", guardar);

// Podemos usar varios tipos de datos:
function sumaNumeros(numbersArr, funcionAnonima) {
  return funcionAnonima(numbersArr);
}

const totalSuma = sumaNumeros([1, 2, 3, 4, 5, 6], function (numeros) {
  let suma = 0;
  for (let numero of numeros) {
    suma += numero; // suma = suma + numero;
  }
  return suma;
});

console.log(totalSuma);

// Métodos como el forEach usan funciones anónimas
// como argumentos:
["uno", "dos", "tres", "cuatro", "cinco"].forEach(function (string) {
  console.log(string);
});

// ---------------------------------------------------
// ARROW FUNCTIONS
// Sintaxis sólo para funciones anónimas

const greeting1 = function (name) {
  return `Hello, ${name}!`;
};
console.log(greeting1("Pedro"));

const greeting2 = (name) => {
  return `Hello, ${name}!`;
};
console.log(greeting2("Luís"));

// Sintaxis simplificada: en una línea, se omiten {} y return
const greeting3 = (name) => `Hello, ${name}!`;
console.log(greeting3("Ludovico"));

// Se pueden omitir los paréntesis:
// const greeting3 = name => `Hello, ${name}!`;

// Con más de un parámetro:
const greeting4 = (name1, name2) => `Hello ${name1} and ${name2}`;
console.log(greeting4("Francisca", "Andrea"));

// Sin parámetros:
const greeting5 = () => "Hello there!";
console.log(greeting5());

// El forEach anterior con Arrow Function:
["uno", "dos", "tres", "cuatro", "cinco"].forEach((string) => {
  console.log(string);
});

// ---------------------------------------------------
// ARGUMENTS OBJECT
// Para acceder a los argumentos que usamos cuando
// invocamos una función:

function pintarArgumentos() {
  console.log(arguments);
  console.log(arguments.length);
  console.log(arguments[0]);
  console.log(arguments[arguments.length - 1]);

  for (let i = 0; i < arguments.length; i++) {
    console.log("Argumentos en el bucle:", arguments[i]);
  }
}

pintarArgumentos("Hola", "Qué tal", "Adiós", "Patata");
pintarArgumentos(88, ["Sí", "No"], { edad: 31 }, false);
