var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs'); // esta librería fs (file system) se requiere para la administración de archivos. Dicha librería implementa la programación asincrona para procesar la creación, lectura, modificación, borrado de archivos 

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    // filtrar los tipos para admitir únicamente las colecciones que queremos
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { mensaje: 'Debe seleccionar otro tipo de colección' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó un archivo',
            errors: { mensaje: 'Debe seleccionar una imagen' }
        });
    }
    // Obtener nombre del archivo
    var archivo = req.files.imagen; // "imagen" es la "clave" del objeto (clave-valor) que se recibe como archivo
    var nombreEnPedazos = archivo.name.split('.'); // de la variable archivo tomo su name y lo corto en pedazos por cada punto que tenga y se almacena como un arreglo en la variable "nombreEnPedazos" 
    var extensionDelArchivo = nombreEnPedazos[nombreEnPedazos.length - 1]; // del arreglo de pedazos del nombre selecciono el último y lo almaceno en la variable "extensionDelArchivo"

    // filtrar las extensiones para admitir únicamente las que queremos
    var extensionesValidas = ['png', 'gif', 'jpg', 'jpeg'];
    if (extensionesValidas.indexOf(extensionDelArchivo) < 0) { // si regresa -1, o sea < 0, significa que la extensión del archivo no está entre las extensiones validas
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
        });
    }

    // Crear nombre de archivo personalizado
    var nombreCreadoDelArchivo = `${id}-${new Date().getMilliseconds()}.${extensionDelArchivo}`; // este nombre personalizado está conformado por la unión del valor de la variable "id", con un número aleatorio formado a partir de la fecha y con el valor de la variable "extensionDelArchivo"

    // Mover el archivo en cuestión desde el temporal a un path específico
    var path = `./uploads/${tipo}/${nombreCreadoDelArchivo}`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }
        subirPorTipo(tipo, id, nombreCreadoDelArchivo, res);
    });
});

function subirPorTipo(tipo, id, nombreCreadoDelArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuarioEncontrado) => {
            if (!usuarioEncontrado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario buscado no existe',
                    errors: { message: 'Ese usuario no existe' }
                });
            }
            var pathViejo = './uploads/usuarios/' + usuarioEncontrado.img; // el "pathViejo" es el path de la imagen anterior para un usuario en concreto. "img" es el nombre de la propiedad que se definió en el modelo "usuarioSchema"
            if (fs.existsSync(pathViejo)) { // si existe
                fs.unlinkSync(pathViejo); // elimina esa imagen anterior
            }
            usuarioEncontrado.img = nombreCreadoDelArchivo;
            usuarioEncontrado.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de ususario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medicoEncontrado) => {
            if (!medicoEncontrado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El médico buscado no existe',
                    errors: { message: 'Ese médico no existe' }
                });
            }
            var pathViejo = './uploads/medicos/' + medicoEncontrado.img; // el "pathViejo" es el path de la imagen anterior para un medico en concreto. "img" es el nombre de la propiedad que se definió en el modelo "medicoSchema"
            if (fs.existsSync(pathViejo)) { // si existe
                fs.unlinkSync(pathViejo); // elimina esa imagen anterior
            }
            medicoEncontrado.img = nombreCreadoDelArchivo;
            medicoEncontrado.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de médico actualizada',
                    medico: medicoActualizado
                });
            });
        });

    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospitalEncontrado) => {
            if (!hospitalEncontrado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital buscado no existe',
                    errors: { message: 'Ese hospital no existe' }
                });
            }
            var pathViejo = './uploads/hospitales/' + hospitalEncontrado.img; // el "pathViejo" es el path de la imagen anterior para un hospital en concreto. "img" es el nombre de la propiedad que se definió en el modelo "hospitalSchema"
            if (fs.existsSync(pathViejo)) { // si existe
                fs.unlinkSync(pathViejo); // elimina esa imagen anterior
            }
            hospitalEncontrado.img = nombreCreadoDelArchivo;
            hospitalEncontrado.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }

}

module.exports = app;