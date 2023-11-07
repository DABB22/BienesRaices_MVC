
import { Dropzone } from 'dropzone';

const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
// console.log(token);

Dropzone.options.imagen = {
    dictDefaultMessage: 'Sube tus imagenes aquí',
    acceptedFiles: '.png,.jpg,.jpeg',
    maxFilesize: 5, // este numero es em mega
    maxFiles: 1,
    parallelUploads: 1, // este numero debe ser igual al de maxFiles
    autoProcessQueue: false, // procesa en automatico la subida del archivo sin alguna acción de un botón
    addRemoveLinks: true,
    dictRemoveFile: ' X Quitar Imagen ',
    dictMaxFilesExceeded: 'El límite es un(1) archivo',
    headers: {
        'CSRF-Token': token
    },
    paramName: 'imagen', // mismo nombre que se asignó en el archivo propiedadesroutes en el endpoitn que carga la imagen, se hace uso de upload funcion creada en el archivo subirImagen de la carpeta middleware.
    init: function() { // este init y function nos va a permitir reescribir sobre el objeto de eventos de dropzone, son funciones que podemos registrar cuando inice dropzone
        const dropzone = this;
        const btnPublicar = document.querySelector('#publicar');

        btnPublicar.addEventListener('click', function() {
            dropzone.processQueue();
        })
        
        // siempre que veamos dropzone.on() quiere decir que es un evento de dropzone, tiene muchos diferentes eventos
        //ej.
        // dropzone.on('error', function (file, mensaje) {
        // }); 
        dropzone.on('queuecomplete', function () { // no toma parametros ya que se ejecuta una vez se a ejecutado el queue
            if(dropzone.getActiveFiles().length == 0) {
                window.location.href = '/mis-propiedades';
            }
        }); 
    }
};