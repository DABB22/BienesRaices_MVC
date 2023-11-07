
import express from 'express';
import {
    inicio,
    categoria,
    paginaError,
    buscador
} from '../controllers/appController.js';
import identificarUsuario from '../middleware/identificarUsuario.js';

const router = express.Router();


// Página de inicio
router.get('/', identificarUsuario, inicio);

// Categorias
router.get('/categorias/:id', categoria);

// Página 404
router.get('/404', paginaError);

// Buscador
router.post('/buscador', buscador);

export default router;