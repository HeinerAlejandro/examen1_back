var express = require('express');

const Donacion = require('../models/donacionScheme');

var app = express();

var json =
{
	message: 'OK, Im route',
	status: 200,
	ok: true,
	data: 'OK, Im route'
};

app.get('/', (req, res, next) => {


	Donacion.find().exec((err, donaciones) => {

		if (err) {

			json.message = err;
			json.status = 500;
			json.data = null;
			json.ok = false;
			return res.status(500).json(json);

		}
		json.message = 'Donaciones encontradas';
		json.data = donaciones;


		console.log('todas donaciones', donaciones);

		if (donaciones.length == 0) {
			json.message = 'donaciones no registradas';
			json.data = null;
		}

		json.status = 200;
		json.ok = true;
		return res.status(200).json(json);

	})
});

module.exports = app;