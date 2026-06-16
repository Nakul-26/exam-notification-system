export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // 1. Get the backend URL from environment variables
  // In Cloudflare Pages, these are set in the Dashboard under Settings > Environment Variables
  const backendUrl = env.VITE_BACKEND_URL;
  
  if (!backendUrl) {
    return new Response(
      JSON.stringify({ 
        error: "VITE_BACKEND_URL not configured", 
        details: "Please set VITE_BACKEND_URL in your Cloudflare Pages Dashboard." 
      }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. Construct the target URL (e.g., https://your-backend.vercel.app/api/auth/login)
  const targetUrl = new URL(url.pathname + url.search, backendUrl.replace(/\/$/, ''));

  // 3. Forward the request to Vercel
  // We use the original request object to preserve Method, Headers, and Body
  const proxyRequest = new Request(targetUrl, request);

  // 4. Execute the fetch and return the response
  try {
    return await fetch(proxyRequest);
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: "Proxy Error", 
        message: error.message 
      }), 
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
