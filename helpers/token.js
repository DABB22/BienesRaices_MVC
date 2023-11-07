
import jwt from 'jsonwebtoken';

const generarId = () => Math.random().toString(32).substring(2) + Date.now().toString(32);

const generarJWT = datosUsuario => jwt.sign({ id: datosUsuario.id, nombre: datosUsuario.nombre, email: datosUsuario.email }, process.env.JWT_PALABRASECRETA, { expiresIn: '1d' });


export {
    generarId,
    generarJWT
};