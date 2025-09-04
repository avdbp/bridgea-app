// Simple API handler for Vercel
export default async (req: any, res: any) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Health check endpoint
  if (req.url === '/api/health' || req.url === '/api/health/') {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      message: 'Bridgea API is running on Vercel'
    });
    return;
  }
  
  // Root API endpoint
  if (req.url === '/api' || req.url === '/api/') {
    res.status(200).json({
      message: 'Bridgea API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      environment: 'production',
      platform: 'Vercel'
    });
    return;
  }
  
  // API routes placeholder
  if (req.url.startsWith('/api/v1/')) {
    res.status(501).json({
      error: 'Not Implemented',
      message: 'This endpoint is not yet implemented in the Vercel deployment',
      path: req.url,
      method: req.method
    });
    return;
  }
  
  // 404 for other routes
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.url
  });
};