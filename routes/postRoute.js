var express = require('express');
var Post = require('../models/postScheme');
var Boost = require('../models/pwrScheme');


var mdAutentication = require('../middleware/autenticacion');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var moment = require('moment');
var dateMoment = moment();
moment.locale('es');

//inicializamos express
var app = express();

// default options
app.use(fileUpload());

// morgan.token('id', function getId (req) {
//   return req.id
// })

// app.use(assignId)
// // app.use(morgan(':id :method :url  :response-time'))
// app.use(morgan(':id :method :url :status :response-time ms - :res[content-length]', {stream: fs.createWriteStream('./access.log', {flags: 'a'})});



// function assignId (req, res, next) {
//   req.id = uuid.v4()
//   next()
// }

// app.use(morgan('common', {stream: fs.createWriteStream('./access.log', {flags: 'a'})}))
// app.use(morgan('dev'))

//json maestro que contendrá las respuestas de las peticiones
var json =
{
	message: 'OK, Im post route',
	status: 200,
	ok: true,
	data: 'OK, Im post route'
};


var _categoryX = [];
function upChild(element, child) {

	// // //// // // //////////////console.logog('categoria a correr', _categoryX);
	// // //// // // //////////////console.logog('elemento a comparar', element)

	if (_categoryX.length > 0) {

		_categoryX.forEach((e, i) => {

			// // //// // // //////////////console.logog('e', e.name);
			// // //// // // //////////////console.logog('i', i);
			if (String(e.name) === String(element)) {

				// // //// // // //////////////console.logog('sn iguales', i);
				// return i;

				_categoryX[i].childs.push(child);

			}

		});

		// return -1;
	}


}


function countCategorys(post) {


	// //////////console.log('lo que se recibe acá', post[0]._category);

	let _child = [];
	let c = 0;
	let aux = null;
	let padre = null;
	var childe = null;
	while (c < post.length) {
		// ////////console.log(post[c]._category);
		post[c]._category.forEach((element, index) => {

			if (element._principal != null) {


				aux = element._principal._category;
				padre = aux;
				//// // // //////////////console.logog('1 principal', element._principal);
				if (!_categoryX.find(el => el.name === aux)) {
					var a =
					{
						_id: element._principal._id,
						name: aux,
						count: (post.filter(el => { return el._category._principal_category === aux })).length,
						childs: []
					}

					_categoryX.push(a);
				}

				aux = element.child;
				// var aa = null;
				if (!_child.find(el => el.name === aux)) {
					var a =
					{
						// principal: padre,
						name: aux,
						_id: element._child,
						count: (post.filter(el => { return el._category.child === aux })).length
					}

					_child.push(a);
					upChild(padre, a);
					// childe = a;

				}



				c++;



			}
		});
	}
	var _category = _categoryX;
	_categoryX = [];
	//// // // //////////////console.logog(_category);
	return { _category };

}



//RUTA GET DE TODOS LOS POST
app.get('/categoryCount/:status', (req, res, next) => {

	var status = (req.params.status == 'true') ? true : false;
	Post.find({
		'status': status
	}, {
		"_category": 1
	})
		// .populate('user', '_id name surname role')
		.populate({
			path: '_category._principal',
			select: '_category _child'
		}
		)

		.exec((error, response) => {
			if (error) {
				json.message = error;
				json.status = 500;
				json.data = null;
				json.ok = false;
				return res.status(500).json(json);
			}

			var cats = [];

			var inn = {
				principal: null,
				nro: 1,
				childs: []
			}

			// //// // // //////////////console.logog('la respuesta inicial', response);
			////////console.log('los posts', response);

			var prueba = countCategorys(response);
			//
			// // // // //////////////console.logog('las categorias', prueba);
			// // // //////////////console.logog('antes',prueba);



			prueba._category.sort(function (a, b) {
				var textA = a.name.toUpperCase();
				var textB = b.name.toUpperCase();
				return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
			})

			// // // //////////////console.logog('luego',prueba);


			json.message = 'Estatus de categorias';
			json.data = prueba;

			json.status = 200;
			json.ok = true;
			return res.status(200).json(json);
		});

});



// "_category": {
// 	"_id": "5edd7ba78bbb8612fcb60966",
// 	"principal": "Supermercados",
// 	"child": "Minimercados",
// 	"_principal": null
//RUTA GET DE TODOS LOS POST
app.get('/', (req, res, next) => {
	Post.find({})
		.populate('user', '_id name surname role')
		.populate({
			path: '_category._principal',
			select: '_category _child'
		}
		)
		.exec((error, response) => {
			if (error) {
				json.message = error;
				json.status = 500;
				json.data = null;
				json.ok = false;
				return res.status(500).json(json);
			}

			json.message = response.length + ' Publicaciones encontrados!';
			json.data = response;


			// //// // // //////////////console.logog(response);
			// //// // // //////////////console.logog(response);

			if (response.length == 0) {
				json.message = 'Publicaciones no encontrados';
				json.data = null;
			}

			json.status = 200;
			json.ok = true;
			return res.status(200).json(json);
		});

});



//RUTA GET DE TODOS LOS POST hechos por un usario logeado
app.get('/stats/:id', (req, res, next) => {
	var id = req.params.id;



	//////////// // //// // // //////////////console.logog('llegaaa', id);

	Post.find({ user: id })
		.populate('user', '_id view')
		.exec((error, response) => {
			if (error) {
				json.message = error;
				json.status = 500;
				json.data = null;
				json.ok = false;
				return res.status(500).json(json);
			}
			// response = response[0];
			json.message = 'Publicaciones totales encontradas ' + response.length;
			// json.data = response;

			//////////////// // //// // // //////////////console.logog(response.length);
			// return;
			var like = 0;
			var comentarios = 0;
			var visits = 0;
			if ((response) && response.length > 0) {

				response.forEach(element => {
					// contar likes
					if ((element.reactions) && element.reactions.length > 0) {

						element.reactions.forEach(reaction => {
							if (reaction.reaction == 'like') {
								like++;
							}
						});

					}
					if ((element.comments) && element.comments.length > 0) {

						element.comments.forEach(reaction => {

							comentarios++;

						});

					}
					if ((element.view) && element.view >= 0) {


						visits = visits + element.view;



					}
					if ((element.user.view) && element.user.view >= 0) {

						// element.view.forEach(vist => {

						visits = visits + element.user.view;

						// });

					}
				});

			}

			var l = {
				publicaciones: response.length,
				likes: like,
				comment: comentarios,
				visits: visits
			}

			//////////// // //// // // //////////////console.logog(l);

			json.data = l;

			// if (response.length == 0)
			// {
			// 	json.message = 'Publicaciones no encontrados';
			// 	json.data = null;
			// }

			json.status = 200;
			json.ok = true;
			return res.status(200).json(json);
		});

});


app.post('/sameCategory/:category', (req, res, next) => {
	var body = req.body;

	var desde = body.desde || 0;
	desde = Number(desde);
	var limite = body.limite || -1;
	limite = Number(limite);

	var not = body.not || '-';

	// ////////////// // //// // // //////////////console.logog(not);
	var category = req.params.category; //recibe el id de la publicacion


	Post.find({
		$and: [
			{ 'status': true },
			{ "_id": { "$ne": not } },

			{ '_category._principal': category }, //recibe un array de datos
			// {"user": id},
			// {"user": 'x'},
		]
	})
		.skip(desde)
		.limit(limite)
		.populate({
			path: '_category._principal',
			select: '_category _child'
		})
		.exec((error, response) => {
			if (error) {
				json.message = error;
				json.status = 500;
				json.data = null;
				json.ok = false;
				return res.status(500).json(json);
			}

			json.message = 'Publicaciones totales encontrados! ' + response.lenght;
			json.data = response;

			if (response.length == 0) {
				json.message = 'Publicaciones no encontrados';
				json.data = null;
			}

			json.status = 200;
			json.ok = true;
			return res.status(200).json(json);
		});

});


//RUTA GET DE TODOS LOS POST hechos por un usario logeado
app.post('/publicacionesUser/:id', (req, res, next) => {
	var body = req.body;

	var desde = body.desde || 0;
	desde = Number(desde);
	var limite = body.limite || -1;
	limite = Number(limite);

	var not = body.not || '-';

	// ////////////// // //// // // //////////////console.logog(not);
	var id = req.params.id; //recibe el id de la publicacion


	Post.find({
		$and: [
			{ "status": true },
			// {"_id": { "$ne": not }},
			{ "user": id },
			// {"user": 'x'},
		]
	})
		.skip(desde)
		.limit(limite)
		.populate({
			path: '_category._principal',
			select: '_category _child'
		})
		.exec((error, response) => {
			if (error) {
				json.message = error;
				json.status = 500;
				json.data = null;
				json.ok = false;
				return res.status(500).json(json);
			}

			json.message = 'Publicaciones totales encontrados! ' + response.lenght;
			json.data = response;

			if (response.length == 0) {
				json.message = 'Publicaciones no encontrados';
				json.data = null;
			}

			json.status = 200;
			json.ok = true;
			return res.status(200).json(json);
		});

});

//RUTA GET DE POST PARTICULAR
app.get('/publicacion/:id', [mdAutentication.cualquiera], (req, res, next) => {
	var p = req.params.id; //recibe el id de la publicacion


	Post.findById(p)
		.populate('user', 'name surname email role _dataPyme positionCompany')
		.populate({
			path: '_category._principal',
			select: '_category _child'
		}
		)
		.exec((error, post) => {

			////////// // //// // // //////////////console.logog('post', post);
			if (!post) {
				json.message = 'No existe esta publicación';
				json.status = 400;
				json.ok = false;
				json.data = null;
				return res.status(400).json(json);
			}

			if (req.usuario.role) {

			}

			if ((!req.usuario) || req.usuario.role != 'ADMIN_ROLE') {
				//////// // //// // // //////////////console.logog('entra');
				if (post.status == false) {
					json.message = 'Esta publicación aun no ha sido aprobada';
					json.status = 404;
					json.ok = false;
					json.data = null;
					return res.status(404).json(json);
				}

			}



			// ////////// // //// // // //////////////console.logog('post', post);
			if (error && error != null) {
				json.message = error;
				json.status = 500;
				json.data = null;
				json.ok = false;
				return res.status(500).json(json);
			}



			json.message = 'Publicación encontrada';
			json.data = post;

			if (post.length == 0) {
				json.message = 'Publicación no encontrada';
				json.data = null;
			}

			json.status = 200;
			json.ok = true;
			return res.status(200).json(json);
		});

});

app.put('/view/', (req, res, next) => {
	var id = req.body.id; //recibe el id de la publicacion

	//////////////// // //// // // //////////////console.logog('llega', id);
	Post.findById(id)
		// .populate('user', 'name surname email role _dataPyme positionCompany')
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

			post.view = post.view + 1;

			// //////////////// // //// // // //////////////console.logog('la visita', post.view);
			post.save((err, postSaved) => {
				if (err) {
					//if exists problem for update user, return sttus 400

					json.message = 'Error al añadir la visita';
					json.data = null;
					json.status = 400;
					json.ok = null;

					return res.status(400).json(json);
				}

				json.message = 'Visita añadida';
				json.data = postSaved;
				json.status = 200;
				json.ok = true;

				return res.status(200).json(json);
			});
		});


});


app.post('/createOrder', mdAutentication.verificaToken, (req, res, next) => {

	var idUser = req.usuario._id;
	var body = req.body;
	// archivos 'filesPost[]' 'filesPlan[]':
	var archivo = req.files;
	var filesPost = archivo['filesPost[]'];
	var filesPlan = archivo['filesPlan[]'];

	var typeRequest = JSON.parse(body.typeRequest);
	var dataPost = JSON.parse(body.dataPost);
	var planPauta = JSON.parse(body.planPauta);
 	console.log('el maldito body', body);
	console.log('los malditos files', req.files);


	// preparando el post

	// this.post = {
	// 	title: forma.value.Title,
	// 	content: this.ngIncludeDesc,
	// 	notContent: this.ngnotIncludeDesc,
	// 	type: forma.value.Type,
	// 	_infoContact: contactData,//JSON.stringify(contactData),
	// 	_category: catGroup,//JSON.stringify(catGroup),
	// 	_cityTarget: this.cityTargets,//JSON.stringify(this.cityTargets),
	// 	_socialNet: social,//JSON.stringify(social),
	// 	costoPlan: forma.value.costoPlan,
	// 	typePost: "Publicación"
	//   };

	var post = new Post
		({
			title: dataPost.title,
			content: dataPost.content,
			notContent: dataPost.notContent,
			type: dataPost.type,
			_infoContact: dataPost._infoContact,
			_category: dataPost._category,
			_cityTarget: dataPost._cityTarget,
			_socialNet: dataPost._socialNet,
			typePost: dataPost.typePost,
			payProcess: 'onProcess',
			user: idUser,

		});



		if (filesPost.length == undefined) {

			var a = filesPost;
			var m = [];
			m.push(a);
			filesPost = m;

		}
		if (filesPlan.length == undefined) {

			var a = filesPlan;
			var m = [];
			m.push(a);
			filesPlan = m;

		}

		var _filesPost = [];
		var _filesPlan = [];
		var pathsPost = [];
		var pathsPlan = [];

		// // se procesan los archivos del post ------------------------------
		// archivo = filesPost;
		// for (var i = 0; i < archivo.length; ++i) {
		// 	var nombreCortado = archivo[i].name.split('.');
		// 	var extensionArchivo = nombreCortado[nombreCortado.length - 1];
		// 	var nombreArchivo = `${post._id}-img${i}-${new Date().getMilliseconds()}.${extensionArchivo}`;
		// 	var path = `./uploads/Post/${post._id}/${nombreArchivo}`;

		// 	var l = {
		// 		type: (archivo[i].mimetype.includes("pdf") == true) ? 'PDF' : 'IMAGEN',
		// 		file: nombreArchivo,
		// 		format: extensionArchivo,
		// 		folder: post._id
		// 	}

		// 	_filesPost.push(l);
		// 	pathsPost.push(path);
		// 	nombreArchivo = '';
		// }
		// post._filesPost = _filesPost;
		// var dir = `./uploads/Post/${post._id}`;

		// if (!fs.existsSync(dir)) {
		// 	fs.mkdirSync(dir);
		// } else {

		// }

		// se procesan los archivos y estructura del plan (en caso de existir) ------------------------------


		// plan: {
		// 	planPauta: x,//JSON.stringify(x),
		// 	redesPublico: (forma.value.redesPublico != null && forma.value.redesPublico != '')? forma.value.redesPublico: 'No aplica',
		// 	generoObj: this.generoObj, //JSON.stringify(this.generoObj),
		// 	edadesObj: this.edadesObj, //JSON.stringify(this.edadesObj),
		// 	estadoCivilObj: this.estadoCivilObj, //JSON.stringify(this.estadoCivilObj),
		// 	cuentaPublico: this.ngCuentaPublico,
		// 	palabrasBuscador: (this.palabrasBuscador != null && this.palabrasBuscador != '')? this.palabrasBuscador: 'No aplica',
		// 	fechas: this.fechas, //JSON.stringify(this.fechas),
		// 	cityTargets: this.cityTargets, //JSON.stringify(this.cityTargets),
		//   },

		var totalDays = {
			inicio: planPauta.fechas,
			finalizacion: planPauta.fechas,
			totalDays: 1
		}

		var audience = {
			year: planPauta.edadesObj,
			gender: planPauta.generoObj,
			status: planPauta.estadoCivilObj,
			description: planPauta.cuentaPublico
		}

		var Boost = new Boost({

			name: planPauta.planPauta.nombre,
			redesPublico: planPauta.redesPublico,
			daysReamming: totalDays,
			_cityTarget: planPauta.cityTargets,
			price: planPauta.planPauta.costo,
			audience: audience,
			palabrasBuscador: planPauta.palabrasBuscador

		})


		// archivo = _filesPlan;
		// for (var i = 0; i < archivo.length; ++i) {
		// 	var nombreCortado = archivo[i].name.split('.');
		// 	var extensionArchivo = nombreCortado[nombreCortado.length - 1];
		// 	var nombreArchivo = `${post._id}-img${i}-${new Date().getMilliseconds()}.${extensionArchivo}`;
		// 	var path = `./uploads/Post/${post._id}/${nombreArchivo}`;

		// 	var l = {
		// 		type: (archivo[i].mimetype.includes("pdf") == true) ? 'PDF' : 'IMAGEN',
		// 		file: nombreArchivo,
		// 		format: extensionArchivo,
		// 		folder: post._id
		// 	}

		// 	_files.push(l);
		// 	pathsPlan.push(path);
		// 	nombreArchivo = '';
		// }
		// // post._files = _files;
		// var dir = `./uploads/Post/${post._id}`;

		// if (!fs.existsSync(dir)) {
		// 	fs.mkdirSync(dir);
		// } else {

		// }

	console.log('modelo post', post);
	console.log('modelo boost', Boost);

	return res.end();

});

/*
/*
	Ruta de creacion de publicaciones recibirá el id del usuario y el middelware tiene que certificar
	que este mismo usuario este logeado
*/
app.post('/', mdAutentication.verificaToken, (req, res, next) => {
	var body = req.body;


	var idUser = req.usuario._id;
	var _category = [];
	var _rangoPrize = [];
	var _cityTarget = [];
	var _socialNet = [];
	var _mapUrl = [];
	var _target = [];
	var _infoContact = [];

	var category = JSON.parse(body._category);
	// var rangoPrize = JSON.parse(body._rangoPrize);
	var cityTarget = JSON.parse(body._cityTarget);
	var socialNet = JSON.parse(body._socialNet);
	var infoContact = JSON.parse(body._infoContact);
	// var target = JSON.parse(body._target);


	// //////////////// // //// // // //////////////console.logog(body.target);
	var tgt = body.target.split("#");
	// //////////////// // //// // // //////////////console.logog(tgt);
	var tg = [];
	for (var i = 0, length1 = tgt.length; i < length1; i++) {
		var element = tgt[i];
		var l = {
			tag: element
		}
		if (element != '') {

			tg.push(l);
		}

	}

	var post = new Post
		({
			title: body.title,
			// target: body.target,
			content: body.content,
			notContent: body.notContent,
			// department: body.department,
			// city: body.city,
			type: body.type,
			_infoContact: infoContact,
			_category: category,
			// _rangoPrize: rangoPrize,
			_cityTarget: cityTarget,
			_socialNet: socialNet,
			// _files: _files,
			// _target: tg,
			user: idUser,
			typePost: body.typePost

		});

	var archivo = req.files;


	if (archivo['files[]'].length == undefined) {

		var a = archivo['files[]'];
		var m = [];
		m.push(a);
		archivo = m;

	} else {
		archivo = archivo['files[]'];
	}


	var _files = [];
	var paths = [];
	for (var i = 0; i < archivo.length; ++i) {
		// //////////////// // //// // // //////////////console.logog(archivo[i]);
		var nombreCortado = archivo[i].name.split('.');
		var extensionArchivo = nombreCortado[nombreCortado.length - 1];
		var nombreArchivo = `${post._id}-img${i}-${new Date().getMilliseconds()}.${extensionArchivo}`;
		var path = `./uploads/Post/${post._id}/${nombreArchivo}`;
		// //////////////// // //// // // //////////////console.logog(nombreArchivo);

		var l = {
			type: (archivo[i].mimetype.includes("pdf") == true) ? 'PDF' : 'IMAGEN',
			file: nombreArchivo,
			format: extensionArchivo,
			folder: post._id
		}

		_files.push(l);
		paths.push(path);
		nombreArchivo = '';
	}

	// folder
	post._files = _files;
	var dir = `./uploads/Post/${post._id}`;

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	} else {

	}

	console.log('el conjunto hecho', post);
	// return res.end();
	post.save((error, postSaved) => {
		if (error) {
			json.message = error;
			json.data = null;
			json.status = 400;
			json.ok = false;

			console.log('el maldito error', error);



			return res.status(400).json(json);
		}

		for (var i = 0, length1 = paths.length; i < length1; i++) {

			var path = paths[i];
			archivo[i].mv(path, err => {

				if (err) {

					return res.status(500).json({
						ok: false,
						mensaje: 'Error al mover archivo',
						errors: err
					});
				}

			});
		}

		json.message = '¡Publicación agregada, pronto estará disponible al público!';
		json.data = postSaved;
		json.status = 201;
		json.ok = true;
		return res.status(201).json(json);

	});

});


app.put('/categoryChange/:idPost/:type', [mdAutentication.verificaToken, mdAutentication.verificaAdminRoleoMismoUser], (req, res, next) => {
	var body = req.body;
	var u = req.usuario._id; //recibe el id del usuario
	var idPost = req.params.idPost; //recibe el id de la publicacion
	var type = req.params.type; //recibe el id de la publicacion


	var nro = body.nro;

	Post.findById(idPost)
		.populate('user', '_id name surname role')
		.populate({
			path: '_category._principal',
			select: '_category _child'
		})
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

			// //////////console.log('el post', post);
			// //////////console.log('cant', post._category.length);
			// actualizar schema en cats
			if ((post._category) && post._category.length >= 1 && post._category.length < 3) {

				var l = {
					_principal: null,
					_child: null,
					child: null
				};

				post._category.push(l);


			}


			if (type == 'principal') {

				post._category[nro]._principal = body._category;
				post._category[nro].principal = null;

				// //////////console.log('el post luego push', post._category);
				// return res.end();

			} else if (type == 'child') {
				//// // // //////////////console.logog('fue child');
				// return res.end();
				post._category[nro]._child = body._category;

				//////////console.log('bodycategory', body._category);


				if ((body._category)) {

					//// // // //////////////console.logog('entra acá');
					var id = body._category;
					//// // // //////////////console.logog('el id', id);
					// //// // // //////////////console.logog('el id a comparar', id);
					//// // // //////////////console.logog('_child', post._category[nro]._principal._child);
					post._category[nro]._principal._child.forEach((e, i) => {
						//// // // //////////////console.logog('ciclo', i);
						if (String(e._id) == String(id)) {

							post._category[nro].child = null;
							post._category[nro].child = e.name;

						}

					});


				}


				//////////console.log('con child', post._category);


			}


			// //////////console.log('antes de up', post);
			// return res.end();
			post.save((err, postSaved) => {



				if (err) {
					//if exists problem for update user, return sttus 400

					json.message = 'Error al modificar la categoria!';
					json.data = null;
					json.status = 400;
					json.ok = null;

					return res.status(400).json(json);
				}

				json.message = 'Categoria de publicación modificada';
				json.data = postSaved;
				json.status = 200;
				json.ok = true;

				return res.status(200).json(json);
			});
		});
});


app.put('/:p', [mdAutentication.verificaToken, mdAutentication.verificaAdminRoleoMismoUser], (req, res, next) => {
	var body = req.body;
	var u = req.usuario._id; //recibe el id del usuario
	var p = req.params.p; //recibe el id de la publicacion


var archivo = req.files || null;


var cityTarget = JSON.parse(body._cityTarget);
var socialNet = JSON.parse(body._socialNet);
var infoContact = JSON.parse(body._infoContact);
var _files  = (JSON.parse(body.newOrden) != null && JSON.parse(body.newOrden) != '')? JSON.parse(body.newOrden): [];
var canChangeFiles = body.canChangeFiles;


if ( (archivo != null) && archivo['files[]'].length == undefined) {
	// //////////////// // //// // // //////////////console.logog('indefinido');
	var a = archivo['files[]'];
	var m = [];
	m.push(a);
	archivo = m;
	// //////////////// // //// // // //////////////console.logog(archivo.length);
} else {
	if(archivo != null){

		archivo = archivo['files[]'];
	}
}

if((_files) && (_files.length > 0) && (_files[0].type == 'IMAGEN') ){

	_files.forEach((ele, idx) => {

		if(ele.delete == true){


			if (fs.existsSync(`./uploads/Post/${p}/${ele.file}`)) {
				// return
				fs.unlink(`./uploads/Post/${p}/${ele.file}`, (err) => {
					if (err) throw err;
					// //////////////// // // // // //////////////console.logog( pathViejo, 'was deleted');
				});
			}

		}

	});

	var f = _files.filter( f => {

        return (!f.delete || f.delete != true);

	});

	_files = f;


}

if( (canChangeFiles) && canChangeFiles == true ){

	array.forEach( (element, idx) => {

		if((element.delete) && element.delete == true){

			fs.unlink(`./uploads/Post/${p}/${element.file}`,(err) => {
				if(err) throw err;
				// ////////console.log('myText.txt was deleted');
			});

		}
	});
}

if( (archivo) && (archivo != null) && archivo.length > 0){

	var paths = [];
	for (var i = 0; i < archivo.length; ++i) {
	// //////////////// // //// // // //////////////console.logog(archivo[i]);
	var nombreCortado = archivo[i].name.split('.');
	var extensionArchivo = nombreCortado[nombreCortado.length - 1];
	var nombreArchivo = `${p}-img${i}-${new Date().getMilliseconds()}.${extensionArchivo}`;
	var path = `./uploads/Post/${p}/${nombreArchivo}`;
	// //////////////// // //// // // //////////////console.logog(nombreArchivo);

	var l = {
		type: (archivo[i].mimetype.includes("pdf") == true) ? 'PDF' : 'IMAGEN',
		file: nombreArchivo,
		format: extensionArchivo,
		folder: p
	}

	if( (canChangeFiles) && canChangeFiles == true ){

		if(_files.length > 0 && _files[0].type != l.type){
			// si esto es distinto entonces es un cambio de pdf a imagen ... o imagen a pdf
			// fs.unlinkSync(`./uploads/Post/${p}`);
		}

	}

	_files.push(l);
	paths.push(path);
	nombreArchivo = '';

}

// folder
// post._files = _files;
var dir = `./uploads/Post/${p}`;

if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir);
} else {

}

}
	// return res.end();

	Post.findById({
		 _id: p, user: u
		})
		.exec((error,post)=>
		{

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




		post.content = body.content;
		post.notContent = body.notContent;
		post._infoContact = infoContact;
		post._cityTarget = cityTarget;
		post._socialNet = socialNet;
		post.updated_at = dateMoment.format('LL');
		post._files = _files;
		// `${folder}-thumbnail.jpeg`: img;
		var t = (post.thumbnail != null)? post.thumbnail : `${post._id}-thumbnail.jpeg`;
		var thumbFile = `./uploads/Post/${post._id}/${t}`;
		//////console.log('proceso', thumbFile);
		if (fs.existsSync(thumbFile)) {
			// return
			fs.unlink(thumbFile, (err) => {
				if (err) throw err;
				//////console.log('eliminada el thumb');
			});
		}
		post.thumbnail = null;


		if((paths) && (paths.length > 0)){

			for (var i = 0, length1 = paths.length; i < length1; i++) {

				var path = paths[i];
				archivo[i].mv(path, err => {

				if (err) {

					return res.status(500).json({
						ok: false,
						mensaje: 'Error al mover archivo',
						errors: err
					});
				}

			});
		}
		}



		post.save((err, postSaved) => {
			if (err) {
				//if exists problem for update user, return sttus 400

				json.message = 'Error al modificar la publicación!';
				json.data = null;
				json.status = 400;
				json.ok = null;

				return res.status(400).json(json);
			}

			json.message = 'Publicacion modificada!';
			json.data = postSaved;
			json.status = 200;
			json.ok = true;

			return res.status(200).json(json);
		});
	});
});

/*
	Ruta encargada de borrar publicaciones basada en id de usuario y la publicacion
*/

app.delete('/:p', [mdAutentication.verificaToken, mdAutentication.verificaAdminRoleoMismoUser], (req, res, next) => {
	var u = req.usuario._id; //recibe el id del usuario
	var p = req.params.p; //recibe el id de la publicacion

	Post.findByIdAndRemove({ _id: p, user: u }, (error, postDeleted) => {
		if (error) {
			json.message = 'Error al buscar la publicación';
			json.data = null;
			json.status = 500;
			json.ok = false;

			return res.status(500).json(json);
		}

		if (!postDeleted) {
			json.message = 'No se encontró la publicación';
			json.data = null;
			json.status = 400;
			json.ok = false;

			return res.status(400).json(json);
		}

		json.message = 'Publicación eliminada!';
		json.data = postDeleted;
		json.status = 200;
		json.ok = true;

		return res.status(200).json(json);
	});
});

module.exports = app;