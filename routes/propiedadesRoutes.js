import express from 'express';
import { body } from 'express-validator';
import { 
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarEdit,
    eliminar,
    cambiarEstado,
    mostrarPropiedad,
    enviarMensaje,
    verMensaje
 } from '../controllers/propiedadController.js';
import protegerRuta from '../middleware/protegerRuta.js';
import upload from '../middleware/subirImagen.js';
import identificarUsuario from '../middleware/identificarUsuario.js';

 
const router = express.Router();

router.get('/mis-propiedades',protegerRuta, admin);
router.get('/propiedades/crear',protegerRuta, crear);
router.post('/propiedades/crear',protegerRuta,
    body('titulo')
        .notEmpty().withMessage('El titulo del anuncio es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripción del anuncio es obligatoria')
        .isLength({max: 200}).withMessage('La descripción debe contener máximo 200 caracteres'),
    body('categoria')
        .isNumeric().withMessage('Selecciona una categoría'),
    body('precio')
        .isNumeric().withMessage('Selecciona una rango de precios'),
    body('habitaciones')
        .isNumeric().withMessage('Selecciona el número de habitaciones'),
    body('estacionamiento')
        .isNumeric().withMessage('Selecciona el número de estacionamientos'),
    body('wc').isNumeric()
        .withMessage('Selecciona una cantidad de baños'),
    body('lat')
        .notEmpty().withMessage('Selecciona una ubicación en el mapa'),
    guardar
);

router.get('/propiedades/agregar-imagen/:id', protegerRuta, agregarImagen);
router.post('/propiedades/agregar-imagen/:id', 
    protegerRuta,
    upload.single('imagen'), // se usa .single porque es una sola imagen para multiples se usa .array ... el parametro que se le pasa es lo que lo conecta, estamos haciendo uso de dropzone, en este caso en el archivo de configuración de dropzone se agrego una propiedad adicional llamada paramName y se le asigno el valor de 'imagen' y al tener ambos este valor es como se conectan para subir la imagen.
    // upload.array()
    almacenarImagen
);

router.get('/propiedades/editar/:id', protegerRuta, editar );
router.post('/propiedades/editar/:id',protegerRuta,
    body('titulo')
        .notEmpty().withMessage('El titulo del anuncio es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La descripción del anuncio es obligatoria')
        .isLength({max: 200}).withMessage('La descripción debe contener máximo 200 caracteres'),
    body('categoria')
        .isNumeric().withMessage('Selecciona una categoría'),
    body('precio')
        .isNumeric().withMessage('Selecciona una rango de precios'),
    body('habitaciones')
        .isNumeric().withMessage('Selecciona el número de habitaciones'),
    body('estacionamiento')
        .isNumeric().withMessage('Selecciona el número de estacionamientos'),
    body('wc').isNumeric()
        .withMessage('Selecciona una cantidad de baños'),
    body('lat')
        .notEmpty().withMessage('Selecciona una ubicación en el mapa'),
    guardarEdit
);


router.post('/propiedades/eliminar/:id', protegerRuta, eliminar); // el formulario solo soporta get y post cuando se crea la aplicación de esta manera.

router.put('/propiedades/:id', protegerRuta, cambiarEstado); // usamos put en este caso porque lo haremos con js a través de fetchAPI


//* AREA PÚBLICA

router.get('/propiedad/:id',identificarUsuario, mostrarPropiedad);
router.post('/propiedad/:id',identificarUsuario,
    body('mensaje').isLength({min: 20}).withMessage('El mensaje no puede ir vacío o es muy corto'),
    enviarMensaje
);


router.get('/mensajes/:id', protegerRuta, verMensaje);


export default router;