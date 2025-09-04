const express = require('express');
const router = express.Router();
const isLoggedIn = require("../middleware/isLoggedIn");

const Client = require('../models/Client.model');

// Middleware para parsear datos del formulario
router.use(express.urlencoded({ extended: true }));

// Ruta para mostrar la vista de creación de clientes
router.get('/', isLoggedIn, (req, res) => {
  res.render('createClientForm'); // Nombre del archivo HBS para el formulario
});

// Ruta para manejar la creación de clientes desde el formulario
router.post('/clients/create', isLoggedIn, async (req, res) => {
  try {
    // Obtén los datos del formulario
    const { name, phone, email, dataContact, city, observations } = req.body;

    // Crea un nuevo cliente en la base de datos
    await Client.create({ name, phone, email, dataContact, city, observations });

    // Redirecciona a la página principal o a donde desees después de crear el cliente
    res.redirect('/');
  } catch (error) {
    console.error('Error al crear el cliente:', error);
    // Maneja el error de alguna manera, por ejemplo, mostrando un mensaje al usuario
    res.render('error', { message: 'Error al crear el cliente' });
  }
});

// Ruta para mostrar la lista de clientes
router.get('/clients', isLoggedIn,  async (req, res) => {
  try {
    // Obtiene todos los clientes de la base de datos
    const clients = await Client.find();

    // Renderiza la vista con el listado de clientes
    res.render('clientList', { clients }); // Nombre del archivo HBS para el listado
  } catch (error) {
    console.error('Error al obtener el listado de clientes:', error);
    // Maneja el error de alguna manera, por ejemplo, mostrando un mensaje al usuario
    res.render('error', { message: 'Error al obtener el listado de clientes' });
  }
});

// Ruta para mostrar los detalles de un cliente específico
router.get('/clients/details/:clientId',  async (req, res) => {
  try {
    // Obtén el ID del cliente desde los parámetros de la URL
    const clientId = req.params.clientId;

    // Busca el cliente en la base de datos por su ID
    const client = await Client.findById(clientId);

    // Verifica si el cliente existe
    if (!client) {
      // Si el cliente no se encuentra, puedes manejar esto de alguna manera, por ejemplo, redireccionar a la lista de clientes
      return res.redirect('/clients');
    }

    // Renderiza la vista con los detalles del cliente y un enlace para editar
    res.render('clientDetail', { client }); // Nombre del archivo HBS para los detalles del cliente
  } catch (error) {
    console.error('Error al obtener los detalles del cliente:', error);
    // Maneja el error de alguna manera, por ejemplo, mostrando un mensaje al usuario
    res.render('error', { message: 'Error al obtener los detalles del cliente' });
  }
});

// Ruta para mostrar el formulario de edición de un cliente
router.get('/clients/edit/:clientId',  async (req, res) => {
  try {
    // Obtén el ID del cliente desde los parámetros de la URL
    const clientId = req.params.clientId;

    // Busca el cliente en la base de datos por su ID
    const client = await Client.findById(clientId);

    // Verifica si el cliente existe
    if (!client) {
      // Si el cliente no se encuentra, puedes manejar esto de alguna manera, por ejemplo, redireccionar a la lista de clientes
      return res.redirect('/clients');
    }

    // Renderiza la vista con el formulario de edición y los detalles del cliente
    res.render('editClientForm', { client }); // Nombre del archivo HBS para el formulario de edición
  } catch (error) {
    console.error('Error al obtener los detalles del cliente para editar:', error);
    // Maneja el error de alguna manera, por ejemplo, mostrando un mensaje al usuario
    res.render('error', { message: 'Error al obtener los detalles del cliente para editar' });
  }
});

// Ruta para manejar la actualización de un cliente desde el formulario de edición
// Ruta para manejar la actualización de un cliente desde el formulario de edición
router.post('/clients/edit/:clientId', isLoggedIn, async (req, res) => {
  try {
    // Obtén el ID del cliente desde los parámetros de la URL
    const clientId = req.params.clientId;

    // Obtén los datos del formulario
    const { name, phone, email, dataContact, city, observations } = req.body;

    // Actualiza el cliente en la base de datos y devuelve el documento modificado
    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      { name, phone, email, dataContact, city, observations },
      { new: true }
    );

    // Corrige el orden de los parámetros en res.redirect
    res.redirect(302, `/clients/details/${updatedClient._id}`);
  } catch (error) {
    console.error('Error al editar el cliente:', error);
    // Maneja el error de alguna manera, por ejemplo, mostrando un mensaje al usuario
    res.render('error', { message: 'Error al editar el cliente' });
  }
});


// Ruta para eliminar un cliente
// Ruta para eliminar un cliente
router.post('/clients/delete/:clientId', isLoggedIn, async (req, res) => {
  try {
    const clientId = req.params.clientId;

    // Utiliza deleteOne para eliminar el cliente
    await Client.deleteOne({ _id: clientId });

    // Redirecciona a la lista de clientes después de la eliminación
    res.redirect('/clients');
  } catch (error) {
    console.error('Error al eliminar el cliente:', error);
    res.render('error', { message: 'Error al eliminar el cliente' });
  }
});



module.exports = router;
