const UserPromo = require("../models/userPromoModel");
const Promo = require("../models/promoModel");
const Company = require("../models/companyModel");
const Email = require("../models/emailModel");
const Notification = require("../models/notificationModel");
const Notice = require("../models/noticeModel");
const SendEmail = require("./email");

const { sendFile, getFileUrl, getAFileUrl } = require("../config/multer");

module.exports = class Record {
  constructor(user) {
    this.user = user;
  }

  async setPromoRecord() {
    const promos = await Promo.find();
    const form = {
      username: this.user.username,
      promoId: "",
      promoTarget: 0,
      promoAmount: 0,
      promoName: "",
      promoStart: 0,
      promoEnd: 0,
      promoGifts: [],
      promoDescription: "",
      promoBanner: "",
      promoBannerUrl: "",
      promoState: "",
      promoStatus: false,
    };

    promos.forEach((el) => {
      form.promoId = el._id;
      form.promoTarget = el.promoTarget;
      form.promoName = el.promoName;
      form.promoStart = el.promoStart;
      form.promoEnd = el.promoEnd;
      form.promoGifts = el.promoGifts;
      form.promoDescription = el.promoDescription;
      form.promoBanner = el.promoBanner;
      form.promoStatus = el.promoStatus;

      UserPromo.create(form);
    });

    return this;
  }

  async prepareEmail(template, state) {
    const email = await Email.findOne({ template: template });
    const company = await Company.findOne({ state: state });
    const banner = await getAFileUrl(email.banner);

    const from = company.systemEmail;
    const content = email.content.replace(
      "[company-name]",
      `${company.companyName}`
    );

    if (company) {
      const companyInfo = {
        email: from,
        username: this.user.username,
      };

      const users = [companyInfo, this.user];

      users.forEach((user) => {
        try {
          new SendEmail(company, user, email, banner, content, "").sendEmail();
        } catch (err) {
          return next(
            new AppError(
              `There was an error sending the email. Try again later!, ${err}`,
              500
            )
          );
        }
      });
    }

    return this;
  }
};
