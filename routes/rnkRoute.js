var express = require('express');
var Post = require('../models/postScheme');
var mdAutentication = require('../middleware/autenticacion');

var app = express();

//json maestro que contendrá las respuestas de las peticiones
var json =
{
	message: 'OK, Im post route',
	status: 200,
	ok: true,
	data: 'OK, Im post route'
};
/////////////////////////////////////COMMENT//////////////////////////////////
/*
RUTA QUE ME PERMITE AÑADIR VISITAS A LAS PUBLICACION EN BASE A SU ID
*/
/////////////////////////////////////COMMENT//////////////////////////////////
app.post('/views/:p/:v?',(req, res, next) =>
{

    var p = req.params.p; //recibe el id de la publicacion
    var views = req.params.v; //valor donde recibe el nro de visitas

	Post.findById({_id:p}, (error,post)=>
	{
		if (error)
		{
			//if error exists, return the error with status 500
			json.message = 'Error al buscar la publicación';
			json.data = null;
			json.status = 500;
			json.ok = false;

			return res.status(500).json(json);
		}

		if (!post)
		{
			//if user not exists, return the error with status 400 bad request
			json.message = 'No se encontró la publicación';
			json.data = null;
			json.status = 400;
			json.ok = false;

			return res.status(400).json(json);
        }

        if(!views)
        {
            //si las visitas son nulas, solo devuelve las que estan ya registradas
            json.message = post.view + ' Visitas!';
            json.data = post.view;
            json.status = 200;
            json.ok = true;

            return res.status(200).json(json);
        }

        post.view = views; //aqui modifico la cantidad de visitas del post

        post.save((err, postSaved)=>
        {
            if (err)
            {
            	//if exists problem for update user, return sttus 400

                json.message = 'Error al modificar el numero de visistas!';
                json.data = null;
                json.status = 400;
                json.ok = null;

                return res.status(400).json(json);
            }

            json.message = post.view + ' Visitas!';
            json.data = post.view;
            json.status = 200;
            json.ok = true;

            return res.status(200).json(json);
        });
	});

});

/////////////////////////////////////COMMENT//////////////////////////////////
/*
RUTA POST PARA CALIFICAR UNA PUBLICACION
*/
/////////////////////////////////////COMMENT//////////////////////////////////
var stars =
{
	points:null, //0 al 5?
	idUser : null //id de quien dio la reaccion
}

app.post('/stars/:p',
// mdAutentication.verificaToken,
mdAutentication.cualquiera,
(req,res,next)=>
{
    /////////////////////////////////////////////////////////////////
	stars.idUser = req.usuario._id; // id de quien le dio calificacion
	stars.points = req.body.points; // la califificacion
	//////////////////////////////////////////////////////////////


	/////
	////////////// // // // // //////////////console.logog( stars );
	// return res.end();

	// Post.findById(req.params.p, (error,post)=>
	Post.findById(req.params.p).exec((error,post)=>

	{
		if (error)
		{
			//if error exists, return the error with status 500
			json.message = 'Error al calificar la publicación';
			json.data = null;
			json.status = 500;
			json.ok = false;
			return res.status(500).json(json);
		}
		if (!post)
		{
			//if user not exists, return the error with status 400 bad request
			json.message = 'No se pudo calificar la publicación';
			json.data = null;
			json.status = 400;
			json.ok = false;
			return res.status(400).json(json);
		}
///////////////////////////////////////////////////////////////////////////////////////////////////
		//si la calififcaion llega null, este la borra, sino la agrega
		if(stars.points)
		{
			if(!post.stars.length){ post.stars.push(stars); json.message = 'Has calificado esta publicación!';}
			else
			{
				var aux = post.stars; var aux1= null;
				//saco la puntuacion que ya di
				aux1 = aux.filter(function(item) { return item.idUser == stars.idUser; });
				//saco todos los demas like
				aux = aux.filter(function(item) { return item.idUser != stars.idUser; });
				//sobreescribo la puntuacion que di
				aux1 = stars;
				//reencolo las demas puntuaciones sin el like modificado
				post.stars = aux;
				//luego vuelvo asignar la puntuacion modificada
                post.stars.push(aux1);

                json.message = 'Has calificado esta publicación!';
			}

		}else
		{
			var aux = post.stars;
			aux = aux.filter(function(item) { return item.idUser != stars.idUser; });
			post.stars = aux;
			json.message = 'Has quitado tu calificación!';
		}

/////////////////////////////////////////////////////////////////////////////////////////////////////

		///////////////////////////////////////////promedio de estrelas////////////////////////////////////////

		var aux1 = 0;
		var aux2 = 0;

		// ////////////// // // // // //////////////console.logog(post.stars);
		post.stars.forEach(item => {

			// //////////// // // // // //////////////console.logog(item.points)
			aux2 += aux1 + item.points;

		});

		// //////////// // // // // //////////////console.logog(aux2);
		// //////////// // // // // //////////////console.logog(post.stars.length);

		aux2 = aux2/post.stars.length;
		// //////////// // // // // //////////////console.logog('total', aux2);

		// ////////////// // // // // //////////////console.logog(aux2);
		aux2 = (aux2 >= 5)? aux2 = 5: aux2;

		// ////////////// // // // // //////////////console.logog(aux2);

		post.points = Number(aux2).toFixed(1);

		// return res.end();

/////////////////////////////////////////////////////////////////////////////////////////////////////
		// ////////////// // // // // //////////////console.logog(post);

		post.save((err, postSaved)=>
        {
			if (err)
            {
				//if exists problem for update user, return sttus 400
				// ////////////// // // // // //////////////console.logog(err);
                json.message = 'Error al calificar la publicación!';
                json.data = null;
                json.status = 400;
                json.ok = null;
                return res.status(400).json(json);
            }
			//en el json de respuesta retorno en el mensaje los datos mas relevante y rapidos
			var l = {
				stars: postSaved.stars,
				points: post.points
			}
			json.data = l;
    		json.status = 200;
    		json.ok = true;
            return res.status(200).json(json);
        });
	});
});

/////////////////////////////////////COMMENT//////////////////////////////////
/*
RUTA PARA VER LA CANTIDAD DE ESTERELLAS QUE POSEE LA PUBLICACION
*/
/////////////////////////////////////COMMENT//////////////////////////////////
app.get('/stars/:p',(req,res,next)=>
{
    /////////////////////////////////////////////////////////////////
	stars.idUser = '5ea0a03e2056aa01c488e5b1';//req.usuario._id; // id de quien le dio calificacion
	stars.points = req.body.points; // la califificacion
	///////////////////////////////////////////////////////////////////

	Post.findById({_id:req.params.p}, (error,post)=>
	{
		if (error)
		{
			//if error exists, return the error with status 500
			json.message = 'Error al calificar la publicación';
			json.data = null;
			json.status = 500;
			json.ok = false;
			return res.status(500).json(json);
		}
		if (!post)
		{
			//if user not exists, return the error with status 400 bad request
			json.message = 'No se pudo calificar la publicación';
			json.data = null;
			json.status = 400;
			json.ok = false;
			return res.status(400).json(json);
        }

		var l = {
			stars: post.stars,
			points: post.points
		}

        json.message = post.stars.length + ' Personas han calificado este producto';
        json.data = l;
    	json.status = 200;
    	json.ok = true;
           return res.status(200).json(json);
    });
})
module.exports = app;