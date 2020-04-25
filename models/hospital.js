var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hospitalSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' } // esta propiedad "usuario" tiene como valor el "objectId" con el que aparezca en la colección "ususario" cuya referencia en el "ususarioSchema" es la palabra "Usuario"
}, { collection: 'hospitales' });

module.exports = mongoose.model('Hospital', hospitalSchema);