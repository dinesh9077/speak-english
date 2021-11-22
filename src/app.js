const express = require("express");
require("./db/conn");
var cors = require("cors");
const userRouter = require("./routes/user");
const tokenRouter = require("./routes/token");
const authRouter = require("./routes/auth");

const app = express();
var serverPort = 6000;
const port = process.env.PORT || serverPort

app.use(express.json());
app.use(cors());

//routes
app.use(userRouter);
app.use(tokenRouter);
app.use(authRouter);

//connection
app.listen(port, () => console.log(`Magic Happen on :) ${port}`));