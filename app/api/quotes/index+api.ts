export async function GET() {
  try {
    const fetchQuotes = async (tag: string) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(
          `https://www.goodreads.com/quotes/tag/${tag}`,
          { signal: controller.signal },
        );
        clearTimeout(timeoutId);
        const html = await response.text();
        const quotes = [];
        const regex = /<div class="quoteText">\s*&ldquo;(.*?)&rdquo;/gs;
        let match;
        while ((match = regex.exec(html)) !== null) {
          quotes.push(match[1].replace(/<br\s*\/?>/gi, "\n").trim());
        }
        return quotes;
      } catch (e) {
        console.error(`Failed to fetch ${tag} quotes from Goodreads`, e);
        return [];
      }
    };

    const [loveQuotes, lifeQuotes] = await Promise.all([
      fetchQuotes("love"),
      fetchQuotes("life"),
    ]);

    const allQuotes = [...loveQuotes, ...lifeQuotes];

    // Fallback if Goodreads blocks us
    if (allQuotes.length === 0) {
      allQuotes.push(
        "I choose you. And I'll choose you over and over and over. Without pause, without a doubt, in a heartbeat.",
        "You are my sun, my moon, and all my stars.",
        "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.",
        "Every love story is beautiful, but ours is my favorite.",
        "To love and be loved is to feel the sun from both sides.",
        "Home is wherever I'm with you.",
        "In you, I've found the love of my life and my closest, truest friend.",
      );
    }

    // Shuffle quotes
    for (let i = allQuotes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuotes[i], allQuotes[j]] = [allQuotes[j], allQuotes[i]];
    }

    return Response.json(allQuotes);
  } catch (error) {
    console.error("Quotes API Error:", error);
    return Response.json(
      { error: "Failed to fetch quotes it" },
      { status: 500 },
    );
  }
}
