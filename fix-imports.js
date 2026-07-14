const fs = require('fs');
const path = require('path');

const files = [
  'app/api/auth/signup/route.ts',
  'app/api/auth/oauth/route.ts',
  'app/api/admin/users/route.ts',
  'app/api/admin/users/[uid]/status/route.ts',
  'app/api/admin/users/create/route.ts',
  'app/api/test/route.ts'
];

for (const file of files) {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) continue;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace import
  content = content.replace(
    /import\s*\{[^}]*adminAuth[^}]*\}\s*from\s*['"]@\/lib\/firebase-admin['"];/,
    "import { getAdminServices } from '@/lib/firebase-admin';"
  );
  
  // Insert the await inside the POST/GET functions. This is a bit tricky with regex.
  // We'll just replace `export async function POST(req: Request) {`
  // with `export async function POST(req: Request) { const { adminAuth, adminDb, crashError } = await getAdminServices(); if (!adminAuth || !adminDb) throw new Error("Firebase Admin Crash: " + crashError);`
  
  content = content.replace(
    /export async function (POST|GET)\(([^)]*)\) \{(\s*try \{)?/,
    `export async function $1($2) {$3
  const { adminAuth, adminDb, crashError } = await getAdminServices();
  if (crashError || !adminAuth || !adminDb) {
    return Response.json({ success: false, message: 'Server Configuration Error', error: crashError || 'Admin not initialized' }, { status: 500 });
  }`
  );
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Fixed', file);
}
