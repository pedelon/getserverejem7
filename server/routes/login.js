const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');
const app = express();



app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                error: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'UsuariO o contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Usuario o contraseñA incorrectos'
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token: token
        })


    })


});

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // el client ID se configura en el config como variable de entorno
    });
    const payload = ticket.getPayload();

    // console.log('payload ->', payload);

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}

// verify().catch(console.error);


app.post('/google', async(req, res) =>  {

    let token = req.body.idtoken;

    let googleUsuario = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                err: err
            });
        });

    Usuario.findOne({ email: googleUsuario.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (usuarioDB) {

            if (usuarioDB.google === false) {

                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usar su auteticación normal'
                    }
                });

            } else {

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token
                });

            }

        } else {
            // Si el usuario no existe en la BD se crea por google
            let usuario = new Usuario();
            usuario.nombre = googleUsuario.nombre;
            usuario.email = googleUsuario.email;
            usuario.img = googleUsuario.img;
            usuario.google = googleUsuario.google;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token
                });

            });

        }

    });

});



module.exports = app