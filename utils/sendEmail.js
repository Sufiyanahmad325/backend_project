import nodemailer from 'nodemailer'


const sendEmail = async (email , subject , message)=>{
const transporter = nodemailer.createTransport({            
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'selina.zulauf47@ethereal.email',
        pass: 'R9FBdRbmwJsPzqMcrN'
    }
});


const send = await transporter.sendMail({
    from: "selina.zulauf47@ethereal.email",
    to: email,
    subject: subject,
    message:message,
    html: '<b>Hello world</b>',
  });

  return send

}

export default sendEmail;