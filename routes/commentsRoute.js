//ME JALO LAS LIBRERIAS NECESARIAS
var express = require('express');
var Post = require('../models/postScheme');
var moment = require('moment');

var mdAutentication = require('../middleware/autenticacion');
var app = express();

var dateMoment = moment().locale('es');

/////////////////////////////////////COMMENT//////////////////////////////////
/*
RUTAS PARA EL CRUD DE COMENTARIO DE LA PUBLICACION, ESTA RUTA MENTENDRÁ SIEMPRE
COMO REQUISITO EL ID DE LA PUBLICACION MAS EL CODIGO DEL USUARIO LOGEADO
*/
/////////////////////////////////////COMMENT//////////////////////////////////

//json maestro que contendrá las respuestas de las peticiones
var json =
{
	message: 'OK, Im post route',
	status: 200,
	ok: true,
	data: 'OK, Im post route'
};

var comment =
{
	idUser: null,//codigo del usuario que comento
	userName: null,//nombre del user que comento
	text: null,//comentario
	index: null,//indice del omentario
	created_at: null,//fecha de creacion
	reactions: new Array()
	// userData: null
}




var likes =
{
	reaction: null, //like o dislike
	idUser: null //id de quien dio la reaccion
}


// var a = new Array()

app.post('/reactions/:id/:p',
// mdAutentication.verificaToken,
mdAutentication.cualquiera,
(req, res, next) => {
	/////////////////////////////////////////////////////////////////
	likes.idUser = req.usuario._id; // id de quien le dio like/dislike
	likes.reaction = req.body.r; // la reaccion

	let index = req.params.p;
	let id = req.params.id;



	//////////////// // // // // ////////////////console.logog('el index', index);
	// //////////////// // // // // ////////////////console.logog(likes);
	// //////////////// // // // // ////////////////console.logog(id);

	// return res.end();

	Post.findById(id
		// "_comments._id": index,
		// "comments.index": index,
	)
		.exec((error, post) => {
			if (error) {
				//if error exists, return the error with status 500
				json.message = 'Error al reaccionar al comentario';
				json.data = null;
				json.status = 500;
				json.ok = false;
				return res.status(500).json(json);
			}
			// //////////////// // // // // ////////////////console.logog('EL POST', post);
			// post = post[0];
			if (!post) {
				//if user not exists, return the error with status 400 bad request
				json.message = 'No se pudo reaccionar al comentario';
				json.data = null;
				json.status = 400;
				json.ok = false;
				return res.status(400).json(json);
			}
			///////////////////////////////////////////////////////////////////////////////////////////////////
			// //////////////// // // // // ////////////////console.logog(post._id);
			// return res.end();
			var ix = null;
			post._comments.forEach((element, i) => {

				//////////////// // // // // ////////////////console.logog('EL MALDITO INDICE', String(element));
				if (String(element._id) === String(index)) {
					//////////////// // // // // ////////////////console.logog('iguales', i);
					ix = i;
				}

			});

			//////////////// // // // // ////////////////console.logog('indice', ix);
			// ix = (ix >= 0)? ix: null;

			// return res.end();

			if (ix == null) {
				//if user not exists, return the error with status 400 bad request
				json.message = 'No se pudo reaccionar al comentario';
				json.data = null;
				json.status = 400;
				json.ok = false;
				return res.status(400).json(json);
			}

			//si la reaccion llega null, este borra la reaccion sino la agrega
			// var auxiliar = new Array();
			if (likes.reaction) //LIKES DE LA PUBLICACION
			{
				// //////////////// // // // // ////////////////console.logog(post);
				// return res.end();
				if (!post._comments[ix].reactions.length) {
					// post._comments[ix].reactions.push(JSON.stringify(likes));
					post._comments[ix].reactions.push(likes);
					// post._comments[ix].text = 'COÑO';
					json.message = 'Has reaccionado!';
					//////////////// // // // // ////////////////console.logog('etapa 1', post._comments[ix]);
					// auxiliar = post._comments[ix];
				}
				else {
					var aux = post._comments[ix].reactions;
					var aux1 = null;
					//saco el like que ya di
					aux1 = aux.filter(function (item) { return item.idUser == likes.idUser; });
					//saco todos los demas like
					aux = aux.filter(function (item) { return item.idUser != likes.idUser; });
					//sobreescribo el like que di
					aux1 = likes;
					//reencolo los demas likes sin el like modificado
					post._comments[ix].reactions = aux;
					//luego vuelvo asignar el like modificado
					post._comments[ix].reactions.push(aux1);
					json.message = 'Has reaccionado!';

					//////////////// // // // // ////////////////console.logog('etapa 2', post._comments[ix]);
					// auxiliar = post._comments[ix];
				}
			} else {
				var aux = post._comments[ix].reactions;
				aux = aux.filter(function (item) { return item.idUser != likes.idUser; });
				post._comments[ix].reactions = aux;
				json.message = 'Has quitado tu reacción!';
				//////////////// // // // // ////////////////console.logog('etapa 3', post._comments[ix]);
				auxiliar = post._comments[ix];
			}

			// //////////////// // // // // ////////////////console.logog(post._comments[ix]);
			// return res.end();
			// //////////////// // // // // ////////////////console.logog(likes);

			// post.title = 'MALDITA SEA8';
			// post._comments[ix] = auxiliar;

			/////////////////////////////////////////////////////////////////////////////////////////////////////
			post.save((err, postSaved) => {
				var countLike = postSaved._comments[ix].reactions.filter(function (item) { return item.reaction == 'like'; });
				var countDlike = postSaved._comments[ix].reactions.filter(function (item) { return item.reaction == 'dislike'; });

				if (err) {
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
				// //////////////// // // // // ////////////////console.logog('QUE COÑO GUARDA', postSaved.comments[ix]);
				json.status = 200;
				json.ok = true;
				return res.status(200).json(json);
			});
		});
});

/////////////////////////////////////COMMENT//////////////////////////////////
/*
RUTA PARA RETORNAR COMENTARIO DE LA PUBLICACION EN BASE AL ID DE LA PUBLICACION
*/
/////////////////////////////////////COMMENT//////////////////////////////////
app.get('/:p', (req, res, next) => {
	var p = req.params.p; //recibe el id de la publicacion

	// return res.end();
	Post.findById({ _id: p })
		// .populate('user', 'role imgProfile _dataPyme')
		.exec((error, post) => {
			if (error) {
				//if error exists, return the error with status 500
				json.message = 'Error al buscar la publicación';
				json.data = null;
				json.status = 500;
				json.ok = false;

				return res.status(500).json(json);
			}

			if (!post) {
				//if user not exists, return the error with status 400 bad request
				json.message = 'No se encontró la publicación';
				json.data = null;
				json.status = 400;
				json.ok = false;

				return res.status(400).json(json);
			}

			// var l = {
			// comments: post.comments,
			// user: post.user
			// }

			// //////////////// // // // // ////////////////console.logog(post._comments);
			// return res.end();
			// return

			json.message = post._comments.length + ' Comentarios';
			json.data = post._comments;
			//////////////// // // // // ////////////////console.logog(json.data);
			json.status = 200;
			json.ok = true;

			return res.status(200).json(json);
		});
});

/////////////////////////////////////COMMENT//////////////////////////////////
/*
RUTA PARA AGREGAR COMENTARIO A LA PUBLICACION EN BASE A SU ID
*/
/////////////////////////////////////COMMENT//////////////////////////////////

app.post('/:p',
// mdAutentication.verificaToken,
mdAutentication.cualquiera,
(req, res, next) => {
	var u = req.usuario._id; //recibe el id del usuario
	var p = req.params.p; //recibe el id de la publicacion
	var body = req.body; // recibe el cuerpo del comentario


	var com = {
		idUser: u,
		userName: body.userName,
		text: body.text,
		index: null,
		created_at: dateMoment.format('LL')


	}


	Post.findById({ _id: p, user: u })
		// .populate('user', 'role imgProfile _dataPyme')
		.exec((error, post) => {
			if (error) {
				//if error exists, return the error with status 500
				json.message = 'Error al buscar la publicación';
				json.data = null;
				json.status = 500;
				json.ok = false;

				return res.status(500).json(json);
			}

			if (!post) {
				//if user not exists, return the error with status 400 bad request
				json.message = 'No se encontró la publicación';
				json.data = null;
				json.status = 400;
				json.ok = false;

				return res.status(400).json(json);
			}
			// comment.userData = post.user;
			post._comments.push(com);

			post.save((err, postSaved) => {
				if (err) {
					//if exists problem for update user, return sttus 400

					json.message = '¡Error al agregar el comentario!';
					json.data = null;
					json.status = 400;
					json.ok = null;

					return res.status(400).json(json);
				}

				json.message = '¡Comentario Agregado!';
				json.data = postSaved;
				json.status = 200;
				json.ok = true;

				return res.status(200).json(json);
			});

		});
});

/////////////////////////////////////COMMENT//////////////////////////////////
/*
RUTA DONDE MODIFIQUE EL COMENTARIO EN BASE AL ID DE LA PUBLICACION Y AL ID
DEL USUARIO Y AL INDICE DEL COMENTARIO
*/
/////////////////////////////////////COMMENT//////////////////////////////////
app.put('/:p/:i',
	[mdAutentication.verificaToken, mdAutentication.verificaAdminRoleoMismoUser]
	, (req, res, next) => {
		var u = req.usuario._id; //recibe el id del usuario
		var p = req.params.p; //recibe el id de la publicacion
		var i = req.params.i; //recibe el index del comentario, es decir el nodo del array
		var body = req.body; // recibe el cuerpo del comentario

		comment.idUser = u; //id de usuario sacado del token
		comment.userName = req.usuario.name; // nombre del usuario que comento
		comment.text = body.text; //cuerpo del comentario
		comment.created_at = dateMoment.format('LL');

		Post.findById({ _id: p }, (error, post) => {
			if (error) {
				//if error exists, return the error with status 500
				json.message = 'Error al buscar la publicación';
				json.data = null;
				json.status = 500;
				json.ok = false;

				return res.status(500).json(json);
			}

			if (!post) {
				//if user not exists, return the error with status 400 bad request
				json.message = 'No se encontró la publicación';
				json.data = null;
				json.status = 400;
				json.ok = false;

				return res.status(400).json(json);
			}

			post.comments[i] = comment;

			post.save((err, postSaved) => {
				if (err) {
					//if exists problem for update user, return sttus 400

					json.message = '¡Error al modificar el comentario!';
					json.data = null;
					json.status = 400;
					json.ok = null;

					return res.status(400).json(json);
				}

				json.message = '¡Comentario modificado!';
				json.data = postSaved;
				json.status = 200;
				json.ok = true;

				return res.status(200).json(json);
			});

		});

	});

/////////////////////////////////////COMMENT//////////////////////////////////
/*
RUTA QUE BORRA COMENTARIOS EN BASE AL ID DEL POST, INDICE DEL COMENTARIO Y EL
ID DEL USUARIO
*/
/////////////////////////////////////COMMENT//////////////////////////////////
app.delete('/:p/:i'
	, [mdAutentication.verificaToken]
	, (req, res, next) => {
		var u = req.usuario._id; //recibe el id del usuario
		var p = req.params.p; //recibe el id de la publicacion
		var i = req.params.i; //recibe el index del comentario, es decir el nodo del array

		// //////////////// // // // // ////////////////console.logog('llega delete');
		Post.findById({ _id: p }, (error, post) => {
			if (error) {
				//if error exists, return the error with status 500
				json.message = 'Error al buscar la publicación';
				json.data = null;
				json.status = 500;
				json.ok = false;

				return res.status(500).json(json);
			}

			if (!post) {
				//if user not exists, return the error with status 400 bad request
				json.message = 'No se encontró la publicación';
				json.data = null;
				json.status = 400;
				json.ok = false;

				return res.status(400).json(json);
			}

			post._comments = post._comments.filter((item) => { return String(item._id) != String(i); });

			post.save((err, postSaved) => {
				if (err) {
					//if exists problem for update user, return sttus 400

					json.message = '¡Error al eliminar el comentario!';
					json.data = null;
					json.status = 400;
					json.ok = null;

					return res.status(400).json(json);
				}

				json.message = '¡Comentario eliminado!';
				json.data = postSaved;
				json.status = 200;
				json.ok = true;

				return res.status(200).json(json);
			});

		});

	});



module.exports = app;