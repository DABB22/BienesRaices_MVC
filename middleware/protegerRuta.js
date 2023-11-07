
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';

const protegerRuta = async (req, res, next) => {

    // Verificar si hay un token
    const { _token } = req.cookies;
    if(!_token){
        return res.redirect('/auth/login');
    };

    // Comporbar token
    try {

        const decoded = jwt.verify(_token, process.env.JWT_PALABRASECRETA);
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id);
        // console.log(usuario);

        // Almacenar el usuario al req
        if(usuario){
            req.usuario = usuario; // si el usuario existe lo agregamos al request
        }else{
            return res.redirect('/auth/login'); // caso contrario redireccionamos al login
        }
        return next();
    } catch (error) {
        return res.clearCookie('_token').redirect('/auth/login');
        console.log(error);
    }

    // console.log('Desde el middleware');
    
};

export default protegerRuta;