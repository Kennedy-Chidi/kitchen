const twilio = require("twilio");
const dotenv = require("dotenv");
dotenv.config({ path: "../config.env" });

class SendSMS {
  sendSMS(data) {
    const client = new twilio(
      process.env.TWILIO_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    client.messages
      .create({
        body: data,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: "+2348068131738",
      })
      .then((message) => {
        console.log(message);
      })
      .catch((err) => console.log(err));
  }

  static max500(data) {
    let result = false;
    if (data.length <= 500) {
      result = true;
    }
    return result;
  }

  static validateName(name) {
    // Perform name validation logic
    // Return true if the name is valid, otherwise false
    return true; // Return true for demonstration purposes
  }
}

module.exports = SendSMS;
