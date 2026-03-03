export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const { to, message } = req.body;
  if (!to || !message) return res.status(400).json({ error: "Missing to or message" });

  const accountSid = process.env.TWILIO_SID;
  const authToken  = process.env.TWILIO_TOKEN;
  const fromNumber = process.env.TWILIO_FROM;

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const twilioRes = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type":  "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: fromNumber, Body: message }),
    }
  );

  const data = await twilioRes.json();
  if (!twilioRes.ok) return res.status(500).json({ error: data.message });
  return res.status(200).json({ success: true });
}
