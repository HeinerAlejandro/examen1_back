var express = require('express');
var Post = require('../models/postScheme');
var mdAutentication = require('../middleware/autenticacion');

// se inicializa express
var app = express();

var json =
{
	message: 'OK, Im post route',
	status: 200,
	ok: true,
	data: 'OK, Im post route'
};

/////////////////////////////////////COMMENT//////////////////////////////////
/*
RUTA ENCARGADA DE LA GESTION O CRUD DE LAS REACCION COMO LIKE O DISLIKE QUE SE
PUEDAN DAR EN UNA PUBLICACIÓN
*/
/////////////////////////////////////COMMENT//////////////////////////////////

/* RUTA PARA OBTENER LOS LIKES Y DISLIKES */
app.get('/:p',(req, res, next) =>
{
	var p = req.params.p; //recibe el id de la publicacion
    Post.findById(p).exec((error,posts)=>
	{
		if(error)
		{
			json.message = error;
			json.status = 500;
			json.data = null;
			json.ok = false;
			return res.status(500).json(json);
        }

        // //////////////// // // // // //////////////console.logog(posts);

		if (!posts.reactions)
		{
			json.message = '0 Personas han reaccionado';
			json.data = null;
            return res.status(200).json(json);
        }




		json.message = posts.reactions.length + ' Personas han reaccionado';
        json.data = posts.reactions;
		json.status = 200;
		json.ok = true;
        return res.status(200).json(json);
	});

});

/////////////////////////////////////COMMENT//////////////////////////////////
/*
RUTA POST PARA DAR UNA REACCION DEPENDIENDO DE LA REACCION QUE MANDE, SEA LIKE
DISLIKE O NULL; SIENDO ESTE ULTIMO PARA DESACTIVAR CUALQUIERA DE LAS REACCIONES
DADAS ANTERIORMENTE Y DEBE ESTAR LOGEADA PARA REACCIONAR A DICHA PUBLICACION
*/
/////////////////////////////////////COMMENT//////////////////////////////////

var likes =
{
	reaction:null, //like o dislike
	idUser : null //id de quien dio la reaccion
}

app.post('/:p',
// mdAutentication.verificaToken,
mdAutentication.cualquiera,
(req,res,next)=>
{

	// ////////////// // // // // //////////////console.logog(req);
	// return res.end();
	/////////////////////////////////////////////////////////////////
	likes.idUser = req.usuario._id; // id de quien le dio like/dislike
	likes.reaction = req.body.r; // la reaccion
	//////////////// // // // // //////////////console.logog(likes.reaction);
	///////////////////////////////////////////////////////////////////
	// //////////////// // // // // //////////////console.logog(likes);

	// ////////////// // // // // //////////////console.logog('recibe', likes.idUser);
//
	// return res.end();
	// // // // // //////////////console.logog('like/dislike');

	Post.findById({_id:req.params.p}, (error,post)=>
	{
		if (error)
		{
			//if error exists, return the error with status 500
			json.message = 'Error al reaccionar la publicación';
			json.data = null;
			json.status = 500;
			json.ok = false;
			return res.status(500).json(json);
		}
		if (!post)
		{
			//if user not exists, return the error with status 400 bad request
			json.message = 'No se pudo reaccionar la publicación';
			json.data = null;
			json.status = 400;
			json.ok = false;
			return res.status(400).json(json);
		}
///////////////////////////////////////////////////////////////////////////////////////////////////
		//si la reaccion llega null, este borra la reaccion sino la agrega
		if(likes.reaction) //LIKES DE LA PUBLICACION
		{

			if(!post.reactions.length){ post.reactions.push(likes); json.message = 'Has reaccionado!';}
			else
			{
				var aux = post.reactions; var aux1= null;
				//saco el like que ya di
				aux1 = aux.filter(function(item) { return item.idUser == likes.idUser; });
				//saco todos los demas like
				aux = aux.filter(function(item) { return item.idUser != likes.idUser; });
				//sobreescribo el like que di
				aux1 = likes;
				//reencolo los demas likes sin el like modificado
				post.reactions = aux;
				//luego vuelvo asignar el like modificado
				post.reactions.push(aux1);
				json.message = 'Has reaccionado!';

			}
		}else
		{
			var aux = post.reactions;
			aux = aux.filter(function(item) { return item.idUser != likes.idUser; });
			post.reactions = aux;
			json.message = 'Has quitado tu reacción!';
		}

		// //////////////// // // // // //////////////console.logog(post);
/////////////////////////////////////////////////////////////////////////////////////////////////////
		post.save((err, postSaved)=>
        {
			var countLike = postSaved.reactions.filter(function(item) { return item.reaction == 'like'; });
			var countDlike = postSaved.reactions.filter(function(item) { return item.reaction == 'dislike'; });

			if (err)
            {
            	//if exists problem for update user, return sttus 400
                json.message = 'Error al reaccionar a la publicación!' + err;
                json.data = null;
                json.status = 400;
                json.ok = null;
                return res.status(400).json(json);
            }
			//en el json de respuesta retorno en el mensaje los datos mas relevante y rapidos
			json.data =
			{
				nroLikes: countLike.length,
				nroDislikes: countDlike.length,
			};
    		json.status = 200;
    		json.ok = true;
            return res.status(200).json(json);
        });
	});
});


module.exports = app;

