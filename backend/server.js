const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const apiRoutes = require('./routes/api');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', apiRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno no servidor' });
});

// Inicia servidor
app.listen(env.PORT, () => {
    console.log(`Backend rodando na porta ${env.PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
