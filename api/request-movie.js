export default async function handler(req, res) {
  // Allow requests from your Mini App frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { movie } = req.body || {};

  if (!movie || !movie.trim()) {
    return res.status(400).json({ error: 'Movie name is required' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminGroupId = process.env.ADMIN_GROUP_ID;

  if (!botToken || !adminGroupId) {
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const messageText = `🎬 *NEW MOVIE REQUEST*\n\n📌 *Title:* ${movie.trim()}\n⏰ *Time:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

  try {
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminGroupId,
        text: messageText,
        parse_mode: 'Markdown',
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('Telegram API error:', data);
      return res.status(500).json({ error: 'Failed to send notification to admin group' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
  
