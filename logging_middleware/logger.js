import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const validStacks = ["backend", "frontend"];
const validLevels = ["debug", "info", "warn", "error", "fatal"];
const validPackages = [
  "cache","controller","cron_job","db","domain",
  "handler","repository","route","service"
];

export const Log = async (stack, level, pkg, message) => {
if (
  !validStacks.includes(stack) ||
  !validLevels.includes(level) ||
  !validPackages.includes(pkg)
) {
  return;
}

  try {
    const response = await axios.post(
      `${process.env.BASE_URL}/logs`,
    {   
        
        stack,
        level,
        package: pkg,
        message,
            },
      {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        },
      }
    );

    console.log("Log sent:", response.data);

  } catch (err) {
        console.error("Logging failed:", err.message);
  }
};