
import multer from "multer";
import path from 'path'; // esto es algo interno de Nodejs // es algo que nos va a retornar la ubicación en el dd 
import { generarId } from '../helpers/token.js'

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log(req);
        console.log(file);
        cb(null, './public/uploads/')
    },
    filename: function(req, file, cb) {
        console.log(req);
        console.log(file);
        cb(null, generarId() + path.extname(file.originalname))
    }
});


const upload = multer({storage});

export default upload;