

const book1 = {
  author: "George Orwell",
  publishers: [{ companyName: "AB" }, { companyName: "CD" }],
};

const book5 = JSON.parse(JSON.stringify(book1));
book5.publishers[0] = { companyName: "Doritos" };

console.log(book1);
console.log(book5);