var express = require('express');
var Catg = require('../models/catgScheme');
var mdAutentication = require('../middleware/autenticacion');

// se inicializa express
var app = express();

var json =
{
	message: 'OK, Im file route',
	status: 200,
	ok: true,
	data: 'OK, Im file route'
};



//rutas para jalarme las categorias
app.get('/',
// [mdAutentication.verificaToken,mdAutentication.verificaAdminRole],
(req,res,next)=>
{
	Catg.find({}).exec((error,response)=>
	{
		if(error)
		{
			json.message = error;
			json.status = 500;
			json.data = null;
			json.ok = false;
			return res.status(500).json(json);
		}

		json.message = 'Categorias encontradas!';
		json.data = response;

		if (response.length == 0)
		{
			json.message = 'Categorias no encontradas';
			json.data = null;
		}

		json.status = 200;
		json.ok = true;
		return res.status(200).json(json);
	});

});

//ruta para agregar categorias
app.post('/',
[mdAutentication.verificaToken,mdAutentication.verificaAdminRole],
(req,res, next)=>
{
	var body = req.body;
    var catg = new Catg
    ({
        name: body.name,
        created_at: Date('d-m-Y H:i')
    });

    catg.save((error,catg)=>
    {
    	if (error)
    	{
    		json.message = error;
    		json.data = null;
    		json.status = 400;
    		json.ok = false;
    		return res.status(400).json(json);
    	}

    	json.message = 'Categoria agregada! ;-)';
    	json.data = catg;
    	json.status = 201;
    	json.ok = true;
    	return res.status(201).json(json);
    });

});

//ruta para actualizar categorias
app.put('/',
[mdAutentication.verificaToken,mdAutentication.verificaAdminRole],
(req, res, next)=>
{
    var body = req.body;

    Catg.findById(body.id, (error,catg)=>
	{
		if (error)
		{
			//if error exists, return the error with status 500
			json.message = 'Error al buscar el usuario';
			json.data = null;
			json.status = 500;
			json.ok = false;

			return res.status(500).json(json);
		}

		if (!catg)
		{
			//if catg not exists, return the error with status 400 bad request
			json.message = 'No se encontró al usuario';
			json.data = null;
			json.status = 400;
			json.ok = false;

			return res.status(400).json(json);
		}

		catg.name = body.name;

        catg.save((err, catgSaved)=>
        {
            if (err)
            {
            	//if exists problem for update catg, return sttus 400

                json.message = 'Error al modificar usuario!';
                json.data = null;
                json.status = 400;
                json.ok = null;

                return res.status(400).json(json);
            }

            catgSaved.pass = ';-)';

            json.message = 'Categoria modificada!';
    		json.data = catgSaved;
    		json.status = 200;
    		json.ok = true;

            return res.status(200).json(json);
        });
	});
});


//ruta para borrar una categoria dependiendo del id

app.delete('/',
[mdAutentication.verificaToken ,mdAutentication.verificaAdminRoleoMismoUser],
(req, res, next)=>
{
    var id = req.body.id;

    Catg.findByIdAndRemove(id, (error, catgDeleted)=>
    {
        if (error)
        {
            json.message = 'Error al buscar la categoria';
			json.data = null;
			json.status = 500;
			json.ok = false;

			return res.status(500).json(json);
        }

        if (!catgDeleted)
        {
            json.message = 'No se encontró la categoria';
			json.data = null;
			json.status = 400;
			json.ok = false;

			return res.status(400).json(json);
        }

        json.message = 'Categoria eliminada! ;-)';
    	json.data = catgDeleted;
    	json.status = 200;
    	json.ok = true;

        return res.status(200).json(json);
    });
});
module.exports = app;