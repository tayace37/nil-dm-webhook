export default async function handler(req, res) {
  const VERIFY_TOKEN = "nil_dm_secret";

  // --- Meta webhook verification (GET) ---
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Verification failed");
  }

  // --- Incoming events (POST) ---
  if (req.method === "POST") {
    try {
      // Read RAW request body safely
      const rawBody = await new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => (data += chunk));
        req.on("end", () => resolve(data));
        req.on("error", reject);
      });

      // Log raw body for debugging (optional)
      console.log("✅ Raw body:", rawBody);

      // Parse JSON manually
      let body;
      try {
        body = JSON.parse(rawBody);
      } catch (e) {
        console.error("❌ JSON parse failed. Raw body was:", rawBody);
        return res.status(400).send("Invalid JSON received");
      }

      console.log("✅ Parsed body:", JSON.stringify(body));

      // Forward to Zapier
      const zapierRes = await fetch("https://hooks.zapier.com/hooks/catch/26521683/u0udtb0/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const zapierText = await zapierRes.text();
      console.log("➡️ Forwarded to Zapier:", zapierRes.status, zapierText);

      return res.status(200).send("EVENT_RECEIVED");
    } catch (err) {
      console.error("❌ Error forwarding to Zapier:", err);
      return res.status(500).send("Error forwarding to Zapier");
    }
  }

  return res.status(405).send("Method Not Allowed");
}
