var express = require('express');

var app = express();

app.get('/', (req, res, next) => { // esta es la ruta principal
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

module.exports = app;