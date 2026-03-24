export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url)
      return Response.json({ message: "URL required" }, { status: 400 });

    // Simplified Instagram extractor for mobile: just return the embed URL
    const match = url.match(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
    if (!match)
      return Response.json({ message: "Invalid URL" }, { status: 400 });

    const embedUrl = `https://www.instagram.com/${match[1]}/${match[2]}/embed/`;

    return Response.json({ embedUrl });
  } catch (e) {
    return Response.json({ message: "Error" }, { status: 500 });
  }
}
