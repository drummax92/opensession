-- OpenSession metadata + automatic MP3 stem/audition exporter.
-- Temporary render state is restored; the project is never saved.
local TITLE = "StormHacks Demo"
local OWNER = "OpenSession"
local SLUG = "stormhacks-demo"
local array_mt = {}
local function array(t) return setmetatable(t or {}, array_mt) end
local function finite(n)
  return type(n) == "number" and n == n and n ~= math.huge and n ~= -math.huge
end
local function encode(v, depth)
  depth = depth or 0
  local kind = type(v)
  if kind == "string" then
    return '"' .. v:gsub('[%z\1-\31\\"]', function(c)
      if c == '"' then return '\\"' end
      if c == '\\' then return '\\\\' end
      return string.format('\\u%04x', c:byte())
    end) .. '"'
  elseif kind == "number" then
    assert(finite(v), "Non-finite JSON number")
    return (string.format("%.17g", v):gsub(",", "."))
  elseif kind == "boolean" then return tostring(v)
  elseif kind == "table" then
    local entries, indent = {}, string.rep("  ", depth + 1)
    local is_array = getmetatable(v) == array_mt
    if is_array then
      for _, value in ipairs(v) do entries[#entries + 1] = indent .. encode(value, depth + 1) end
    else
      local keys = {}
      for key in pairs(v) do assert(type(key) == "string"); keys[#keys + 1] = key end
      table.sort(keys)
      for _, key in ipairs(keys) do
        entries[#entries + 1] = indent .. encode(key) .. ": " .. encode(v[key], depth + 1)
      end
    end
    local first, last = is_array and "[" or "{", is_array and "]" or "}"
    if #entries == 0 then return first .. last end
    return first .. "\n" .. table.concat(entries, ",\n") .. "\n" .. string.rep("  ", depth) .. last
  end
  error("Unsupported JSON value: " .. kind)
end
local aliases = {
  ["drums"]="drums", ["storm drums"]="drums",
  ["bass"]="bass", ["storm bass"]="bass",
  ["lead guitar"]="lead-guitar", ["storm lead"]="lead-guitar",
  ["rhythm guitar l"]="rhythm-guitar-l", ["storm rh l"]="rhythm-guitar-l",
  ["rhythm guitar r"]="rhythm-guitar-r", ["storm rh r"]="rhythm-guitar-r",
  ["vocals"]="vocals", ["storm voc"]="vocals"
}
local warnings, plans, jobs = {}, {}, {}
local stats = {items=0, fx=0, parameters=0, normal=0, auditions=0, dry=0}
local function warn(s) warnings[#warnings + 1] = s end
local function available(path)
  local f = io.open(path, "rb")
  if not f then return false end
  local size = f:seek("end"); f:close()
  return size and size > 0
end
local function write(path, contents)
  local f, err = io.open(path, "wb")
  assert(f, "Cannot open " .. path .. ": " .. tostring(err))
  local ok, why = f:write(contents)
  local closed, close_error = f:close()
  if not ok or not closed then os.remove(path); error(tostring(why or close_error)) end
end
local function optional(fn, ...)
  local ok, a, b = pcall(fn, ...)
  if ok then return a, b end
  warn("Optional API read failed: " .. tostring(a))
end
local function read_items(track)
  local items = array()
  for index=0,reaper.CountTrackMediaItems(track)-1 do
    local item = assert(reaper.GetTrackMediaItem(track,index))
    local ok,id = reaper.GetSetMediaItemInfo_String(item,"GUID","",false)
    assert(ok and id and id~="", "Cannot read item GUID")
    local entry = {id=id, start=reaper.GetMediaItemInfo_Value(item,"D_POSITION"),
      length=reaper.GetMediaItemInfo_Value(item,"D_LENGTH")}
    assert(finite(entry.start) and finite(entry.length) and entry.length>=0,"Invalid item timing")
    local take = reaper.GetActiveTake(item)
    if take then
      local name = reaper.GetTakeName(take)
      if name and name~="" then entry.name=name end
      local source, seen = reaper.GetMediaItemTake_Source(take), {}
      while source and not seen[source] do
        seen[source]=true
        local filename = reaper.GetMediaSourceFileName(source)
        if filename and filename~="" then entry.sourceFile=filename; break end
        source=reaper.GetMediaSourceParent(source)
      end
    else warn("Item " .. id .. " has no active take; timing retained.") end
    items[#items+1]=entry; stats.items=stats.items+1
  end
  return items
end
local function read_plugins(track, stem, folder)
  local plugins = array()
  local targets = {}
  for index=0,reaper.TrackFX_GetCount(track)-1 do
    local ok,name = reaper.TrackFX_GetFXName(track,index)
    assert(ok and name and name~="", "Cannot read FX name")
    local id = reaper.TrackFX_GetFXGUID(track,index)
    assert(id and id~="", "Cannot read FX GUID")
    local plugin = {id=id,name=name,parameters=array()}
    local vendor=name:match("%(([^()]*)%)%s*$")
    if vendor and vendor~="" then plugin.vendor=vendor end
    local preset_ok,preset=optional(reaper.TrackFX_GetPreset,track,index)
    if preset_ok and preset and preset~="" then plugin.preset=preset
    else warn(name .. ": preset not exposed by REAPER; omitted.") end
    local count=optional(reaper.TrackFX_GetNumParams,track,index)
    if type(count)~="number" then count=0 end
    for parameter=0,count-1 do
      local name_ok,param_name=optional(reaper.TrackFX_GetParamName,track,index,parameter)
      if not name_ok or not param_name or param_name=="" then
        param_name="Parameter " .. parameter
        warn(name .. ": name unavailable for parameter " .. parameter)
      end
      local entry={index=parameter,name=param_name}
      local value=optional(reaper.TrackFX_GetParamNormalized,track,index,parameter)
      if finite(value) and value>=0 and value<=1 then entry.normalizedValue=value
      else warn(name .. ": normalized value unavailable for parameter " .. parameter) end
      local display_ok,display=optional(reaper.TrackFX_GetFormattedParamValue,track,index,parameter)
      if display_ok and display and display~="" then entry.displayValue=display end
      plugin.parameters[#plugin.parameters+1]=entry; stats.parameters=stats.parameters+1
    end
    if not reaper.TrackFX_GetEnabled(track,index) then warn(name .. " is currently bypassed; state preserved.") end
    local lower=name:lower()
    local target
    if (stem=="lead-guitar" or stem=="rhythm-guitar-l" or stem=="rhythm-guitar-r") and lower:find("rabea",1,true) then target="rabea" end
    if stem=="lead-guitar" and lower:find("vintageverb",1,true) then target="vintageverb" end
    if target then
      if targets[target] then warn("Duplicate audition target " .. target .. " on " .. stem .. "; manual review required.")
      else
        targets[target]=true
        local path="audio/auditions/" .. stem .. "__without-" .. target .. ".mp3"
        plans[#plans+1]=path .. " | " .. stem .. " | bypass ONLY FX slot " .. (index+1) .. ": " .. name
        jobs[#jobs+1]={track=track,fx=index,path=path,plugin=plugin}
      end
    end
    plugins[#plugins+1]=plugin; stats.fx=stats.fx+1
  end
  if stem=="lead-guitar" and not targets.vintageverb then warn("Lead Guitar VintageVerb audition target not found.") end
  if (stem=="lead-guitar" or stem=="rhythm-guitar-l" or stem=="rhythm-guitar-r") and not targets.rabea then warn(stem .. ": Rabea audition target not found.") end
  return plugins
end
-- Restore every targeted enabled state even if the render callback fails.
local function with_bypassed_fx(track, indices, callback)
  local original={}
  for _,index in ipairs(indices) do original[index]=reaper.TrackFX_GetEnabled(track,index) end
  local ok,err=xpcall(function()
    for _,index in ipairs(indices) do reaper.TrackFX_SetEnabled(track,index,false) end
    callback()
  end,debug.traceback)
  local restore_errors={}
  for _,index in ipairs(indices) do
    local restored,why=pcall(reaper.TrackFX_SetEnabled,track,index,original[index])
    if not restored then restore_errors[#restore_errors+1]=tostring(why) end
  end
  assert(#restore_errors==0,"FX restoration failed: " .. table.concat(restore_errors,"; "))
  return ok,err
end
local function render_audio(project, folder, duration, normal_jobs)
  assert(reaper.GetPlayStateEx(project)==0, "Stop playback/recording before exporting audio. Metadata is retained.")
  local numbers={RENDER_SETTINGS=2,RENDER_BOUNDSFLAG=0,RENDER_STARTPOS=0,
    RENDER_ENDPOS=duration,RENDER_CHANNELS=2,RENDER_SRATE=44100,
    RENDER_TAILFLAG=0,RENDER_TAILMS=0,RENDER_ADDTOPROJ=0,
    RENDER_DITHER=16,RENDER_NORMALIZE=0}
  local strings={RENDER_FORMAT="bDNwbQ==",RENDER_FORMAT2="",RENDER_FILE="",RENDER_PATTERN=""}
  local saved_numbers,saved_strings,tracks={},{},{}
  for k in pairs(numbers) do saved_numbers[k]=reaper.GetSetProjectInfo(project,k,0,false) end
  for k in pairs(strings) do
    local ok,value=reaper.GetSetProjectInfo_String(project,k,"",false)
    assert(ok,"Cannot snapshot " .. k); saved_strings[k]=value
  end
  for i=0,reaper.CountTracks(project)-1 do
    local t=reaper.GetTrack(project,i)
    local state={track=t,selected=reaper.IsTrackSelected(t),
      mute=reaper.GetMediaTrackInfo_Value(t,"B_MUTE"),solo=reaper.GetMediaTrackInfo_Value(t,"I_SOLO"),fx={}}
    for f=0,reaper.TrackFX_GetCount(t)-1 do state.fx[f]=reaper.TrackFX_GetEnabled(t,f) end
    tracks[#tracks+1]=state
  end
  local master=reaper.GetMasterTrack(project)
  local master_selected=reaper.IsTrackSelected(master)
  local restored=false
  local function restore()
    if restored then return end
    local errors={}
    local function attempt(fn,...) local ok,e=pcall(fn,...);if not ok then errors[#errors+1]=tostring(e) end end
    for _,t in ipairs(tracks) do
      for f,enabled in pairs(t.fx) do attempt(reaper.TrackFX_SetEnabled,t.track,f,enabled) end
      attempt(reaper.SetMediaTrackInfo_Value,t.track,"B_MUTE",t.mute)
      attempt(reaper.SetMediaTrackInfo_Value,t.track,"I_SOLO",t.solo)
      attempt(reaper.SetTrackSelected,t.track,t.selected)
    end
    attempt(reaper.SetTrackSelected,master,master_selected)
    for k,v in pairs(saved_strings) do if k~="RENDER_FORMAT" then attempt(reaper.GetSetProjectInfo_String,project,k,v,true) end end
    attempt(reaper.GetSetProjectInfo_String,project,"RENDER_FORMAT",saved_strings.RENDER_FORMAT,true)
    for k,v in pairs(saved_numbers) do attempt(reaper.GetSetProjectInfo,project,k,v,true) end
    if #errors>0 then error("State restoration failed: " .. table.concat(errors,"; ")) end
    restored=true
    reaper.UpdateArrange()
  end
  reaper.atexit(function() if not restored then local ok,e=pcall(restore);if not ok then reaper.ShowMessageBox(tostring(e),"OpenSession restoration",0) end end end)
  local stage=folder .. "/.render-" .. tostring(math.floor(reaper.time_precise()*1000000))
  reaper.RecursiveCreateDirectory(stage,0)
  local rendered=0
  local function render_one(job,number)
    -- Demo tracks are independent: only this track may contribute audio.
    -- Selection alone is insufficient if the render action falls back to master mix.
    for _,state in ipairs(tracks) do
      reaper.SetMediaTrackInfo_Value(state.track,"I_SOLO",0)
      reaper.SetMediaTrackInfo_Value(state.track,"B_MUTE",state.track==job.track and 0 or 1)
    end
    reaper.SetOnlyTrackSelected(job.track)
    reaper.SetTrackSelected(master,false)
    local pattern="opensession-" .. number
    assert(reaper.GetSetProjectInfo_String(project,"RENDER_FILE",stage,true))
    assert(reaper.GetSetProjectInfo_String(project,"RENDER_PATTERN",pattern,true))
    -- Older REAPER versions require base64, not the newer raw four-byte shorthand.
    -- Set sink before reapplying numeric render controls for this job.
    assert(reaper.GetSetProjectInfo_String(project,"RENDER_FORMAT",strings.RENDER_FORMAT,true))
    for key,value in pairs(numbers) do reaper.GetSetProjectInfo(project,key,value,true) end
    for key,value in pairs(numbers) do
      local actual=reaper.GetSetProjectInfo(project,key,0,false)
      assert(math.abs(actual-value)<0.000001,"Render setting not retained: " .. key .. "=" .. tostring(actual))
    end
    local unmuted,selected=0,0
    for _,state in ipairs(tracks) do
      if reaper.GetMediaTrackInfo_Value(state.track,"B_MUTE")==0 then
        assert(state.track==job.track,"Non-target track is audible");unmuted=unmuted+1
      end
      if reaper.IsTrackSelected(state.track) then
        assert(state.track==job.track,"Non-target track selected");selected=selected+1
      end
    end
    assert(unmuted==1 and selected==1,"Track isolation failed")
    local ok,targets=reaper.GetSetProjectInfo_String(project,"RENDER_TARGETS","",false)
    targets=targets or ""
    local paths={}
    for path in targets:gmatch("[^;]+") do paths[#paths+1]=path end
    if #paths==0 then
      -- An empty prediction does not prove the render action cannot work.
      -- Attempt it, then inspect only this job's unique staging prefix.
      reaper.Main_OnCommandEx(42230,0,project)
      local i=0
      while true do
        local file=reaper.EnumerateFiles(stage,i)
        if not file then break end
        if file:sub(1,#pattern)==pattern and file:sub(#pattern+1,#pattern+1):match("[%. _%-]")
            and file:lower():match("%.mp3$") then paths[#paths+1]=stage .. "/" .. file end
        i=i+1
      end
      if #paths==0 then
        local _,format=reaper.GetSetProjectInfo_String(project,"RENDER_FORMAT","",false)
        error("No MP3 produced after render action. RENDER_TARGETS=" .. tostring(targets)
          .. "; RENDER_FORMAT=" .. tostring(format) .. "; staging=" .. stage)
      end
    end
    assert(#paths==1,"Expected exactly one selected-track output, got " .. #paths)
    local path=paths[1]
    assert(path:lower():match("%.mp3$"),"MP3 encoder unavailable; refusing to change format")
    local normalized=path:gsub("\\","/"):lower()
    assert(normalized:sub(1,#stage+1)==(stage .. "/"):gsub("\\","/"):lower(),"Render target outside staging folder")
    if targets~="" then
      assert(not available(path),"Staging output already exists")
      reaper.Main_OnCommandEx(42230,0,project)
    end
    assert(available(path),"Render failed or cancelled: " .. job.path)
    local source=reaper.PCM_Source_CreateFromFile(path)
    assert(source,"Rendered MP3 cannot be decoded")
    local length,is_beats=reaper.GetMediaSourceLength(source)
    reaper.PCM_Source_Destroy(source)
    if is_beats or not finite(length) or math.abs(length-duration)>0.15 then
      os.remove(path);error("Rendered duration mismatch: " .. tostring(length))
    end
    local destination=folder .. "/" .. job.path
    local backup=destination .. ".previous"
    if available(destination) then
      assert(not available(backup),"Previous backup exists: " .. backup)
      assert(os.rename(destination,backup))
    end
    local moved,why=os.rename(path,destination)
    if not moved then if available(backup) then os.rename(backup,destination) end;error(tostring(why)) end
    os.remove(backup)
    rendered=rendered+1
    if job.plugin then job.plugin.bypassStemPath=job.path;stats.auditions=stats.auditions+1
    elseif job.dry then
      job.entry.bypassVariants=array({{bypassedPluginIds=array(job.pluginIds),stemPath=job.path}})
      stats.dry=stats.dry+1
    else stats.normal=stats.normal+1 end
  end
  local ok,err=xpcall(function()
    for k,v in pairs(numbers) do reaper.GetSetProjectInfo(project,k,v,true) end
    for k,v in pairs(strings) do if k=="RENDER_FORMAT2" then assert(reaper.GetSetProjectInfo_String(project,k,v,true)) end end
    for _,t in ipairs(tracks) do
      reaper.SetMediaTrackInfo_Value(t.track,"B_MUTE",0)
      reaper.SetMediaTrackInfo_Value(t.track,"I_SOLO",0)
    end
    local sequence=0
    for _,job in ipairs(normal_jobs) do
      sequence=sequence+1
      local success,why=xpcall(function() render_one(job,sequence) end,debug.traceback)
      if not success then warn("Normal render failed: " .. job.path .. " | " .. tostring(why)) end
    end
    for _,job in ipairs(jobs) do
      sequence=sequence+1
      local indices={}
      if job.dry then
        indices=job.indices
      else indices[1]=job.fx end
      local success,why
      if not job.dry and not reaper.TrackFX_GetEnabled(job.track,job.fx) then
        success,why=false,"Target FX was already bypassed; audition omitted"
      else
        success,why=with_bypassed_fx(job.track,indices,function() render_one(job,sequence) end)
      end
      if not success then warn("Audition render failed: " .. job.path .. " | " .. tostring(why)) end
    end
  end,debug.traceback)
  restore()
  if not ok then warn("Audio export interrupted: " .. tostring(err)) end
  os.remove(stage)
  return rendered
end
local function main()
  local project,filename=reaper.EnumProjects(-1)
  assert(project,"No active project")
  local directory=filename and filename:match("^(.*)[/\\][^/\\]+$")
  assert(directory,"Save the REAPER project first.")
  local folder=directory .. "/StormHacks-Demo.opensession"
  reaper.RecursiveCreateDirectory(folder .. "/audio/auditions",0)
  if available(folder .. "/session.json") and reaper.ShowMessageBox(
    "Export metadata and render all stems/auditions? Successful renders replace existing audio.\n\n" .. folder,
    "OpenSession exporter",4)~=6 then return end
  local manifest={schemaVersion="0.1",id="stormhacks-demo",slug=SLUG,title=TITLE,owner=OWNER,
    genres=array(),duration=reaper.GetProjectLength(project),daw={name="REAPER",version=reaper.GetAppVersion()},tracks=array()}
  local bpm=reaper.Master_GetTempo()
  if finite(bpm) and bpm>0 then manifest.bpm=bpm end
  assert(finite(manifest.duration) and manifest.duration>=0,"Invalid project duration")
  local source_name=reaper.GetProjectName(project)
  local seen,normal_jobs={},{}
  for index=0,reaper.CountTracks(project)-1 do
    local track=assert(reaper.GetTrack(project,index))
    local ok,name=reaper.GetSetMediaTrackInfo_String(track,"P_NAME","",false)
    assert(ok,"Cannot read track name")
    local normalized=name:lower():match("^%s*(.-)%s*$")
    local stem=aliases[normalized]
    if not stem then
      stem="track-" .. (index+1)
      warn("Unrecognized demo track " .. name .. "; using " .. stem .. ".mp3")
    end
    assert(not seen[stem],"Ambiguous duplicate track role: " .. stem .. ". Give rhythm tracks distinct L/R names.")
    seen[stem]=true
    local entry={id=reaper.GetTrackGUID(track),name=name,
      volumeLinear=reaper.GetMediaTrackInfo_Value(track,"D_VOL"),pan=reaper.GetMediaTrackInfo_Value(track,"D_PAN"),
      muted=reaper.GetMediaTrackInfo_Value(track,"B_MUTE")~=0,solo=reaper.GetMediaTrackInfo_Value(track,"I_SOLO")~=0,
      stemPath="audio/" .. stem .. ".mp3",items=read_items(track)}
    assert(entry.id and entry.id~="" and finite(entry.volumeLinear) and entry.volumeLinear>=0,"Invalid track metadata")
    if entry.volumeLinear>0 then entry.volumeDb=20*math.log(entry.volumeLinear,10) end
    entry.plugins=read_plugins(track,stem,folder)
    normal_jobs[#normal_jobs+1]={track=track,path=entry.stemPath}
    if stem=="lead-guitar" then
      local rabea,vintageverb
      local ambiguous=false
      for index,plugin in ipairs(entry.plugins) do
        local lower=plugin.name:lower()
        if lower:find("rabea",1,true) then
          if rabea then ambiguous=true end
          rabea={index=index-1,id=plugin.id}
        end
        if lower:find("vintageverb",1,true) then
          if vintageverb then ambiguous=true end
          vintageverb={index=index-1,id=plugin.id}
        end
      end
      if rabea and vintageverb and not ambiguous then
        local path="audio/auditions/lead-guitar__without-rabea-and-vintageverb.mp3"
        jobs[#jobs+1]={track=track,path=path,dry=true,entry=entry,
          indices={rabea.index,vintageverb.index},pluginIds={rabea.id,vintageverb.id}}
        plans[#plans+1]=path .. " | lead-guitar | bypass ONLY Rabea and VintageVerb together"
      else warn("Combined lead variant omitted: need exactly one Rabea and one VintageVerb.") end
    end
    for _,item in ipairs(entry.items) do
      if item.start<0 then warn(name .. ": item starts before zero.") end
    end
    manifest.tracks[#manifest.tracks+1]=entry
  end
  for _,role in ipairs({"drums","bass","lead-guitar","rhythm-guitar-l","rhythm-guitar-r","vocals"}) do
    if not seen[role] then warn("Missing expected demo role: " .. role) end
  end
  write(folder .. "/session.json",encode(manifest) .. "\n")
  local audio_ok,rendered=pcall(render_audio,project,folder,manifest.duration,normal_jobs)
  if not audio_ok then warn("Audio export failed: " .. tostring(rendered));rendered=0 end
  write(folder .. "/session.json",encode(manifest) .. "\n")
  local report="OpenSession export\nSource REAPER project: " .. tostring(source_name)
    .. "\nPublished title: " .. TITLE .. "\nDuration: " .. encode(manifest.duration)
    .. " seconds\nRender bounds: start 0; end " .. encode(manifest.duration)
    .. "\nTracks: " .. #manifest.tracks .. "\nItems: " .. stats.items .. "\nFX: " .. stats.fx
    .. "\nParameters: " .. stats.parameters .. "\nNormal audio files present: " .. stats.normal
    .. "\nAudition audio files present: " .. stats.auditions
    .. "\nDry lead audio files generated: " .. stats.dry
    .. "\nCombined lead path: audio/auditions/lead-guitar__without-rabea-and-vintageverb.mp3; linked in track.bypassVariants after successful rendering"
    .. "\nAudio generated by this run: " .. rendered
    .. "\nOnly the target track is unmuted/selected per job; render controls read back before rendering."
    .. "\nNew MP3 files decoded and duration checked (0.15 second encoder tolerance)."
    .. "\nTrack names/order preserved from REAPER. Volume/pan values are static trim controls."
    .. "\nPreset is the REAPER dropdown preset, not necessarily the plugin's internal browser preset."
    .. "\nFlat track inserts supported; nested container children, input/take/master FX excluded."
    .. "\nDo not apply volume/pan twice to post-fader processed stems."
    .. "\n\nRequired audition render plan:\n" .. table.concat(plans,"\n")
    .. "\n\nWarnings:\n" .. (#warnings>0 and table.concat(warnings,"\n") or "None") .. "\n"
  write(folder .. "/EXPORT_REPORT.txt",report)
  reaper.ShowMessageBox("OpenSession metadata exported\nTracks: " .. #manifest.tracks
    .. " | Items: " .. stats.items .. " | FX: " .. stats.fx .. " | Parameters: " .. stats.parameters
    .. "\nAudio present: " .. stats.normal .. " normal, " .. stats.auditions .. " auditions, " .. stats.dry .. " dry lead"
    .. "\nAudio rendered: " .. rendered .. " | Warnings: " .. #warnings
    .. "\n\n" .. folder .. "\n\nSee EXPORT_REPORT.txt for details.","OpenSession exporter",0)
end
local ok,err=xpcall(main,debug.traceback)
if not ok then reaper.ShowMessageBox("Export failed:\n\n" .. tostring(err),"OpenSession exporter",0) end
