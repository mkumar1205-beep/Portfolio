const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Persistence helper for incoming contact inquiries
function saveMessageLocally(entry) {
  try {
    const dataDir = path.join(__dirname, "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, "messages.json");
    let messages = [];
    if (fs.existsSync(filePath)) {
      try {
        messages = JSON.parse(fs.readFileSync(filePath, "utf8"));
      } catch {
        messages = [];
      }
    }
    messages.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
  } catch (err) {
    console.error("Local message backup error:", err.message);
  }
}

app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/resume", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "resume.html"));
});

app.post("/send", async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Please provide name, email, and message." });
  }

  const messageEntry = {
    name,
    email,
    message,
    timestamp: new Date().toISOString(),
  };

  // Always save backup locally so no inquiries are lost
  saveMessageLocally(messageEntry);

  const emailUser = process.env.EMAIL_USER || "manyakumar1205@gmail.com";
  const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim() : "";
  const recipient = process.env.CONTACT_RECIPIENT || "manyakumar1205@gmail.com";

  // If a Gmail App Password is configured, dispatch directly via Nodemailer
  if (emailPass.length > 0) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      await transporter.sendMail({
        from: `"Portfolio Contact" <${emailUser}>`,
        to: recipient,
        subject: `[Portfolio Contact] Message from ${name}`,
        replyTo: email,
        text: `New contact submission from your portfolio:\n\nName: ${name}\nEmail: ${email}\nTime: ${new Date().toLocaleString()}\n\nMessage:\n${message}\n`,
      });

      return res.status(200).json({
        success: true,
        sentViaSmtp: true,
        message: "Message transmitted successfully to manyakumar1205@gmail.com!"
      });
    } catch (error) {
      console.error("Gmail SMTP error:", error.message);
    }
  }

  // Pre-filled direct mailto link to manyakumar1205@gmail.com
  const mailtoSubject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
  const mailtoBody = encodeURIComponent(`Hi Manya,\n\n${message}\n\n---\nFrom: ${name} (${email})`);
  const mailtoUrl = `mailto:${recipient}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return res.status(200).json({
    success: true,
    sentViaSmtp: false,
    mailtoUrl,
    message: "Message saved! Opening direct email to manyakumar1205@gmail.com."
  });
});

const PORT = Number(process.env.PORT) || 8080;

if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
