var express = require("express");

const Donacion = require("../models/donacionScheme");

var app = express();

var json = {
  message: "OK, Im route",
  status: 200,
  ok: true,
  data: "OK, Im route",
};

app.put("/", async (req, res, next) => {
  var body = req.body;

  var donacion = {
    cedula: body.cedula,
    banco: body.banco,
    fecha: body.fecha,
  };

  await Donacion.findByIdAndUpdate(
    { _id: body._id },
    donacion,
    {
      new: true,
    },
    (error, doc) => {
      if (error)
        return res.status(400).json({ error: "Error findIdAndUpdate" });

      console.log(doc);
      return res.status(200).json(doc);
    }
  );

  // console.log("Donacion Actualizada", donacion);

  // donacion.save((error, donacion) => {
  //   if (error) {
  //     json.message = error;
  //     json.data = null;
  //     json.status = 400;
  //     json.ok = false;
  //     return res.status(400).json(json);
  //   }

  //   json.message = `Donacion registrada`;
  //   json.data = null;
  //   json.status = 201;
  //   json.ok = true;
  //   return res.status(201).json(json);
  // });
});

app.post("/", (req, res, next) => {
  var body = req.body;

  var donacion = new Donacion({
    cedula: body.cedula,
    banco: body.banco,
    fecha: body.fecha,
  });

  console.log("Donacion registrada", donacion);

  donacion.save((error, donacion) => {
    if (error) {
      json.message = error;
      json.data = null;
      json.status = 400;
      json.ok = false;
      return res.status(400).json(json);
    }

    json.message = `Donacion registrada`;
    json.data = null;
    json.status = 201;
    json.ok = true;
    return res.status(201).json(json);
  });
});

app.get("/", (req, res, next) => {
  Donacion.aggregate([
    {
      $lookup: {
        from: "Voluntarios",
        localField: "cedula",
        foreignField: "Cedula",
        as: "donante",
      },
    },
  ]).exec((err, donaciones) => {
    if (err) {
      json.message = err;
      json.status = 500;
      json.data = null;
      json.ok = false;
      return res.status(500).json(json);
    }

    json.message = "Donaciones encontradas";
    json.data = donaciones;

    // console.log("todas donaciones", donaciones);

    if (donaciones.length == 0) {
      json.message = "donaciones no registradas";
      json.data = null;
    }

    json.status = 200;
    json.ok = true;
    return res.status(200).json(json);
  });
});

app.get("/:id", (req, res, next) => {
  const id = req.params.id;

  Donacion.findById(id, (error, data) => {
    if (error) return next(error);
    res.json(data);
  });
});

app.delete("/delete/:id", (req, res, next) => {
  const id = req.params.id;

  Donacion.findByIdAndRemove(id, (error, doc) => {
    if (!error) {
      console.log(doc);
      return res.status(200).json({ status: true });
    } else {
      console.log(error);
      return res.status(400).json({ status: false });
    }
  });
});

module.exports = app;
