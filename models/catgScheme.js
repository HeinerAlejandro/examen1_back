var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var moment = require('moment');
var dateMoment = moment();
moment.locale('es');

var Scheme = mongoose.Schema;

var child = new Scheme
({
    name:
    {
        type: String,
        required:[false, 'Se debe asignar un nombre a la subcategoria'],
        unique: false
    }
});



var categoryScheme = new Scheme
({
    _category:
    {
        type:String,
        required:[true, 'Debe asignar un nombre a la categoria'],
        unique: false
    },

    _child: [child],


    created_at:
    {
        type: String,
        required:true,
        default: dateMoment.format('LL')
    }
});

categoryScheme.plugin(uniqueValidator, {response: '{PATH} debe ser único'});

module.exports = mongoose.model('Category', categoryScheme);



