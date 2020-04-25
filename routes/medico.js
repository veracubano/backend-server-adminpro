var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico'); // se importa el "hospitalSchema", al que decidimos denominar "Hospital" como se puede ver en el export dentro del archivo "hospital.js" de la carpeta "models"

//======================================================
//------ Obtener todos los medicos --------------------
//======================================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0; // el valor de la variable "desde" se recibe como otro parametro del método GET
    desde = Number(desde); // se obliga a que sea de tipo "number"
    Medico.find({})
        .skip(desde) // se salta el valor que tenga la variable "desde", es decir, si desde = 5 me entrega los registros a partir del 6
        .limit(5) // limita la respuesta a solamente 5 registros en este caso
        .populate('usuario', 'nombre email') // con el método "populate" digo que con esta consulta me devuelva únicamente los campos "nombre" y "email" de la colección "usuarios" concretamente en la propiedad del "medicoSchema" donde se especifique la referencia 
        .populate('hospital') // aquí digo que me traiga todo de la colección "hospital" y me lo muestre en la propiedad del "medicoSchema" en la cual aparece tal relación o referencia
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }
            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });
        });
});

//======================================================
//------ Actualizar medico --------------------
//======================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medicoAActualizar) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }
        if (!medicoAActualizar) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese id' }
            });
        }
        medicoAActualizar.nombre = body.nombre;
        medicoAActualizar.usuario = req.usuario._id;
        medicoAActualizar.hospital = body.hospital;

        medicoAActualizar.save((err, medicoActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoActualizado
            });
        });
    });
});

//======================================================
//------ Crear un nuevo medico --------------------
//======================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            medicoToken: req.medico // este "req.usuario" viene del método "verificaToken" del archivo "autenticacion.js" en la carpeta "middlewares" 
        });
    });
});

//======================================================
//------ Borrar un medico por el id --------------------
//======================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: { message: 'No existe un medico con el id ' + id }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;