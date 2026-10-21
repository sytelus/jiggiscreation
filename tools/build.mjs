import { mkdir, cp, copyFile, access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const out=resolve(root,'dist');
// Deliberately overwrite known files only. No recursive deletion of user files.
await mkdir(out,{recursive:true});
await access(resolve(root,'public/assets/editorial.webp'));
await copyFile(resolve(root,'index.html'),resolve(out,'index.html'));
await cp(resolve(root,'src'),resolve(out,'src'),{recursive:true});
await cp(resolve(root,'public'),out,{recursive:true});
const html=await readFile(resolve(out,'index.html'),'utf8');
for(const [,url] of html.matchAll(/(?:src|href)="(\/[^"#?]*)"/g))await access(resolve(out,'.'+url));
console.log('Built dist/; all local HTML assets exist.');
