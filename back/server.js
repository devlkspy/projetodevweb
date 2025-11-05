const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const User = require('./models/User.js');

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: 'https://SUA_URL_DA_VERCEL_AQUI.vercel.app'
};

app.use(cors(corsOptions));
app.use(express.json());

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'perfis_devweb',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 200, height: 200, crop: 'fill' }]
  },
});

const upload = multer({ storage: storage });

const dbURI = process.env.DATABASE_URL;

console.log('Tentando conectar ao MongoDB...');
mongoose.connect(dbURI)
    .then(() => {
        console.log('MongoDB conectado com sucesso!');
        app.listen(port, () => {
            console.log(`Servidor rodando com sucesso na porta ${port}`);
        });
    })
    .catch((err) => {
        console.error('ERRO CRÍTICO MongoDB:', err);
        process.exit(1);
    });

app.get('/', (req, res) => {
    res.send('Olá! Este é o seu servidor backend respondendo.');
});

app.post('/cadastrar', async (req, res) => {
    console.log('Recebida requisição POST /cadastrar');
    try {
        const { 
            nome, email, senha, role, 
            matricula, curso, turno, modalidade 
        } = req.body;
        
        console.log('Dados recebidos para cadastro:', { nome, email, role, curso });

        const novoUsuario = new User({ 
            nome, email, senha, role, 
            matricula, curso, turno, modalidade 
        });
        
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
            fotoUrlUsuario: usuario.fotoUrl,
            matriculaUsuario: usuario.matricula, 
            cursoUsuario: usuario.curso 
        });

    } catch (error) {
        console.error('Erro detalhado no login:', error);
        res.status(500).json({ status: 'erro', mensagem: 'Erro interno ao tentar fazer login.' });
    }
});

app.post('/atualizar-perfil/:id/', upload.single('foto'), async (req, res) => {
    console.log('Recebida requisição POST /atualizar-perfil');
    try {
        const userId = req.params.id;
        const { nome } = req.body;
        
        const usuario = await User.findById(userId);
        if (!usuario) {
            return res.status(404).json({ status: 'erro', mensagem: 'Usuário não encontrado.' });
        }

        if (nome) {
            usuario.nome = nome;
        }
        
        if (req.file) {
            usuario.fotoUrl = req.file.path;
        }

        await usuario.save();
        
        console.log('Perfil atualizado com sucesso para:', usuario.email);
        res.status(200).json({ 
            status: 'sucesso', 
            mensagem: 'Perfil atualizado com sucesso!',
            nome: usuario.nome,
            fotoUrl: usuario.fotoUrl
        });

    } catch (error) {
        console.error('ERRO AO ATUALIZAR PERFIL (upload.single):', error);
        res.status(500).json({ status: 'erro', mensagem: 'Erro interno ao atualizar perfil.' });
    }
});

app.get('/usuarios', async (req, res) => {
    console.log('Recebida requisição GET /usuarios');
    try {
        const usuarios = await User.find().select('nome email role curso matricula _id');
        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ status: 'erro', mensagem: 'Erro interno ao buscar usuários.' });
    }
});

app.delete('/usuarios/:id', async (req, res) => {
    console.log('Recebida requisição DELETE /usuarios/:id');
    try {
        const userId = req.params.id;
        const deletedUser = await User.findByIdAndDelete(userId);
        
        if (!deletedUser) {
            return res.status(404).json({ status: 'erro', mensagem: 'Usuário não encontrado.' });
        }
        
        console.log('Usuário excluído:', deletedUser.email);
        res.status(200).json({ status: 'sucesso', mensagem: 'Usuário excluído com sucesso!' });

    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ status: 'erro', mensagem: 'Erro interno ao excluir usuário.' });
    }
});