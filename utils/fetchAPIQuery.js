const APIFeatures = require("./apiFeatures");

module.exports = class FetchQuery {
  constructor(query, model) {
    this.query = query;
    this.model = model;
  }

  async fetchData() {
    const result = new APIFeatures(this.model.find(), this.query)
      .filter()
      .sort()
      .limitFields();

    const resultLen = await result.query;

    const features = result.paginate();

    const results = await features.query.clone();

    return {
      results,
      length: resultLen.length,
    };
  }
};
