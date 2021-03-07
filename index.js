const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Comment = require("./models/Comment");
const dbConnect = require("./utils/dbConnect");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();
app.use(cors());

app.use(express.json());
dbConnect();
app.get("/", (req, res) => {
  res.send("hello");
});
app.post("/user/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "Tüm bilgileri eksiksiz doldurunuz." });
  }
  const salt = bcrypt.genSaltSync(10);
  const hashedPass = bcrypt.hashSync(password, salt);

  const newUser = await User.create({ username, email, password: hashedPass });
  if (!newUser) {
    return res.json({ error: "Başarısız." });
  }
  async function sendMail() {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        type: "login",
        user: "sametyildirimtest@gmail.com",
        pass: process.env.EMAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: "sametyildirimtest@gmail.com",
      to: newUser.email,
      subject: "Email aktivasyon",
      text: "Email aktivasyon",
      html: `<a href='http://localhost:3000/userauth/${newUser._id}'>Aktivasyon Linki</a>`,
    });
  }

  sendMail().catch(console.error);
  res.json(newUser);
});
app.post("/user/auth", async (req, res) => {
  const { id } = req.body;
  const user = await User.findByIdAndUpdate(id, { authed: true });
  if (user) {
    return res.json({ success: true });
  }
  res.json({ success: false });
});
app.post("/user/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!password || !email) {
    return res.status(400).json({ error: "Email veya şifre boş bırakılamaz." });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "Email veya şifre hatalı." });
  }
  const isPassTrue = bcrypt.compareSync(password, user.password);
  if (isPassTrue) {
    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        email: user.email,
        authed: user.authed,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    return res.status(200).json({ success: true, token });
  }
  res.json({ success: false });
});
app.post("/comment", async (req, res) => {
  const { title } = req.body;
  const { usertoken } = req.headers;
  try {
    const user = jwt.verify(usertoken, process.env.JWT_SECRET);

    if (user.authed) {
      const newComment = await Comment.create({ title, owner: user.email });
      return res.status(200).json({ success: true, data: newComment });
    }
  } catch (error) {
    return res.status(400).json({ error: "Üç kağıtcılık yapma" });
  }
  if (!newComment) {
    return res.status(400).json({ error: "Mesaj oluşmadı" });
  }
});
app.get("/comment", async (req, res) => {
  const data = await Comment.find({});
  if (!data) {
    res.status(500).json({ error: "Data bulunamadı" });
  }
  res.status(200).json(data);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
