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

app.put('/',  (req, res, next) => {

    var body = req.body;

    var donacion = new Donacion({

        cedula: body.cedula,
        banco: body.banco,
        fecha: body.fecha
    });


	console.log('Donacion Actualizada', donacion);

	donacion.save((error, donacion) => {
		if (error) {

			json.message = error;
			json.data = null;
			json.status = 400;
			json.ok = false;
			return res.status(400).json(json);
		}

		json.message = `Donacion registrada`;
		json.data = null;
		json.status = 201;
		json.ok = true;
		return res.status(201).json(json);
	});

});


app.post('/', (req, res, next) => {

    var body = req.body;

    var donacion = new Donacion({

        cedula: body.cedula,
        banco: body.banco,
        fecha: body.fecha
    });


	console.log('Donacion registrada', donacion);

	donacion.save((error, donacion) => {
		if (error) {

			json.message = error;
			json.data = null;
			json.status = 400;
			json.ok = false;
			return res.status(400).json(json);
		}

		json.message = `Donacion registrada`;
		json.data = null;
		json.status = 201;
		json.ok = true;
		return res.status(201).json(json);
	});

});


app.get('/', (req, res, next) => {
    
    Donacion.aggregate([{
        $lookup : {
            from : 'Voluntarios',
            localField : 'cedula',
            foreignField : 'Cedula', 
            as : 'donante'
        }
    }]).exec((err, donaciones) => {

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