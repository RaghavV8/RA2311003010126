import express from 'express';
import { Log } from "../logging_middleware/logger.js";

const app = express();
app.use(express.json());

app.get("/schedule", async (req, res) => {
  try {

    await Log("backend", "info", "route", "Fetching schedules");

    res.json({
      message: "Vehicle maintenance schedule fetched",
    });
  } catch (err) {
    await Log("backend", "error", "vehicle_scheduler", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3001, () => {
  console.log("Vehicle Scheduler running on port 3001");
});