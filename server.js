const mongoose = require("mongoose");
const app = require("./app");

const DB_HOST =
  "mongodb+srv://Volodymyr:adnDTkMf8c1UJX01@cluster0.jyvut9u.mongodb.net/contacts_book?retryWrites=true&w=majority";

mongoose
  .connect(DB_HOST)
  .then(() => console.log("Database connection successful"))
  .then(() => app.listen(3000))
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });
