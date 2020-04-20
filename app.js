// Requires (se cargan las librerías de terceros o personalizadas que se requieren)
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables (aquí usamos la librería "express")
var app = express(); // creo mi aplicación

// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err; // si esto sucede la ejecución se detiene inmediatamente después de la sentencia throw, y no se ejecutará ninguna de las sentencias siguientes
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
})

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});


// Pongo a mi aplicación a escuchar peticiones
app.listen(3000, () => {
    console.log('Express server en el puerto 3000: \x1b[32m%s\x1b[0m', 'online'); // estos caracteres y esta síntaxis es para poner color verde al escribir online
});