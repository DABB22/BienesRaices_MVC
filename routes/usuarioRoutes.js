
import express from "express";
import { 
    formularioLogin,
    cerrarSesion,
    formularioRegistro,
    registrar,
    confirmarCuenta,
    formularioOlvidePassword,    
    resetPassword,
    comprobarTokenOlvidePassword,
    nuevoPassword,
    autenticarUsuario,
} from "../controllers/usuarioController.js";

const router = express.Router();

/* 
* ejemplo de routing mostrando un texto plano con el metodo send y el verbo http get
router.get('/', function(req, res) { // req es lo que estás enviando al servidor de node y res es la respuesta del servidor  
    res.send('Hola Mundo en express inicio');
});
* otra sintaxis que se puede manejar:
router.route('/')
    .get(function(req, res){ 
        res.send('Hola Mundo en express inicio');
    })
    .post(function(req, res){
        res.json({ msg: 'Hola Mundo desde post'});
    }) 
*/
/* 
* forma de usar el routing de acuerdo al verbo http relacionado a la URL, el metodo .render para aplicar la vista y la función asociada a ejecutarse en ésta vista.
router.get('/login', function(req, res) { 
    res.render('auth/login', { //* el metodo render toma como primer parámetro la ruta de la vista a renderizar y como segundo la información que se requiera pasar a la vista
       autenticado: false; 
    });
}); 
*/


//* forma de usar el routing aplicando controladores
router.get('/login', formularioLogin); 
router.post('/login', autenticarUsuario); 

//cerrar sesión
router.post('/cerrar-sesion', cerrarSesion)

router.get('/registro', formularioRegistro); 
router.post('/registro', registrar);

router.get('/confirmar-cuenta/:token', confirmarCuenta); 

router.get('/olvide-password', formularioOlvidePassword); 
router.post('/olvide-password', resetPassword); 

// Almacena el nuevo password
router.get('/olvide-password/:token', comprobarTokenOlvidePassword);
router.post('/olvide-password/:token', nuevoPassword);


export default router;