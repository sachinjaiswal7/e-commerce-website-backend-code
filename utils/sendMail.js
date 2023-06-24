import nodemailer from "nodemailer"


const sendMail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.NODEMAILER_HOST,
        port: process.env.NODEMAILER_PORT,
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASSWORD
        }
    });

    const mailOptions = {
        from: "crplay@gmail.com",
        to: options.toEmail,
        subject: options.subject,
        text: options.text
    };

    await transporter.sendMail(mailOptions);


}

export default sendMail;