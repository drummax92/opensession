import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const code=ts.transpileModule(await readFile(new URL('./open-package.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2020,target:ts.ScriptTarget.ES2020}}).outputText;
const {openPackage}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const project=JSON.parse(await readFile(new URL('../fixtures/exported-session.json',import.meta.url),'utf8'));
const paths=project.tracks.flatMap(t=>[t.stemPath,...t.plugins.filter(p=>p.bypassStemPath).map(p=>p.bypassStemPath)]);
function files(folder=false, value=project) {
 const all=[new File([JSON.stringify(value)],'session.json'),...paths.map(p=>new File(['audio'],p.split('/').at(-1)))];
 if(folder) all.forEach((f,i)=>Object.defineProperty(f,'webkitRelativePath',{value:'StormHacks-Demo.opensession/'+(i?paths[i-1]:'session.json')}));
 return all;
}
test('actual exporter package resolves nested folder and flat multi-file selections',async()=>{
 for(const folder of [true,false]){
 const result=await openPackage(files(folder));
 assert.equal(result.project.duration,40);assert.equal(result.project.tracks.length,6);assert.equal(result.audioFiles.size,10);
 assert.equal(result.project.tracks[0].items[0].start,11);
 }
});
test('missing normal stem fails clearly; missing audition is left for nonfatal loader warning',async()=>{
 await assert.rejects(openPackage(files().filter(f=>f.name!=='bass.mp3')),/Missing stem: audio\/bass.mp3/);
 const result=await openPackage(files().filter(f=>f.name!=='lead-guitar__without-rabea.mp3'));
 assert.equal(result.audioFiles.size,9);
});
test('bad JSON, ambiguous manifests and duplicate filenames rejected',async()=>{
 await assert.rejects(openPackage([new File(['{'],'session.json')]),/valid JSON/);
 await assert.rejects(openPackage([...files(),new File(['{}'],'session.json')]),/exactly one/);
 await assert.rejects(openPackage([...files(),new File(['different'],'bass.mp3')]),/Ambiguous/);
 await assert.rejects(openPackage([new File(['zip'],'session.zip')]),/Unzip/);
});
test('malformed metadata and remote or traversal audio paths rejected',async()=>{
 for(const mutate of [p=>p.duration=0,p=>p.tracks[0].stemPath='../bass.mp3',p=>p.tracks[0].stemPath='https://example.com/a.mp3',p=>p.tracks[0].items[0].length=Infinity,p=>p.tracks[0].id=p.tracks[1].id]){
 const bad=structuredClone(project);mutate(bad);await assert.rejects(openPackage(files(false,bad)));
 }
});
