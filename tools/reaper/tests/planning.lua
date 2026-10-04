-- Run from the repository root: lua tools/reaper/tests/planning.lua
local file=assert(io.open('tools/reaper/OpenSessionExporter.lua','rb'))
local source=file:read('*a');file:close()
assert(load(source)) -- syntax-check the complete production script
local marker='local ok,err=xpcall(main,debug.traceback)'
local start=assert(source:find(marker,1,true))
local exposed=source:sub(1,start-1)..'\nreturn {allocate=allocate_stem,plugins=read_plugins,combinations=plan_combinations,jobs=jobs,warnings=warnings,bypass=with_bypassed_fx}'
reaper={
 TrackFX_GetCount=function(t)return #t end,
 TrackFX_GetFXName=function(t,i)return true,t[i+1].name end,
 TrackFX_GetFXGUID=function(t,i)return t[i+1].id end,
 TrackFX_GetPreset=function()return true,'Test' end,
 TrackFX_GetNumParams=function()return 0 end,
 TrackFX_GetEnabled=function(t,i)return t[i+1].enabled end,
 TrackFX_SetEnabled=function(t,i,v)t[i+1].enabled=v end,
}
local api=assert(load(exposed))()
local function fx(name,id)return {name=name,id=id,enabled=true}end
local pair={fx('VST3: Archetype Rabea X (Neural DSP)','amp'),fx('VST3: ValhallaVintageVerb (Valhalla DSP, LLC)','verb')}
local seen={}
local fixtures={{'drums',{}},{'bass',{}},{'lead',pair},{'guitar l',{pair[1]}},{'guitar r',{pair[1]}},{'voal',{}}}
for i,f in ipairs(fixtures) do
 local stem=api.allocate(f[1],i-1,seen)
 local entry={plugins=api.plugins(f[2],stem,'unused')}
 api.combinations(f[2],stem,entry)
end
assert(#api.jobs==5,'Cadillac must get four singles and one combination')
local combined=api.jobs[3]
assert(combined.path=='audio/auditions/track-3__without-rabea-and-vintageverb.mp3')
assert(combined.pluginIds[1]=='amp' and combined.pluginIds[2]=='verb')
assert(combined.indices[1]==0 and combined.indices[2]==1)
local unique={}
for _,j in ipairs(api.jobs) do assert(not unique[j.path]);unique[j.path]=true end
assert(api.allocate('Lead Guitar',6,seen)=='lead-guitar','Keep canonical demo path')
assert(api.allocate('Lead Guitar',7,seen)~='lead-guitar','Duplicate names must be unique')
assert(api.allocate('',8,seen)=='track-9','Blank names supported')
local count=#api.jobs
local duplicated={fx('Rabea','amp1'),fx('Rabea','amp2'),fx('VintageVerb','verb2')}
local entry={plugins=api.plugins(duplicated,'track-10','unused')}
api.combinations(duplicated,'track-10',entry)
assert(#api.jobs==count+3,'Duplicate plugins each get a single; ambiguous combined pair omitted')
assert(api.jobs[count+1].path~=api.jobs[count+2].path)
assert(#api.warnings==1)
local ok=api.bypass(pair,{0,1},function()
 assert(not pair[1].enabled and not pair[2].enabled)
 error('render cancelled')
end)
assert(not ok and pair[1].enabled and pair[2].enabled,'Restore both FX after failure')
pair[2].enabled=false
assert(api.bypass(pair,{0,1},function()end))
assert(pair[1].enabled and not pair[2].enabled,'Preserve initially disabled state')
print('PASS: arbitrary/duplicate/blank track names, VST3 singles and combined GUIDs, duplicate FX isolation, failure restoration')
