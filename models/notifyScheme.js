var mongoose = require('mongoose');
var moment = require('moment');
var dateMoment = moment();
moment.locale('es');
const mongoosePaginate = require('mongoose-paginate-v2');

var TYPENOTIFY = require('../config/config').TYPENOTIFY;

var Scheme = mongoose.Schema;

var moment = require('moment');
var dateMoment = moment();
moment.locale('es');
// var dateMoment = momen

var taux = TYPENOTIFY.auth.concat(TYPENOTIFY.noAuth)

var notyfType =
{
    values: taux,
    response: '{VALUE} no es un tipo de notificación permitida'
}

var notifyScheme = new Scheme
    ({
        idPost:
        {
            type: String,
            required: false,
            default: null
        },//codigo id del post

        idUser:
        {
            type:Scheme.Types.ObjectId,
            ref:'User',
            required: [true, 'Debe existir un usuario válido para publicar']
        },//propietario del post realizado

        idForeign:
        {
            type: String,
            required: false,
            default: null
        },//codigo id del usuario que interactuo con el post o con el user

        description:
        {
            type: String,
            required: [true, 'Se necesita una descripción para el asunto de la notificación']
        },

        subject:
        {
            type: String,
            required: true
        },

        link:
        {
            type: String,
            required: false,
            default: null
        },

        type:
        {
            type: String,

            required: true,
            enum: notyfType
        },
        // typeSmall:
        // {
        //     type: String,
        //     required: true,
        // },

        created_at:
        {
            type:String,
            required:false,
            default: dateMoment.format('LL')
        },//fecha de cuando fue creado

        read:
        {
            type:Boolean,
            // required:false,
            default: false
        },//fecha de cuando fue creado


    });

    notifyScheme.plugin(mongoosePaginate);
module.exports = mongoose.model('Notify', notifyScheme, 'Notify');