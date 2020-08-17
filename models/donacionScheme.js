var mongoose = require('mongoose');

var Scheme = mongoose.Schema;

var donacionScheme = new Scheme(
    {
        cedula : {
            type: String,
            required: [true, 'Cedula es necesaria']
        },
        fecha : {
            type : Date,
            required : [true, 'Fecha de donacion es requerida']
        },
        banco : {
            type : String,
            required : [true, 'Banco de sangre es requerido']
        }
    }
)

module.exports = mongoose.model( 'Donaciones', donacionScheme, 'Donaciones');
