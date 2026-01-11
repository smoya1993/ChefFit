const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
  origin: (origin, callback) => {
    console.log("🟡 CORS CHECK");
    console.log("  raw origin:", origin);
    console.log("  typeof:", typeof origin);
    console.log("  allowedOrigins:", allowedOrigins);

    if (!origin) {
      console.log("  ✔ allowed (no origin)");
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log("  ✔ allowed (in whitelist)");
      return callback(null, true);
    }

    console.log("  ❌ blocked by CORS");
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
