// Requires (se cargan las librerías de terceros o personalizadas que se requieren)
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables (aquí usamos la librería "express")
var app = express(); // creo mi aplicación

// Midleware Body parser: parse application/x-www-form-urlencoded and parse application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar rutas
var appRoutes = require('./routes/app'); // "appRoutes" es una variable con la que se llama al archivo que contiene la ruta principal
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err; // si esto sucede la ejecución se detiene inmediatamente después de la sentencia throw, y no se ejecutará ninguna de las sentencias siguientes
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);

app.use('/', appRoutes); //esto es un midlewear, es algo que se ejecuta antes que se resuelvan otras rutas

// Pongo a mi aplicación a escuchar peticiones
app.listen(3000, () => {
    console.log('Express server en el puerto 3000: \x1b[32m%s\x1b[0m', 'online'); // estos caracteres y esta síntaxis es para poner color verde al escribir online
});