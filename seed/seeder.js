
//* archivo principal del seeder.

import {exit} from 'node:process';
import categorias from './categorias.js';
import precios from './precios.js';
import usuarios from './usuarios.js';
// import Categoria from '../models/Categoria.js'
// import Precio from '../models/Precio.js';
import db from '../config/db.js';
// import { truncate } from 'node:fs';
import { Categoria, Precio, Usuario } from '../models/index.js'

// función que importa los datos de categorias y precios a la BD
const importarDatos = async () => {
    try {
        // autenticar
        await db.authenticate();

        // generar columnas
        await db.sync();

        // insertamos los datos
        await Promise.all([Categoria.bulkCreate(categorias), Precio.bulkCreate(precios), Usuario.bulkCreate(usuarios)] ); // bulkCreate nos va a insertar todos los datos del seed de categorias creado para alimentar nuestra tabla en la BD

        console.log('Datos importados correctamente');
        exit(); // por qué podemos pasar exit(), exit)(0), exit(1)? 
        // con los parentesís vacío o en cero siginifica que termina la ejecución de ese código o proceso pero fue correcto 
        // con uno como parametro termina los procesos o el código pero que hubo un error

        
    } catch (error) {
        console.log(error);
       // process.exit(1); // forma de terminar los procesos en caso de que haya un error y evitar que continúe con otros procesos.
       exit(1);
    };
};

// función que limpia los datos de la BD
const eliminarDatos = async () => {
    try {
        // método para limpiar o eliminar
        // await Promise.all([Categoria.destroy({where: {}, truncate: true}), Precio.destroy({where: {}, truncate: true})]);
        
        // otro metodo para eliminar y limpiar
        await db.sync({force: true});
        console.log('datos eliminados correctamente');
        exit();
        
    } catch (error) {
        console.log(error);
        exit(1);
    }
};


if (process.argv[2] === '-i') { // .argv es algo interno de node, es una forma en la que le pasas argumentos a un comando desde el comandline(terminal) // normalmente lo va a leer como si fuera un arreglo
    importarDatos();
};

if (process.argv[2] === '-e') { // .argv es algo interno de node, es una forma en la que le pasas argumentos a un comando desde el comandline(terminal) // normalmente lo va a leer como si fuera un arreglo
    eliminarDatos();
};