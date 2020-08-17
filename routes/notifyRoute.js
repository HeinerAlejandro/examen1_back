var express = require('express');
var Notify = require('../models/notifyScheme');

var User = require('../models/userScheme');
var Post = require('../models/postScheme');
var directionFunctions = require('../config/directionFunctions');
var jwt = require('jsonwebtoken');

var mdAutentication = require('../middleware/autenticacion');
var SITENAME = require('../config/config').SITENAME;
var WEBNAME = require('../config/config').WEBNAME;
var SEED = require('../config/config').SEED;
var PATHSEMAIL = require('../config/config').PATHSEMAIL;
var mail = require('../config/nodeMailerWithTemp');


var moment = require('moment');
var dateMoment = moment();
moment.locale('es');

// se inicializa express
var app = express();
var json =
{
	message: 'OK, Im user route',
	status: 200,
	ok: true,
	data: 'OK, Im user route'
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



var noNotify = []



function setSmall(type){
	switch (type) {


		case 'nAccountModify':
		return 'Modificación de cuenta';
		break;
		case 'nAccountLimitation':
		return 'Limitación de cuenta';
		break;
		case 'nAccountVerify':
		return 'Cuenta verificada';
		break;
		case 'nAccountCreatedNoVerify':
		return 'Te damos la bienveida a Mercado Pyme';
		break;
		case 'nAccountDeletedConfirm':
		return 'Eliminación de cuenta';
		break;
		case 'nAccountDeleted':
		return 'Cuenta eliminada';
		break;
		case 'nPublicationLike':
		return 'Te han dado like';
		break;
		case 'nPublicationReview':
		return 'Te han puntuado';
		break;
		case 'nPublicationComment':
		return 'Te han hecho un comentario';
		break;
		case 'nPublicationCreatedApproved':
		return 'Publicación aprobada';
		break;
		case 'nPublicationCreatedNoApprovedAndPay':
		return 'Publicación creada';
		break;
		case 'nPublicationExpiration':
		return 'Pocos días de una publicación';
		break;
		case 'nPublicationExtensionDays':
		return 'Extensión de días de una publicación';
		break;

		default:
			break;
	}
}

async function setSubject(data, adicional = null) {

	let notify = data,
		type = notify.type,
		description = notify.description,
		idUser = notify.idUser,
		idPost = notify.idPost,
		idForeign = notify.idForeign,
		subject = notify.subject;

	let template = '';


	var infoUser = '';
	if (idUser != null) {
		infoUser = await User.findById(idUser, (error, user) => {
			if (error) {
				//if error exists, return the error with status 500
				json.message = 'Error al buscar el usuario';
				json.data = null;
				json.status = 500;
				json.ok = false;

				// return res.status(500).json(json);
				return;
			}

			if (!user || user.length == 0) {
				//if user not exists, return the error with status 400 bad request
				json.message = 'No se encontró al usuario';
				json.data = null;
				json.status = 400;
				json.ok = false;

				// return res.status(400).json(json);
				return;
			}
			// si todo sale bien
			user.pass = '******';

		});

	}

	var infoPost = '';
	if (idPost != null) {
		var postPromise = new Promise((resolve, reject) => {
			Post.findById(idPost)
				.populate('user', 'name email role')
				.exec((error, post) => {

					if (error) {
						//if error exists, return the error with status 500
						json.message = 'Error al buscar el Post';
						json.data = null;
						json.status = 500;
						json.ok = false;
						reject();
						return res.status(500).json(json);
					}

					if (!post || post.length == 0) {
						//if post not exists, return the error with status 400 bad request
						json.message = 'No se encontró al Post';
						json.data = null;
						json.status = 400;
						json.ok = false;
						reject();
						return res.status(400).json(json);
					}
					// //////////////// // // // // //////////////console.logog(post,'al interno');

					resolve(post);

				});

		});
		await postPromise.then((d) => {

			infoPost = d;

		});
		// //////////////// // // // // //////////////console.logog(infoPost, 'al externo');
	}

	switch (type) {
		case "nAccountModify":

			description = `Se han modificado configuraciones de tu cuenta en ${WEBNAME}`;
			var textNotify = `Se han modificado configuraciones de tu cuenta`;

			template = 'normal';
			notify.description = textNotify;
			notify.subject = `Modificación de cuenta`;

			var r = {
				'datosRetorno': notify,
				// 'url': url,
				'template': template,
				'email': infoUser.email,
				'name': infoUser.name,
				// 'textButton': 'Confirma tu cuenta',
				'textEmail': description
			}
			return r;

			break;
		case "nAccountLimitation":

			description = `Administración ha deshabilitado el acceso a tu cuenta en ${WEBNAME}. Puedes ponerte en contacto con el soporte en el siguiente link `;
			var textNotify = `Administración ha deshabilitado el acceso a tu cuenta`;

			var url = `${SITENAME}/${PATHSEMAIL.contact}`;
			template = 'withButton';

			notify.link = url;
			notify.subject = `Limitación de cuenta`;

			var r = {
				'datosRetorno': notify,
				'url': url,
				'template': template,
				'email': infoUser.email,
				'name': infoUser.name,
				'textButton': 'Contacto',
				'textEmail': description
			}

			return r;

			break;
		case "nAccountVerify":

			description = `!Felicidades ${infoUser.name} has verificado tu cuenta exitosamente en ${WEBNAME}!`;
			var textNotify = `!Felicidades ${infoUser.name} has verificado tu cuenta exitosamente!`;

			template = 'normal';
			notify.description = textNotify;
			notify.subject = `Verificación de cuenta`;

			var r = {
				'datosRetorno': notify,
				// 'url': url,
				'template': template,
				'email': infoUser.email,
				'name': infoUser.name,
				// 'textButton': 'Confirma tu cuenta',
				'textEmail': description
			}
			return r;


			break;
		case "nAccountCreatedNoVerify":

			description = `Hola ${infoUser.name} has creado tu cuenta de usuario bajo el rol de ${directionFunctions.getRole(infoUser.role)} en la plataforma ${WEBNAME} confirma tu cuenta en el siguiente link.`;

			var textNotify = `Hola ${infoUser.name} has creado tu cuenta de usuario bajo el rol de ${directionFunctions.getRole(infoUser.role)}. Accede a tu correo electrónico para verificar tu cuenta`;

			var vd = {
				verify: true,
				email: infoUser.email,
				type: 'confirmAccount',
				role: infoUser.role
			}
			var token = jwt.sign({ verify: vd }, SEED, { expiresIn: '7d' });
			var url = `${SITENAME}/${PATHSEMAIL.verify}/confirmAccount?t=${token}`;
			template = 'withButton';

			notify.description = textNotify;
			notify.link = url;
			notify.subject = `Te damos la bienvenida a ${WEBNAME}`;

			var r = {
				'datosRetorno': notify,
				'url': url,
				'template': template,
				'email': infoUser.email,
				'name': infoUser.name,
				'textButton': 'Confirma tu cuenta',
				'textEmail': description
			}

			return r;

			break;


		case "nAccountPasswordChangeRequest":

			description = `Hola ${infoUser.name} has solicitado cambiar tu contraseña de cuenta de usuario en la plataforma ${WEBNAME}. Puedes hacerlo en el siguiente link.`;

			var textNotify = `Hola ${infoUser.name} has solicitado cambiar tu contraseña de cuenta de usuario en la plataforma ${WEBNAME}. Puedes hacerlo en el siguiente link. Accede a tu correo electrónico para verificar tu cuenta`;

			var vd = {
				verify: true,
				email: infoUser.email,
				type: 'changePassword',
				role: infoUser.role
			}



			var token = jwt.sign({ verify: vd }, SEED, { expiresIn: '7d' });
			var url = `${SITENAME}/${PATHSEMAIL.verify}/changePassword?t=${token}`;
			template = 'withButton';

			notify.description = textNotify;
			notify.link = url;
			notify.subject = `Cambio de contraseña en ${WEBNAME}`;

			var r = {
				'datosRetorno': notify,
				'url': url,
				'template': template,
				'email': infoUser.email,
				'name': infoUser.name,
				'textButton': 'Cambia de contraseña',
				'textEmail': description,
				'toast': `Ingresa a tu email ${infoUser.email} para cambiar de contraseña`
			}

			return r;

			break;
		case "nAccountChangeEmailRequest":

			description = `Hola ${infoUser.name} has solicitado cambiar tu email de cuenta de usuario a ${adicional.newEmail} en la plataforma ${WEBNAME}. Puedes confirmarlo en el siguiente link.`;

			var textNotify = `Hola ${infoUser.name} has solicitado cambiar tu email de cuenta de usuario a ${adicional.newEmail} en la plataforma ${WEBNAME}. Accede a tu nuevo email para confirmarlo`;

			var vd = {
				verify: true,
				email: adicional.newEmail,
				type: 'changeEmail',
				idUser: infoUser._id,
				role: infoUser.role
			}
			var token = jwt.sign({ verify: vd }, SEED, { expiresIn: '7d' });
			var url = `${SITENAME}/${PATHSEMAIL.verify}/changeEmail?t=${token}`;
			template = 'withButton';

			notify.description = textNotify;
			notify.link = url;
			notify.subject = `Cambio de email en ${WEBNAME}`;

			var r = {
				'datosRetorno': notify,
				'url': url,
				'template': template,
				'email': adicional.newEmail,
				'name': infoUser.name,
				'textButton': `Cambiar email a ${adicional.newEmail}`,
				'textEmail': description,
				'toast': `Ingresa a tu nuevo email ${adicional.newEmail} para confirmarlo`
			}

			return r;

			break;
		case "nAccountDeletedConfirm":

			description = `Hola ${infoUser.name} has solicitado la eliminación de tu cuenta en la plataforma ${WEBNAME}, lamentamos mucho que tengas que irte. Puedes confirmar tu solicitud en el siguiente link`;

			var textNotify = `Hola ${infoUser.name} has solicitado la eliminación de tu cuenta en la plataforma ${WEBNAME}, lamentamos mucho que tengas que irte. Puedes confirmar tu solicitud a traves de tu correo electrónico`;

			var vd = {
				verify: true,
				email: infoUser.email,
				type: 'deleteAccount',
				role: infoUser.role
			}
			var token = jwt.sign({ verify: vd }, SEED, { expiresIn: '7d' });
			var url = `${SITENAME}/${PATHSEMAIL.verify}/deleteAccount?t=${token}`;
			template = 'withButton';

			notify.description = textNotify;
			notify.link = url;
			notify.subject = `Eliminación de cuenta en ${WEBNAME}`;
			var r = {
				'datosRetorno': notify,
				'url': url,
				'template': template,
				'email': infoUser.email,
				'name': infoUser.name,
				'textButton': 'Elimina tu cuenta',
				'textEmail': description
			}

			return r;

			break;
		case "nAccountChangeEmail":

			description = `Has cambiado exitosamente de email en tu cuenta de usuario en ${WEBNAME}!`;
			var textNotify = `Has cambiado exitosamente de email en tu cuenta de usuario`;

			template = 'normal';
			notify.description = textNotify;
			notify.subject = `Cambiaste de email en ${WEBNAME}`;

			var r = {
				'datosRetorno': notify,
				// 'url': url,
				'template': template,
				'email': infoUser.email,
				'name': infoUser.name,
				// 'textButton': 'Confirma tu cuenta',
				'textEmail': description
			}
			return r;


			break;
		case "nAccountChangePassword":

			description = `Has cambiado exitosamente de contraseña en tu cuenta de usuario en ${WEBNAME}!`;
			var textNotify = `Has cambiado exitosamente de contraseña en tu cuenta de usuario`;

			template = 'normal';
			notify.description = textNotify;
			notify.subject = `Cambiaste de contraseña en ${WEBNAME}`;

			var r = {
				'datosRetorno': notify,
				// 'url': url,
				'template': template,
				'email': infoUser.email,
				'name': infoUser.name,
				// 'textButton': 'Confirma tu cuenta',
				'textEmail': description
			}
			return r;


			break;
		case "nAccountDeleted":

			description = `Has eliminado tu cuenta de usuario en ${WEBNAME}!`;
			var textNotify = `Has eliminado tu cuenta de usuario`;

			template = 'normal';
			notify.description = textNotify;
			notify.subject = `Cuenta eliminada en ${WEBNAME}`;

			var r = {
				'datosRetorno': notify,
				// 'url': url,
				'template': template,
				'email': infoUser.email,
				'name': infoUser.name,
				// 'textButton': 'Confirma tu cuenta',
				'textEmail': description
			}
			return r;


			break;
		case "nPublicationLike":

			description = `Alguien ha reaccionado con un LIKE en una de tus publicaciones llamada (${infoPost.title}) en la plataforma ${WEBNAME}. Puedes visualizar la publicación en el siguiente link.`;

			var textNotify = `Alguien ha reaccionado con un LIKE en una de tus publicaciones llamada (${infoPost.title}). Puedes visualizar la publicación en el siguiente link.`;

			var url = `${SITENAME}/${PATHSEMAIL.infoPublication}/${infoPost._id}`;
			template = 'withButton';

			notify.description = textNotify;
			notify.link = url;
			notify.subject = `Recibiste un like en ${infoPost.title}`;

			var r = {
				'datosRetorno': notify,
				'url': url,
				'template': template,
				'email': infoPost.user.email,
				// 'email': 'alvarosego01@gmail.com',
				'name': infoPost.user.name,
				'textButton': 'Ver publicación',
				'textEmail': description
			}

			return r;

			break;
		case "nPublicationReview":

			description = `Alguien ha reaccionado con una RESEÑA en una de tus publicaciones llamada (${infoPost.title}) en la plataforma ${WEBNAME}. Puedes visualizar la publicación en el siguiente link.`;

			var textNotify = `Alguien ha reaccionado con una RESEÑA en una de tus publicaciones llamada (${infoPost.title}). Puedes visualizar la publicación en el siguiente link.`;

			var url = `${SITENAME}/${PATHSEMAIL.infoPublication}/${infoPost._id}`;
			template = 'withButton';

			notify.description = textNotify;
			notify.link = url;
			notify.subject = `Recibiste una reseña en ${infoPost.title}`;

			var r = {
				'datosRetorno': notify,
				'url': url,
				'template': template,
				'email': infoPost.user.email,
				// 'email': 'alvarosego01@gmail.com',
				'name': infoPost.user.name,
				'textButton': 'Ver publicación',
				'textEmail': description
			}

			return r;

			break;
		case "nPublicationComment":

			description = `Alguien ha reaccionado con un COMENTARIO en una de tus publicaciones llamada (${infoPost.title}) en la plataforma ${WEBNAME}. Puedes visualizar la publicación en el siguiente link.`;

			var textNotify = `Alguien ha reaccionado con un COMENTARIO en una de tus publicaciones llamada (${infoPost.title}). Puedes visualizar la publicación en el siguiente link.`;

			var url = `${SITENAME}/${PATHSEMAIL.infoPublication}/${infoPost._id}`;
			template = 'withButton';

			notify.description = textNotify;
			notify.link = url;
			notify.subject = `Recibiste una comentario en ${infoPost.title}`;

			var r = {
				'datosRetorno': notify,
				'url': url,
				'template': template,
				'email': infoPost.user.email,
				// 'email': 'alvarosego01@gmail.com',
				'name': infoPost.user.name,
				'textButton': 'Ver publicación',
				'textEmail': description
			}

			return r;

			break;
		case "nPublicationCreatedApproved":

			description = `Administración ha verificado el contenido de tu publicación llamada (${infoPost.title}) y ahora se encuentra disponible al publico en la plataforma ${WEBNAME}. Puedes visualizar la publicación en el siguiente link.`;

			var textNotify = `Administración ha verificado el contenido de tu publicación llamada (${infoPost.title}) y ahora se encuentra disponible al publico. Puedes visualizar la publicación en el siguiente link.`;

			var url = `${SITENAME}/${PATHSEMAIL.infoPublication}/${infoPost._id}`;
			template = 'withButton';

			notify.description = textNotify;
			notify.link = url;
			notify.subject = `Tu publicación ${infoPost.title} ha sido verificada`;

			var r = {
				'datosRetorno': notify,
				'url': url,
				'template': template,
				'email': infoPost.user.email,
				// 'email': 'alvarosego01@gmail.com',
				'name': infoPost.user.name,
				'textButton': 'Ver publicación',
				'textEmail': description
			}

			return r;


			break;
		case "nPublicationCreatedNoApprovedAndPay":

			description = `Has creado con exito una publicación llamada (${infoPost.title}) en la plataforma ${WEBNAME}. Administración realizará la verificación en breve`;

			var textNotify = `Has creado con exito una publicación llamada (${infoPost.title}). Administración realizará la verificación en breve`;

			var url = `${SITENAME}/${PATHSEMAIL.infoPublication}/${infoPost._id}`;
			var url2 = `${SITENAME}/${PATHSEMAIL.infoBilling}/`;
			template = 'createPublication';
			var l = {
				'public': url,
				'billing': url2
			}
			l = JSON.stringify(l);
			var infoPay = '-';


			notify.description = textNotify;
			notify.link = l;
			notify.subject = `Creaste una publicación`;

			var r = {
				'datosRetorno': notify,
				'url': url,
				'url2': url2,
				'template': template,
				'email': infoPost.user.email,
				// 'email': 'alvarosego01@gmail.com',
				'name': infoPost.user.name,
				'textButton': 'Ver publicación',
				'textButton2': 'Ver factura',
				'textEmail': description,
				'infoPay': infoPay
			}

			return r;


			break;
		case "nPublicationExpiration":
			description = `Una de tus publicaciones llamada (${infoPost.title}) tiene pocos días (${infoPost.days}) de expiración en la plataforma ${WEBNAME}. íe recomendamos extender su tiempo de expiración ahora.`;

			var textNotify = `Una de tus publicaciones llamada (${infoPost.title}) tiene pocos días (${infoPost.days}) de expiración. Te recomendamos extender su tiempo de expiración ahora.`;

			var vd = {
				verify: true,
				email: infoPost.user.email,
				type: 'publicExtension',
				role: infoPost.user.role
			}
			var token = jwt.sign({ publication: vd }, SEED, { expiresIn: '7d' });

			var url = `${SITENAME}/${PATHSEMAIL.infoPublication}/${infoPost._id}`;
			var url2 = `${SITENAME}/${PATHSEMAIL.paymentProcess}/${infoPost._id}?t=${token}`;
			template = 'createPublication';

			var l = {
				'public': url,
				'extendTime': url2
			}

			l = JSON.stringify(l);

			notify.description = textNotify;
			notify.link = l;
			notify.subject = `Poco tiempo de expiración en una de tus publicaciones`;


			var r = {
				'datosRetorno': notify,
				'url': url,
				'url2': url2,
				'template': template,
				'email': infoPost.user.email,
				// 'email': 'alvarosego01@gmail.com',
				'name': infoPost.user.name,
				'textButton': 'Ver publicación',
				'textButton2': 'Extender tiempo',
				'textEmail': description,
				'infoPay': ''
			}


			return r;

			break;
		case "nPublicationExtensionDays":

			description = `Has realizado una extensión de expiración en tu publicación llamada (${infoPost.title}) en la plataforma ${WEBNAME}.`;

			var textNotify = `Has realizado una extensión de expiración en tu publicación llamada (${infoPost.title}).`;

			var url = `${SITENAME}/${PATHSEMAIL.infoPublication}/${infoPost._id}`;
			var url2 = `${SITENAME}/${PATHSEMAIL.infoBilling}/`;
			template = 'createPublication';
			var l = {
				'public': url,
				'billing': url2
			}
			l = JSON.stringify(l);
			var infoPay = '';


			notify.description = textNotify;
			notify.link = l;
			notify.subject = `Se extendió el tiempo de expiración en tu publicación`;

			var r = {
				'datosRetorno': notify,
				'url': url,
				'url2': url2,
				'template': template,
				// 'email': infoPost.user.email,
				'email': infoPost.user.email,
				'name': infoPost.user.name,
				'textButton': 'Ver publicación',
				'textButton2': 'Ver factura',
				'textEmail': description,
				'infoPay': infoPay
			}

			return r;

			break;

		default:
			break;
	}

}



app.get('/:id',
	[mdAutentication.verificaToken, mdAutentication.verificaAdminRoleoMismoUser],
	(req, res, next) => {

		var id = req.params.id;

		Notify.find({
			_id: id,
			idUser: req.usuario._id
		}).exec((err,Notify)=> {

			Notify = Notify[0];
			if (err) {

				json.message = err;
				json.status = 500;
				json.data = null;
				json.ok = false;
				return res.status(500).json(json);

			}
			if (!Notify)
			{
				//if user not exists, return the error with status 400 bad request
				json.message = 'No se encontró la notificación';
				json.data = null;
				json.status = 400;
				json.ok = false;
				return res.status(400).json(json);
			}

			Notify.read = true;

			Notify.save((err, notifySaved)=>
			{
				if (err)
				{
					//if exists problem for update user, return sttus 400

					json.message = 'Error al actualizar notificación';
					json.data = null;
					json.status = 400;
					json.ok = null;

					return res.status(400).json(json);
				}

				json.message = 'Notificación encontrada';
				json.data = notifySaved;
				json.status = 200;
				json.ok = true;

				return res.status(200).json(json);
			});

		});

	});

app.get('/',
	[mdAutentication.verificaToken],
	(req, res, next) => {

		var id = req.params.id;

		const options = {
			page: dataPaginador.page,
			limit: 12,
			sort: { '_id': -1 },
			customLabels: myCustomLabels
			// select: "-pass"

		};

		Notify.paginate({
			idUser: req.usuario._id
		},
			options,
			(err, result) => {

			if (err) {

				json.message = err;
				json.status = 500;
				json.data = null;
				json.ok = false;
				return res.status(500).json(json);

			}
			json.message = 'Notificaciones encontradas';
			json.data = {
				registros: result.itemsList,
				paginador: result.paginator
			}

			// json.paginator = result.paginator;


			if (result.length == 0) {
				json.message = 'Notificaciones no encontrados';
				json.data = null;
			}

			json.status = 200;
			json.ok = true;
			return res.status(200).json(json);


		});

	});

//añade una notificación a la palestra con los datos de que genero la notificación,
//la publicacion y el dueño de la publicacion
app.post('/',
	[mdAutentication.verifyValidate],
	(req, res, next) => {
		var body = req.body;
		// var small = setSmall(body.type);
		//console.log('entrada notif', body);
		var notify = new Notify
			({
				idUser: (body.idUser) ? body.idUser : null,
				idPost: (body.idPost) ? body.idPost : null,
				idForeign: (req.usuario) ? req.usuario : null,
				type: body.type,
				description: '',
				subject: '',
				// typeSmall: small
			});
			// ////console.log('el maldito body', body);

			let promNotify = new Promise(function (resolve, reject) {
				// proceso para obtener todas las configuraciones del email  que se enviará
				let x = notify;
				let adicional = {};
				if(body.newEmail && body.newEmail != ''){
					// ////console.log('al añadir new email', body.newEmail)
					adicional.newEmail = body.newEmail;
				}
				adicional = (Object.keys(adicional).length === 0)? null: adicional;
				////console.log('el x', adicional);
				resolve(setSubject(x, adicional));

			});

			// return res.end();
		// return res.end();
		promNotify.then(d => {

			notify = d.datosRetorno;
			var toast = (d.toast && d.toast != '')? d.toast : null;
			////console.log('retorno notify', toast)
			// return res.end();
			if (body.type != 'nAccountDeleted') {
				notify.save((error, notifySaved) => {
					if (error) {
						json.message = error;
						json.data = 'prueba';
						json.status = 400;
						json.ok = false;
						return res.status(400).json(json);
					}

					// ////console.log('notifi guardada', notifySaved);
					// ya que carga la notificacion, se envia el email
					mail.sendEmailNotify(d);

					json.message = (toast && toast != null)? toast : 'Notificado!';
					json.data = null;
					json.status = 201;
					json.ok = true;
					return res.status(201).json(json);
				});
			} else {
				mail.sendEmailNotify(d);


				json.message = (toast && toast != null)? toast : 'Notificado!';
				////console.log(json.message);
				json.data = null;
				json.status = 201;
				json.ok = true;
				return res.status(201).json(json);


			}


		});
	});


//borra una notificación en base al id de la misma
app.delete('/:n',
	[mdAutentication.verificaToken, mdAutentication.verificaAdminRoleoMismoUser],
	(req, res, next) => {
		Notify.findByIdAndRemove({ _id: req.params.n }, (error, notifyDeleted) => {
			if (error) {
				json.message = 'Error al buscar la notificación';
				json.data = null;
				json.status = 500;
				json.ok = false;

				return res.status(500).json(json);
			}

			if (!notifyDeleted) {
				json.message = 'No se encontró la notificación';
				json.data = null;
				json.status = 400;
				json.ok = false;

				return res.status(400).json(json);
			}

			json.message = 'Notificación eliminada';
			json.data = notifyDeleted;
			json.status = 200;
			json.ok = true;

			return res.status(200).json(json);
		});

	});



module.exports = app;



