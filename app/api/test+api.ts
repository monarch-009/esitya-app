export async function GET() {
  const isMongoSet = !!process.env.MONGODB_URI;
  const isJwtSet = !!process.env.JWT_SECRET;

  return Response.json({
    success: true,
    data: {
      message: "Test endpoint is working perfectly!",
      environment: process.env.NODE_ENV || "development",
      vercelSecretsLoaded: {
        MONGODB_URI: isMongoSet,
        JWT_SECRET: isJwtSet
      }
    }
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    }
  });
}
