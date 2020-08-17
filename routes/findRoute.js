var express = require('express');

// se inicializa express
var app = express();

//importamos los modelos que necesitamos por el momento
var Post = require('../models/postScheme');
var Category = require('../models/catgScheme');
var User = require('../models/userScheme');

//json maestro que contendrá las respuestas de las peticiones
var json =
{
	message: 'OK, Im browser route',
	status: 200,
	ok: true,
	data: 'OK, Im browser route',
	paginator: null
};

const myCustomLabels = {
	totalDocs: 'itemCount',
	docs: 'itemsList',
	limit: 'perPage',
	page: 'currentPage',
	nextPage: 'next',
	prevPage: 'prev',
	totalPages: 'pageCount',
	pagingCounter: 'slNo',
	meta: 'paginator'
};


var dataPaginador = {
	page: 1,
	limit: 1,
}

app.post('/orderBy', async (req, res, next) => {
	var body = req.body;
	//////////////// //// // // // ////////////////console.logog(body);
	/**
	 * RECIBE POR URL P SI ES POR PRECIO O POR PUNTAJE Y EL TIPO SI ES DE MAYOR A MENOR O VICEVERSA
	 */
	var p = body.p; // si es precio o puntaje
	var t = body.t; //  si es menor que o mayor que
	var posts = await Post.find(); // se trae hasta a chavez en esta verga...

	if (p === 'price') {
		if (t === 'mayor') { posts.sort((a, b) => { return b._rangoPrize.max - a._rangoPrize.max }); } //mayor que

		if (t === 'menor') { posts.sort((a, b) => { return a._rangoPrize.min - b._rangoPrize.min }); } //menor que

		json.data = posts;
		// //////////////// //// // // // ////////////////console.logog(posts);
		json.message = 'Resultados organizados por precio';
		json.status = 200;
		json.ok = true;
		return res.status(200).json(json);
	}

	if (p === 'points') {
		if (t === 'mayor') { posts.sort((a, b) => { return b.points - a.points }); } //mayor que

		if (t === 'menor') { posts.sort((a, b) => { return a.points - b.points }); } //menor que

		json.data = posts;
		// //////////////// //// // // // ////////////////console.logog(posts);
		json.message = 'Resultados organizados por puntaje';
		json.status = 200;
		json.ok = true;
		return res.status(200).json(json);
	}

});

// rutas
// el get recibe 3 parametros, request. eñ response y el next
// el next cuando se ejecuta hara que se continue con otra funcion
app.post('/:id?', (req, res, next) => {
	var busqueda = req.body.title; // dato a buscar
	// var regex = new RegExp( diacriticSensitiveRegex(argumento) , 'i'); // expresion literaria
	var argumento = busqueda;

	var allBody = req.body;

	// // ////////////////console.logog('parametros', allBody);
	// // //// // // // ////////////////console.logog(argumento);

	var jsonFinder = {}; //esquema maestro del json de busqueda
	var auxDir = {}; //variable auxiliar que contendra los datos de localizacion

	/////// OPERADORES TERNARIOS PARA LLENAR EL JSON DE BUSQUEDA///////
	req.body.type ? jsonFinder.type = req.body.type : null; //tipo servicio o producto
	req.body.categoryp ? jsonFinder.categoryp = req.body.categoryp : null; //categoria padre del servicio o producto
	req.body.child ? jsonFinder.child = req.body.child : null; //categoria hija del servicio o producto
	req.body.min ? jsonFinder.min = req.body.min : null; //rango menor d eprecio
	req.body.max ? jsonFinder.max = req.body.max : null; //rango mayor de precio
	req.body.target ? jsonFinder.target = req.body.target : null; //a quien va dirigido
	req.body.cityTarget ? jsonFinder.cityTarget = req.body.cityTarget : null; //a quien va dirigido

	req.body.idPadre ? jsonFinder.idPadre = req.body.idPadre : null;
	req.body.idChild ? jsonFinder.idChild = req.body.idChild : null;

	req.body.city ? auxDir.city = req.body.city : null; //ciudad
	req.body.dpt ? auxDir.department = req.body.dpt : null; // no se que otr verga
	auxDir ? jsonFinder._dir = auxDir : null; //direccion encapsulada

	var changePaginator = req.body.changePaginator || null;
	var oldPaginate = req.body.oldPaginate || null;
	var typeFind = req.body.typeFind || null;


	// //// // // // ////////////////console.logog('si es telefono',req.body.movil);
	//
	if ((req.body.movil == true)) {
		dataPaginador.limit = 5;
	} else {
		dataPaginador.limit = 12;
	}

	if (changePaginator != null) {

		getNewPag(oldPaginate, changePaginator);

	} else {
		// dataPaginador.page = 1;
	}
	// changePaginator: 2
	// oldPaginate
	// typeFind

	// //// // // // ////////////////console.logog('como queda paginador', dataPaginador);

	// //////////////// //// // // // ////////////////console.logog(req.body.typeFind);
	if (req.params.id) { preferences(req.params.id, jsonFinder); }

	//return res.status(200).json(jsonFinder);

	if ((req.body.typeFind) && (req.body.typeFind == 'first' || req.body.typeFind == 'all')) {


		// // //// // // // ////////////////console.logog('primera carga');

		Promise.all
			([

				firstFind(),
			]).then(result => {

				// // //// // // // ////////////////console.logog('recibe en promesa', result);
				json.data = result[0].itemsList;
				json.paginator = result[0].paginator;
				json.message = 'Resultados encontrados';
				json.status = 200;
				json.ok = true;

				// // //// // // // ////////////////console.logog('la respuesta final', json)

				return res.status(200).json(json);
			});


	}
	if ((req.body.typeFind) && (req.body.typeFind == 'buscador')) {

		Promise.all
			([
				//regexFind(argumento),
				flexibleFinder2(argumento), //basados en una expresion regular

			]).then(result => {
				json.data = result[0].itemsList;
				json.paginator = result[0].paginator;
				json.message = 'Resultados encontrados';
				json.status = 200;
				json.ok = true;

				return res.status(200).json(json);
			});


	}

	////// //// // // // ////////////////console.logog(req.body);
	if ((req.body.typeFind) && (req.body.typeFind == 'category')) {



		if (req.body.idChild == null || req.body.idChild == '') {

			Promise.all
				([

					categoryFinder(argumento, jsonFinder)


				]).then(result => {
					// //// // // // ////////////////console.logog('resultados antes de [0]', result);
					json.data = result[0].itemsList;
					json.paginator = result[0].paginator;
					json.message = 'Resultados encontrados';
					json.status = 200;
					json.ok = true;
					return res.status(200).json(json);
				});

		}
		if (req.body.idChild != null && req.body.idChild != '') {


			Promise.all
				([

					categorySubFinder(argumento, jsonFinder)


				]).then(result => {
					json.data = result[0].itemsList;
					json.paginator = result[0].paginator;
					json.message = 'Resultados encontrados';
					json.status = 200;
					json.ok = true;
					return res.status(200).json(json);
				});

		}

	}

	if ((req.body.typeFind) && (req.body.typeFind == 'price')) {

		Promise.all
			([

				priceFinder(argumento, jsonFinder)


			]).then(result => {
				// //////////////// //// // // // ////////////////console.logog(result);
				// json.data = result;

				try {

					json.data = result.filter(function (item) { return item.length > 0; });
					json.message = 'Resultados encontrados';
					json.status = 200;
					json.ok = true;

					return res.status(200).json(json);
				}
				catch (err) {
					json.data = []
					json.message = 'Ha ocurrido un problema';
					json.status = 200;
					json.ok = false;

					return res.status(200).json(json);
				}

			});


	}

	if ((req.body.typeFind) && (req.body.typeFind == 'ubicacion')) {

		Promise.all
			([

				//
				cityFinder(argumento, allBody)

			]).then(result => {
				json.data = result[0].itemsList;
				json.paginator = result[0].paginator;
				json.message = 'Resultados encontrados';
				json.status = 200;
				json.ok = true;
				return res.status(200).json(json);
			});

	}

});

async function cityFinder(argumento, body) {

	return new Promise(async (resolve, reject) => {

		var pCat = null;

		if (body.categoryp != null || body.child != null) {

			if (body.child != null) {

				await flexibleFinderCategory(body.categoryp, body.child, 'specific').then(r => {
					pCat = r;
					// ////////////////console.logog('la promesa llega', r);
				}, err => {
					pCat = err;
					// ////////////////console.logog( 'error con la promesa', err);
				});
			} else if (body.categoryp != null && body.child == null) {
				await flexibleFinderCategory(body.categoryp).then(r => {
					pCat = r;
					// ////////////////console.logog('la promesa llega', r);
				}, err => {
					pCat = err;
					// ////////////////console.logog( 'error con la promesa', err);
				});
			}

		}

		const options = {
			page: dataPaginador.page,
			limit: dataPaginador.limit,
			sort: { '_id': -1 },
			customLabels: myCustomLabels,
			populate: {
				path: '_category._principal',
				select: '_category _child'
			}
		};

		var busqueda = {}

		//// // // // ////////////////console.logog('todos los args', body);
		if (body.categoryp != null) {


			if (body.child != null) {


				//// // // // ////////////////console.logog('solo catego y child', body.categoryp);
				//// // // // ////////////////console.logog('solo catego y child', body.child);
				busqueda = {
					$or:
						[
							{ '_cityTarget.department': { $regex: diacriticSensitiveRegex(body.city), $options: 'i' } }, //recibe un array de datos
							{ '_cityTarget.city': { $regex: diacriticSensitiveRegex(body.city), $options: 'i' } }, //recibe un array de datos
						],
					$and: [
						{ 'status': true },
						{ '_category._principal': pCat._category }, //recibe un array de datos
						{ '_category._child': pCat._child }, //recibe un array de datos
					]
				}


			} else {
				//// // // // ////////////////console.logog('solo catego', body.categoryp);
				busqueda = {
					$or:
						[
							{ '_cityTarget.department': { $regex: diacriticSensitiveRegex(body.city), $options: 'i' } }, //recibe un array de datos
							{ '_cityTarget.city': { $regex: diacriticSensitiveRegex(body.city), $options: 'i' } }, //recibe un array de datos
						],
					$and: [
						{ 'status': true },
						{ '_category._principal': pCat._category }, //recibe un array de datos

					]
				}

			}


		} else {

			busqueda = {
				$or:
					[
						{ '_cityTarget.department': { $regex: diacriticSensitiveRegex(body.city), $options: 'i' } }, //recibe un array de datos
						{ '_cityTarget.city': { $regex: diacriticSensitiveRegex(body.city), $options: 'i' } }, //recibe un array de datos
					],
				$and: [
					{ 'status': true },
				]
			}
		}

		////////////////console.logog('busqueda con ubicacion', busqueda);

		Post.paginate(busqueda, options, function (err, result) {

			if (err) {
				// // //// // // // ////////////////console.logog('error', err);
				reject(err);
			}
			if (result) {

				//// // // // ////////////////console.logog('resultados', result);
				resolve(result);
			} else {
				// // //// // // // ////////////////console.logog('no hay resultados');
				reject('No hay resultados');
			}


		});

	});

}


function priceFinder(argumento, body) {
	// //////////////// //// // // // ////////////////console.logog('que e body', body);

	if (body.min != null &&
		body.max != null &&
		body.min >= 0 &&
		body.max >= 0) {

		return new Promise((resolve, reject) => {
			Post.find
				({
					$and:
						[
							{ 'status': true },
							// {'title':regex}, //expresion regular para el titulo
							// {'type':body.type},//el tipo de publicacion si es producto o servicio
							{ $expr: { $gte: [{ $toDouble: "$_rangoPrize.min" }, body.min] } },
							{ $expr: { $lte: [{ $toDouble: "$_rangoPrize.max" }, body.max] } },

						],

				}).exec((err, posts) => {
					if (err) { reject(err); }
					if (posts) { resolve(posts); } else { reject('No se encontro resultados'); }
				});
		});

	}


	if (body.min != null && body.min >= 0) {

		// //////////////// //// // // // ////////////////console.logog('minimo', body.min);

		return new Promise((resolve, reject) => {
			Post.find
				({
					$and:
						[

							{ $expr: { $gte: [{ $toDouble: "$_rangoPrize.min" }, body.min] } },
							{ 'status': true },

						],

				}).exec((err, posts) => {
					if (err) { reject(err); }
					if (posts) { resolve(posts); } else { reject('No se encontro resultados'); }
				});
		});

	}

	if (body.max != null && body.max >= 0) {

		return new Promise((resolve, reject) => {
			Post.find
				({
					$and:
						[
							{ 'status': true },
							// {'title':regex}, //expresion regular para el titulo
							// {'type':body.type},//el tipo de publicacion si es producto o servicio
							// {'_rangoPrize.min':{$gte:body.min}}, //rango de valor monetario
							{ $expr: { $lte: [{ $toDouble: "$_rangoPrize.max" }, body.max] } },

						],

				}).exec((err, posts) => {
					if (err) { reject(err); }
					if (posts) { resolve(posts); } else { reject('No se encontro resultados'); }
				});
		});


	}
}


function categorySubFinder(argumento, body) {

	////// //// // // // ////////////////console.logog('llama sub');

	const options = {
		page: dataPaginador.page,
		limit: dataPaginador.limit,
		sort: { '_id': -1 },
		customLabels: myCustomLabels,
		populate: {
			path: '_category._principal',
			select: '_category _child'
		}
	};

	// //// // // // ////////////////console.logog('que llega', body);

	return new Promise((resolve, reject) => {

		Post.paginate({
			$and:
				[
					{ 'status': true },
					// {'title':regex}, //expresion regular para el titulo
					// {'type':body.type},//el tipo de publicacion si es producto o servicio
					{ '_category._principal': body.idPadre }, //recibe un array de datos
					{ '_category._child': String(body.idChild) }, //recibe un array de datos
				],

		}, options, function (err, result) {

			if (err) {
				// // //// // // // ////////////////console.logog('error', err);
				reject(err);
			}
			if (result) {

				// // //// // // // ////////////////console.logog('resultados', result);
				resolve(result);
			} else {
				// // //// // // // ////////////////console.logog('no hay resultados');
				reject('No hay resultados');
			}


		});

	});

}
function categoryFinder(argumento, body) {
	////// //// // // // ////////////////console.logog('llama principal');


	// // // ////////////////console.logog('busqueda category', body);
	const options = {
		page: dataPaginador.page,
		limit: dataPaginador.limit,
		sort: { '_id': -1 },
		customLabels: myCustomLabels,
		populate: {
			path: '_category._principal',
			select: '_category _child'
		}
	};


	// //// // // // ////////////////console.logog('las opciones de busqueda', options);

	return new Promise((resolve, reject) => {

		Post.paginate({
			$and:
				[
					{ 'status': true },
					// {'title':regex}, //expresion regular para el titulo
					// {'type':body.type},//el tipo de publicacion si es producto o servicio
					{ '_category._principal': body.idPadre } //recibe un array de datos

				]
		}, options, function (err, result) {
			// result.itemsList [here docs become itemsList]

			// // // ////////////////console.logog('resultado', result);

			if (err) {
				// // //// // // // ////////////////console.logog('error', err);
				reject(err);
			}
			if (result) {

				// // //// // // // ////////////////console.logog('resultados', result);
				resolve(result);
			} else {
				// // //// // // // ////////////////console.logog('no hay resultados');
				reject('No hay resultados');
			}


		});
	});

}

function regexFind(argumento) {
	return new Promise((resolve, reject) => {
		Post.find({ 'title': regex }, (err, posts) => {
			if (err) { reject(err); }
			if (posts) { resolve(posts); }
		});
	});
}

function firstFind() {


	const options = {
		page: dataPaginador.page,
		limit: dataPaginador.limit,
		sort: { '_id': -1 },
		customLabels: myCustomLabels,
		populate: {
			path: '_category._principal',
			select: '_category _child'
		}

	};

	// //// // // // ////////////////console.logog('options', options);

	return new Promise((resolve, reject) => {

		Post.paginate({
			$and: [
				{ 'status': true },
			]
		}, options, function (err, result) {

			if (err) {
				// // //// // // // ////////////////console.logog('error', err);
				reject(err);
			}
			if (result) {

				// // //// // // // ////////////////console.logog('resultados', result);
				resolve(result);
			} else {
				// // //// // // // ////////////////console.logog('no hay resultados');
				reject('No hay resultados');
			}


		});




	});
}


function flexibleFinderUser(argumento) {

	// ////////////////console.logog('el argumento que se busca', argumento);
	return new Promise((resolve, reject) => {

		User.find
			({
				$or:
					[
						{ 'name': { $regex: diacriticSensitiveRegex(argumento), $options: 'i' } }, //expresion regular para el titulo
						{ 'surname': { $regex: diacriticSensitiveRegex(argumento), $options: 'i' } }, //expresion regular para el titulo
						{ '_dataPyme.nameCompany': { $regex: diacriticSensitiveRegex(argumento), $options: 'i' } }, //expresion regular para el titulo
						// { '_child.name': { $in: [{ $regex: diacriticSensitiveRegex(argumento), $options: 'i' }]  } }, //expresion regular para el titulo
						// { $in: [body.categoryc] }
					]
			}).exec((err, user) => {
				if (err) { reject(err); }
				if ((user)) {
					user.pass = '*';


					// //////////////console.logog('la mierda esta', user);

					// ////////////////console.logog('las user en id', l);
					if ((user.length > 0) && (user[0]._id)) {
						resolve(user[0]._id);
					} else {
						reject(null);
					}
				} else { reject(null); }
			});
	});

}

function flexibleFinderCategory(argumento, argChild = null, type = 'flexible') {

	// ////////////////console.logog('el argumento que se busca', argumento);
	return new Promise((resolve, reject) => {

		if (type == 'flexible') {

			var l = {
				_category: null,
				_child: null
			}
			Category.find
				({
					$or:
						[
							{ '_child.name': { $regex: diacriticSensitiveRegex(argumento), $options: 'i' } }, //expresion regular para el titulo
							// { '_category': { $regex: diacriticSensitiveRegex(argumento), $options: 'i' } }, //expresion regular para el titulo
							// { '_child.name': { $in: [{ $regex: diacriticSensitiveRegex(argumento), $options: 'i' }]  } }, //expresion regular para el titulo
							// { $in: [body.categoryc] }
						]
				}).exec((err, cats) => {
					if (err) { reject(err); }
					if ((cats) && cats.length > 0) {


						////////////console.log('etapa child', cats);

						////////////////console.logog('caso', cats);
						child = cats[0]._child.filter(r => {

							////////////console.log(r.name);
							////////////console.log('argumento', argumento);
							var l = new RegExp(argumento, 'i');
							return l.test(r.name);

						});

						////////////console.log('el child', child);


						l._category = null;
						l._child = child[0]._id || null;

						////////////console.log('las cats en idCHILD', l);



						resolve(l);
					} else {

						// ----

						Category.find
							({
								$or:
									[
										// { '_child.name': { $regex: diacriticSensitiveRegex(argumento), $options: 'i' } }, //expresion regular para el titulo
										{ '_category': { $regex: diacriticSensitiveRegex(argumento), $options: 'i' } }, //expresion regular para el titulo
										// { '_child.name': { $in: [{ $regex: diacriticSensitiveRegex(argumento), $options: 'i' }]  } }, //expresion regular para el titulo
										// { $in: [body.categoryc] }
									]
							}).exec((err, cats) => {
								if (err) { reject(err); }
								if ((cats) && cats.length > 0) {


									l._category = cats[0]._id;
										l._child = null;


									resolve(l);
								}else{
									reject(null);
								}
							});
						// ----
					}
				});

		} else if (type == 'specific') {


			////////////////console.logog('argumento padre', argumento);
			////////////////console.logog('argumento child', argChild);

			Category.find
				({
					$and:
						[
							{ '_category': { $regex: diacriticSensitiveRegex(argumento), $options: 'i' } }, //expresion regular para el titulo
							{ '_child.name': { $regex: diacriticSensitiveRegex(argChild), $options: 'i' } }, //expresion regular para el titulo
							// { '_child.name': { $in: [{ $regex: diacriticSensitiveRegex(argumento), $options: 'i' }]  } }, //expresion regular para el titulo
							// { $in: [body.categoryc] }
						]
				}).exec((err, cats) => {
					if (err) { reject(err); }
					if ((cats) && cats.length > 0) {

						////////////////console.logog('caso', cats);
						child = cats[0]._child.filter(r => {

							// ////////////////console.logog(r.name);
							////////////////console.logog(r.name);
							var l = new RegExp(argChild, 'i');
							////////////////console.logog('regex', l);

							return l.test(r.name);

						});

						////////////////console.logog('coño vale,', child);

						////////////////console.logog('los cats', cats);
						var l = {
							_category: cats[0]._id,
							_child: child[0]._id || null
						}

						////////////////console.logog('las cats en id', l);

						resolve(l);
					} else { reject(null); }
				});

		}
	});


}

async function flexibleFinder2(argumento) {


	// ////////////////console.logog('llega finder', argumento);
	var pCat = null;
	var usId = null;
	await flexibleFinderCategory(argumento).then(r => {

		pCat = r;
		// ////////////////console.logog('la promesa llega', r);
	}, err => {
		pCat = err;
		// ////////////////console.logog( 'error con la promesa', err);
	});

	await flexibleFinderUser(argumento).then(r => {

		usId = r;
	}, err => {

		usId = err;
	});


	const opc = {
		page: dataPaginador.page,
		limit: dataPaginador.limit,
		// sort: { '_id': -1 },
		customLabels: myCustomLabels,
		populate: {
			path: '_category._principal',
			select: '_category _child'
		}
	};

	var busqueda = {
		$or: [
			// { '_cityTarget.city': { $regex: diacriticSensitiveRegex(body.city), $options: 'i' } }, //r
			{ 'title': { $regex: diacriticSensitiveRegex(argumento), $options: 'i' } }, //expresion regular para el titulo
			{ 'content': { $regex: diacriticSensitiveRegex(argumento), $options: 'i' } }, //expresion regular para el titulo
			{ 'notContent': { $regex: diacriticSensitiveRegex(argumento), $options: 'i' } }, //expresion regular para el titulo
			{ 'type': { $regex: diacriticSensitiveRegex(argumento), $options: 'i' } },//el tipo de publicacion si es producto o servicio
			{ 'user': usId },//el tipo de publicacion si es producto o servicio

			{ '_cityTarget.department': { $regex: diacriticSensitiveRegex(argumento), $options: 'i' } }, //recibe un array de datos
			{ '_cityTarget.city': { $regex: diacriticSensitiveRegex(argumento), $options: 'i' } }, //recibe un array de datos
			// { '_target.tag': { $regex: diacriticSensitiveRegex(argumento), $options: 'i' } } //recibe un array de datos
		],
		$and: [
			{ 'status': true },
		]
	}

	if ((pCat) && pCat != null) {
		if (pCat._category != null) {
			////////////console.log('entra aca1', pCat);
			busqueda.$or.push({ '_category._principal': pCat._category });
		}
		if (pCat._child != null) {
			////////////console.log('entra aca2', pCat);
			busqueda.$or.push({ '_category._child': pCat._child });
		}
	}

	// ////////////////console.logog('esqueleto busqueda', busqueda);

	return new Promise((resolve, reject) => {
		Post.paginate(busqueda, opc, function (err, result) {

			if (err) {
				// //// // // // ////////////////console.logog('el error', err);
				reject(err);
			}
			if (result) {

				// //// // // // ////////////////console.logog('resultados por texto', result);
				resolve(result);
			} else {

				reject('No hay resultados');
			}


		});

	});
}

function flexibleFinder(argumento, body) {
	return new Promise((resolve, reject) => {
		Post.find
			({
				$or:
					[
						{ 'title': { $regex: diacriticSensitiveRegex(argumento), $options: 'i' } }, //expresion regular para el titulo
						{ 'type': body.type },//el tipo de publicacion si es producto o servicio
						{ '_category._principal': body.idPadre }, //recibe un array de datos
						{ '_category.child': { $in: [body.categoryc] } }, //recibe un array de datos
						{ '_rangoPrize.min': { $gte: body.min } }, //rango de valor monetario
						{ '_rangoPrize.max': { $lte: body.max } }, //rango de valor monetario
						{ 'city': body.city }, //ubicación de donde fue hecha la publiación
						{ 'deparment': body.department }, //ubicación de donde fue hecha la publiación
						{ '_target': { $all: [body.target] } }, //recibe un array de datos
						{ '_cityTarget.department': { $in: [body.cityTarget] } }, //recibe un array de datos
						{ '_cityTarget.city': { $in: [body.cityTarget] } }, //recibe un array de datos
						{ '_target.tag': { $in: [body.taget] } } //recibe un array de datos
					],
				$and: [
					{ 'status': true }
				]
			}).exec((err, posts) => {
				if (err) { reject(err); }
				if (posts) { resolve(posts); } else { reject('No se encontro resultados'); }
			});
	});
}

function specificFinder(argumento, body) {

	return new Promise((resolve, reject) => {
		Post.find
			({
				$and:
					[
						{ 'status': true },
						{ 'title': { $regex: diacriticSensitiveRegex(argumento), $options: 'i' } }, //expresion regular para el titulo
						{ 'type': body.type },//el tipo de publicacion si es producto o servicio
						{ '_category._principal': body.idPadre }, //recibe un array de datos
						{ '_category.child': { $in: [body.categoryc] } }, //recibe un array de datos
						{ '_rangoPrize.min': { $gte: body.min } }, //rango de valor monetario
						{ '_rangoPrize.max': { $lte: body.max } }, //rango de valor monetario
						{ 'city': body.city }, //ubicación de donde fue hecha la publiación
						{ 'deparment': body.department }, //ubicación de donde fue hecha la publiación
						{ '_target': { $all: [body.target] } }, //recibe un array de datos
						{ '_cityTarget.department': { $in: [body.cityTarget] } }, //recibe un array de datos
						{ '_cityTarget.city': { $in: [body.cityTarget] } }, //recibe un array de datos
						{ '_target.tag': { $in: [body.taget] } } //recibe un array de datos
					],

			}).exec((err, posts) => {
				if (err) { reject(err); }
				if (posts) { resolve(posts); } else { reject('No se encontro resultados'); }
			});
	});
}

function diacriticSensitiveRegex(string = '') {
	return string.replace(/a/g, '[a,á,à,ä]')
		.replace(/e/g, '[e,é,ë]')
		.replace(/i/g, '[i,í,ï]')
		.replace(/o/g, '[o,ó,ö,ò]')
		.replace(/u/g, '[u,ü,ú,ù]');
}

function getNewPag(oldPag, argumento) {




	if (argumento == 'new') {

		dataPaginador.page = 1;
		return;
	}


	if (argumento == 'prev' && oldPag.prev != null) {
		dataPaginador.page = oldPag.prev;
	} else

		if (argumento == 'next' && oldPag.next != null) {
			dataPaginador.page = oldPag.next;
		} else {
			dataPaginador.page = argumento;
		}



}



module.exports = app;
