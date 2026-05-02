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
    console.error("Invalid log parameters");
    return;
  }

  try {
    const response = await axios.post(
      `${process.env.BASE_URL}/logs`,
      { stack, level, package: pkg, message },
      {
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        },
      }
    );

    console.log("Log sent:", response.data);
  } catch (err) {
    console.error("Logging failed:", err.message);
  }
};