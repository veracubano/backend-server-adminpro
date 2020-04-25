var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital'); // se importa el "hospitalSchema", al que decidimos denominar "Hospital" como se puede ver en el export dentro del archivo "hospital.js" de la carpeta "models"

//======================================================
//------ Obtener todos los hospitales --------------------
//======================================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0; // el valor de la variable "desde" se recibe como otro parametro del método GET 
    desde = Number(desde); // se obliga a que sea de tipo "number"
    Hospital.find({}) // en esta consulta a la base de datos "Hospital" se le dice que encuentre todos sus "documentos"
        .skip(desde) // se salta el valor que tenga la variable "desde", es decir, si desde = 5 me entrega los registros a partir del 6
        .limit(5) // limita la respuesta a solamente 5 registros en este caso
        .populate('usuario', 'nombre email') // aquí el método "pupulate" indica que deseo que me devuelva únicamente los campos "nombre" y "email" desde el documento correspondiente de la colección "usuario". Y esto porque el campo "usuario" del "hospitalSchema" contiene una referencia al "usuarioSchema", o lo que es lo mismo a "Usuario"
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                });
            }
            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            });
        });
});

//======================================================
//------ Actualizar hospital --------------------
//======================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospitalAActualizar) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if (!hospitalAActualizar) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }
        hospitalAActualizar.nombre = body.nombre;
        hospitalAActualizar.usuario = req.usuario._id;

        hospitalAActualizar.save((err, hospitalActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalActualizado
            });
        });
    });
});

//======================================================
//------ Crear un nuevo hospital --------------------
//======================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

//======================================================
//------ Borrar un hospital por el id --------------------
//======================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con el id ' + id }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;