var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var moment = require('moment');
moment.locale('es');
var dateMoment = moment();
// var dateMoment = moment();
var roles =
{
    values: ['ADMIN_ROLE', 'CLIENTE_ROLE', 'EMPRESA_ROLE'],
    response: '{VALUE} no es un role permitido'
}

const mongoosePaginate = require('mongoose-paginate-v2');



var Scheme = mongoose.Schema;



var _localization = new Scheme({

    longitude: {
        type: String,
        required: false,
        default: null
    },

    latitude: {
        type: String,
        required: false,
        default: null
    },

    mapUrl: {
        type: String,
        required: false,
        default: null
    }




});

var _economicActivity = new Scheme({

     typeActivity:
    {
        type: String,
        required: [false, 'Tipo actividad economica necesaria'],
        default: null
    },
    details:
    {
        type: String,
        required: [false, 'Detalles actividad necesario'],
        default: null
    },

});
var _phoneCompany = new Scheme({

    phonesCompany: {
        type: String,
        required: false
    },

    typePhone :{
        type: String,
        required: false,
        default: null
    }

  });

var pymeSchema = new Scheme({
    nameCompany:
    {
        type: String,
        required: [true, 'Nombre de la empresa es necesario']
    },
    nit:
    {
        type: String,
        required: [true, 'El NIT es necesario']
    },
    socialReason:
    {
        type: String,
        required: [true, 'La razón social es necesaria']
    },
    direction:
    {
        type: String,
        required: [true, 'La dirección de empresa es necesaria']
    },

    logo:
    {
        type: String,
        required: false,
        default: null
    },
    // companyPhones: [_phoneCompany],
    // economicActivity: [_economicActivity]
});

// pymeSchema.plugin(uniqueValidator, { response: '{PATH} debe ser único' });
// module.exports = mongoose.model('Pyme', pymeSchema);

var userScheme = new Scheme
    ({
        name:
        {
            type: String,
            required: [true, 'Nombre es necesario']
        },
     surname:
        {
            type: String,
            required: [true, 'Apellido es necesario']
        },

        year:
        {
            type: Number,
            // unique: true,
            required: [false, 'Edad es necesario']
        },

        identification:
        {
            type: String,
            required: [true, 'Identificación es necesaria']
        },

        typeId:{
             type: String,
            required: [true, 'Tipo de identificación es necesaria']

        },

        gender:
        {
            type: String,
            // unique: true,
            required: [true, 'Género es necesario']
        },

        email:
        {
            type: String,
            // unique: [true, {response: 'Email debe ser único' }],
            unique: true,
            required: [true, 'Email es necesario']
        },

        phone:
        {
            type: String,
            // unique: true,
            required: [false, 'Teléfono es necesario']
        },

        celPhone:
        {
            type: String,
            // unique: true,
            required: [false, 'Teléfono celular es necesario']
        },

        department:
        {
            type: String,
            required: [true, 'El departamento es necesario']
        },
        city:
        {
            type: String,
            required: [true, 'La ciudad  es necesaria']
        },


        pass:
        {
            type: String,
            required: [true, 'La contraseña es necesaria']
        },
        positionCompany:
        {
            type: String,
            required: false,
            default: null
        },

        receiveEmail:
        {
            type: Boolean,
            required: false,
            default: true
        },

        termsCondition:
        {
            type: Boolean,
            required: false,
            default: true
        },

        //   mapUrl:
        // {
        //     type: String,
        //     required: false,
        //     default: null
        // },


        imgProfile:
        {
            type: String,
            required: false,
            default: null
        },

        role:
        {
            type: String,
            required: true,
            default: 'CLIENTE_ROLE',
            enum: roles
        },

        preference:
        {
            type: Array,
            required: false
        },

        status:
        {
            type: Boolean,
            // required: true,
            default: true
        },

        created_at:
        {
            type: String,
            // required: false,
            default: dateMoment.format('LL')
        },

        updated_at:
        {
            type: String,
            // required: false,
            default: null
        },

        firstTime:
        {
            type: Boolean,
            // required: false,
            default: true
        },

        verify:
        {
            type: Boolean,
            // required: true,
            default: false
        },

    view:
    {
        type:Number ,
        required:false,
        default: 0
    },//visitas a la publiacion


    negocioName:
    {
        type: String,
        required: false,
        default: null
    },


        _dataPyme: pymeSchema,
        _naturalEconomicActivity: [_economicActivity],
        _companyPhones: [_phoneCompany],
        _mapUrl: _localization

    });

userScheme.plugin(uniqueValidator, { message: '{PATH} ya está registrado en sistema' });
// userScheme.plugin(uniqueValidator, {  });

userScheme.plugin(mongoosePaginate);

module.exports = mongoose.model('User', userScheme);








