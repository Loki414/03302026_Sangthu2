import express from "express";
import mongoose from "mongoose";
import messagesRouter from "./routes/messages.js";

const app = express();
app.use(express.json());

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
