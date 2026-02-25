export default async function handler(req, res) {
  const VERIFY_TOKEN = "nil_dm_secret";

  // Verification handshake
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Verification failed");
  }

  if (req.method === "POST") {
    try {
      const body = req.body;

      console.log("✅ Incoming webhook body:", JSON.stringify(body));

      const zapierRes = await fetch("https://hooks.zapier.com/hooks/catch/26521683/u0udtb0/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const zapierText = await zapierRes.text();

      console.log("➡️ Forwarded to Zapier. Status:", zapierRes.status);
      console.log("➡️ Zapier response:", zapierText);

      return res.status(200).send("EVENT_RECEIVED");
    } catch (err) {
      console.error("❌ Error forwarding to Zapier:", err);
      return res.status(500).send("Error forwarding to Zapier");
    }
  }

  return res.status(405).send("Method Not Allowed");
}
