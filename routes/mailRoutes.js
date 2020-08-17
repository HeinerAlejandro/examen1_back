var express = require('express');

var nodeMailer = require('nodemailer');

var mdAutentication = require('../middleware/autenticacion');

var User = require('../models/userScheme');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var SITENAME = require('../config/config').SITENAME;

var app = express();

// var mail = require('./nodeMailerWithTemp');
var mail = require('../config/nodeMailerWithTemp');



//json maestro que contendrá las respuestas de las peticiones
var json =
{
    message: 'OK, Im user route',
    status: 200,
    ok: true,
    data: 'OK, Im user route'
};

// send email
app.put('/resetPassword/', (req, res, next) => {

    var body = req.body;
    var reqEmail = body.email;
    // find({"email": "alvarosego01@gmail.com"})

    User.find({ email: reqEmail }, (error, user) => {
        if (error) {
            //if error exists, return the error with status 500
            json.message = 'Error al buscar el usuario';
            json.data = null;
            json.status = 500;
            json.ok = false;

            return res.status(500).json(json);
        }

        if (!user || user.length == 0) {
            //if user not exists, return the error with status 400 bad request
            json.message = 'No se encontró al usuario';
            json.data = null;
            json.status = 400;
            json.ok = false;

            return res.status(400).json(json);
        }

        // //////////////// // // // // //////////////console.logog(user);
        var data = {
            name: user[0].name,
            email: user[0].email,
            role: user[0].role,
            type: 'resetPassword'
        }

        // si el email de usuario existe entonces..
        //EN ESTE PTO TENEMOS QUE CREAR UN TOKEN
        var token = jwt.sign({ user: data }, SEED, { expiresIn: 1800000 });
        ////////////////////////////////////////
        let url = `${SITENAME}/resetPassword?t=${token}`;

        mail.sendPasswordReset( reqEmail , user[0].name , user[0].name , url);

        json.message = 'Una solicitud de nueva contraseña ha sido enviada, visita tu bandeja de correo electronico. <br> La solicitud solo será vigente durante 30 minutos.';
        json.data = null;
        json.status = 200;
        json.ok = true;

        return res.status(200).json(json);

    });

    // res.end();
});

module.exports = app;
