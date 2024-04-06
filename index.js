//index.js
const express = require('express');
const mysql = require('mysql');
require("dotenv-safe").config();
const jwt = require('jsonwebtoken');
const app = express(); 
app.use(express.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'senha',
    database: 'api'
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conexão bem-sucedida com o banco de dados');
});

app.get('/', (req, res, next) => {
    res.json({message: "Tudo ok por aqui!"});
})

app.post('/login', (req, res, next) => {
    const username = req.body.user;
    const password = req.body.password;
    const query = 'SELECT * FROM usuarios WHERE usuario = ?';
    connection.query(query, [username], (error, results, fields) => {
      if (error) {
        console.error('Erro ao verificar o login do usuário:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
      if (results.length === 0) {
        console.log('Nome de usuário não encontrado.');
        return res.status(401).json({ message: 'Nome de usuário inválido' });
      }

      const user = results[0];
      if (user.senha !== password) {
        console.log('Senha incorreta.');
        return res.status(401).json({ message: 'Nome de usuário ou senha inválidos' });
      }
      console.log('Usuário autenticado com sucesso!');
      const token = jwt.sign({ id: user.id }, process.env.SECRET, {
        expiresIn: 300
      });
      console.log(token);

      return res.json({ auth: true, token: token });
    });
})

app.get('/clientes', verifyJWT, (req, res, next) => { 
    console.log("Retornou todos clientes!");
    const query = 'SELECT usuario FROM usuarios';
    connection.query(query, (error, results, fields) => {
        if (error) {
            console.error('Erro ao verificar todos os usuários:', error);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }
        if (results.length === 0) {
            console.log('Nenhum usuário encontrado.');
            return res.status(401).json({ message: 'Nenhum usuário encontrado' });
        }
        console.log(results);
        res.json({message: "Clientes na tela!"});
    });
})

function verifyJWT(req, res, next) {
    const authorizationHeader = req.headers['authorization'];
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return res.status(401).json({ auth: false, message: 'No token provided.' });
    }

    const token = authorizationHeader.split(' ')[1];
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
        if (err) {
            return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
        }
        req.userId = decoded.id;
        next();
    });
}

app.post('/logout', function(req, res) {
    token = null;
    res.json({ auth: false, token: null });
})

app.listen(3000, () => console.log("Servidor escutando na porta 3000..."));