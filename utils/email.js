const path = require("path");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const dotenv = require("dotenv");
const Transport = require("nodemailer-sendinblue-transport");
dotenv.config({ path: "../config.env" });

module.exports = class Email {
  constructor(company, user, email, bannerURL, content, resetURL) {
    this.companyName = company.companyName;
    this.domainName = company.domainName;
    this.logo = company.logo;
    this.from = company.systemEmail;
    this.user = user;
    this.template = email.template;
    this.companyPhone = company.media[2]?.text;
    this.title = email.title;
    this.banner = bannerURL;
    this.content = content;
    this.headerColor = email.headerColor;
    this.footerColor = email.footerColor;
    this.mainColor = email.mainColor;
    this.greeting = email.greeting;
    this.warning = email.warning;
    this.resetURL = resetURL;
  }

  // 1) SET CONFIGURATION
  transporter() {
    return nodemailer
      .createTransport(
        new Transport({
          apiKey: process.env.SENDINBLUE_KEY,
        })
      )
      .use(
        "compile",
        hbs({
          viewEngine: {
            partialsDir: path.join(__dirname, "../views/partials"),
            layoutsDir: "../views/layouts",
            defaultLayout: "",
          },
          viewPath: "views",
          extName: ".hbs",
        })
      );
  }

  // 2) SEND EMAIL
  send(template, subject) {
    this.transporter()
      .sendMail({
        from: this.from, // sender address
        to: this.user.email, // list of recipients
        subject: subject, // Subject line
        template: template,
        context: {
          banner: this.banner,
          content: this.content,
          headerColor: this.headerColor,
          footerColor: this.footerColor,
          mainColor: this.mainColor,
          logo: this.logo,
          companyPhone: this.companyPhone,
          greeting: this.greeting,
          warning: this.warning,
          name: this.user.username,
          resetURL: this.resetURL,
          from: this.from,
          title: this.title,
          domainName: this.domainName,
          companyName: this.companyName,
        },
      })
      .then(() => {
        console.log("Email sent successfully");
      })
      .catch((err) => {
        console.log(err);
      });
  }

  sendEmail() {
    console.log(`Email sending...`);
    this.send(`${this.template}`, `${this.title}`);
  }
};
