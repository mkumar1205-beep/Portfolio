const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config(); 

const app = express();
app.use(cors());
app.use(express.json());

app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
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
    res.status(500).send("Error sending message");
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));

