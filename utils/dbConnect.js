const mongoose = require("mongoose");
const dbConnect = () => {
  mongoose.connect(
    process.env.MONGO_URI,
    { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true },
    (err) => {
      if (err) throw err;
      console.log("db bağlandı");
    }
  );
};
module.exports = dbConnect;
