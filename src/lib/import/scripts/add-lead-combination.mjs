// Manual-render fallback. Does not alter the REAPER exporter.
import {readFile,writeFile,copyFile,mkdir,stat} from 'node:fs/promises';
import {constants} from 'node:fs';
import {resolve,dirname} from 'node:path';
const [directory,source]=process.argv.slice(2);
if(!directory||!source) throw new Error('Usage: node src/lib/import/scripts/add-lead-combination.mjs PACKAGE_FOLDER BOTH_OFF_MP3');
const root=resolve(directory), manifest=resolve(root,'session.json');
const original=await readFile(manifest,'utf8'), project=JSON.parse(original);
const track=project.tracks.find(t=>t.stemPath==='audio/lead-guitar.mp3');
if(!track||track.plugins.length!==2||!track.plugins.some(p=>/rabea/i.test(p.name))||!track.plugins.some(p=>/vintageverb/i.test(p.name))) throw new Error('Expected Lead Guitar with Rabea and VintageVerb');
if(!(await stat(source)).isFile() || !source.toLowerCase().endsWith('.mp3')) throw new Error('Select the MP3 rendered with BOTH plugins OFF');
const stemPath='audio/auditions/lead-guitar__without-rabea-and-vintageverb.mp3';
const ids=track.plugins.map(p=>p.id), key=ids.slice().sort().join('|');
track.bypassVariants=[...(track.bypassVariants??[]).filter(v=>v.bypassedPluginIds.slice().sort().join('|')!==key),{bypassedPluginIds:ids,stemPath}];
const backup=manifest+'.before-combined-'+Date.now()+'.bak';
await writeFile(backup,original,{flag:'wx'});
await mkdir(dirname(resolve(root,stemPath)),{recursive:true});
// Refuse to overwrite an existing render. Original manifest remains intact on failure.
await copyFile(resolve(source),resolve(root,stemPath),constants.COPYFILE_EXCL);
await writeFile(manifest,JSON.stringify(project,null,2)+'\n');
console.log(`Added both-OFF variant. Manifest backup: ${backup}`);
console.log(`Expected duration: ${project.duration}s; the player validates decoded duration on load.`);
