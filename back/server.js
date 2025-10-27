const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const dbURI = 'mongodb+srv://lucasmadeira08_db_user:eJ3us85TnQVS7Oa4@cluster0.kodcp4r.mongodb.net/aps_database?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI)
    .then(() => console.log('MongoDB conectado com sucesso!'))
    .catch((err) => console.error('Erro ao conectar no MongoDB:', err));

app.get('/', (req, res) => {
    res.send('Olá! Este é o seu servidor backend respondendo.');
});

app.post('/cadastrar', async (req, res) => {
    try {
        const { nome, email, senha, role } = req.body;

        const novoUsuario = new User({
            nome: nome,
            email: email,
            senha: senha,
            role: role
        });

        await novoUsuario.save();

        res.status(201).json({ status: 'sucesso', mensagem: 'Usuário cadastrado com sucesso!' });

    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);

        if (error.code === 11000) {
            res.status(409).json({ status: 'erro', mensagem: 'Este email já está cadastrado.' });
        } else {
            res.status(500).json({ status: 'erro', mensagem: 'Erro interno ao cadastrar. Tente novamente.' });
        }
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        const usuario = await User.findOne({ email: email });

        if (!usuario) {
            return res.status(404).json({ status: 'erro', mensagem: 'Email não encontrado.' });
        }

        if (usuario.senha !== senha) {
            return res.status(401).json({ status: 'erro', mensagem: 'Senha incorreta.' });
        }

        res.status(200).json({
            status: 'sucesso',
            mensagem: 'Login bem-sucedido!',
            nomeUsuario: usuario.nome,
            emailUsuario: usuario.email,
            dataCadastroUsuario: usuario.dataCadastro
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ status: 'erro', mensagem: 'Erro interno ao tentar fazer login.' });
    }
});
    app.listen(port, () => {
        console.log(`Servidor rodando com sucesso em http://localhost:${port}`);
    });