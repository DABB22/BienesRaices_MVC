
import bcryp from 'bcrypt';


const usuarios = [
    {
        nombre: 'Diego',
        email: 'dcorreo@correo.com',
        confirmado: 1,
        password: bcryp.hashSync('123123', 10)
    },
    {
        nombre: 'Diego A',
        email: 'dacorreo@correo.com',
        confirmado: 1,
        password: bcryp.hashSync('123123', 10)
    }
]

export default usuarios
