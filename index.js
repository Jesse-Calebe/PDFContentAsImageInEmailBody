const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    host: '---',
    port: 0,
    secure: false, //true para 465, false para as demais
    auth: {
        user: '-----',
        pass: '----'
    }
});

transport.sendMail({
    from: '------',
    to: '-----',
    subject: 'Teste',
    html: '<h1>Olá,pessoa</h1> <p>Essa é sua senha: {}</p>',
    text: 'Olá, pessoa! Esse amail contem suasenha',
})
.then((response) => console.log('email enviado com sucesso!'))
.catch((err) => console.log('Erro', err));