class Validator {
  static removeTags(data) {
    let cleanedString = data.replace(/<[^>]+>/g, "");
    cleanedString = cleanedString.replace(/[^\w\s]/gi, "");
    return cleanedString;
  }

  static isEmpty(data) {
    let result = false;
    if (data == "" || data == null || data == undefined) {
      result = true;
    }
    return result;
  }

  static trimData(data) {
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === "string") {
        data[key] = value.trim();
      }
    });
    return data;
  }

  static trimAData(data) {
    return data.trim();
  }

  static max250(data) {
    let result = false;
    if (data.length <= 250) {
      result = true;
    }
    return result;
  }

  static max500(data) {
    let result = false;
    if (data.length <= 500) {
      result = true;
    }
    return result;
  }

  static capitalizeFirstLetter(word) {
    if (!word || typeof word !== "string") {
      return "";
    }

    const lowercasedWord = word.toLowerCase();
    const capitalizedWord =
      lowercasedWord.charAt(0).toUpperCase() + lowercasedWord.slice(1);

    return capitalizedWord;
  }

  static validateName(name) {
    // Perform name validation logic
    // Return true if the name is valid, otherwise false
    return true; // Return true for demonstration purposes
  }
}

module.exports = Validator;
