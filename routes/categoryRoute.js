var express = require('express');
var Catg = require('../models/catgScheme');
var Post = require('../models/postScheme');
var mdAutentication = require('../middleware/autenticacion');

var moment = require('moment');
var dateMoment = moment();
moment.locale('es');


// se inicializa express
var app = express();

var json =
{
	message: 'OK, Im file route',
	status: 200,
	ok: true,
	data: 'OK, Im file route'
};


//ruta para añdir subcategoria
app.post('/subcategoria/:id',
[mdAutentication.verificaToken,mdAutentication.verificaAdminRole],
(req, res, next)=>
{
	// var child = JSON.parse(req.body._child);

	var body = req.body;


    Catg.findById(req.params.id, (error,catg)=>
	{
		if (error)
		{
			//if error exists, return the error with status 500
			json.message = 'Error al buscar la categoria';
			json.data = null;
			json.status = 500;
			json.ok = false;

			return res.status(500).json(json);
		}

		if (!catg)
		{
			//if catg not exists, return the error with status 400 bad request
			json.message = 'No se encontró la categoria';
			json.data = null;
			json.status = 400;
			json.ok = false;

			return res.status(400).json(json);
		}
		// // // ////////////////console.logog('encontró cat', catg);
		var l = {
			name: body.name
		}
		catg._child.push(l);

		// // // ////////////////console.logog('push', catg._child);

        catg.save((err, catgSaved)=>
        {
            if (err)
            {
				//if exists problem for update catg, return sttus 400
				// // // ////////////////console.logog(err);

                json.message = 'Error al añadir sub categoria!';
                json.data = null;
                json.status = 400;
                json.ok = null;

                return res.status(400).json(json);
            }


            json.message = 'Subcategoria añadida';
    		json.data = catgSaved;
    		json.status = 200;
    		json.ok = true;

            return res.status(200).json(json);
        });
	});
});

// function findIndex(cagt)

function changSubCategory(id, sub){

	// ////////////////console.logog('idcambiado', id);
	// ////////////////console.logog('sub', sub);

	return x = new Promise((resolve,reject) => {

		Post.updateMany(
			{ "_category._child": id },   // Query parameter

			{ $set: { "_category.child": sub } }
	 ).exec((error,response)=> {

		if(error){

			reject('no se pudo cambiar', error);

		}
		if(response){

			// ////////////////console.logog('todos los items con la sub', response);
			resolve('datos cambiados ');

		}

	});


	})

	//  Catg.find({}).exec((error,response)=>
	// {



}

//ruta para modificar subcategoria
app.put('/subcategoria/:id/:index',
[mdAutentication.verificaToken,mdAutentication.verificaAdminRole],
(req, res, next)=>
{
	var id = req.params.id;
	var idx = req.params.index;
	var body = req.body;
    Catg.findById( id , async (error,catg)=>
	{
		if (error)
		{
			//if error exists, return the error with status 500
			json.message = 'Error al buscar la categoria';
			json.data = null;
			json.status = 500;
			json.ok = false;

			return res.status(500).json(json);
		}

		if (!catg)
		{
			//if catg not exists, return the error with status 400 bad request
			json.message = 'No se encontró la categoria';
			json.data = null;
			json.status = 400;
			json.ok = false;

			return res.status(400).json(json);
		}

		var i = catg._child.findIndex( r => {
			// // // // ////////////////console.logog(r._id);
			// // // // ////////////////console.logog('idx', idx)
			return String(r._id) === String(idx);
		});
		// // // // ////////////////console.logog(i);
		// // // // ////////////////console.logog(catg._child[i]);


		await changSubCategory(idx, body.name).then(r => {
			// ////////////////console.logog(r);
		}, err => {
			console.error(err);
		});

		catg._child[i].name = body.name;


        catg.save((err, catgSaved)=>
        {
            if (err)
            {
            	//if exists problem for update catg, return sttus 400

                json.message = 'Error al modificar sub categoria!';
                json.data = null;
                json.status = 400;
                json.ok = null;

                return res.status(400).json(json);
            }


            json.message = 'Subcategoria modificada';
    		json.data = catgSaved;
    		json.status = 200;
    		json.ok = true;

            return res.status(200).json(json);
        });
	});
});




//rutas para jalarme las categorias
app.get('/',
// [mdAutentication.verificaToken,mdAutentication.verificaAdminRoleoMismoUser],
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

		////////////////console.logog('las categorias');

		json.message = 'Categorias encontradas!';

		// ////////////////console.logog(response);

		response.sort(function (a, b) {
			var textA = a._category.toUpperCase();
			var textB = b._category.toUpperCase();
			return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
		})

		// ////////////////console.logog(response);


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
        _category: body.name,
        created_at: dateMoment.format('LL')
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

    	json.message = 'Categoria agregada';
    	json.data = catg;
    	json.status = 201;
    	json.ok = true;
    	return res.status(201).json(json);
    });

});

//ruta para actualizar categorias
app.put('/principal/:id',
[mdAutentication.verificaToken,mdAutentication.verificaAdminRole],
(req, res, next)=>
{
	var id = req.params.id
	var body = req.body;

    Catg.findById(id, (error,catg)=>
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

		catg._category = body.name;

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

            json.message = 'Categoria modificada';
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