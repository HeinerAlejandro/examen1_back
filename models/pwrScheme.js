const mongoose = require('mongoose');
const moment   = require('moment');

moment.locale('es');
const dateMoment = moment();
const Scheme = mongoose.Schema;

const _audience = new Scheme
({
    year:
    {
        type: Array,
        required:[true, 'Rango de edad de audiencia y/o público'],
    },

    gender:
    {
        type: Array,
        required:[true, 'Sexo de la audiencia y/o píblico']
    },

    status:
    {
        type: Array,
        required:[true, 'Estado civil a quienes va dirigido tu publicación']
    },

    description:
    {
        type: String,
        required:[true, 'Descripción mas detallada de la audiencia y/o público']
    }
});//AUDIENCIA A LA QUE VA DIRIGIDA EL POST

const _daysReamming= new Scheme({
    inicio: {
        type: String
    },
    finalizacion: {
        type: String
    },
    totalDays: {
        type: Number
    }
})

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

const boostSchema = new Scheme
({
    visible:
    {
        type:Boolean,
        required:true,
        default:true
    },//borrado logico

    name:
    {
        type: String,
        required:[true, 'Debe indicar un nombre al boost de publicación']
    },// NOMBRE DEL POST

    redesPublico: {
        type: Array
    },

    daysReamming: _daysReamming,

    _cityTarget: [_cityTarget],

    price:
    {
        type: String,
        required: [true, 'Debe indicar el costo del boost de publicación'],
    },// PRECIO DEL BOOST

    audience:[_audience],//AUDIENCIA DIRIGIDA

    palabrasBuscador: {
        type: String
    },

    created_at:
    {
        type: Date,
        default: dateMoment.format('LL')
    },//FECHA DE CREACION
    status: {
        type: Boolean,
        default: false,
    }

});


// 	planPauta: x,//JSON.stringify(x),
		// 	redesPublico: (forma.value.redesPublico != null && forma.value.redesPublico != '')? forma.value.redesPublico: 'No aplica',
		// 	generoObj: this.generoObj, //JSON.stringify(this.generoObj),
		// 	edadesObj: this.edadesObj, //JSON.stringify(this.edadesObj),
		// 	estadoCivilObj: this.estadoCivilObj, //JSON.stringify(this.estadoCivilObj),
		// 	cuentaPublico: this.ngCuentaPublico,
		// 	palabrasBuscador: (this.palabrasBuscador != null && this.palabrasBuscador != '')? this.palabrasBuscador: 'No aplica',
		// 	fechas: this.fechas, //JSON.stringify(this.fechas),
		// 	cityTargets: this.cityTargets, //JSON.stringify(this.cityTargets),

module.exports = mongoose.model('Boost', boostSchema, 'Boost');