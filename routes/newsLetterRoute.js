var express = require('express');
var NewsLetter = require('../models/nslrScheme');


var mdAutentication = require('../middleware/autenticacion');

var moment = require('moment');
var dateMoment = moment();
moment.locale('es');

//inicializamos express
var app = express();

// default options

var json =
{
	message: 'OK, Im post route',
	status: 200,
	ok: true,
	data: 'OK, Im post route'
};


app.post('/',(req,res,next)=>
{
    var body = req.body;


	var NewsLtt = new NewsLetter
	({
        email: body.email,
        name: body.name,
        city: body.city
    });

    NewsLtt.save((error,response)=>
    {
    	if (error)
    	{
    		json.message = error;
    		json.data = null;
    		json.status = 400;
    		json.ok = false;
    		//////////////// // // // // //////////////console.logog(json);
    		return res.status(400).json(json);
    	}



    	json.message = '¡Gracias por suscribirte a Alerta Pyme!';
    	json.data = response;
    	json.status = 201;
    	json.ok = true;
    	return res.status(201).json(json);
    });

});



app.get('/',
[mdAutentication.verificaToken ,mdAutentication.verificaAdminRole] ,
(req,res,next)=> {

	NewsLetter.find({
	})
	.exec((error,response)=>
	{
		if(error)
		{
			json.message = error;
			json.status = 500;
			json.data = null;
			json.ok = false;
			return res.status(500).json(json);
		}

		response.filter(function (item) { return item.length > 0; });

		json.message = 'Registros de NewsLetter';
		json.data = response;
		json.status = 200;
		json.ok = true;
		return res.status(200).json(json);
	});

});




module.exports = app;