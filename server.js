const mongoose = require("mongoose");
const dotenv = require("dotenv");
const server = require("./app");
mongoose.set("strictQuery", true);

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.log({ database_error: err });
  });

const PORT = process.env.PORT || 5000;
// const PORT = 1000;
server.listen(PORT, () => {
  console.log(`App running on PORT ${PORT}...`);
});
