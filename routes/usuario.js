var express = require('express');
var bcrypt = require('bcryptjs');
/* var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED; */

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario'); // se importa el "usuarioSchema", al que decidimos denominar "Usuario" como se puede ver en el export dentro del archivo "usuario.js" de la carpeta "models"
//======================================================
//------ Obtener todos los usuarios --------------------
//======================================================
app.get('/', (req, res, next) => {
    Usuario.find({}, 'nombre email img role')
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                usuarios: usuarios
            });
        });
});

/* //======================================================
//------ Verificar token -------------------- // este middleware se trasladó al archivo "autenticacion.js" de la carpeta "middlewares"
//======================================================
app.use('/', (req, res, next) => { // esto también es un middleware
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        next();
    });
}); */



//======================================================
//------ Actualizar usuario --------------------
//======================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Usuario.findById(id, (err, usuarioAActualizar) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuarioAActualizar) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }
        usuarioAActualizar.nombre = body.nombre;
        usuarioAActualizar.email = body.email;
        usuarioAActualizar.role = body.role;
        usuarioAActualizar.save((err, usuarioActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }
            usuarioActualizado.password = ':)'; // para que no aparezca la contraseña al hacer el "PUT"
            res.status(200).json({
                ok: true,
                usuario: usuarioActualizado
            });
        });
    });
});

//======================================================
//------ Crear un nuevo usuario --------------------
//======================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario // este "req.usuario" viene del método "verificaToken" del archivo "autenticacion.js" en la carpeta "middlewares" 
        });
    });
});

//======================================================
//------ Borrar un usuario por el id --------------------
//======================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con el id ' + id }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;