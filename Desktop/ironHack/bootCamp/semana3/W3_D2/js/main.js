// MUTABILIDAD de objetos y arrays

let price1 = 10.99;
let price2 = 10.99;

console.log(price1 === price2);

let price3 = price1;
console.log(price3);
console.log(price1 === price3);

const book1 = {
  author: "George Orwell",
  publishers: [{ companyName: "AB" }, { companyName: "CD" }],
};

const book2 = book1;
console.log(book1);
console.log(book2);

book2.author = "Pedro Pérez";
console.log(book1);
console.log(book2);

book1.author = "Maria del Carmen";
console.log(book1);
console.log(book2);

console.log(book1 === book2);
// book 2 y book 1 apuntan a la misma dirección de memoria
// por eso se modifican ambos a la vez
// Lo mismo con students e ironhackers
let students = ["Julián", "Ana", "Daniel", "Alejandro", "Carlos", "Joao"];
let ironhackers = students;
console.log(students === ironhackers);

// Aunque book3 tenga el mismo valor que book1,
// tienen diferentes direcciones en memoria
const book3 = {
  author: "Maria del Carmen",
};
console.log(book1 === book3); // false

// Lo mismo con students y studentsCopy
let studentsCopy = ["Julián", "Ana", "Daniel", "Alejandro", "Carlos", "Joao"];
console.log(students === studentsCopy); // false

// COPIAR OBJETOS Y ARRAYS
// Object.assign (shallow copy)
const book4 = Object.assign({}, book1);
console.log(book1 === book4);
book4.author = "George Orwell";
console.log(book1);
console.log(book4);
book4.publishers[0] = {
  companyName: "Super Cool Company",
};

console.log(book1);
console.log(book4);

// Spread operator (shallow copy)
let ironhackers2 = [...students];
console.log(ironhackers2);
ironhackers2.push("Andrea");
console.log(students);
console.log(ironhackers2);

// JSON.parse + JSON.stringify (deep copy)
const book5 = JSON.parse(JSON.stringify(book1));
book5.publishers[0] = { companyName: "Doritos" };

console.log(book1);
console.log(book5);

// --------------------------------------------
// MÉTODOS DE ARRAYS
// NO mutan (modifican) el array original:

// MAP
const numbersArray = [1, 2, 3];

const newNumbersArray = numbersArray.forEach((number) => {
  return number * 2;
});
// No retorna nada
console.log(newNumbersArray);

const mappedNumbersArray = numbersArray.map((number) => {
  return number * 2;
});

console.log(mappedNumbersArray);

const tripleNumbersArray = numbersArray.map((mongeta) => mongeta * 3);
console.log(tripleNumbersArray);

const stringArray = numbersArray.map((patata) => patata.toString());
console.log(stringArray);
console.log(numbersArray);

const uppercaseStudents = students.map((student) => student.toUpperCase());
console.log(uppercaseStudents);
console.log(students);

// REDUCE
const suma = numbersArray.reduce((acumulador, valorActual) => {
  console.log("Acumulador:", acumulador, "Valor Actual:", valorActual);
  return acumulador + valorActual;
});
console.log(suma);

const resta = [2, 5, 8, 45, 1, 0, 9, 88].reduce((patata, mongeta) => {
  console.log("Acumulador:", patata, "Valor Actual:", mongeta);
  return patata - mongeta;
}, 1000);
console.log(resta);

const resta2 = numbersArray.reduce((patata, mongeta) => patata - mongeta, 20);
console.log(resta2);

const people = [
  { name: "Candice", age: 25 },
  { name: "Tammy", age: 30 },
  { name: "Allen", age: 49 },
  { name: "Nettie", age: 21 },
  { name: "Stuart", age: 17 },
];

const ages = people.reduce((acumulador, valorActual) => {
  console.log("Acumulador:", acumulador, "Valor Actual:", valorActual);
  return acumulador + valorActual.age;
}, 0);
console.log(ages);
console.log(people);

// FILTER
const numbers = [1, 2, 3, 4, 5, 6];
const evenNumbers = numbers.filter((number) => {
  return number % 2 === 0;
});

console.log(evenNumbers);

const newStudents = students.filter(function (student) {
  return student.length > 4;
});

console.log(newStudents);
console.log(students);

// SÍ mutan (modifican) el array original:

// REVERSE
const reverseStudents = students.reverse();
console.log(reverseStudents);
console.log(students);

// SORT
const unsortedNumbers = [22, 23, 99, 68, 1, 0, 9, 112, 223, 64, 18];
// unsortedNumbers.sort();
// console.log(unsortedNumbers);

const students2 = ["Julián", "Ana", "daniel", "alejandro", "Carlos", "joao"];
students2.sort();
console.log(students2);

unsortedNumbers.sort(function (num1, num2) {
  return num1 - num2;
});

console.log(unsortedNumbers);

students2.sort(function (student1, student2) {
  if (student1.toUpperCase() < student2.toUpperCase()) return -1;
  if (student1.toUpperCase() > student2.toUpperCase()) return 1;
  return 0;
});

console.log(students2);
