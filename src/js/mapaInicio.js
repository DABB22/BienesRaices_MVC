(function (){
    const lat = 10.3830857;
    const lng = -75.4981989;
    const mapa = L.map('mapa-inicio').setView([lat, lng ], 12);

    let markers = new L.FeatureGroup().addTo(mapa); // nos va a permitir crear un grupo de markers // estos markers van a ser una capa que van a estar encima de nuestra capa y nos permitirá limpiar y filtrar resultados previos
    
    let propiedades = [];
 
    // FILTROS
    const filtros = {
        categoria: '',
        precio: ''
    };

    const categoriasSelect = document.querySelector('#categorias');
    const preciosSelect = document.querySelector('#precios');


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);


    //Filtrado de categorias y precios
    categoriasSelect.addEventListener('change', e => {
        filtros.categoria = +e.target.value;
        // console.log(filtros)
        filtrarPropiedades();
    });

    preciosSelect.addEventListener('change', e => {
        filtros.precio = +e.target.value;
        // console.log(filtros)
        filtrarPropiedades();
    });

    
    const obtenerPropiedades = async () => {

        try {
            const url = '/api/propiedades';
            const respuesta = await fetch(url);
            propiedades = await respuesta.json();
            // console.log(propiedades)

            mostrarPropiedades(propiedades);

        } catch (error) {
            console.log(error);
        }
    };


    const mostrarPropiedades = propiedades => {

        //Limpiar los marker previos 

        markers.clearLayers();

        propiedades.forEach( propiedad => {
            // Agregar los pines
            const marker = new L.marker([propiedad?.lat, propiedad?.lng], {
                autoPan: true
            }).addTo(mapa).bindPopup(`
                <p class='text-indigo-600 font-bold'>${propiedad?.categoria.nombre}</p>
                <h1 class='text-xl font-extrabold uppercase my-2'>${propiedad?.titulo}</h1>
                <img src='/uploads/${propiedad?.imagen}' alt='Imagen de la propiedad ${propiedad?.titulo}'>
                <p class='text-gray-600 font-bold'>${propiedad?.precio.nombre}</p>
                <a href='/propiedad/${propiedad?.id}' class='bg-indigo-600 block p-2 text-center font-bold uppercase'>Ver Propiedad</a>
            `);

            markers.addLayer(marker);
            
        });
    };

    const filtrarPropiedades = () => {
        // console.log('filtrando');

        const resultado = propiedades.filter( filtrarCategoria ).filter( filtrarPrecio );
        mostrarPropiedades(resultado);

    };

    const filtrarCategoria = propiedad => filtros.categoria ? propiedad.categoriaId === filtros.categoria : propiedad;
    // console.log(propiedad.categoriaId)
    
    const filtrarPrecio = propiedad => filtros.precio ? propiedad.precioId === filtros.precio : propiedad;



    obtenerPropiedades();

})();