import express from 'express';
const Log = require("../logging_middleware/logger");

const app = express();
app.use(express.json());

app.post("/notify", async (req, res) => {
  try {
    const { user, message } = req.body;

    await Log("backend", "info", "service", `Sending notification to ${user}`);

    res.json({
      status: "Notification sent",
      user,
    });
  } catch (err) {
    await Log("backend", "error", "notification_service", err.message);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

app.listen(3002, () => {
  console.log("Notification service running on port 3002");
});