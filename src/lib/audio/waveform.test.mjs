import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const code=ts.transpileModule(await readFile(new URL('./waveform.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ES2020}}).outputText;
const {buildWaveform,selectWaveforms,waveformHeight}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const buffer=(channels)=>({length:channels[0].length,numberOfChannels:channels.length,getChannelData:i=>channels[i]});
test('peaks preserve silence and transients, including last sample and opposite stereo polarity',()=>{
 assert.deepEqual(buildWaveform(buffer([[0,0,0,0]]),2),[0,0]);
 assert.deepEqual(buildWaveform(buffer([[0,0.8,0,0,0],[0,-0.8,0,0,-1]]),2),[0.8,1]);
 assert.deepEqual(buildWaveform(buffer([[0,0],[1,0]]),20),[1,0]);
});

test('dynamic waveform selects exact FX set and uses shared amplitude reference',()=>{
 const normal={peaks:[0.8],duration:40}, dry={peaks:[0.2],duration:40};
 const bank={lead:{'[]':normal,'["amp","verb"]':dry}};
 assert.equal(selectWaveforms(bank,{}).lead,normal);
 assert.equal(selectWaveforms(bank,{lead:['verb','amp']}).lead,dry);
 assert.ok(waveformHeight(0.2,1)<waveformHeight(0.8,1));
 assert.ok(waveformHeight(0.2,2)>waveformHeight(0.2,1));
 assert.equal(waveformHeight(0.8,0),0);
 assert.equal(waveformHeight(0.8,2),12);
});
