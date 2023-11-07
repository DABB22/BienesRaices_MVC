
import { Sequelize } from 'sequelize';
import { Precio, Categoria, Propiedad } from '../models/index.js'


const inicio = async (req, res) => {

    const usuario = req.usuario;
    // console.log(usuario);

    const [categorias, precios, casas, departamentos ] = await Promise.all([
        Categoria.findAll({raw: true}),// el {raw: true} nos trae la consulta mas organizada y solo los datos de id y precio
        Precio.findAll({raw: true}),
        Propiedad.findAll({
            limit: 3,
            where: {
                categoriaId: 1
            },
            include: [
                {
                    model: Precio,
                    as: 'precio'
                }
            ],
            order: [['createdAt', 'DESC']]
        }),
        Propiedad.findAll({
            limit: 3,
            where: {
                categoriaId: 2
            },
            include: [
                {
                    model: Precio,
                    as: 'precio'
                }
            ],
            order: [['createdAt', 'DESC']]
        }),
    ]);

    // console.log(categorias)

    res.render('inicio',{
        pagina: 'Inicio',
        categorias,
        precios,
        casas,
        departamentos,
        csrfToken: req.csrfToken(),
        usuario
    })
};

const categoria = async (req, res) => {
    const {id} = req.params;

    //Comprobar que la categoria exista
    const categoria = await Categoria.findByPk(id);
    if(!categoria){
        return res.redirect('/404');
    }

    //Obtener las propiedades de la categoría
    const propiedades = await Propiedad.findAll({
        where: {
            categoriaId: id
        },
        include: [
            {model: Precio, as: 'precio'},
        ]
    });

    res.render('categoria', {
        pagina: `${categoria.nombre}(s) en venta`,
        propiedades,
        csrfToken: req.csrfToken()
    })
    
};

const paginaError = (req, res) => {
    res.render('404',{
        pagina: 'No Encontrada',
        csrfToken: req.csrfToken()
    })
};

const buscador = async (req, res) => {
    const {termino} = req.body;

    if(!termino.trim()){
        res.redirect('back');
    }

    //consultar las propiedades
    const propiedades = await Propiedad.findAll({
        where:{
            titulo: {
                [Sequelize.Op.like] : '%' + termino + '%' //importamos Sequelize para usar la propiedad o metodo .Op para tener acceso a diferentes funciones o metodo en este caso requerimos uno de busqueda, like este es parecido al operador de like de sql // lo que hace este codigo es buscar el termino en cualquier parte de la cadena del titulo 
            }
        },
        include: [
            {model: Precio, as: 'precio'}
        ]
    })

    res.render('busqueda', {
        pagina: 'Resultados de la búsqueda',
        propiedades,
        csrfToken: req.csrfToken()
    })

};

export {
    inicio,
    categoria,
    paginaError,
    buscador
};