//ME JALO LAS LIBRERIAS NECESARIAS
var mongoose = require('mongoose');

var moment = require('moment');
var dateMoment = moment();
moment.locale('es');
// var dateMoment = moment();

//GENERO REGLAS DE ENUM
var tipo =
{
    values: ['Servicio', 'Producto'],
    response: '{VALUE} no es un tipo de publicación permitido'
}
const mongoosePaginate = require('mongoose-paginate-v2');


var paymentProcess ={
	values: ['Completed', 'onProcess'],
	response: ['{VALUE} no es un estado de pago permitido']
}


//GENERO EL SCHEME
var Scheme = mongoose.Schema;


var _reactionsComent = new Scheme({
	reaction: {
		type: String,
		required: false,
		default: null
	}, //like o dislike
	idUser: {
		type: String,
		required: false,
		default: null
	} //id de quien dio la reaccion
});
var _comentario = new Scheme({

	idUser: {
		type: String,
		required: false,
		default: null
	},//codigo del usuario que comento
	userName: {
		type: String,
		required: false,
		default: null
	},//nombre del user que comento
	text: {
		type: String,
		required: false,
		default: null
	},//comentario
	index: {
		type: String,
		required: false,
		default: null
	},//indice del omentario
	created_at: {
		type: String,
		required: false,
		default: null
	},//fecha de creacion
	reactions: [_reactionsComent]
});
	// userData: null



var _infoContact = new Scheme({

	 email: {
        type: String,
        required: false,
        default: null
    },
     phone: {
        type: String,
        required: false,
        default: null
    },
     celPhone: {
        type: String,
        required: false,
        default: null
    },


})




var socialNet = new Scheme
({
	facebook:
	{
		type:String,
		required: false
	},
	whatsapp:
	{
		type:String,
		required: false
	},
	instagram:
	{
		type:String,
		required: false
	},
	web:
	{
		type:String,
		required: false
	},
});

var comment = new Scheme
({
	idUser:
	{
		type:String,
		required: [true, 'Se requiere el id de quien comentó']
	},//codigo del usuario que comento
	userName:
	{
		type:String,
		required: [true, 'Se requiere el nombre de quien comentó']
	},//nombre del user que comento
	text:
	{
		type:Array,
		required: [true, 'Se requiere el id de quien comentó']
	},//comentario
	index:
	{
		type:Number,
		required: [true, 'Se requiere un indice de orden']
	},//indice del omentario
	created_at:
	{
		type:Date,
		required: true
	}//fecha de creacion
});

var _cityTarget = new Scheme({


    department: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    }

  });
var _rangoPrize = new Scheme({

    min: {
        type: String,
        required: true
    },

    max: {
        type: String,
        required: true
    }


  });

var _category = new Scheme({

    principal: {
        type: String,
        required: false
    },

    child: {
        type: String,
        required: false
	},

    _principal: {
        type: Scheme.Types.ObjectId,
		ref: 'Category',
		required: [false, 'Debe existir un usuario válido para publicar'],
		// index: true
		// type:Scheme.Types.ObjectId,

    },
	_child: {
		type: Scheme.Types.ObjectId,
		ref: 'Category._child',
	}

  });

var _files = new Scheme({

    type: {
        type: String,
        required: false
    },

    file: {
        type: String,
        required: false
    },

    format: {
        type: String,
        required: false
    },

    folder: {
        type: String,
        required: false
    }



  });

var _target = new Scheme({


    tag: {
        type: String,
        required: false
    }

});


var _adminReasons = new Scheme({

	reasons:
	{
		type:String,
		required: false
	},// titulo de la publicacion

	changeFiles:
	{
		type:Boolean,
		required: false,
		default: false
	},//determinada por el admin si puede o no ser visible


	changed:
	{
		type:Boolean,
		required: false,
		default: false
	},//determinada por el admin si puede o no ser visible

	active:
	{
		type:Boolean,
		required: false,
		default: false
	},//determinada por el admin si puede o no ser visible


	califDate:
	{
		type:String,
		required:false,
		default: null
	},//f


});

//CREO EL MODELO COMO TAL

var postScheme = new Scheme
({

	title:
	{
		type:String,
		required:[true, 'Nombre de la publicación es necesario']
	},// titulo de la publicacion



	content:
	{
		type:String,
		required:[false,'Debe incluir datos de lo contenido en el producto']
	},//tipo de producto o servicio que se ofrece

	notContent:
	{
		type:String,
		required:[true,'Debe incluir datos de lo que no contiene el producto']
	},//tipo de producto o servicio que se ofrece

	view:
	{
		type:Number ,
		required:false,
		default: 0
	},//visitas a la publiacion

	days:
	{
		type:Number,
		required:false
	},//dias en que estará activa la publicación

	user:
	{
		type:Scheme.Types.ObjectId,
		ref:'User',
		required: [true, 'Debe existir un usuario válido para publicar']
	},//usuario dueño de la publicación



	// department:
	// {
	// 	type:String,
	// 	required: [true, 'Debe existir un departamento válido para publicar']
	// },//departamento?
	// city:
	// {
	// 	type:String,
	// 	required: [true, 'Debe existir un municipio válido para publicar']
	// },//ciudad?

		type:
	{
		type:String,
		required:[true, 'Debe definir el tipo de publicación'],
		enum: tipo
	},//si es producto o servicio

		img:
	{
		type:String,
		required: [false, 'Debe existir un municipio válido para publicar']
	},//ciudad?
	_infoContact: _infoContact,
	_cityTarget: [_cityTarget],
	_category: [_category],
	_rangoPrize: _rangoPrize,
	_files: [_files],
	_socialNet: socialNet, //vergas de redes sociales.required,
	_target: [_target],

		points:
	{
		type:Number,
		required:false
	}, //puntuacion de la publicacion


	status:
	{
		type:Boolean,
		required: false,
		default: false
	},//determinada por el admin si puede o no ser visible


	verify_at:
	{
		type:String,
		required:false,
		default: null
	},//fecha de cuando el admin revisó

	created_at:
	{
		type:String,
		required:false,
		default: dateMoment.format('LL')
	},//fecha de cuando fue creado

	updated_at:
	{
		type:String,
		required:false,
		default: null
	},//fecha de cuando fue modificado

	finished_at:
	{
		type:String,
		required:false,
		default: null
	},//fecha de cuando fue finalizará


	reactions:
	{
		type:Array,
		required:false
	},//si es like o dislike

	stars:
	{
		type:Array,
		required:false
	},//ranking mediante estrellas

	_comments: [_comentario],

	_adminReasons: _adminReasons,

	thumbnail: {
		type:String,
		required:false,
		default: null
	},
	typePost: {
		type:String,
		required: true,
		default: 'Publicación'
	},
	payProcess: {
		type: String,
		required: false,
		enum: paymentProcess
	}


});




postScheme.plugin(mongoosePaginate);

module.exports = mongoose.model('Post', postScheme);


