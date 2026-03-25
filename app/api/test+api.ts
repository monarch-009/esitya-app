export async function GET() {
  return Response.json({
    success: true,
    data: {
      message: "Test endpoint is working perfectly!",
      environment: process.env.NODE_ENV || "development"
    }
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    }
  });
}
