const UserPromo = require("../models/userPromoModel");
const User = require("../models/userModel");
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

    for (let i = 0; i < promos.length; i++) {
      const el = promos[i];
      form.promoId = el._id;
      form.promoTarget = el.promoTarget;
      form.promoName = el.promoName;
      form.promoStart = el.promoStart;
      form.promoEnd = el.promoEnd;
      form.promoGifts = el.promoGifts;
      form.promoDescription = el.promoDescription;
      form.promoBanner = el.promoBanner;
      form.promoStatus = el.promoStatus;
      await UserPromo.create(form);
    }

    const ref = "";
    const payload = {
      state: this.user.state,
      user: this.user,
      ref,
    };

    this.prepareEmail("signup", payload);

    if (this.user.referredBy != "") {
      const refUser = await User.findOne({ username: this.user.referredBy });
      if (refUser) {
        const payload = {
          state: this.user.state,
          user: refUser,
          referralUsername: this.user.username,
        };
        this.prepareEmail("referral-signup", payload);
      }
    }

    return this;
  }

  async prepareEmail(template, payload) {
    const { state, user, referralUsername } = payload;
    const email = await Email.findOne({ template: template });
    const company = await Company.findOne({ state: state });
    const banner = await getAFileUrl(email.banner);

    if (
      email != null &&
      email != undefined &&
      company != null &&
      company != undefined
    ) {
      const from = company.systemEmail;
      const content = email.content
        ?.split("[company-name]")
        .join(company.companyName)
        .split("[username]")
        .join(user.username)
        .split("[referral-username]")
        .join(referralUsername);

      const companyInfo = {
        email: from,
        username: user.username,
      };

      const users = [companyInfo, user];

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
