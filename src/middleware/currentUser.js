import mongoose from "mongoose";

/**
 * Lấy user hiện tại từ header `x-user-id` (ObjectId).
 * Thay bằng JWT/session khi tích hợp auth thật.
 */
export function requireCurrentUser(req, res, next) {
  const raw = req.headers["x-user-id"];
  if (!raw || typeof raw !== "string") {
    return res.status(401).json({ error: "Thiếu header x-user-id" });
  }
  if (!mongoose.Types.ObjectId.isValid(raw)) {
    return res.status(400).json({ error: "x-user-id không hợp lệ" });
  }
  req.currentUserId = new mongoose.Types.ObjectId(raw);
  next();
}
