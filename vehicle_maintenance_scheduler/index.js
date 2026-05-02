import express from 'express';
import { Log } from "../logging_middleware/logger.js";
import { getDepots, getVehicles } from "./services/apiService.js";
import { selectTasks } from "./services/optimizer.js";
const PORT=process.env.SCHEDULER_PORT || 3001;

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  Log("backend", "info", "route", `${req.method} ${req.url}`);
  next();
});

app.get("/schedule", async (req, res) => {
  try {
    await Log("backend", "info", "route", "Starting Schedule processing");

    await Log("backend", "debug", "controller", "Fetched data from DB");

    res.json({
      message: "Vehicle maintenance schedule fetched",
    });

  } catch (err) {
    await Log("backend", "error", "handler", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/optimize", async (req, res) => {
  try {
    const depots = await getDepots();
    const vehicles = await getVehicles();

    const capacity = depots[0].MechanicHours;

    const maxImpact = selectTasks(vehicles, capacity);

    // console.log("HIT OPTIMIZE ROUTE");
    // console.log("CALLING LOG...");
    await Log("backend", "info", "service", "Optimization completed");

    res.json({
      capacity,
      maxImpact
    });

  } catch (err) {
    // console.error("ERROR:", err);   
    await Log("backend", "error", "handler", err.stack || err.message);
    res.status(500).json({ error: "Failed optimization" });
  }
});

app.listen(PORT, () => {
  console.log(`Vehicle Scheduler running on port ${PORT}`);
});