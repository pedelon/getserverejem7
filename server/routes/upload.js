const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const fs = require('fs');
const path = require('path');

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// default options middleware 
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            error: {
                message: 'No entrega ningún Archivo'
            }
        });
    }

    // Valida tipo
    let tiposValidos = ['usuario', 'producto'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Tipos permitidos son: ' + tiposValidos.join(', ')
            }
        })
    }

    // El nombre del campo de entrada (es decir, "archivo") se utiliza para recuperar el archivo cargado.
    let archivo = req.files.archivo;

    let nombreArchivo = archivo.name.split('.');
    let extension = nombreArchivo[nombreArchivo.length - 1];

    // extenciones permitidas
    let extencionesValidas = ['png', 'jpg', 'jpeg', 'gif'];

    if (extencionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Tipo de archivo no permitido. solo imagenes ' + extencionesValidas.join(', ')
            }
        })
    }

    // cambiar nombre al archivo
    let nombreModif = `${ id }-${ new Date().getMilliseconds() }.${ extension }`


    // Use el método mv () para colocar el archivo en algún lugar de su servidor
    archivo.mv(`uploads/${ tipo }/${ nombreModif }`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                error: err
            });

        if (tipo === 'usuario') {
            imagenUsuario(id, res, nombreModif);
        } else {
            imagenProducto(id, res, nombreModif);
        }

        // res.json({
        //     ok: true,
        //     message: 'imagen subida correctamente'
        // });
    });
});

function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {

            borraArchivo(nombreArchivo, 'usuario');

            return res.status(500).json({
                ok: false,
                error: err
            });
        }

        if (!usuarioDB) {

            borraArchivo(nombreArchivo, 'usuario');

            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Usuario no existe'
                }
            });
        }

        borraArchivo(usuarioDB.img, 'usuario');

        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioSave) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: err
                });
            }

            res.json({
                ok: true,
                usuario: usuarioSave,
                message: 'Imagen de usuario guadarda correctamente'
            });

        });



    });

}

function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {

        if (err) {

            borraArchivo(nombreArchivo, 'producto');

            return res.status(500).json({
                ok: false,
                error: err
            });
        }

        if (!productoDB) {

            borraArchivo(nombreArchivo, 'producto');

            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Producto no existe'
                }
            });
        }

        borraArchivo(productoDB.img, 'producto');

        productoDB.img = nombreArchivo;
        productoDB.save((err, productoSave) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: err
                });
            }

            res.json({
                ok: true,
                producto: productoSave,
                message: 'Imagen de producto guadarda correctamente'
            });

        });



    });

}

function borraArchivo(nombreImg, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImg }`);

    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;