const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dbURI = process.env.DATABASE_URL;

console.log('Tentando conectar ao MongoDB...');
mongoose.connect(dbURI)
    .then(() => {
        console.log('MongoDB conectado com sucesso!');
        
        console.log('Iniciando o servidor Express...');
        app.listen(port, () => {
            console.log(`Servidor rodando com sucesso na porta ${port}`);
        });

    })
    .catch((err) => {
        console.error('ERRO CRÍTICO ao conectar no MongoDB:', err);
        process.exit(1);
    });

app.get('/', (req, res) => {
    res.send('Olá! Este é o seu servidor backend respondendo.');
});

app.post('/cadastrar', async (req, res) => {
    console.log('Recebida requisição POST /cadastrar');
    try {
        const { nome, email, senha, role } = req.body;
        console.log('Dados recebidos para cadastro:', { nome, email, role });

        const novoUsuario = new User({ nome, email, senha, role });
        await novoUsuario.save();
        console.log('Novo usuário salvo com sucesso:', email);

        res.status(201).json({ status: 'sucesso', mensagem: 'Usuário cadastrado com sucesso!' });

    } catch (error) {
        console.error('Erro detalhado ao cadastrar usuário:', error);
        if (error.code === 11000) {
            res.status(409).json({ status: 'erro', mensagem: 'Este email já está cadastrado.' });
        } else {
            res.status(500).json({ status: 'erro', mensagem: 'Erro interno ao cadastrar. Tente novamente.' });
        }
    }
});

app.post('/login', async (req, res) => {
    console.log('Recebida requisição POST /login');
    try {
        const { email, senha } = req.body;
        console.log('Tentativa de login para:', email);

        const usuario = await User.findOne({ email: email });
        console.log('Usuário encontrado no BD:', usuario ? usuario.email : 'Nenhum');

        if (!usuario) {
            return res.status(404).json({ status: 'erro', mensagem: 'Email não encontrado.' });
        }
        if (usuario.senha !== senha) {
            return res.status(401).json({ status: 'erro', mensagem: 'Senha incorreta.' });
        }

        console.log('Login bem-sucedido para:', email);
        res.status(200).json({
            status: 'sucesso',
            mensagem: 'Login bem-sucedido!',
            userId: usuario._id,
            nomeUsuario: usuario.nome,
            emailUsuario: usuario.email,
            dataCadastroUsuario: usuario.dataCadastro,
            roleUsuario: usuario.role,
            fotoUrlUsuario: usuario.fotoUrl
        });

    } catch (error) {
        console.error('Erro detalhado no login:', error);
        res.status(500).json({ status: 'erro', mensagem: 'Erro interno ao tentar fazer login.' });
    }
});

app.patch('/perfil/:id', async (req, res) => {
    console.log('Recebida requisição PATCH /perfil');
    try {
        const userId = req.params.id;
        const { nome } = req.body;

        if (!nome) {
            return res.status(400).json({ status: 'erro', mensagem: 'O campo nome é obrigatório.' });
        }

        const usuarioAtualizado = await User.findByIdAndUpdate(
            userId,
            { nome: nome },
            { new: true }
        );

        if (!usuarioAtualizado) {
            return res.status(404).json({ status: 'erro', mensagem: 'Usuário não encontrado.' });
        }

        console.log('Perfil atualizado com sucesso para:', usuarioAtualizado.email);
        res.status(200).json({ 
            status: 'sucesso', 
            mensagem: 'Perfil atualizado com sucesso!',
            nomeUsuario: usuarioAtualizado.nome
        });

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ status: 'erro', mensagem: 'Erro interno ao atualizar perfil.' });
    }
});