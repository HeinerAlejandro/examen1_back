const  express         = require('express');
const  Bill            = require('../models/billScheme');
const  User            = require('../models/userScheme');
const  moment          = require('moment');

const dateMoment = moment().locale('es');

const json =
{
	message: 'OK, Im post route',
	status: 200,
	ok: true,
	data: 'OK, Im post route'
};

// se inicializa express
const app = express();

app.get('/', (req, res, next) =>
{
    Bill.find().exec((error,response)=>
	{
		if(error)
		{
			json.message = error;
			json.status = 500;
			json.data = null;
			json.ok = false;
			return res.status(500).json(json);
		}

		response = response.filter(item =>{ return item.visible !== false; });
		
		json.message = '¡Facturas encontradas!';
		json.data = response;

		if (response.length == 0)
		{
			json.message = 'Facturas no encontradas';
			json.data = null;
		}

		json.status = 200;
		json.ok = true;
		return res.status(200).json(json);
	});

});

app.get('/:id', (req, res, next) =>
{
    let id = req.params.id;

    Bill.find({'userId':id}).exec((error,response)=>
	{
		if(error)
		{
			json.message = error;
			json.status = 500;
			json.data = null;
			json.ok = false;
			return res.status(500).json(json);
		}

		json.message = '¡Facturas encontradas!';
		json.data = response;

		if (response.length == 0)
		{
			json.message = 'Facturas no encontradas';
			json.data = null;
		}

		json.status = 200;
		json.ok = true;
		return res.status(200).json(json);
	});

});

app.post('/', async (req, res, next) =>
{
    const body = req.body;
	const userBill = await User.findById(body.userId);

	const bill = new Bill
	({
		user          :
		{
			_id: 	userBill._id,
			name:	userBill.name,
			email:	userBill.email,
			type:	userBill.type
		},
		description   : body.description,
		price: body.price,
        days          : 12,
	});

	try 
	{
		let aux = await bill.save();
		json.message = 'Factura creada, ¡gracias por su compra!';
		json.data = aux;
		return res.status(200).json(json);

	} catch (error) 
	{

		return res.status(200).json(error);
	}

	
});

app.put('/restore/:bill',
async (req, res, next) =>
{
    let aux = await Bill.findById(req.params.bill);
	aux.visible = true;

	try 
	{
		aux.save();	
		json.message = 'Elemento restaurado =)';
		json.data = aux;
		return res.status('200').json(json);

	} catch (error) 
	{
		json.message = 'Ha ocurrido un error, por favor intente nuevamente';
		json.data = null;
		json.ok = false;
		json.status = 500;
		return res.status('200').json(json);
	}
});

app.delete('/remove/:bill',
async (req, res, next) =>
{
    let aux = await Bill.findById(req.params.bill);
	aux.visible = false;

	try 
	{
		aux.save();	
		json.message = 'Elemento pasado a reciclaje, puede recuperarlo cuando desee';
		json.data = aux;
		return res.status('200').json(json);

	} catch (error) 
	{
		json.message = 'Ha ocurrido un error, por favor intente nuevamente';
		json.data = null;
		json.ok = false;
		json.status = 500;
		return res.status('200').json(json);
	}
});

app.delete('/destroy/:bill',
(req, res, next) =>
{
    Bill.findByIdAndRemove({_id:req.params.bill}, (error, billDeleted)=>
    {
        if (error)
        {
            json.message = 'Error al buscar la notificación';
			json.data = null;
			json.status = 500;
			json.ok = false;

			return res.status(500).json(json);
		}

		if (!billDeleted)
        {
            json.message = 'No se encontró la factura';
			json.data = null;
			json.status = 400;
			json.ok = false;

			return res.status(400).json(json);
		}

        json.message = '¡Factura eliminada!';
    	json.data = billDeleted;
    	json.status = 200;
    	json.ok = true;

        return res.status(200).json(json);
    });

});

module.exports = app;

