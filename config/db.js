import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

dotenv.config({path: '.env'}) // indicamos donde va a encontrar el archivo .env de las variables de entorno

// esto nos crea una nueva instancia, se va a conectar a la base de datos que acabamos de crear y de esa forma va a poder agregar los datos a la BD. 
const db = new Sequelize(process.env.BD_NOMBRE, process.env.BD_USER, process.env.BD_PASSWORD ?? '',{ //* toma 4 parametros: nombre de la base de datos, usuario, password y un objeto de configuración.
    host: process.env.BD_HOST,
    port: process.env.BD_PORT,
    dialect: 'mysql',
    define: {
        timestamps: true // esto lo que nos hace es agregar dos columnas más a nuestra BD, una de cuando fue creado y o tra de cuando fue actualizado.
    },
    pool: { // configura como va a ser el comportamiento para conexiones nuevas o existentes.
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorsAliases: false // es algo obsoleto por lo que lo colocamos en false para asegurarnos de que no se usen.
}); 

export default db;