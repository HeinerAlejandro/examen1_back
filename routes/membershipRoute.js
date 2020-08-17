var express = require('express');
var MemberShip = require('../models/mbpScheme');
var mdAutentication = require('../middleware/autenticacion');

// se inicializa express
var app = express();

var json = 
{ 
	message: 'OK, Im member route',
	status: 200, 
	ok: true,
	data: 'OK, Im member route'
};


//RUTA QUE ME PERMITE OBTENER TODAS LAS MEMBRESIAS
app.get('/',(req,res,next)=>
{
	MemberShip.find({}).exec((error,response)=>
	{
		if(error)
		{
			json.message = error;
			json.status = 500;
			json.data = null;
			json.ok = false;
			return res.status(500).json(json);
		}

		json.message = 'Planes de membresias encontradas! ;-)';
		json.data = response;

		if (response.length == 0)
		{ 
			json.message = 'No hay planes de  membresias por el momento =/';
			json.data = null;
		}

		json.status = 200;
		json.ok = true;
		return res.status(200).json(json);
	});

});

//RUTA POST QUE ME PERMITE CREAR UN PLAN DE MEMBRESIA
app.post('/',
[mdAutentication.verificaToken, mdAutentication.verificaAdminRole],
(req,res,next)=>
{
	var body = req.body;

	var planScheme= null;

	if(body.extension)
	{
		planScheme =
		{
			extension: body.extension,
			offer: body.offer
		};
	}

	var member = new MemberShip
	({
		name: body.name,
		months: body.months,
		description: body.description,
		_refPlan: planScheme,
		created_at: Date('d-m-Y H:i'),
	});

	member.save((error,memberSaved)=>
    {
    	if (error) 
    	{
    		json.message = error;
    		json.data = null;
    		json.status = 400;
    		json.ok = false;
    		return res.status(400).json(json);
    	}

    	json.message = 'Plan de membresía agregado! ;-)';
    	json.data = memberSaved;
    	json.status = 201;
    	json.ok = true;
    	return res.status(201).json(json);
    });

});

//RUTA QUE ME PERMITE MODIFICAR UNA MEMBRESIA DEPENDIENDO DE SU ID
app.put('/:m',
[mdAutentication.verificaToken, mdAutentication.verificaAdminRoleoMismoUser], 
(req, res, next)=>
{

	var body = req.body;
	var planScheme= null;

	MemberShip.findById({_id:req.params.m}, (error,membership)=>
	{
		if (error) 
		{
			//if error exists, return the error with status 500
			json.message = 'Error al buscar el plan de membresía =/';
			json.data = null;
			json.status = 500;
			json.ok = false;

			return res.status(500).json(json);
		}

		if (!membership) 
		{
			//if user not exists, return the error with status 400 bad request
			json.message = 'No se encontró el plan de membresía =/';
			json.data = null;
			json.status = 400;
			json.ok = false;

			return res.status(400).json(json);
		}

		if(body.extension)
		{
			planScheme =
			{
				extension: body.extension,
				offer: body.offer
			};
		}

		membership.name = body.name;
		membership.months = body.months;
		membership.description = body.description;
		membership._refPlan = planScheme;
		membership.updated_at = Date('d-m-y H:i');

		membership.save((err, memberSaved)=>
        {
            if (err) 
            {
            	//if exists problem for update user, return sttus 400

                json.message = 'Error al modificar el plan de membresia!';
                json.data = null;
                json.status = 400;
                json.ok = null;

                return res.status(400).json(json);    
            }

            json.message = 'Plan de membresia modificada!';
    		json.data = memberSaved;
    		json.status = 200;
    		json.ok = true;

            return res.status(200).json(json);
        });

	});
});

//RUTA PARA ELIMINAR UN PLAN DE MEMBRESIA
app.delete('/:m',
[mdAutentication.verificaToken ,mdAutentication.verificaAdminRole],
(req,res,next)=>
{
	MemberShip.findByIdAndRemove({_id:req.params.m}, (error, member)=>
    {
        if (error) 
        {
            json.message = 'Error al buscar el plan de membresía =/';
			json.data = null;
			json.status = 500;
			json.ok = false;

			return res.status(500).json(json);  
		}
		
		if (!member) 
        {
            json.message = 'No se encontró el plan de membresía =/';
			json.data = null;
			json.status = 400;
			json.ok = false;

			return res.status(400).json(json);  
		}
		
        json.message = 'Plan de membresía eliminado! ;-)';
    	json.data = member;
    	json.status = 200;
    	json.ok = true;

        return res.status(200).json(json);
    });
});

module.exports = app;