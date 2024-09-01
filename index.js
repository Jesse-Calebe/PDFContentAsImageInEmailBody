const fs = require("fs");
const path = require("path");
const Poppler = require("pdf-poppler");
const nodemailer = require("nodemailer");

const pdfFilePath = path.join(__dirname, "relatorio.pdf");
const outputDir = path.join(__dirname, "output"); // Diretório temporário para salvar as imagens

// Configurar transporte de e-mail (substitua com suas credenciais)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, //true para 465, false para as demais
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const convertPDFToImages = async () => {
  try {
    const options = {
      format: "png",
      out_dir: outputDir,
      out_prefix: path.basename(pdfFilePath, path.extname(pdfFilePath)),
      page: null, // Convertendo todas as páginas
    };

    await Poppler.convert(pdfFilePath, options);
    console.log("Conversão concluída. As imagens foram salvas em:", outputDir);
    sendEmailWithImages();
  } catch (error) {
    console.error("Erro durante a conversão:", error);
  }
};

const sendEmailWithImages = () => {
  fs.readdir(outputDir, (err, files) => {
    if (err) {
      console.error("Erro ao ler o diretório de saída:", err);
      return;
    }

    // Filtrar arquivos PNG
    const imageFiles = files.filter((file) => file.endsWith(".png"));

    // Ler cada imagem e preparar os anexos inline
    const attachments = imageFiles.map((file, index) => ({
      filename: file,
      path: path.join(outputDir, file),
      cid: `image${index + 1}@example.com`, // Content ID para referência no corpo do e-mail
    }));

    // Construir o HTML do e-mail com as imagens embutidas
    let htmlContent = "<h1>Relatório PDF em Imagens</h1>";
    attachments.forEach((attachment, index) => {
      htmlContent += `<img src="cid:image${index + 1}@example.com" /><br/>`;
    });

    // Configurações do e-mail
    const mailOptions = {
      from: process.env.SEND_FROM,
      to: process.env.SEND_TO,
      subject: "Relatório PDF em Imagens",
      html: htmlContent,
      attachments: attachments,
    };

    // Enviar o e-mail
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log("Erro ao enviar o e-mail:", error);
      }
      console.log("E-mail enviado:", info.response);

      // Limpar imagens temporárias
      imageFiles.forEach((file) => fs.unlinkSync(path.join(outputDir, file)));
      console.log("Imagens temporárias deletadas.");
    });
  });
};

convertPDFToImages();
