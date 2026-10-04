import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

test('player action state updates preserve loaded waveform data', async () => {
  const source=await readFile(new URL('./useSessionPlayer.ts',import.meta.url),'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  const project={duration:40,tracks:[{id:'lead',muted:false,solo:false}]};
  const waveforms={lead:{peaks:[0,0.5,1],duration:40}};
  let state;
  const transport={currentTime:0,isPlaying:false,trackVolumeById:new Map([['lead',1]]),
    mutedTrackIds:new Set(),soloTrackIds:new Set(),bypassedPluginByTrack:new Map(),bypassedPluginIdsByTrack:new Map(),
    async play(){this.isPlaying=true;},pause(){this.isPlaying=false;},
    async togglePlay(){this.isPlaying=!this.isPlaying;},async seek(t){this.currentTime=t;},
    setTrackVolume(id,value){this.trackVolumeById.set(id,value);},
    toggleMute(id){this.mutedTrackIds.add(id);},toggleSolo(id){this.soloTrackIds.add(id);},
    togglePluginBypass(id,plugin){this.bypassedPluginIdsByTrack.set(id,[plugin]);}};
  const react={useState:init=>{state={...init(),isLoading:false,isReady:true,waveformsByTrack:waveforms};return [state,fn=>{state=fn(state);}];},
    useRef:()=>({current:{project,transport}}),useEffect:()=>{},useCallback:fn=>fn};
  const exports={};
  vm.runInNewContext(code,{exports,require:name=>name==='react'?react:{}});
  const player=exports.useSessionPlayer(project);
  const actions=[()=>player.play(),()=>player.pause(),()=>player.togglePlay(),()=>player.seek(12),
    ()=>player.setTrackVolume('lead',0.4),()=>player.toggleMute('lead'),()=>player.toggleSolo('lead'),()=>player.togglePluginBypass('lead','verb')];
  for(const action of actions){action();await Promise.resolve();assert.equal(state.waveformsByTrack,waveforms);}
  assert.equal(state.currentTime,12);assert.equal(state.trackVolumeById.lead,0.4);
  assert.ok(state.mutedTrackIds.has('lead'));
});
