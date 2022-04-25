const express = require("express");
require("./db/conn");
var cors = require("cors");
const userRouter = require("./routes/user");
const tokenRouter = require("./routes/token");
const authRouter = require("./routes/auth");
const historyRouter = require("./routes/history");
const agoraRouter = require("./routes/agora");
const adminRouter = require("./routes/admin");
const profileRouter = require("./routes/profile");
const zegoTokenRouter = require("./routes/zegoToken");
const newCallNowRouter = require("./routes/new_call_now");

const app = express();
var serverPort = 5000;
const port = process.env.PORT || serverPort

app.use(express.json());
app.use(cors());

//routes
app.use(userRouter);
app.use(tokenRouter);
app.use(authRouter);
app.use(historyRouter);
app.use(agoraRouter);
app.use(adminRouter);
app.use(profileRouter);
app.use(zegoTokenRouter);
app.use(newCallNowRouter);

//connection
app.listen(port, () => console.log(`Magic Happen on :) ${port}`));