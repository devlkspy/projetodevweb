const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    senha: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['aluno', 'admin'],
        default: 'aluno'
    },
    dataCadastro: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
