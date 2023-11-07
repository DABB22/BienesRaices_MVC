
import nodemailer from 'nodemailer';

const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const {nombre, email, token} = datos;

    //* ENVIO DEL EMAIL CON LA INFORMACIÓN PARA COMPLETAR EL REGISTRO

    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Confirma tu cuenta en BienesRaices.com',
        text: 'Confirma tu cuenta en BienesRaices.com',
        html: `
            <p>Hola ${nombre}, comprueba tu cuenta en BienesRaices.com</p>
            <p>Tu cuenta está a un paso de quedar activa, visita el siguiente enlace para confirmarla <a href="${location.origin}:${process.env.PORT ?? 3000}/auth/confirmar-cuenta/${token}">ConfirmarCuenta</a>  y disfrutar de nuestros servicios</p>
            <p>En caso de NO haber creado esta cuenta por favor hacer caso omiso a este correo</p>
        `
        // html: `
        //     <p>Hola ${nombre}, comprueba tu cuenta en BienesRaices.com</p>
        //     <p>Tu cuenta está a un paso de quedar activa, visita el siguiente enlace para confirmarla <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar-cuenta/${token}">ConfirmarCuenta</a>  y disfrutar de nuestros servicios</p>
        //     <p>En caso de NO haber creado esta cuenta por favor hacer caso omiso a este correo</p>
        // `
    })
};


const emailRecuperarPassword = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const {nombre, email, token} = datos;

    //* ENVIO DEL EMAIL CON LA INFORMACIÓN PARA COMPLETAR EL REGISTRO

    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Recupera tu contraseña | BienesRaices.com',
        text: 'Recupera tu contraseña | BienesRaices.com',
        html: `
            <p>Hola ${nombre}, recupera nuevamente el acceso en BienesRaices.com</p>
            <p>Recupera tu contraseña en un solo click visitando el siguiente enlace <a href="${location.origin}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">RecuperarContraseña</a></p>
            <p>En caso de NO haber solicitado este canbio de contraseña por favor hacer caso omiso a este correo</p>
        `
        // html: `
        //     <p>Hola ${nombre}, recupera nuevamente el acceso en BienesRaices.com</p>
        //     <p>Recupera tu contraseña en un solo click visitando el siguiente enlace <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">RecuperarContraseña</a></p>
        //     <p>En caso de NO haber solicitado este canbio de contraseña por favor hacer caso omiso a este correo</p>
        // `
    })
};





export {
    emailRegistro,
    emailRecuperarPassword
};