//--------

// Requires - son importaciones de librerias que hacen falta para que funcionen cosas.
var express = require("express"),
  path = require('path'),
  // nodeMailer = require('nodemailer'),
  // libreria moongoose
  mongoose = require("mongoose"),
  // importación de bodyparser para el uso de envio de formularios en post
  bodyParser = require("body-parser"),
  // ------------
  // cors
  fs = require('fs'),
  https = require('https'),

  cors = require("cors"),
  // inicializar las variables necesarias
  // se inicializa express
  app = express();


// DEVELOPER
const PORT = 4040;

var allowedOrigins = ['http://localhost:4200',
  'https://examen1front.alvarosegovia.com/'];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin
    // (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not ' +
        'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));



app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());




// importar rutas
var appRoutes = require('./routes/appRoutes');

var lgnRoutes = require('./routes/loginRoute');
var voluntariosRoute = require('./routes/voluntarioRoute');
var donantesRoutes = require('./routes/donantesRoutes');
var censoRoutes = require('./routes/censoRoutes');


mongoose.connection.openUri('mongodb+srv://admin:admin@cluster0.vhlsq.gcp.mongodb.net/examen_web?retryWrites=true&w=majority', (err, res) =>
{
  // si hay un error entonces
  //if (err) throw err;
});

// rutas
// se ejecuta algo que se ejecuta antes del proceso de rutas
app.use('/login', lgnRoutes); // Ruta de login
app.use('/voluntario', voluntariosRoute); // Ruta de usuarios
app.use('/donantes', donantesRoutes); // Ruta de publicaciones
// app.use('/censo', censoRoutes); // Ruta de publicaciones

// app.use('/find', fndRoutes); //Ruta de busqueda de archvos
app.use('/', appRoutes);
 // escuchar peticiones de express


// https.createServer({
//     key: fs.readFileSync('ssl.key'),
//     cert: fs.readFileSync('ssl.cert')
// }, app).listen(PORT, function(){
//     //////////////// // // // // ////////////////console.logog("My https server listening on port " + PORT + "...");
// });

app.listen(PORT, () =>
{
  console.log("\x1b[32m','Conectado, '\x1b[0m'");
  console.log('Servidor Node-Express: \x1b[32m', 'En linea localhost: '+ PORT, '\x1b[0m');
});

