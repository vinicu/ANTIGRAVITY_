const dotenv = require('dotenv');
const path = require('path');

// Carrega .env da raiz
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnv = ['GITHUB_TOKEN', 'JWT_SECRET', 'GITHUB_REPO_URL'];

const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
    console.error(`ERRO CRÍTICO: Variáveis de ambiente faltando: ${missingEnv.join(', ')}`);
    process.exit(1);
}

module.exports = {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GITHUB_REPO_URL: process.env.GITHUB_REPO_URL,
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT || 3000
};
