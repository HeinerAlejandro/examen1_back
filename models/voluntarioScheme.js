

var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var moment = require('moment');
moment.locale('es');
var dateMoment = moment();
// var dateMoment = moment();

const mongoosePaginate = require('mongoose-paginate-v2');

var Scheme = mongoose.Schema;





var userScheme = new Scheme
    ({
        Nombre:
        {
            type: String,
            required: [true, 'Nombre es necesario']
        },
     Apellido:
        {
            type: String,
            required: [true, 'Apellido es necesario']
        },

        Edad:
        {
            type: Number,
            // unique: true,
            required: [false, 'Edad es necesario']
        },

        Cedula:
        {
            type: String,
            required: [true, 'Cedula es necesaria']
        },

        Genero:
        {
            type: String,
            // unique: true,
            required: [true, 'Género es necesario']
        },
        TipoSangre:
        {
            type: String,
            // unique: true,
            required: [true, 'Tipo de sangre es necesario']
        },

        Email:
        {
            type: String,
            // unique: [true, {response: 'Email debe ser único' }],
            unique: true,
            required: [true, 'Email es necesario']
        },

        Telefono:
        {
            type: String,
            // unique: true,
            required: [false, 'Teléfono es necesario']
        },


        DonanteSangre:
        {
            type: String,
            required: [true, 'Donante de sangre es necesario'],
        },

        Fundacion:
        {
            type: String,
            required: [true, 'La fundacion es necesario']
        },

        Estado:
        {
            type: String,
            required: [true, 'El departamento es necesario']
        },
        Ciudad:
        {
            type: String,
            required: [true, 'La ciudad  es necesaria']
        },


        Pass:
        {
            type: String,
            required: [true, 'La contraseña es necesaria']
        },

        Cargo:
        {
            type: String,
        required: [true, 'Cargo es necesario']
        },


        Img:
        {
            type: String,
            required: false,
            default: null
        },


        RegistradoEn:
        {
            type: String,
            // required: false,
            default: dateMoment.format('LL')
        },


    });

userScheme.plugin(uniqueValidator, { message: '{PATH} ya está registrado en sistema' });
// userScheme.plugin(uniqueValidator, {  });


module.exports = mongoose.model( 'Voluntarios', userScheme, 'Voluntarios' );








