export async function GET() {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "API is healthy and running smoothly",
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    }
  });
}
