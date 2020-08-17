var mongoose = require('mongoose');

var Scheme = mongoose.Schema;
//modelo esquema de membresias y planes



var planScheme = new Scheme
({
    offer:
    {
        type:Number,
        required: false,
        default: 0
    },//oferta de planes

    extension:
    {
        type:Boolean,
        required: false,
        default: 0
    }//mes de oferta?
});

memberScheme = new Scheme
({
    name:
    {
        type:String,
        required:[true, 'Debe asignar un nombre al plan de membresía'],
        unique:true
    },//nombre de la membresia

    months:
    {
        type:Number,
        required:[true, 'Debe asignar cantidad de meses al plan']
    },

    description:
    {
        type:String,
        required:[true, 'Debe asignar una descripción al plan de membresía']
    },//de que trata esta membresia

    _refPlan: planScheme,// donde irá el modelo artificial que incluira los planes de descuentos

    created_at:
    {
        type:Date,
        required: true,
        default: null
    },//cuando fue creado

    updated_at:
    {
        type:Date,
        required: false,
        default: null
    }// cuando fue actualizado

});

module.exports = mongoose.model('Membership', memberScheme);