export async function GET() {
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
  
  if (!siteKey) {
    return Response.json({ error: 'hCaptcha is not configured' }, { status: 500 });
  }
  
  return Response.json({ siteKey });
}
