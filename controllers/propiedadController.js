
import { unlink } from 'node:fs/promises';
import { validationResult } from 'express-validator';
import {Categoria, Precio, Propiedad, Mensaje, Usuario} from "../models/index.js";
import {esVendedor, formatearFecha} from '../helpers/index.js'
import { where } from 'sequelize';

//* Pagina principal al iniciar el login de sesión
const admin = async (req, res) => {

    //* leer queryString
    // console.log(req.query);
    const {pagina: paginaActual} = req.query;
    // console.log(paginaActual);

    const expresion = /^[1-9]$/; //cuando tenemos una expresión regular de este tipo/sintaxis tenemos acceso a un método llamado .test() -> devuelve true o false
    if(!expresion.test(paginaActual)){
        return res.redirect('/mis-propiedades?pagina=1');
    } 

    try {
        const { id } = req.usuario;

        // limites y offset para el paginador
        const limit = 3;
        const offset = ((paginaActual * limit) - limit);

        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit, //este limit es igual al de sql, sequelize tiene un metodo también para ese limit.
                offset, // este offset también exite en sequelize y lo que hara es saltarse x cantidad de registros.
                where: {
                    usuarioId: id,
                },
                include: [
                    { model: Categoria, as: 'categoria' },
                    { model: Precio, as:'precio' },
                    { model: Mensaje, as:'mensajes' }
                ]
            }),
            Propiedad.count({
                where: {
                    usuarioId: id
                }
            })
        ]);

        res.render('propiedades/admin', {   
            pagina: 'Mis Propiedades',
            csrfToken: req.csrfToken(),
            propiedades,
            paginas: Math.ceil(total/limit),
            paginaActual: Number(paginaActual),
            total,
            offset,
            limit
        });
    } catch (error) {
        console.log(error);
    }

    
}

//* Formulario para crear una nueva propiedad
const crear = async (req, res) => {

    // const {titulo, descripcion, categoria, precio} = req.body;

    // consultar modelo de precio y categoria
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]);


    res.render('propiedades/crear', {
        pagina: 'Crear Propiedad',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos:{} // creamos el objeto de datos para que no nos marque error cuando cargue la vista con el metodo get ya que en la función de guardar del motodo post tenemos este objeto para rellenar los campos 
    });
}


const guardar = async (req, res) => {
    // console.log(req.body)
    
    // resultado de la validación
    let resultado = validationResult(req);
    
    if(!resultado.isEmpty()){
    
        // consultar modelo de precio y categoria
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ]);

        return res.render('propiedades/crear', {
            pagina: 'Crear Propiedad',
            barra: true,
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body // datos que se ingresan en el formulario de crear la propiedad, los pasamos a la vista para rellenar los camposS
        });
    }

    // console.log(req.body);
    // console.log(req.usuario);

    // Crear un registro
    try {
        const {titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, categoria: categoriaId, precio: precioId } = req.body;
        const { id: usuarioId } = req.usuario;
        const propiedadGuardada = await Propiedad.create({
            titulo, 
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: ''
        });

        const { id } = propiedadGuardada;
        res.redirect(`/propiedades/agregar-imagen/${id}`);
    } catch (error) {
        console.log(error);
    };    
    return console.log('registro realizado correctamente');
};


const agregarImagen = async (req, res) => {

    const {id} = req.params;

    // validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);
    
    if(!propiedad){
        return res.redirect('/mis-propiedades');
    };
    
    // validar que la propiedad no este publicada
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades');
    };

    // la propiedad pertenece a quien visita la pagina
    if(req.usuario.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades');
    };

    res.render('propiedades/agregar-imagen',{
        pagina: `Agregar Imagen: ${propiedad.titulo}`,
        propiedad,
        csrfToken: req.csrfToken(),
    }); 
};


const almacenarImagen = async (req, res, next) => {
    const {id} = req.params;

    // validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);
    
    if(!propiedad){
        return res.redirect('/mis-propiedades');
    };
    
    // validar que la propiedad no este publicada
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades');
    };

    // la propiedad pertenece a quien visita la pagina
    if(req.usuario.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades');
    };

    try {
        
        console.log(req.file); // este req.file lo registra multer
        
        // Almacenar la imagen y plicar propiedad
        propiedad.imagen = req.file.filename;
        propiedad.publicado = 1;
        await propiedad.save();

        // res.redirect('/mis-propiedades');
        next();


    } catch (error) {
        console.log(error);
    }

};

const editar = async (req, res) => {

    const { id } = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);
    // console.log(propiedad);
    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }
    
    //revisar que quien visita la URL es quien creó la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }


    // consultar modelo de precio y categoria
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ]);


    res.render('propiedades/editar', {
        pagina: `Editar Propiedad ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad
    });
};


const guardarEdit = async (req, res) => {
    // console.log('Guardando cambios')

    // Verificar la validación
    let resultado = validationResult(req);

    if(!resultado.isEmpty()){
    
        // consultar modelo de precio y categoria
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ]);

        res.render('propiedades/editar', {
            pagina: `Editar Propiedad`,
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        });
    }

    const { id } = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);
    // console.log(propiedad);
    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }
    
    //revisar que quien visita la URL es quien creó la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }

    // reescribir el objeto y actualizar
    try {
        const {titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, categoria: categoriaId, precio: precioId } = req.body;

        propiedad.set({ // este metodo de sequelize nos ayuda a reescribir los valores de las llaves de la instancia del objeto de propiedades
            titulo, 
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
        });

        await propiedad.save();
        res.redirect('/mis-propiedades');
        
    } catch (error) {
        console.log(error);
    }

};


const eliminar = async (req, res) => {
    // console.log('eliminando propiedad', id);

    const {id} = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);
    // console.log(propiedad);
    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }
    
    //revisar que quien visita la URL es quien creó la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades');
    }

    // eliminar la imagen asociada 
    // para eliminar la imagen importaremos una dependencia que es interna de node --> import { unlink } from 'node:fs/promises'
    await unlink(`public/uploads/${propiedad.imagen}`);

    // eliminar la propiedad
    await propiedad.destroy();
    res.redirect('/mis-propiedades');

};


// Modifica el estado de la propiedad
    const cambiarEstado = async (req, res) => {

        const {id} = req.params;

        // Validar que la propiedad exista
        const propiedad = await Propiedad.findByPk(id);
        // console.log(propiedad);
        if(!propiedad){
            return res.redirect('/mis-propiedades');
        }
        
        //revisar que quien visita la URL es quien creó la propiedad
        if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
            return res.redirect('/mis-propiedades');
        }

        //Actualizar estado de la propiedad
        propiedad.publicado = !propiedad.publicado;

        await propiedad.save();

        res.json({
            resultado: true
        });

    };


const mostrarPropiedad = async (req, res) => {

    const {id} = req.params;
    // console.log(req.usuario)
    // const propiedad = await Propiedad.findByPk(id);
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Categoria, as: 'categoria' },
            { model: Precio, as:'precio' }
        ]
    });

    if(!propiedad || !propiedad.publicado){
        return res.redirect('/404');
    };

    res.render('propiedades/mostrar',{
        propiedad,
        pagina: Propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId)
    });
};


const enviarMensaje = async (req, res) => {
    const {id} = req.params;

    // const propiedad = await Propiedad.findByPk(id);
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Categoria, as: 'categoria' },
            { model: Precio, as:'precio' }
        ]
    });

    if(!propiedad){
        return res.redirect('/404');
    };

    // resultado de la validación
    let resultado = validationResult(req);
    

    if(!resultado.isEmpty()){

       return res.render('propiedades/mostrar',{
            propiedad,
            pagina: Propiedad.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
            errores: resultado.array()
        });

    }

    //Almacenar mensaje
    const {mensaje} = req.body;
    const {id: propiedadId} = req.params;
    const {id: usuarioId} = req.usuario;

    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId
    })

    // res.render('propiedades/mostrar',{
    //     propiedad,
    //     pagina: Propiedad.titulo,
    //     csrfToken: req.csrfToken(),
    //     usuario: req.usuario,
    //     esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
    //     enviado: true
    // });

     res.redirect('/');

}


    // Leer mensajes recibidos

    const verMensaje = async (req, res) => {

        const {id} = req.params;

        // Validar que la propiedad exista
        const propiedad = await Propiedad.findByPk(id, {
            include: [
                { model: Mensaje, as:'mensajes', 
                    include: [
                        { model: Usuario.scope('eliminarPassword') }
                    ]
                }
            ]
        });

        // console.log(mensajes);
        // return
        if(!propiedad){
            return res.redirect('/mis-propiedades');
        }
        
        //revisar que quien visita la URL es quien creó la propiedad
        if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
            return res.redirect('/mis-propiedades');
        }


        res.render('propiedades/mensajes',{
            pagina: 'Mensajes',
            mensajes: propiedad.mensajes,
            propiedad,
            formatearFecha
        })
    };

export {
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
};