const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/task";

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(url, options)
  .then((client, err) => {
    if (err) {
      console.error(err);
    } else {
      const obj = {
        DB_NAME: client.connections[0].name,
        HOST: client.connections[0].host,
        PORT: client.connections[0].port,
      };
      console.debug(`Connected to db`);
      console.log(obj);
    }
  })
  .catch((err) => {
    console.error(err);
  });
