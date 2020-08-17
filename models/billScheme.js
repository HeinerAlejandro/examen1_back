const mongoose  = require('mongoose');
const moment    = require('moment');

moment.locale('es');
const dateMoment = moment();

const Scheme = mongoose.Schema;



const billScheme = new Scheme
({

    visible:
    {
        type:Boolean,
        required:true,
        default:true
    },//codigo del usuario

	user:
	{
		type:Scheme.Types.ObjectId,
		ref:'User',
		required: [true, 'Debe existir un usuario válido para publicar']
	},//usuario dueño

    description:
    {
        type: Array,
        required:[true, 'Se necesita una descripción para la factura']
    },//los items desde el post pasando por los planes hasta el boost

    price:
    {
        type:String,
        required:[true, 'Debe indicar el precio de la compra']
    },//costo de la factura total

    created_at:
    {
        type: String,
        required:true,
        default: dateMoment.format('LL')
    }//fecha de creación

});

module.exports = mongoose.model('Bill', billScheme, 'Bill');