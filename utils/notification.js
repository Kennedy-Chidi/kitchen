const Notification = require("../models/notificationModel");
const Company = require("../models/companyModel");
const Notice = require("../models/noticeModel");
module.exports = class Notify {
  constructor(user, type, totalAmount, time, salesRep) {
    this.user = user;
    this.type = type;
    this.totalAmount = totalAmount;
    this.time = time;
    this.salesRep = salesRep;
  }

  async sendNotification() {
    const company = await Company.findOne();
    const hour = new Date(this.time).getHours();
    let timeOfDay;

    if (hour >= 0 && hour < 12) {
      timeOfDay = "morning";
    } else if (hour >= 12 && hour < 16) {
      timeOfDay = "afternoon";
    } else {
      timeOfDay = "evening";
    }

    const notification = await Notification.findOne({ name: this.type });
    if (notification) {
      const content = notification.content
        ?.split("[username]")
        .join(this.user.username)
        .split("[moment]")
        .join(timeOfDay)
        .split("[customer-care]")
        .join(this.salesRep.username)
        .split("[company-name]")
        .join(company.companyName)
        .split("[customer-phone]")
        .join(this.user.phoneNumber)
        .split("[customer-care-phone]")
        .join(this.salesRep.callLine)
        .split("[customer-address]")
        .join(this.user.address)
        .split("[amount]")
        .join(Notify.formatNumber(this.totalAmount));

      const form = {
        username: this.user.username,
        title: notification.title,
        name: notification.name,
        content: content,
        time: this.time,
      };

      const result = await Notice.create(form);

      return result;
    }
  }

  static formatNumber(number) {
    if (!number) {
      return "0.00";
    }
    const options = { style: "decimal", maximumFractionDigits: 0 };
    return number.toLocaleString("en-US", options);
  }

  static formartTime(data) {
    const date = new Date(data);
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  static formatDate(data) {
    function getOrdinalSuffix(day) {
      const suffixes = ["th", "st", "nd", "rd"];
      const mod = day % 100;
      return day + (suffixes[(mod - 20) % 10] || suffixes[mod] || suffixes[0]);
    }

    if (!data) {
      return "";
    }
    const date = new Date(data);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();

    return `${getOrdinalSuffix(day)} ${month}. ${year}`;
  }
};
