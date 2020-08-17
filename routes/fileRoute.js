var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');
var mdAutentication = require('../middleware/autenticacion');
var User = require('../models/userScheme');
var FORMATOIMAGENES = require('../config/config').FORMATOIMAGENES;
var app = express();

// var usrRoutes = require('./routes/userRoute');
// var pstRoutes = require('./routes/postRoute');

// default options
app.use(fileUpload());



// ACTUALIZAR ARCHIVOS
app.put('/:tipo/:id',
	[mdAutentication.verificaToken, mdAutentication.verificaAdminRoleoMismoUser]
	, (req, res, next) => {

		var tipo = req.params.tipo;
		var id = req.params.id;

		if(req.body.type){
			var type = req.body.type;
			// //////////////// // // // // ////////////////console.logog('llega tipo', type);
		}

		// tipos de colección
		var tiposValidos = ['User'];
		if (tiposValidos.indexOf(tipo) < 0) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Tipo de colección no es válida',
				errors: { message: 'Tipo de colección no es válida' }
			});
		}


		if (!req.files) {
			return res.status(400).json({
				ok: false,
				mensaje: 'No selecciono nada',
				errors: { message: 'Debe de seleccionar una imagen' }
			});
		}

		// Obtener nombre del archivo
		var archivo = req.files.imagen;

		var nombreCortado = archivo.name.split('.');
		var extensionArchivo = nombreCortado[nombreCortado.length - 1];

		// Sólo estas extensiones aceptamos
		var extensionesValidas = FORMATOIMAGENES;
		// var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg', 'PNG'];

		if (extensionesValidas.indexOf(extensionArchivo) < 0) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Extension no válida',
				errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
			});
		}

		// Nombre de archivo personalizado
		// 12312312312-123.png
		var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

		// Mover el archivo del temporal a un path
		var path = `./uploads/${tipo}/${id}/${nombreArchivo}`;

		var dir = `./uploads/${tipo}/${id}`;

		if (!fs.existsSync(dir)){
			fs.mkdirSync(dir);
		}else
		{
			// //////////////// // // // // ////////////////console.logog("Directory already exist");
		}

		//////////////// // // // // ////////////////console.logog('la foto que llega', nombreArchivo);
		// return res.end();
		archivo.mv(path, err => {

			if (err) {

				return res.status(500).json({
					ok: false,
					mensaje: 'Error al mover archivo',
					errors: err
				});
			}

			if(type == 'logo'){

				subirPorTipo(tipo, id, nombreArchivo, res, type);
			}else{
				subirPorTipo(tipo, id, nombreArchivo, res);
			}

		})

	});


function subirPorTipo(tipo, id, nombreArchivo, res, type = null) {

	if (tipo === 'User') {

		User.findById(id, (err, User) => {

			if (!User) {
				return res.status(400).json({
					ok: true,
					mensaje: 'Usuario no existe',
					errors: { message: 'Usuario no existe' }
				});
			}

			var pathViejo = '';
			if(type != 'logo'){
				if(User.imgProfile != '' && User.imgProfile != null){
			 pathViejo = `./uploads/User/${User._id}/${User.imgProfile}`;
				}else{
				pathViejo = null;
				}
			}else{
				if(User._dataPyme.logo != '' && User._dataPyme.logo != null){
			 pathViejo = `./uploads/User/${User._id}/${User._dataPyme.logo}`;
				}else{
					pathViejo = null;
				}
			}

			//////////////// // // // // ////////////////console.logog('el path viejo', pathViejo);
			// Si existe, elimina la imagen anterior
			if (fs.existsSync(pathViejo)) {

				// return;

				fs.unlink(pathViejo, (err) => {
					if (err) throw err;
					// //////////////// // // // // ////////////////console.logog( pathViejo, 'was deleted');
				});

			}
			if(type == 'logo'){
				User._dataPyme.logo = nombreArchivo;
			}else{
				User.imgProfile = nombreArchivo;
			}

			User.save((err, UserActualizado) => {

				UserActualizado.pass = ':)';

				return res.status(200).json({
					ok: true,
					mensaje: 'Imagen de Usuario actualizada',
					User: UserActualizado
				});

			})

		});

	}

}



module.exports = app;