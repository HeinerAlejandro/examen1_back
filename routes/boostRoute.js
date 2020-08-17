import express from 'express';
import Powers from '../models/pwrScheme';
let app = express();

const dateMoment = moment().locale('es');

const json =
{
	message: 'OK, Im post route',
	status: 200,
	ok: true,
	data: 'OK, Im post route'
};



app.get('/', async (req, res, next)=>
{
    let result = await Powers.find();

    result = result.filter(item =>{ return item.visible !== false; });

    if (result)
    {
        json.message = 'Boosts encontrados';
        json.data = result;
        return res.status(200).json(json);
    }else
    {
        json.message = 'Boosts no encontrados';
        json.data = null;
        return res.status(400).json(json);
    }
});

app.post('/create', async (req, res, next)=>
{
    let body = req.body;

    try
    {
        const boost = await Powers.create(body);
        json.message = "Boost de publicacion cargado";
        json.data = boost;
        res.status(201).json(json);

    } catch (error)
    {
        json.message = "Ocurrió un problema";
        json.data = null;
        res.status(500).json(json);
    }
});

app.put('/modify', (req, res, next)=>
{
    const body = req.body;

    Powers.findById( id ,(error,powers)=>
	{
		if (error)
		{
			//if error exists, return the error with status 500
			json.message = 'Error al buscar la categoria';
			json.data = null;
			json.status = 500;
			json.ok = false;

			return res.status(500).json(json);
		}

		if (!powers)
		{
			//if powers not exists, return the error with status 400 bad request
			json.message = 'No se encontró la categoria';
			json.data = null;
			json.status = 400;
			json.ok = false;

			return res.status(400).json(json);
        }

        powers = body;

        powers.save((err, powersSaved)=>
        {
            if (err)
            {
            	//if exists problem for update powers, return sttus 400

                json.message = 'Error al modificar sub categoria!';
                json.data = null;
                json.status = 400;
                json.ok = null;

                return res.status(400).json(json);
            }


            json.message = 'Subcategoria modificada';
    		json.data = powersSaved;
    		json.status = 200;
    		json.ok = true;

            return res.status(200).json(json);
        });
	});
});

app.put('/restore/:powers',
async (req, res, next) =>
{
    let aux = await Powers.findById(req.params.powers);
	aux.visible = true;

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

app.delete('/remove/:powers',
async (req, res, next) =>
{
    let aux = await Powers.findById(req.params.powers);
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

app.delete('/destroy/:power',
(req, res, next) =>
{
    Powers.findByIdAndRemove({_id:req.params.power}, (error, powersDeleted)=>
    {
        if (error)
        {
            json.message = 'Error al buscar la notificación';
			json.data = null;
			json.status = 500;
			json.ok = false;

			return res.status(500).json(json);
		}

		if (!powersDeleted)
        {
            json.message = 'No se encontró la notificación';
			json.data = null;
			json.status = 400;
			json.ok = false;

			return res.status(400).json(json);
		}

        json.message = '¡Notificación eliminada!';
    	json.data = powersDeleted;
    	json.status = 200;
    	json.ok = true;

        return res.status(200).json(json);
    });

});