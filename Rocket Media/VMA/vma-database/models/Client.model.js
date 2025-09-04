// Iteration #1
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let clientSchema = new Schema(
  {
    name: {
      type: String,
    },
    phone: {
      type: Number,
    },
    email: {
      type: String,
    },
    dataContact: {
      type: String,
    },
    city: {
      type: String,
    },
    observations: {
      type: String,
    },
  },
  
  {
    timestamps: true,
  }
);

//schema para montar el modelo (estructura de un documento de la coleccion)
const Client = mongoose.model("Client", clientSchema); //Modelo: clase para manipular documentos en una colección

//especificas qué va a devolver el require
module.exports = Client;