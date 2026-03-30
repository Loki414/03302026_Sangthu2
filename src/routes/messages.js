import { Router } from "express";
import mongoose from "mongoose";
import { Message } from "../models/Message.js";
import { requireCurrentUser } from "../middleware/currentUser.js";

const router = Router();

router.use(requireCurrentUser);

/**
 * GET /
 * Tin nhắn cuối cùng của mỗi cuộc hội thoại (user đối diện với user hiện tại).
 */
router.get("/", async (req, res) => {
  const me = req.currentUserId;

  const pipeline = [
    {
      $match: {
        $or: [{ from: me }, { to: me }],
      },
    },
    {
      $addFields: {
        otherUser: {
          $cond: [{ $eq: ["$from", me] }, "$to", "$from"],
        },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$otherUser",
        lastMessage: { $first: "$$ROOT" },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          withUser: "$_id",
          message: "$lastMessage",
        },
      },
    },
    { $sort: { "message.createdAt": -1 } },
  ];

  const rows = await Message.aggregate(pipeline);

  const result = rows.map((row) => ({
    withUser: row.withUser,
    from: row.message.from,
    to: row.message.to,
    contentMessage: row.message.contentMessage,
    createdAt: row.message.createdAt,
    updatedAt: row.message.updatedAt,
  }));

  res.json(result);
});

/**
 * GET /:userId
 * Toàn bộ tin nhắn giữa user hiện tại và userId (hai chiều).
 */
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "userId không hợp lệ" });
  }
  const other = new mongoose.Types.ObjectId(userId);
  const me = req.currentUserId;

  if (other.equals(me)) {
    return res.status(400).json({ error: "Không thể lấy hội thoại với chính mình" });
  }

  const messages = await Message.find({
    $or: [
      { from: me, to: other },
      { from: other, to: me },
    ],
  }).sort({ createdAt: 1 });

  res.json(messages);
});

/**
 * POST /
 * Gửi tin nhắn tới `to` (userId). type: file | text.
 */
router.post("/", async (req, res) => {
  const { to, contentMessage } = req.body ?? {};

  if (!to || !contentMessage) {
    return res.status(400).json({ error: "Cần có to và contentMessage" });
  }

  if (!mongoose.Types.ObjectId.isValid(to)) {
    return res.status(400).json({ error: "to không hợp lệ" });
  }

  const { type, content } = contentMessage;
  if (type !== "file" && type !== "text") {
    return res.status(400).json({ error: "contentMessage.type phải là file hoặc text" });
  }
  if (typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ error: "contentMessage.content không hợp lệ" });
  }

  const toId = new mongoose.Types.ObjectId(to);
  if (toId.equals(req.currentUserId)) {
    return res.status(400).json({ error: "Không thể gửi tin cho chính mình" });
  }

  const doc = await Message.create({
    from: req.currentUserId,
    to: toId,
    contentMessage: {
      type,
      content: content.trim(),
    },
  });

  res.status(201).json(doc);
});

export default router;
