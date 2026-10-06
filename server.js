const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { MongoClient } = require("mongodb");

const PORT = 4173;
const DATA_FILE = path.join(__dirname, "portfolio_data.json");
const MONGO_URI = "mongodb+srv://aryanrajputdev_db_user:aryansans321@cluster0.v37bky3.mongodb.net/?appName=Cluster0";
const DB_NAME = "portfolio_db";
const COLLECTION_NAME = "portfolio_config";
const DOC_ID = "active_portfolio";

let mongoClient = null;
let db = null;
let isMongoConnected = false;

// Connect to MongoDB Atlas
async function initMongo() {
  try {
    mongoClient = new MongoClient(MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
    await mongoClient.connect();
    db = mongoClient.db(DB_NAME);
    isMongoConnected = true;
    console.log(`[MongoDB Atlas] Successfully connected to database: ${DB_NAME}`);

    // Seed database if empty
    const collection = db.collection(COLLECTION_NAME);
    const existingDoc = await collection.findOne({ _id: DOC_ID });
    if (!existingDoc && fs.existsSync(DATA_FILE)) {
      try {
        const initialData = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
        await collection.updateOne(
          { _id: DOC_ID },
          { $set: { ...initialData, _id: DOC_ID, updatedAt: new Date() } },
          { upsert: true }
        );
        console.log(`[MongoDB Atlas] Initialized ${COLLECTION_NAME} with portfolio data`);
      } catch (seedErr) {
        console.warn("[MongoDB Atlas] Seeding error:", seedErr.message);
      }
    }
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[MongoDB Atlas] Connection failed (${err.message}). Using local JSON fallback.`);
  }
}

// Start MongoDB connection in background
initMongo();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. API: GET /api/db-status -> Health & connection status
  if (req.url === "/api/db-status" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        connected: isMongoConnected,
        provider: "MongoDB Atlas",
        database: DB_NAME,
        collection: COLLECTION_NAME,
        timestamp: Date.now(),
      })
    );
    return;
  }

  // 2. API: GET /api/data -> Read portfolio from MongoDB Atlas (with local file fallback)
  if (req.url === "/api/data" && req.method === "GET") {
    (async () => {
      try {
        if (isMongoConnected && db) {
          const doc = await db.collection(COLLECTION_NAME).findOne({ _id: DOC_ID });
          if (doc) {
            const { _id, ...cleanData } = doc;
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(cleanData));
            return;
          }
        }
      } catch (mongoErr) {
        console.warn("[API GET /api/data] MongoDB read error, falling back to disk:", mongoErr.message);
      }

      // Fallback: read from local file
      if (fs.existsSync(DATA_FILE)) {
        res.writeHead(200, { "Content-Type": "application/json" });
        fs.createReadStream(DATA_FILE).pipe(res);
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, message: "No portfolio data found" }));
      }
    })();
    return;
  }

  // 3. API: POST /api/save -> Save JSON to MongoDB Atlas + disk backup
  if (req.url === "/api/save" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      try {
        const parsed = JSON.parse(body);
        parsed._lastUpdated = Date.now();

        // 1. Save to local JSON backup
        try {
          fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2), "utf8");
        } catch (fsErr) {
          console.warn("[API POST /api/save] Local backup write warning:", fsErr.message);
        }

        // 2. Save to MongoDB Atlas
        let mongoSaved = false;
        if (isMongoConnected && db) {
          try {
            await db.collection(COLLECTION_NAME).updateOne(
              { _id: DOC_ID },
              { $set: { ...parsed, _id: DOC_ID, updatedAt: new Date() } },
              { upsert: true }
            );
            mongoSaved = true;
          } catch (mErr) {
            console.warn("[API POST /api/save] MongoDB write error:", mErr.message);
          }
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            mongoSaved,
            message: mongoSaved ? "Saved to MongoDB Atlas & local backup" : "Saved to local backup (MongoDB offline)",
          })
        );
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 4. API: POST /api/upload-cloudinary -> Direct Cloudinary upload
  if (req.url === "/api/upload-cloudinary" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      try {
        const parsed = JSON.parse(body);
        const fileData = parsed.file;
        if (!fileData) {
          throw new Error("No file provided");
        }

        const cloudName = "su1rtayw";
        const apiKey = "936979835917264";
        const apiSecret = "wnVfpZ3LpuR07MTLbMLWZN1beGw";

        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = crypto.createHash("sha1").update("timestamp=" + timestamp + apiSecret).digest("hex");

        const formData = new URLSearchParams();
        formData.append("file", fileData);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);

        const cRes = await fetch("https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload", {
          method: "POST",
          body: formData,
        });

        const cJson = await cRes.json();
        if (cJson.secure_url) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, url: cJson.secure_url, public_id: cJson.public_id }));
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: cJson.error?.message || "Cloudinary upload failed" }));
        }
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 5. Static File Server
  let reqPath = req.url.split("?")[0];
  if (reqPath === "/") reqPath = "/index.html";

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, "");
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Portfolio & Admin Server live at http://127.0.0.1:${PORT}`);
});
