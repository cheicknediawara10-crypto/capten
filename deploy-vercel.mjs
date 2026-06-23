import https from 'https';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

const TOKEN = process.env.VERCEL_TOKEN;
const TEAM_ID = 'team_bG4AvtY5fUkTAp9FfXyofE89';
const PROJECT_ID = 'prj_prXrRIfNiuY2fs5g4Ar9V4GkVO56';
const ROOT = '/Users/cd/.gemini/antigravity/scratch/capten';

function apiRequest(method, urlPath, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const options = {
      hostname: 'api.vercel.com',
      path: urlPath,
      method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': typeof body === 'string' ? 'application/octet-stream' : 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
        ...extraHeaders,
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function getAllFiles(dir, baseDir = dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath);
    // Skip excluded dirs
    if (['.next', 'node_modules', '.git', '.vercel', 'deploy-vercel.mjs'].some(ex => 
      relPath.startsWith(ex) || entry.name === ex)) continue;
    if (entry.isDirectory()) {
      results.push(...getAllFiles(fullPath, baseDir));
    } else {
      results.push(relPath);
    }
  }
  return results;
}

async function uploadFile(filePath) {
  const content = fs.readFileSync(path.join(ROOT, filePath));
  const sha = crypto.createHash('sha1').update(content).digest('hex');
  
  const res = await new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path: '/v2/files',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Length': content.length,
        'x-vercel-digest': sha,
        'Content-Type': 'application/octet-stream',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(content);
    req.end();
  });
  
  return { sha, size: content.length, file: filePath };
}

async function main() {
  console.log('📦 Collecting files...');
  const files = getAllFiles(ROOT);
  console.log(`Found ${files.length} files`);
  
  console.log('⬆️  Uploading files to Vercel...');
  const uploadedFiles = [];
  
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    process.stdout.write(`\r  ${i + 1}/${files.length}: ${f.substring(0, 50)}`);
    try {
      const result = await uploadFile(f);
      uploadedFiles.push(result);
    } catch (e) {
      console.error(`\n  Error uploading ${f}:`, e.message);
    }
  }
  
  console.log('\n✅ Files uploaded!');
  
  const deployBody = {
    name: 'capten',
    files: uploadedFiles.map(f => ({ file: f.file, sha: f.sha, size: f.size })),
    target: 'production',
    meta: { actor: 'antigravity' },
  };
  
  console.log('🚀 Creating deployment...');
  const deployRes = await apiRequest(
    'POST',
    `/v13/deployments?teamId=${TEAM_ID}&forceNew=1`,
    deployBody
  );
  
  if (deployRes.status >= 200 && deployRes.status < 300) {
    const d = deployRes.body;
    console.log('✅ Deployment created!');
    console.log('   ID:', d.id);
    console.log('   URL:', d.url);
    console.log('   Status:', d.readyState);
    return d.id;
  } else {
    console.error('❌ Deploy failed:', JSON.stringify(deployRes.body, null, 2));
    process.exit(1);
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
