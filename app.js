const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const router = require("./router/router");
app.use(bodyParser.json());
app.use(express.json())
app.use(router);
app.listen(3002, () => {
  require("./db");
  console.log("server listening to port no", 3002);
});
