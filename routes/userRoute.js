//Obtenemos las importaciones
var express = require('express');
var bcrypt = require('bcryptjs');
var User = require('../models/userScheme');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var jwt = require('jsonwebtoken');
// se jala el seed pre configurado por defecto
var SEED = require('../config/config').SEED;

var moment = require('moment');
var dateMoment = moment();
moment.locale('es');

var mdAutentication = require('../middleware/autenticacion');

// var generalFunctions = require('../config/config');

//inicializamos express
var app = express();
app.use(fileUpload());


//json maestro que contendrá las respuestas de las peticiones
var json =
{
	message: 'OK, Im user route',
	status: 200,
	ok: true,
	data: 'OK, Im user route',
	paginator: null
};

var dataPaginador = {
	page: 1,
	limit: 1,
}

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


// cambio de contraseña
app.put('/changeEmail',
	[mdAutentication.prcessVerify],
	(req, res, next) => {

		// var body = req.body
		var decoded = req.decoded;
		User.findById(decoded.idUser)
	// .populate('user', 'name surname email role _dataPyme positionCompany')
	.exec((error,User)=>
	{
		if (error)
		{
			//if error exists, return the error with status 500
			json.message = 'Error al buscar al usuario';
			json.data = null;
			json.status = 500;
			json.ok = false;

			return res.status(500).json(json);
		}

		if (!User)
		{
			//if user not exists, return the error with status 400 bad request
			json.message = 'No se encontró al usuario';
			json.data = null;
			json.status = 400;
			json.ok = false;

			return res.status(400).json(json);
		}

		User.email = decoded.email;
		User.updated_at = dateMoment.format('LL');

        User.save((err, UserSaved)=>
        {
            if (err)
            {
            	//if exists problem for update user, return sttus 400

                json.message = 'Error al cambiar de email';
                json.data = null;
                json.status = 400;
                json.ok = null;

                return res.status(400).json(json);
			}

			UserSaved.pass = '*';
			////console.log('el user saved', UserSaved);
            json.message = 'Has cambiado de email';
    		json.data = UserSaved;
    		json.status = 200;
    		json.ok = true;

            return res.status(200).json(json);
        });
	});
});

// cambio de contraseña
app.put('/changePassword',
	[mdAutentication.prcessVerify],
	(req, res, next) => {

		var body = req.body
		var decoded = req.decoded;

		////console.log('body', body);
		////console.log('decoded', decoded);

		User.findOne({
			email: decoded.email
		})
	// .populate('user', 'name surname email role _dataPyme positionCompany')
	.exec((error,User)=>
	{
		if (error)
		{
			//if error exists, return the error with status 500
			json.message = 'Error al buscar al usuario';
			json.data = null;
			json.status = 500;
			json.ok = false;

			return res.status(500).json(json);
		}

		if (!User)
		{
			//if user not exists, return the error with status 400 bad request
			json.message = 'No se encontró al usuario';
			json.data = null;
			json.status = 400;
			json.ok = false;

			return res.status(400).json(json);
		}

		User.pass = bcrypt.hashSync(body.pass, 10);
		User.updated_at = dateMoment.format('LL');

        User.save((err, UserSaved)=>
        {
            if (err)
            {
            	//if exists problem for update user, return sttus 400

                json.message = 'Error al cambiar de contraseña';
                json.data = null;
                json.status = 400;
                json.ok = null;

                return res.status(400).json(json);
			}

			UserSaved.pass = '*';
			////console.log('el user saved', UserSaved);
            json.message = 'Has cambiado de contraseña';
    		json.data = UserSaved;
    		json.status = 200;
    		json.ok = true;

            return res.status(200).json(json);
        });
	});
});




app.put('/view/',(req,res,next)=>
{
	var id = req.body.id; //recibe el id de la publicacion

	//////////////// // // // // //////////////console.logog('llega', id);
	User.findById(id)
	// .populate('user', 'name surname email role _dataPyme positionCompany')
	.exec((error,User)=>
	{
		if (error)
		{
			//if error exists, return the error with status 500
			json.message = 'Error al buscar al usuario';
			json.data = null;
			json.status = 500;
			json.ok = false;

			return res.status(500).json(json);
		}

		if (!User)
		{
			//if user not exists, return the error with status 400 bad request
			json.message = 'No se encontró la publicación';
			json.data = null;
			json.status = 400;
			json.ok = false;

			return res.status(400).json(json);
		}

		User.view = User.view + 1;

		// //////////////// // // // // //////////////console.logog('la visita', User.view);
        User.save((err, UserSaved)=>
        {
            if (err)
            {
            	//if exists problem for update user, return sttus 400

                json.message = 'Error al añadir la visita';
                json.data = null;
                json.status = 400;
                json.ok = null;

                return res.status(400).json(json);
            }

            json.message = 'Visita añadida';
    		json.data = UserSaved;
    		json.status = 200;
    		json.ok = true;

            return res.status(200).json(json);
        });
	});


});



app.get('/profile/:id',(req,res,next)=>
{
    // var body = req.body;
    	var p = req.params.id; //recibe el id de la publicacion
		User.findById( p )
		// .populate('user', 'name surname email role _dataPyme positionCompany')
		.exec((error,response)=>
	{


		if(!response)
		{
			json.message = 'No existe este usuario';
			json.status = 400;
			json.ok = false;
			json.data = null;
			return res.status(400).json(json);
		}

		if(error)
		{
			json.message = error;
			json.status = 500;
			json.data = null;
			json.ok = false;
			return res.status(500).json(json);
		}
		  response.pass = '************';

		  // //////////////// // // // // //////////////console.logog(response);
		json.message = 'Usuario encontrado';
		json.data = response;

		if (response.length == 0)
		{
			json.message = 'Usuario no encontrado';
			json.data = null;
		}

		json.status = 200;
		json.ok = true;
		return res.status(200).json(json);
	});


});


//ROUTE GET USERS
app.get('/', (req, res, next) => {

	const options = {
		page: dataPaginador.page,
		limit: 12,
		sort: { '_id': -1 },
		customLabels: myCustomLabels,
		select: "-pass"

	};

	User.paginate({},
		options,
		(err, result) => {

		if (err) {

			json.message = err;
			json.status = 500;
			json.data = null;
			json.ok = false;
			return res.status(500).json(json);

		}
		json.message = 'Usuarios encontrados';
		json.data = result.itemsList;
		json.paginator = result.paginator;


		if (result.length == 0) {
			json.message = 'Usuarios no encontrados';
			json.data = null;
		}

		json.status = 201;
		json.ok = true;
		return res.status(201).json(json);


	});

});




//ROUTE POST USERS
app.post('/', (req, res, next) => {

	var body = req.body;


	//////////console.log('lo que llega', body);
	var act = [];

	if(body.role == 'CLIENTE_ROLE'){

	var user = new User
	({
		celPhone: body.celPhone,
		city: body.city,
		department: body.department,
		// details: body.details,
		email: body.email,
		gender: body.gender,
		identification: body.identification,
		// imgProfile: body.imgProfile,
		name: body.name,
		pass: bcrypt.hashSync(body.pass, 10),
		phone: body.phone,
		positionCompany: body.positionCompany,
		role: body.role,
		surname: body.surname,
		termsCondition: body.termsCondition,
		// typeActivity: body.typeActivity,
		typeId: body.typeId,
		year: body.year,
		_mapUrl: body.mapUrl,
		_naturalEconomicActivity: body.typeActivity,
		negocioName: body.negocioName

	});

	}


	if (body.role == 'EMPRESA_ROLE') {

		var user = new User({
			email: body.email,
			name: body.name,
			surname: body.surname,
			year: body.year,
			pass: bcrypt.hashSync(body.pass, 10),
			gender: body.gender,
			typeId: body.typeId,
			identification: body.identification,
			phone: body.phone,
			celPhone: body.celPhone,
			department: body.department,
			city: body.city,
			positionCompany: body.positionCompany,
			mapUrl: body.mapUrl,
			termsCondition: body.termsCondition,
			role: body.role,
			_dataPyme: body.dataPyme,
			_companyPhones: body.companyPhones,
			_naturalEconomicActivity: body.economicActivity,
			_mapUrl: body.mapUrl
		});


	}

	//////////console.log('el conjunto user', user);

	user.save((error, user) => {
		if (error) {

			//////////console.log('el error', error);
			json.message = error;
			json.data = null;
			json.status = 400;
			json.ok = false;
			return res.status(400).json(json);
		}

		user.pass = '************';


        var ll = {
        	_id: user._id,
        	email: user.email,
        	role: user.role
        	// name: user.name,
        }

             //EN ESTE PTO TENEMOS QUE CREAR UN TOKEN
        var token = jwt.sign({user: ll}, SEED, {expiresIn: '7d'});

		json.message = '¡Usuario Registrado!';
		json.data = {
			t: token,
			user: user
		};
		json.status = 201;
		json.ok = true;
		return res.status(201).json(json);
	});

});



//ROUTES PUT USERS By ID
app.put('/:id',
	[mdAutentication.verificaToken, mdAutentication.verificaAdminRoleoMismoUser],
	(req, res, next) => {
		var id = req.params.id;
		var body = req.body;

		//////////////// // // // // //////////////console.logog('lo que llega', body);
		// return res.end();
		User.findById(id, (error, user) => {
			if (error) {
				//if error exists, return the error with status 500
				json.message = 'Error al buscar el usuario';
				json.data = null;
				json.status = 500;
				json.ok = false;

				return res.status(500).json(json);
			}

			if (!user) {
				//if user not exists, return the error with status 400 bad request
				json.message = 'No se encontró al usuario';
				json.data = null;
				json.status = 400;
				json.ok = false;

				return res.status(400).json(json);
			}

			user.celPhone = (body.celPhone && body.celPhone != null)? body.celPhone: user.celPhone;
			user.city = (body.city && body.city != null)? body.city: user.city;
			user.department = (body.department && body.department != null)? body.department: user.department;

			user.gender = (body.gender && body.gender != null)? body.gender: user.gender;
			user.identification = (body.identification && body.identification != null)? body.identification: user.identification;
			user.name = (body.name && body.name != null)? body.name: user.name;
			user.phone = (body.phone && body.phone != null)? body.phone: user.phone;
			user.surname = (body.surname && body.surname != null)? body.surname: user.surname;

			user.typeId = (body.typeId && body.typeId != null)? body.typeId: user.typeId;
			user.year = (body.year && body.year != null)? body.year: user.year;
			user._mapUrl = (body.mapUrl && body.mapUrl != null)? body.mapUrl: user.mapUrl;

			if (user.role == 'EMPRESA_ROLE') {

			user.positionCompany = (body.positionCompany && body.positionCompany != null)? body.positionCompany: user.positionCompany;
			user._naturalEconomicActivity = (body.economicActivity && body.economicActivity != null)? body.economicActivity: user._naturalEconomicActivity;
			user._companyPhones = (body.companyPhones && body.companyPhones != null)? body.companyPhones: user._companyPhones;

			if( (body.dataPyme) && body.dataPyme != null && body.dataPyme != '' && body.dataPyme.length > 0){
				user._dataPyme.nameCompany =  body.dataPyme.nameCompany;
				user._dataPyme.nit =  body.dataPyme.nit;
				user._dataPyme.socialReason =  body.dataPyme.socialReason;
				user._dataPyme.direction =  body.dataPyme.direction;
			}
			}else{
			user._naturalEconomicActivity = (body.typeActivity && body.typeActivity != null)? body.typeActivity: user._naturalEconomicActivity;

			}

			// if (body.pass) {
			// 	user.pass = bcrypt.hashSync(body.pass, 10);
			// }moment().format('LL');
			user.updated_at = dateMoment.format('LL');

			// //////////////// // // // // //////////////console.logog('que coño recibe', body);
			//////////////// // // // // //////////////console.logog('lo que se guarda',user);
			// return res.end();

			user.save((err, userSaved) => {
				if (err) {
					//if exists problem for update user, return sttus 400

					//////////////// // // // // //////////////console.logog(err);

					json.message = 'Error al modificar usuario!';
					json.data = null;
					json.status = 400;
					json.ok = null;

					return res.status(400).json(json);
				}

				//////////////// // // // // //////////////console.logog('lo que guarda en back', userSaved);
				userSaved.pass = ';-)';

				json.message = 'Usuario modificado!';
				json.data = userSaved;
				json.status = 200;
				json.ok = true;

				return res.status(200).json(json);
			});
		});

	});

//ROUTE TO DELETE USER BY ID

app.delete('/:id',
	[mdAutentication.verificaToken, mdAutentication.verificaAdminRoleoMismoUser],
	(req, res, next) => {
		var id = req.params.id;

		User.findByIdAndRemove(id, (error, userDeleted) => {
			if (error) {
				json.message = 'Error al buscar el usuario';
				json.data = null;
				json.status = 500;
				json.ok = false;

				return res.status(500).json(json);
			}

			if (!userDeleted) {
				json.message = 'No se encontró al usuario';
				json.data = null;
				json.status = 400;
				json.ok = false;

				return res.status(400).json(json);
			}

			json.message = 'Usuario eliminado!';
			json.data = userDeleted;
			json.status = 200;
			json.ok = true;

			return res.status(200).json(json);
		});
	});


//export route users module
module.exports = app;