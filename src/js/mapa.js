(function() {
    const lat = document.querySelector('#lat').value || 10.3830857;
    const lng = document.querySelector('#lng').value || -75.4981989;
    const mapa = L.map('mapa').setView([lat, lng ], 15);
    let marker;

    // utilizar Provider y Geocoder
    const geocodeService = L.esri.Geocoding.geocodeService();
    

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);


    // El pin
    marker = new L.marker([lat, lng],{
        draggable: true, // por default no se puede mover el pin
        autoPan: true // esta opción nos ayuda a centrar nuevamente el mapa luego de mover el pin
    }).addTo(mapa);


    // Detectar el movimiento del pin para leer su latitud y longitud
    marker.on('moveend', function(e){
        marker = e.target;

        const posicion = marker.getLatLng();
        // console.log(posicion);
        
        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng));

        //Obtener información de las calles al soltar el pin
        geocodeService.reverse().latlng(posicion, 15).run(function(error, resultado){
            console.log(resultado);
            // console.log(error);
            marker.bindPopup(resultado.address.LongLabel);

            // llenar los campos
            document.querySelector('.calle').textContent = `${resultado?.address?.Address ?? ''} ${resultado?.address?.Neighborhood ?? ''} `;
            document.querySelector('#calle').value = `${resultado?.address?.Address ?? ''} ${resultado?.address?.Neighborhood ?? ''} `;
            document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';
            document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';

        });

    });


})()