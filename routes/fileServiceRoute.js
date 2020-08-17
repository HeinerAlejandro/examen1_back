var express = require('express');
var fs = require('fs');


var app = express();




app.get('/:idPub/:file', (req, res, next) => {

    var folder = req.params.idPub;
    var img = req.params.file;

    var path = `./uploads/publicaciones/${folder}/${ img }`;

    fs.exists(path, existe => {

        if (!existe) {
            path = './assets/no-img.jpg';
        }


        res.sendfile(path);

    });


});


module.exports = app;