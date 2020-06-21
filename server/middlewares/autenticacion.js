const jwt = require('jsonwebtoken');


// ===========================
//    Verifica Token
// ===========================

let verificaToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {

            return res.status(401).json({
                ok: false,
                error: {
                    message: 'token no valido'
                }
            });

        }

        req.usuario = decoded.usuario;
        next();
    });


};


// ===========================
//    Verifica role admin
// ===========================

let verificaAdmin_Role = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role !== 'ADMIN_ROLE') {

        return res.status(401).json({
            ok: false,
            error: {
                message: 'Usuario no es Administrador'
            }
        });

    }

    next();

};


module.exports = {
    verificaToken,
    verificaAdmin_Role
}