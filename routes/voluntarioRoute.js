//Obtenemos las importaciones
var express = require('express');
var bcrypt = require('bcryptjs');
const _VOLUNTARIO = require('../models/voluntarioScheme');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var jwt = require('jsonwebtoken');
// se jala el seed pre configurado por defecto
var SEED = require('../config/config').SEED;

var moment = require('moment');
var dateMoment = moment();
dateMoment.locale('es');

// var mdAutentication = require('../middleware/autenticacion');

// var generalFunctions = require('../config/config');

//inicializamos express
var app = express();

app.use(fileUpload());


//json maestro que contendrá las respuestas de las peticiones
var json =
{
	message: 'OK, Im route',
	status: 200,
	ok: true,
	data: 'OK, Im route'
};


//ROUTE POST USERS
app.post('/', (req, res, next) => {

    var body = req.body;

    var voluntario = new _VOLUNTARIO({

        Nombre: body.Nombre,
        Apellido: body.Apellido,
        Edad: body.Edad,
        Cedula: body.Cedula,
        Genero: body.Genero,
        TipoSangre: body.TipoSangre,
        Email: body.Email,
        Telefono: body.Telefono,
        DonanteSangre: body.DonanteSangre,
        Fundacion: body.Fundacion,
        Estado: body.Estado,
        Ciudad: body.Ciudad,
        Pass: body.Pass,
        Cargo: body.Cargo
    });


	console.log('voluntario conformado', voluntario);

	voluntario.save((error, user) => {
		if (error) {

			json.message = error;
			json.data = null;
			json.status = 400;
			json.ok = false;
			return res.status(400).json(json);
		}

		user.Pass = '************';



		json.message = `¡Usuario ${user.Nombre} Registrado!`;
		json.data = null;
		json.status = 201;
		json.ok = true;
		return res.status(201).json(json);
	});

});


//ROUTE GET USERS
app.get('/', (req, res, next) => {


	_VOLUNTARIO.find().exec((err, voluntario) => {

		if (err) {

			json.message = err;
			json.status = 500;
			json.data = null;
			json.ok = false;
			return res.status(500).json(json);

		}
		json.message = 'Usuarios encontrados';
		json.data = voluntario;


		console.log('todos voluntarios', voluntario);

		if (voluntario.length == 0) {
			json.message = 'Usuarios no encontrados';
			json.data = null;
		}

		json.status = 201;
		json.ok = true;
		return res.status(201).json(json);

	})




});






module.exports = app;