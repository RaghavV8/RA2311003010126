import express from 'express';
import { Log } from "../logging_middleware/logger.js";
import { getNotifications } from "./services/notificationService.js";
import { getTopNotifications } from "./services/priorityService.js";
const PORT = process.env.NOTIFICATION_PORT || 3002;

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  Log("backend", "info", "route", `${req.method} ${req.url}`);
  next();
});

app.post("/notify", async (req, res) => {
  try {
    // console.log("HIT NOTIFICATION ROUTE");
    
    const { user, message } = req.body;

    await Log("backend", "info", "service", "Processing notification request");
    await Log("backend", "info", "service", `Sending notification to ${user}`);

    res.json({
      status: "Notification sent",
      user,
    });
  } catch (err) {
    await Log("backend", "error", "handler", err.message);
    res.status(500).json({ error: "Failed to send notification" });
  }
});


app.get("/priority-notifications", async (req, res) => {
  try {
    // console.log("HIT PRIORITY NOTIFICATION ROUTE");

    const notifications = await getNotifications();
    const top = getTopNotifications(notifications, 10);

    await Log("backend", "info", "service", "priority notifications fetched");

    res.json({
      count: top.length,
      notifications: top,
    });

  } catch (err) {
    await Log("backend", "error", "handler", err.message);
    res.status(500).json({ error: "failed to fetch notifications" });
  }
});


app.listen(PORT, () => {
  console.log(`Notification service running on ${PORT}`);
});