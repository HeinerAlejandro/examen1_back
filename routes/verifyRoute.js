var express = require('express');
var Post = require('../models/postScheme');
var moment = require('moment');
var dateMoment = moment();
moment.locale('es');


var mdAutentication = require('../middleware/autenticacion');


//inicializamos express
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
RUTA ENCARGADA DE VERIFICAR NO SOLO PUBLICACIONES SINO OTROS TEMAS REQUERIDOS
*/
/////////////////////////////////////COMMENT//////////////////////////////////


app.post('/decodeUrl', [mdAutentication.decodeURL] , (req, res, next) => {

	// var body = req.body;
		// ////console.log('finalmente el descifre', req.decoded);

		if(!req.decoded || req.decoded != ''){
				json.message = 'Acceso permitido';
				json.data = req.decoded,
				json.status = 200;
				json.ok = true;
				return res.status(200).json(json);
		}


});



/*
Ruta administrativa que se encargará de validar la publicaion y volverla visible
*/
app.post('/:p/:u',[mdAutentication.verificaToken ,mdAutentication.verificaAdminRole],(req,res,next)=>
{
	var body = req.body; //cuerpo para la verificación
	var p = req.params.p; //recibe el id de la publicacion
	var u = req.params.u; //recibe el id del usuario que hizo la publicacion


	Post.findById({_id:p, user:u}, (error,post)=>
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

		post.status = body.status;
		post.verify_at = dateMoment.format('LL');dateMoment.format('LL');
		////////console.log('el maldito status', post.status);
		if(post.status == true){
			if(post._adminReasons){

				post._adminReasons.changed = true,
				post._adminReasons.active = false,
				post._adminReasons.califDate = dateMoment.format('LL'),
				post._adminReasons.changeFiles = false;

			}

		}

		if(post.status == false){
			var i = {
				reasons: (body.reasons.reason != '')? body.reasons.reason: 'Sin razones',
				changeFiles: (body.reasons.changeFile == 'si')? true: false,
				changed: false,
				active: true,
				califDate: dateMoment.format('LL')
			}
			post._adminReasons = i;
		}


        post.save((err, postSaved)=>
        {
            if (err)
            {
            	//if exists problem for update user, return sttus 400

                json.message = 'Error al verificar la publicación!';
                json.data = null;
                json.status = 400;
                json.ok = null;

                return res.status(400).json(json);
            }

            json.message = (body.status == true)?'¡Publicación aprobada!': 'Publicación no aprobada';
    		json.data = postSaved;
    		json.status = 200;
    		json.ok = true;

            return res.status(200).json(json);
        });
	});
});




module.exports = app;