// app/api/health/route.ts
export async function GET() {
    return Response.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Hexies Backend API is running!',
      version: '1.0.0'
    });
  }