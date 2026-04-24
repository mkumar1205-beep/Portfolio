const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config(); 

const app = express();
app.use(cors());
app.use(express.json());

const path = require("path");
app.use(express.static(path.join(__dirname, "public")));


app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // IMPORTANT
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `Message from ${name}`,
      replyTo: email,
      text: `You have a new message from ${name}(${email}):\n\n${message}`
    });

    res.send("Message sent!");
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).send("Error sending message");
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

