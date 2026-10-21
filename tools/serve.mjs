import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root=resolve(import.meta.dirname,'..',process.argv[2]||'.');
const publicRoot=resolve(root,'public');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.xml':'application/xml','.txt':'text/plain','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    const name=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);
    const file=resolve(root,'.'+name);
    if(!file.startsWith(root+sep)){res.writeHead(403).end();return;}
    let data;
    try{data=await readFile(file);}catch{data=await readFile(resolve(publicRoot,'.'+name));}
    res.writeHead(200,{'Content-Type':mime[extname(name)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
  }catch{res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found');}
});
server.listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173/'));
