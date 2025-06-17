export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { job, tone } = req.body;

  if (!job || !tone) {
    return res.status(400).json({ error: "Missing job or tone" });
  }

  const prompt = `Write a freelance proposal in a ${tone} tone for this job:\n\n${job}\n\nKeep it short, client-focused, and persuasive.`;

  try {
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      return res.status(200).json({ text: data.choices[0].text.trim() });
    } else {
      return res.status(500).json({ error: "No response from OpenAI" });
    }
  } catch (err) {
    return res.status(500).json({ error: "API Error", details: err.message });
  }
}