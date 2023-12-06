
//* importando con Common JS
//const express = require('express'); // este require lo que hace es extraer la dependencia instalada, va a nodemodule y va y extrae esta dependencia en este archivo.

//* importando con ECMAScrip Module 
import express from "express"; // dependencias no requieren que se indique extensión
import csrf from "csurf";
import cookieParser from "cookie-parser";
import usuarioRoutes from "./routes/usuarioRoutes.js"; // archivos internos que hayamois creados  sí requieren que se les indique la extensión.
import propiedadesRoutes from "./routes/propiedadesRoutes.js"; // archivos internos que hayamois creados  sí requieren que se les indique la extensión.
import appRoutes from "./routes/appRoutes.js"; // archivos internos que hayamos creados  sí requieren que se les indique la extensión.
import apiRoutes from "./routes/apiRoutes.js"; // archivos internos que hayamos creados  sí requieren que se les indique la extensión.
import db from "./config/db.js";


//* Crear la app
const app = express(); // app contiene toda la información del servidor que estamos creando.


//* Habilitar lectura de datos de formularios
// app.use(bodyParser.urlencoded({extended: true})); //* dependencía que anteriormente debia instalarse pero que ya fue agregada a express, si se llega a ver esto podemos cambiarla por la nueva 
app.use(express.urlencoded({extended: true}));


//* HABILITAR COOKIE PARSER
app.use(cookieParser());


//* HABILITAR CSRF
app.use(csrf({cookie: true}));


//* Conexión a la Base de Datos
try {
    await db.authenticate(); // metodo de sequelize que va a intentar autenticarse en la base de datos.
    db.sync(); // nos ayuda a crear las tablas en caso de que no estén creadas
    console.log('Conexión correcta a la base de datos');
} catch (error) {
    console.log(error);
};


//* Habilitar PUG
// ya es una configuración que soporta express así que solo es colocar el siguiente código:
app.set('view engine', 'pug'); // set es para agregar configuración - en este caso le indicamos el tipo de template engie que vamos a utilizar
app.set('views', './views'); // aqui le indicamos donde va a encontrar las vistas que vamos a renderizar


//* Carpeta pública
app.use(express.static('public')); // con la función de express y el metodo .static podemos especificarle a node donde va a encontrar los archivos estaticos.


//* Routing
app.use('/', appRoutes);
app.get('/', usuarioRoutes ); // el get se limita a buscar la ruta definida especificamente
app.use('/auth', usuarioRoutes ); // con el use es más dinámico ya que va a buscar todas las rutas que empiecen por el parametro que se indique en el primer
app.use('/', propiedadesRoutes ); // con el use es más dinámico ya que va a buscar todas las rutas que empiecen por la / 
app.use('/api', apiRoutes);


//* Mínimos requisitos para definir la aplicación:
// Crear la aplicación(línea 10), luego definir un puerto y arrancar el proyecto.
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3000;
app.listen(port, host, () => {
    console.log('El servidor está funcionando en el puerto', port);
    console.log('El host es ', host);
});





