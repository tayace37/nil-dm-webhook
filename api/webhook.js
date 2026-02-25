export default async function handler(req, res) {

  const VERIFY_TOKEN = "nil_dm_secret";

  // Verification request from Meta
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send("Verification failed");
    }
  }

  // Incoming Instagram message
  if (req.method === "POST") {

    const body = req.body;

    // Forward to Zapier (we'll paste URL later)
    await fetch("PASTE_ZAPIER_WEBHOOK_HERE", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    return res.status(200).send("EVENT_RECEIVED");
  }

  res.status(405).send("Method not allowed");
}
