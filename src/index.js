import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicdir = "../public/";

const tools = [
  {
    id: "remove-background",
    name: "Remove Background",
  },
  {
    id: "color-restoration-2k",
    name: "Color Restoration - 2K",
  },
  {
    id: "color-restoration-4k",
    name: "Color Restoration - 4K",
  },
];

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, `${publicdir}index.html`));
});

app.get("/api/get-tools", (req, res) => {
  res.send(tools);
});

app.post("/api/photo-edit", async (req, res) => {
  const { sourceImage, toolId } = req.body;

  const apiKey = req.headers["x-api-key"];

  if (!sourceImage || !toolId) {
    return res
      .status(400)
      .json({ error: "sourceImage, toolId and apiKey all are required" });
  }

  const allowedToolIds = tools.map((tool) => tool.id);

  if (!allowedToolIds.includes(toolId)) {
    return res.status(400).json({
      error: "Invalid toolId.",
    });
  }

  const url = `https://prodapi.phot.ai/external/api/v3/user_activity/${toolId}`;

  const headers = {
    "x-api-key": `${apiKey}`,
    "Content-Type": "application/json",
  };
  const data = {
    source_url: sourceImage,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API call failed with status ${response.status}: ${JSON.stringify(
          errorData
        )}`
      );
    }

    const responseData = await response.json();

    res.status(200).json({
      message: "Request successful",
      data: responseData,
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({
      error: "Failed to process the image",
      details: err.message,
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, (error) => {
  if (!error) {
    console.log(`Server is listening on ${port}`);
  }
});
