var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//======================================================
//------------- Busqueda por cada colección ------------
//======================================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var expresionRegular = new RegExp(busqueda, 'i');
    var promesa;
    switch (tabla) {
        case 'usuarios':
            promesa = buscarEnUsuarios(busqueda, expresionRegular);
            break;
        case 'hospitales':
            promesa = buscarEnHospitales(busqueda, expresionRegular);
            break;
        case 'medicos':
            promesa = buscarEnMedicos(busqueda, expresionRegular);
            break;
        default:
            res.status(400).json({
                ok: false,
                mensaje: 'Solamente se busca en usuarios, medicos y hospitales',
                error: { mensaje: 'Tabla/colección no valida' }
            });
    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data // [tabla] entre corchetes significa que ahí irá el valor de la variable "tabla" y no la palabra tabla
        });
    });
});

//====================================================================
//---- Busqueda general, o sea, busca en las tres colecciones --------
//====================================================================
app.get('/todo/:busqueda', (req, res, next) => { // esta es la ruta principal
    var busqueda = req.params.busqueda;
    var expresionRegular = new RegExp(busqueda, 'i'); // la "i" hace que busque la expresión regular sin tener en cuenta mayúsculas ni minúsculas

    Promise.all([buscarEnHospitales(busqueda, expresionRegular), buscarEnMedicos(busqueda, expresionRegular), buscarEnUsuarios(busqueda, expresionRegular)])
        .then(arregloDeLasBusquedas => {
            res.status(200).json({
                ok: true,
                hospitales: arregloDeLasBusquedas[0],
                medicos: arregloDeLasBusquedas[1],
                usuarios: arregloDeLasBusquedas[2]
            });

        });
});

function buscarEnHospitales(busqueda, expresionRegular) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: expresionRegular })
            .populate('usuario', 'nombre email')
            .exec((err, busquedaEnHospitales) => {
                if (err) {
                    reject('Error al hacer la busqueda en Hospitales', err);
                } else {
                    resolve(busquedaEnHospitales);
                }
            });
    });
}

function buscarEnMedicos(busqueda, expresionRegular) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: expresionRegular })
            .populate('usuario', 'nombre email')
            .populate('hospital', 'nombre')
            .exec((err, busquedaEnMedicos) => {
                if (err) {
                    reject('Error al hacer la busqueda en Medicos', err);
                } else {
                    resolve(busquedaEnMedicos);
                }
            });
    });
}

function buscarEnUsuarios(busqueda, expresionRegular) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role').or([{ 'nombre': expresionRegular }, { 'email': expresionRegular }])
            .exec((err, busquedaEnUsuarios) => {
                if (err) {
                    reject('Error al hacer la busqueda en Usuarios', err);
                } else {
                    resolve(busquedaEnUsuarios);
                }
            });
    });
}

module.exports = app;