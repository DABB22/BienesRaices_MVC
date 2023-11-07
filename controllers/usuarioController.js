
import { validationResult, check } from "express-validator";
import bcrypt from 'bcrypt';
// import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";
import { generarId, generarJWT } from "../helpers/token.js";
import { emailRegistro, emailRecuperarPassword } from "../helpers/email.js";

const formularioLogin = (req, res) => {
    res.render('auth/login', { 
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken()
    });
};

const autenticarUsuario = async (req, res) => {

    const {email, password} = req.body;

    //* Validación
    await check('email').isEmail().withMessage('El email no puede ir vacío o no cumple con el formato de correo').run(req);
    await check('password').notEmpty().withMessage('La contraseña es obligatoria').run(req);
    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        return res.render('auth/login', { 
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario: {
                email
            }
        });
    };

    //*Comprobar si el usuario existe
    const usuario = await Usuario.findOne({ where: {email}});

    if (!usuario) {
        return res.render('auth/login', { 
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El usuario no se encuentra registrado'}],
            usuario: {
                email
            }
        });
    };

    //* Comprobar que esté confirmada la cuenta
    if (!usuario.confirmado) {
        return res.render('auth/login', { 
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Tu cuenta aún no ha sido confirmada'}],
            usuario: {
                email
            }
        });
    };

    //* Comprobar el password con el de la base de datos // se hará directamente en el modelo
    if(!usuario.verificarPassword(password)){
        return res.render('auth/login', { 
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'Contraseña errada, vuelve a intentarlo'}],
            usuario: {
                email
            }
        });
    }


    //* Autenticar al usuario // vamos hacer uso de JsonWebToken
    //Existen muchas formas de autenticar usuarios en node.js , una de las más comunes es Keyloak JS , Passport pero tiene poca documentación y es algo compleja , otra forma es con jsonwebtoken
    
    const token = generarJWT({id: usuario.id, nombre: usuario.nombre, email: usuario.email});
    
    //* almacenando el JWT en un cookie 
    // cuando habilitamos el cookieparse en el archivo principal nos da acceso en el request para poder escribir en los cookies
    return res.cookie('_token', token, { // primer parametro: nombre, segundo: valor o dato a almacenar, tercer objeto de opciones para configuración
        httpOnly: true, // nos permite evitar los ataques cross site, esto hace que un cookie no sea accesible desde la api de js
        // expires: 900000, // tiempo de expiración, en milisegundos
        //secure: true, // solo permite los cookies en conexiones seguras
        // sameSite: true
    }).redirect('/mis-propiedades');



};


const cerrarSesion = (req, res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login');
};

const formularioRegistro = (req, res) => {
    res.render('auth/registro', { 
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    });
};

const registrar = async (req, res) => {

    const { nombre, email, password } = req.body;

    //* VALIDACIÓN
    await check('nombre').notEmpty().withMessage('El campo nombre es obligatorio').run(req);
    await check('email').isEmail().withMessage('El email no cumple con el formato de correo').run(req);
    await check('password').isLength({min: 6}).withMessage('La contraseña es un campo obligatorio y debe contener al menos 6 caracteres').run(req);
    await check('repetir_password').equals(password).withMessage('Las contraseñas no coinciden').run(req);
    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        return res.render('auth/registro', { 
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario: {
                nombre,
                email
            }
        });
    };

    //* VERIFICAR QUE EL USUARIO NO ESTÉ DUPLICADO
    const existeUsuario = await Usuario.findOne({ where: {email}}); // solo usamos la variable de email ya que es igual a la llave, esto es debido a algo llamado object literal enhancement

    if (existeUsuario) {
        return res.render('auth/registro', { 
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{
                msg: 'El usuario ya se encuentra registrado'
            }],
            usuario: {
                nombre,
                email
            }
        });
    }

    //* HASHEANDO PASSWORD - PROCESO REALIZADO EN EL ARCHIVO .js DEL MODELO DE USUARIO
        
    //* REGISTRO DEL USUARIO EN LA BD
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    });

    //* ENVIO EMAIL DE CONFIRMACIÓN
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    });

    //* MOSTRAR MENSAJE DE CONFIRMACIÓN DEL ENVÍO DEL FORMULARIO
    res.render('template/mensaje', {
        pagina: 'Cuenta creada correctamente',
        csrfToken: req.csrfToken(),
        mensaje: 'Envío de formulario éxitoso, revisa tu bandeja de correo para activar tu cuenta'
    });
    // console.log(req.body);
};


//* FUNCIÓN QUE COMPRUEBA UNA CUENTA
const confirmarCuenta = async (req, res) => {

    const {token} = req.params;

    //Verificar siel token es válido
    const usuario = await Usuario.findOne({where: {token}});

    if(!usuario){
        return res.render('auth/confirmar-cuenta', { 
            pagina: 'Error al confirmar Cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta o ésta ya fue confirmada',
            error: true
        });
    }

    //Confirmar la cuenta
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    res.render('auth/confirmar-cuenta', { 
        pagina: 'Cuenta Confirmada',
        mensaje: 'Tu cuenta ha sido confirmada de manera éxitosa, puedes iniciar sesión dando click en el botón',
        error: false
    });

};

//* OLVIDE PASSWORD GET
const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', { 
        pagina: 'Olvidé mi contraseña',
        csrfToken: req.csrfToken()
    });
};

//* OLVIDE PASSWORD POST
const resetPassword = async (req, res) => {

    //* VALIDACIÓN
    await check('email').isEmail().withMessage('El email no cumple con el formato de correo').run(req);

    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        return res.render('auth/olvide-password', { 
            pagina: 'Olvidé mi contraseña',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        });
    };

    //* BUSCAR AL USUARIO
    const {email} = req.body;

    const usuario = await Usuario.findOne({where: {email}});

    if(!usuario){
        return res.render('auth/olvide-password', { 
            pagina: 'Olvidé mi contraseña',
            csrfToken: req.csrfToken(),
            mensaje: 'El correo o usuario ingresado no se encuentra registrado',
            errores: [{
                msg: 'El usuario o correo ingresado no se encuentra registrado'
            }]
        });
    }

    //* GENERAR NUEVO TOKEN
    usuario.token = generarId();
    await usuario.save();

    //* Enviar email
    emailRecuperarPassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    });

    //* vista del mensaje
    res.render('template/mensaje', {
        pagina: 'Olvidé mi contraseña',
        csrfToken: req.csrfToken(),
        mensaje: 'Solicitud de cambio de contraseña éxitoso, revisa tu bandeja de correo'
    });
};

const comprobarTokenOlvidePassword = async (req, res) => {
    
    const {token} = req.params; 
    const usuario = await Usuario.findOne({where: {token}});
    
    if(!usuario){
        return res.render('auth/confirmar-cuenta', { 
            pagina: 'Error al solicitar cambio de contraseña',
            mensaje: 'Hubo un error en tu solicitud de cambio de contraseña',
            error: true
        });
    }

    //* MOSTRAR FORMULARIO PARA INGRESAR EL NUEVO PASSWORD
    res.render('auth/reset-password', {
        pagina: 'Reestablecer nueva contraseña',
        csrfToken: req.csrfToken()
    });
};

const nuevoPassword = async (req, res) => {

    //* VALIDAR PASSWORD
    await check('password').isLength({min: 6}).withMessage('El campo no puede ir vacío y debe contener al menos 6 caracteres').run(req);
    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        return res.render('auth/reset-password', { 
            pagina: 'Reestablecer nueva contraseña',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        });
    };

    const {token} = req.params;
    const {password} = req.body;


    //* IDENTIFICAR QUIEN HACE EL CAMBIO
    const usuario = await Usuario.findOne({where: {token}});
    

    //* HASHEAR EL NUEVO PASSWORD
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token=null;
    await usuario.save();

    res.render('auth/confirmar-cuenta',{
        pagina: 'Reestablecer nueva contraseña',
        mensaje: 'Contraseña actualizada correctamente'
    })

};

export {
    formularioLogin,
    cerrarSesion,
    autenticarUsuario,
    formularioRegistro,
    registrar,
    confirmarCuenta,
    formularioOlvidePassword,
    resetPassword,
    comprobarTokenOlvidePassword,
    nuevoPassword
};