var express = require('express');

const imageThumbnail = require('image-thumbnail');
var fs = require('fs');

var Post = require('../models/postScheme');

const base64ToImage = require('base64-to-image');
var app = express();


app.use(express.static('public'));


app.get('/pdf/:id/:img', (req, res, next) => {

    // var tipo = req.params.tipo;
    var img = req.params.img;
    var id = req.params.id;

    var filePath = `./uploads/pdf/${id}/${img}`;

    fs.exists(filePath, existe => {
        // ////////////// // // // // //////////////console.logog(filePath);

        if (existe) {

            fs.readFile(__dirname + filePath, function (err, data) {
                res.contentType("application/pdf");
                // res.co
                res.header('Content-Type: application/octet-stream');
                res.header('Content-Length: '.filesize($filePath));
                res.header('Content-Disposition: inline; filename="ct"');
                res.send(filePath);
                ////////////// // // // // //////////////console.logog(data);
            });
        }



        // fs.exists(filePath, existe => {

        //     if (!existe) {
        //         path = './assets/no-img.jpg';
        //     }

        //     res.header('Content-Type: application/octet-stream');
        //     res.header('Content-Length: ' . filesize($filePath));
        //     res.header('Content-Disposition: inline; filename="ct"');



        //     res.sendfile(filePath);

        // });




        // if(existe){

        //     fs.readFile( __dirname + filePath , function (err,data){
        //         res.contentType("application/pdf");
        //         res.header("Content-disposition: inline; filename=".basename(__dirname + filePath));
        //         // res.send(data);
        //         res.sendFile(__dirname + filePath);
        //         ////////////// // // // // //////////////console.logog(data);
        //     });
        // }


    });


    // if (!existe) {
    //     path = './assets/no-img.jpg';
    // }


    // res.sendfile(path);




});




app.get('/publicaciones/:idPub/:file', (req, res, next) => {

    var folder = req.params.idPub;
    var img = req.params.file;

    var path = `./uploads/publicaciones/${folder}/${img}`;

    fs.exists(path, existe => {

        if (!existe) {
            path = './assets/no-img.jpg';
        }


        res.sendfile(path);

    });


});



app.get('/thumbs/:tipo/:id/:img', async (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;
    var id = req.params.id;

    var path = `./uploads/${tipo}/${id}/${img}`;


    //////// // // // // //////////////console.logog('envio de path', path);

    fs.exists(path, async (existe) => {

        if (!existe) {

            var x = new Promise((resolve) => {

                if (tipo == 'Post') {

                    Post.findById(id)
                        // .populate('user', 'name surname email role _dataPyme positionCompany')
                        .exec(async (error, post) => {
                            if (error) {
                            }

                            if (!post) {
                                //if user not exists, return the error with status 400 bad request
                            }

                            //////console.log(post.thumbnail);


                            if (post.thumbnail == null) {

                                var i = post._files[0].file;

                                var p = `./uploads/${tipo}/${id}/${i}`;

                                var x = thumbnail(p);

                                await x.then(async (response) => {

                                    //////// // // // // //////////////console.logog('inicia promesa');
                                    var base64Str = `data:image/jpeg;base64,${response.thumbnail}`;
                                    var path = `./uploads/${tipo}/${id}/`; // Add trailing slash
                                    var file = `${id}-thumbnail.jpeg`;

                                    // if (fs.existsSync(`${path}${file}`)) {
                                    //     // return
                                    //     fs.unlink(`${path}${file}`, (err) => {
                                    //         if (err) throw err;
                                    //         // //////////////// // // // // //////////////console.logog( pathViejo, 'was deleted');
                                    //     });
                                    // }

                                    var optionalObj = { fileName: file, type: 'jpeg' };
                                    var { imageType, fileName } = await base64ToImage(base64Str, path, optionalObj);

                                    post.thumbnail = fileName;

                                    post.save((err, UserActualizado) => {

                                        // UserActualizado.pass = ':)';

                                        //////// // // // // //////////////console.logog('asignado el file img', `${path}${fileName}`);
                                        // return `${path}${fileName}`;
                                        var ll = `${path}${fileName}`;
                                        resolve(ll);


                                    })
                                });

                            } else {
                                resolve(post.thumbnail);
                            }



                        });

                }

                // resolve(t);

            })

            await x.then(r => {

                //////// // // // // //////////////console.logog('retorno final no existe', r);
                var ppt = (r == null || r == '') ? './assets/no-img.jpg' : r;
                res.sendfile(r);
                //  res.sendFile(r);
            })
            // res.sendfile(path);
        } else {

            //////// // // // // //////////////console.logog('retorno final si existe', path);
            res.sendfile(path);
            //  res.sendFile(path);

        }
    });



});


app.get('/:tipo/:id/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;
    var id = req.params.id;

    var path = `./uploads/${tipo}/${id}/${img}`;

    // //////////////// // // // // //////////////console.logog('el path', path);

    fs.exists(path, existe => {

        if (!existe) {
            path = './assets/no-img.jpg';
            res.sendfile(path);
        } else {

            res.sendfile(path);
        }

    });


});


async function getThumb(patth, tipo, id, img, res) {

    //////// // // // // //////////////console.logog('entra gethumb');

    if (tipo == 'Post') {

        Post.findById(id)
            // .populate('user', 'name surname email role _dataPyme positionCompany')
            .exec(async (error, post) => {
                if (error) {
                }

                if (!post) {
                    //if user not exists, return the error with status 400 bad request
                }

                //////// // // // // //////////////console.logog('encontre post');

                if (post.thumbnail == null) {
                    // osea no tiene thumbnail entonces se le crea
                    var i = post._files[0].file;


                    var p = `./uploads/${tipo}/${id}/${i}`;

                    var x = thumbnail(p);

                    await x.then(resolve => {

                        //////// // // // // //////////////console.logog('inicia promesa');
                        var base64Str = `data:image/jpeg;base64,${resolve.thumbnail}`;
                        var path = `./uploads/${tipo}/${id}/`; // Add trailing slash
                        var file = `${id}-thumbnail.jpeg`;

                        if (fs.existsSync(`${path}${file}`)) {
                            // return
                            fs.unlink(`${path}${file}`, (err) => {
                                if (err) throw err;
                                // //////////////// // // // // //////////////console.logog( pathViejo, 'was deleted');
                            });
                        }

                        var optionalObj = { fileName: file, type: 'jpeg' };
                        var { imageType, fileName } = base64ToImage(base64Str, path, optionalObj);
                        // //////// // // // // //////////////console.logog(imageType);
                        // //////// // // // // //////////////console.logog(fileName);
                        // //////// // // // // //////////////console.logog('archivo', resolve.thumbnail );

                        //////// // // // // //////////////console.logog('asignado file ', `${path}${fileName}`);
                        return `${path}${fileName}`;
                    });

                }

                if (post.thumbnail == true) {

                }


            });



    }






}

async function thumbnail(patth) {

    return p = new Promise(async (resolve, reject) => {


        let options = { height: 350, responseType: 'base64', jpegOptions: { force: true, quality: 100 } }

        try {
            const thumbnail = await imageThumbnail(patth, options);
            // //////// // // // // //////////////console.logog(thumbnail);
            //////// // // // // //////////////console.logog('construyo thumb');
            var l = {
                status: true,
                error: null,
                thumbnail: thumbnail
            };

            // return l;
            resolve(l);
        } catch (err) {

            var l = {
                status: false,
                error: err,
                thumbnail: null
            };
            // return l;
            reject(l);
            // console.error(err);
        }

    });


}

module.exports = app;