var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var medicoSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }, // esta propiedad "usuario" tiene como valor el "objectId" con el que aparezca en la colección "ususario" cuya referencia en el "ususarioSchema" es la palabra "Usuario"
    hospital: {
        type: Schema.Types.ObjectId,
        ref: 'Hospital',
        required: [true, 'El id hospital es un campo obligatorio ']
    }
});

module.exports = mongoose.model('Medico', medicoSchema);