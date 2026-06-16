import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from the current directory (frontend/)
dotenv.config();

const backendUrl = process.env.VITE_BACKEND_URL;

if (!backendUrl) {
  console.log('⚠️  VITE_BACKEND_URL not found in .env. Skipping _redirects generation.');
  process.exit(0);
}

// Remove trailing slash if present
const normalizedUrl = backendUrl.replace(/\/$/, '');

const content = `/api/*  ${normalizedUrl}/api/:splat  200
/*      /index.html  200
`;

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

fs.writeFileSync(path.join(publicDir, '_redirects'), content);
console.log(`✅ Generated public/_redirects pointing to: ${normalizedUrl}`);
