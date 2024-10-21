import nodemailer from "nodemailer";
import { env } from "../config";
import ejs from "ejs";
import path from "path";
import SMTPTransport from "nodemailer/lib/smtp-transport";


export default class Email {

    private readonly transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options>;

    constructor(){
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // Use TLS
            auth: {
                user: 'mirordev@gmail.com',
                pass: env('smtpPassword'),
            },
        });
    }

    public async getEmailTemplate(data: any,templatePath: string = path.join(__dirname, './../views', "email.ejs")){
        const htmlContent = await ejs.renderFile(templatePath, data);
        return htmlContent;
    }

    public async sendEmail(from: string,to: string,subject: string,html: string){
        
        const mailOptions = {
            from: from,
            to: to,
            subject: subject,
            html: html
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            return info;
        } catch (error) {
            console.error('Error sending email: ', error);
            return false;
        }
    }
}

async function sEmail(){
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // Use TLS
        auth: {
            user: 'mirordev@gmail.com',
            pass: env('smtpPassword'),
        },
    });

    const templatePath = path.join(__dirname, './../views', "email.ejs");

    // Render the EJS template with the provided data
    const htmlContent = await ejs.renderFile(templatePath, {
        name: "William"
    });

    const mailOptions = {
        // from: '"YourApp" <no-reply@yourapp.com>', // Sender address
        to: "williamonyejiaka2021@gmail.com", // List of receivers
        subject: "email verification" ,// Subject line
        // text: "Helo World" // Plain text body
        // html: "<h1>Hello World</h1>" // HTML body
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending email: ', error);
        return false;
    }
}