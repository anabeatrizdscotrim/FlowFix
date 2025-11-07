import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log(process.env.EMAIL_USER,
    process.env.EMAIL_PASS)

const testEmail = async () => {
  try {
    const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

    const mailOptions = {
      from: `"FlowFix" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // você pode enviar para você mesmo
      subject: "Teste de envio de e-mail",
      text: "Olá! Este é um teste do envio de e-mail com Nodemailer.",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("E-mail enviado com sucesso:", info.response);
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
  }
};

testEmail();
