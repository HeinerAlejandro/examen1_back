var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

const _VOLUNTARIO = require('../models/voluntarioScheme');

var mdAutentication = require('../middleware/autenticacion');

// var generalFunctions = require('../config/config');

var json =
{
	message: 'OK',
	status: 200,
	ok: true,
	data: 'OK'
};

//METODO POST PARA CREAR UN TOKEN DE SESION Y NAVEGAR EN LA PAGINA, DICHO TOKEN MUERE EN 48HRS

app.post('/',(req,res)=>
{
    var body = req.body;

    _VOLUNTARIO.findOne({email: body.email}, (error, userDB)=>
    {
        if(error)
        {
            json.message = 'Error! ocurrió un problema al intentar acceder';
            json.status = 500;
            json.ok = false;
            json.data = null;
            return res.status(500).json(json);
        }

        if(!userDB)
        {
            json.message = 'Usuario o contraseña incorrectos, verifique';
            json.status = 400;
            json.ok = false;
            json.data = null;
            return res.status(400).json(json);
        }

        if(!bcrypt.compareSync(body.pass, userDB.pass))
        {
            json.message = 'Usuario o contraseña incorrectos, verifique';
            json.status = 400;
            json.ok = false;
            json.data = null;
            return res.status(400).json(json);
        }


        userDB.Pass = '************';


        var ll = {
        	_id: user._id,
        	email: user.Email,
        	// name: user.name,
        }

             //EN ESTE PTO TENEMOS QUE CREAR UN TOKEN
        var token = jwt.sign({user: ll}, SEED, {expiresIn: '7d'});

        json.message = {
            id_user: userDB._id,
            t: token,
            w: 'Bienvenido ' + userDB.name
        };
        json.status = 200;
        json.ok = true;
        json.data = userDB;
        res.status(200).json(json);

    });
});






module.exports = app;