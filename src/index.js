import express from "express";
import mongoose from "mongoose";
import messagesRouter from "./routes/messages.js";

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "message-api",
    endpoints: {
      "GET /health": "kiểm tra server",
      "GET /messages": "tin cuối mỗi hội thoại (header: x-user-id)",
      "GET /messages/:userId": "toàn bộ tin với user đó",
      "POST /messages": "gửi tin — body: { to, contentMessage: { type, content } }",
    },
  });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/messages", messagesRouter);

const mongoUri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/sangthu2";

mongoose
  .connect(mongoUri)
  .then(() => {
    const port = Number(process.env.PORT) || 3000;
    app.listen(port, () => {
      console.log(`Server http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
