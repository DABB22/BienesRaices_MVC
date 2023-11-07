// import { Sequelize } from "sequelize";
import { DataTypes } from "sequelize";
import bcrypt from 'bcrypt';
import db from "../config/db.js";


const Usuario = db.define('Usuarios', { // con el metodo .define definiremos el nombre de las tablas de la BD (primer parámetro) y definiremos un objeto de opciones con la estructura de los datos de esta (segundo parametro) 
    nombre: {
        type: DataTypes.STRING,
        allowNull: false, // es un tipo de validación para que el campo no vaya vacío
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false, // es un tipo de validación para que el campo no vaya vacío
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false, // es un tipo de validación para que el campo no vaya vacío
    },
    token: DataTypes.STRING,
    confirmado: DataTypes.BOOLEAN,
}, {
    hooks: { // los hooks son funciones que puedes agregar a cierto modelo
        beforeCreate: async function (usuario) {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(usuario.password, salt);
        }
    },
    scopes: { // te permiten eliminar ciertos campos cuando haces una consulta a un modelo en especifico
        eliminarPassword: {
            attributes: {
                exclude: ['password', 'token', 'confirmado', 'createdAt', 'updatedAt']
            }
        }
    }

});

//* Metodos personalizados
//comprobar password
Usuario.prototype.verificarPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

export default Usuario;