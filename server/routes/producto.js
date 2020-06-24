const express = require('express');
let { verificaToken } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');


//================================
//  Obtener todos los productos
//================================
app.get('/productos', verificaToken, (req, res) => {

    let desde = Number(req.query.desde) || 0;
    // let limite = Number(req.query.limite) || 0;

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productosDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: err
                });
            }

            Producto.countDocuments({ disponible: true }, (err, conteo) => {

                res.json({
                    ok: true,
                    productos: productosDB,
                    cuantos: conteo
                });

            });

        });

});

//================================
//  obtener un producto por ID
//================================
app.get('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productoDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    error: err
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            })

        });

});

//================================
//  crear un producto
//================================
app.post('/productos', verificaToken, (req, res) => {

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });

    });

});

//================================
//  Actualizar un producto
//================================
app.put('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'El Producto no existe'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoSave) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: err
                });
            }

            res.status(201).json({
                ok: true,
                producto: productoSave
            });

        })

    });


});

//================================
//  Borrar un producto
//================================
app.delete('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }

        productoDB.disponible = false;

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
                message: 'Producto borrado'
            });

        });

    });

});


//================================
//  Buscar un productos
//================================

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productosDB) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: err
                });
            }

            res.json({
                ok: true,
                productos: productosDB
            })


        });

});


module.exports = app;