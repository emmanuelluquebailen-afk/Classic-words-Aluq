import { useState, useEffect, useRef, useCallback } from "react";

const SIZE = 15;
let _id = 0;
const uid = () => ++_id;

// ─── TILE DATA ────────────────────────────────────────────────
const LV_EN = {A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:5,L:1,M:3,N:1,O:1,P:3,Q:10,R:1,S:1,T:1,U:1,V:4,W:4,X:8,Y:4,Z:10};
const LD_EN = {A:9,B:2,C:2,D:4,E:12,F:2,G:3,H:2,I:9,J:1,K:1,L:4,M:2,N:6,O:8,P:2,Q:1,R:6,S:4,T:6,U:4,V:2,W:2,X:1,Y:2,Z:1};
const LV_FR = {A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:10,L:1,M:2,N:1,O:1,P:3,Q:8,R:1,S:1,T:1,U:1,V:4,W:10,X:10,Y:10,Z:10};
const LD_FR = {A:9,B:2,C:2,D:3,E:15,F:2,G:2,H:2,I:8,J:1,K:1,L:5,M:3,N:6,O:6,P:2,Q:1,R:6,S:6,T:6,U:6,V:2,W:1,X:1,Y:1,Z:1};

// ─── DIFFICULTY ───────────────────────────────────────────────
const DIFF = {
  easy:    { label:'Facile',        emoji:'🟢', timer:0,   minScore:0,  penalty:0,  hint:true,  desc:'Pas de minuteur · Indices disponibles' },
  normal:  { label:'Normal',        emoji:'🟡', timer:0,   minScore:0,  penalty:0,  hint:false, desc:'Pas de minuteur · Sans indices' },
  hard:    { label:'Difficile',     emoji:'🔴', timer:120, minScore:0,  penalty:0,  hint:false, desc:'2 min par tour · Sans indices' },
  extreme: { label:'Très difficile',emoji:'⚫', timer:60,  minScore:10, penalty:20, hint:false, desc:'1 min par tour · Min 10 pts ou -20 pts' },
};

// ─── LANG CONFIG ─────────────────────────────────────────────
const CFG = {
  EN: {
    flag:'🇬🇧', name:'ENGLISH', sub:'Définitions en français', defLabel:'🇫🇷',
    LV:LV_EN, LD:LD_EN, dictFile:'dict_en.txt',
    ui:{
      loading:'Chargement du dictionnaire…',
      confirm:'✓ Confirmer', recall:'↩ Rappel', pass:'⏭ Passer', hint:'💡 Indice',
      analysing:'⏳ Analyse…', score:'Score', bag:'Pioche',
      placeHint:'Touchez une case pour placer',
      firstHint:'Le 1er mot doit passer par ★',
      invalid:'❌ Mot invalide', offline:'📵 Définition indisponible hors ligne', words:'mots',
      errAlign:'Alignez vos lettres en ligne ou colonne.',
      errGap:'Il y a un trou dans votre mot.',
      errCenter:'Le premier mot doit passer par ★.',
      errTouch:'Touchez un mot existant.',
      errNone:'Aucun mot valide.',
      errMin:'Placez au moins une lettre.',
      errTimer:'⏰ Temps écoulé ! Tour annulé.',
      errMinScore:'Score insuffisant (-20 pts de pénalité)',
      dictErr:'Erreur de chargement du dictionnaire.',
      statsTitle:'Statistiques', gamesPlayed:'Parties jouées',
      bestScore:'Meilleur score', avgScore:'Score moyen/partie',
      bestWord:'Meilleur mot', totalWords:'Mots joués',
      noStats:'Aucune partie jouée pour le moment.',
      newGame:'Nouvelle partie', backMenu:'← Menu',
    },
    prompt: list =>
`You are an English and French lexicography expert. For each English word:
1. Is it valid English? (valid: true/false)
2. Short definition in FRENCH (1-2 sentences)
3. Grammatical category in French

ONLY valid JSON, no markdown:
{"definitions":[{"word":"CAT","valid":true,"pos":"nom masculin","definition":"Animal domestique félin apprécié pour sa compagnie."}]}
Words: ${list}`,
  },
  FR: {
    flag:'🇫🇷', name:'FRANÇAIS', sub:'Definitions in English', defLabel:'🇬🇧',
    LV:LV_FR, LD:LD_FR, dictFile:'dict_fr.txt',
    ui:{
      loading:'Chargement du dictionnaire…',
      confirm:'✓ Confirmer', recall:'↩ Rappel', pass:'⏭ Passer', hint:'💡 Indice',
      analysing:'⏳ Analyse…', score:'Score', bag:'Pioche',
      placeHint:'Touchez une case pour placer',
      firstHint:'Le 1er mot doit passer par ★',
      invalid:'❌ Mot invalide', offline:'📵 Définition indisponible hors ligne', words:'mots',
      errAlign:'Alignez vos lettres en ligne ou colonne.',
      errGap:'Il y a un trou dans votre mot.',
      errCenter:'Le premier mot doit passer par ★.',
      errTouch:'Touchez un mot existant.',
      errNone:'Aucun mot valide.',
      errMin:'Placez au moins une lettre.',
      errTimer:'⏰ Temps écoulé ! Tour annulé.',
      errMinScore:'Score insuffisant (-20 pts de pénalité)',
      dictErr:'Erreur de chargement du dictionnaire.',
      statsTitle:'Statistiques', gamesPlayed:'Parties jouées',
      bestScore:'Meilleur score', avgScore:'Score moyen/partie',
      bestWord:'Meilleur mot', totalWords:'Mots joués',
      noStats:'Aucune partie jouée pour le moment.',
      newGame:'Nouvelle partie', backMenu:'← Menu',
    },
    prompt: list =>
`You are a French and English lexicography expert. For each French word:
1. Is it valid French? (valid: true/false)
2. Short definition in ENGLISH (1-2 sentences)
3. Grammatical category in English

ONLY valid JSON, no markdown:
{"definitions":[{"word":"CHAT","valid":true,"pos":"masculine noun","definition":"A small domesticated carnivorous mammal kept as a pet."}]}
Words: ${list}`,
  },
};

// ─── BOARD PREMIUMS ──────────────────────────────────────────
const PM = (() => {
  const m = {};
  const a = (t, ps) => ps.forEach(([r,c]) => { m[`${r},${c}`] = t; });
  a('TW',[[0,0],[0,7],[0,14],[7,0],[7,14],[14,0],[14,7],[14,14]]);
  a('DW',[[1,1],[2,2],[3,3],[4,4],[10,4],[11,3],[12,2],[13,1],[1,13],[2,12],[3,11],[4,10],[10,10],[11,11],[12,12],[13,13]]);
  a('TL',[[1,5],[1,9],[5,1],[5,5],[5,9],[5,13],[9,1],[9,5],[9,9],[9,13],[13,5],[13,9]]);
  a('DL',[[0,3],[0,11],[2,6],[2,8],[3,0],[3,7],[3,14],[6,2],[6,6],[6,8],[6,12],[7,3],[7,11],[8,2],[8,6],[8,8],[8,12],[11,0],[11,7],[11,14],[12,6],[12,8],[14,3],[14,11]]);
  m['7,7']='STAR';
  return m;
})();
const PCOL = {TW:{bg:'#8B1A10',fg:'#FFD0CC'},DW:{bg:'#C0703A',fg:'#FFEDE0'},TL:{bg:'#0E3A6B',fg:'#C0DBFF'},DL:{bg:'#1A6090',fg:'#D6EEFF'},STAR:{bg:'#8B1A10',fg:'#FFD0CC'}};
const PLAB = {TW:'MOT\n×3',DW:'MOT\n×2',TL:'LET\n×3',DL:'LET\n×2',STAR:'★'};

// ─── STATS ───────────────────────────────────────────────────
const STATS_KEY = 'cw_stats_v1';
function loadStats() {
  try { return JSON.parse(localStorage.getItem(STATS_KEY)) || {}; } catch { return {}; }
}
function saveStats(s) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch {}
}
function getStatsFor(lang, diff) {
  const s = loadStats();
  return s[lang]?.[diff] || { gamesPlayed:0, bestScore:0, totalScore:0, totalWords:0, bestWord:null, bestWordScore:0 };
}
function recordGame(lang, diff, score, words) {
  const s = loadStats();
  if(!s[lang]) s[lang] = {};
  if(!s[lang][diff]) s[lang][diff] = { gamesPlayed:0, bestScore:0, totalScore:0, totalWords:0, bestWord:null, bestWordScore:0 };
  const d = s[lang][diff];
  d.gamesPlayed++;
  d.totalScore += score;
  d.totalWords += words.length;
  if(score > d.bestScore) d.bestScore = score;
  for(const w of words) {
    if(w.score > d.bestWordScore) { d.bestWordScore = w.score; d.bestWord = w.word; }
  }
  saveStats(s);
}

// ─── GAME HELPERS ────────────────────────────────────────────
function mkBag(LD) {
  const b=[];
  for(const[l,n]of Object.entries(LD)) for(let i=0;i<n;i++) b.push(l);
  for(let i=b.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]; }
  return b;
}
const mkTile=(l,LV)=>({id:uid(),letter:l,value:LV[l]||0});
const drawN=(bag,n,LV)=>bag.splice(0,Math.min(n,bag.length)).map(l=>mkTile(l,LV));
const getL=(board,placed,r,c)=>placed[`${r},${c}`]?.letter??board[r]?.[c]?.letter??null;

function findWords(board,placed) {
  const positions=Object.keys(placed).map(k=>k.split(',').map(Number));
  const seen=new Set(),words=[];
  for(const[pr,pc]of positions) {
    for(const[dr,dc]of[[0,1],[1,0]]) {
      let[r,c]=[pr,pc];
      while(r-dr>=0&&c-dc>=0&&getL(board,placed,r-dr,c-dc)){r-=dr;c-=dc;}
      const cells=[];let[tr,tc]=[r,c];
      while(tr<SIZE&&tc<SIZE&&getL(board,placed,tr,tc)){cells.push([tr,tc]);tr+=dr;tc+=dc;}
      if(cells.length<2) continue;
      const key=cells.map(([a,b])=>`${a},${b}`).join('|');
      if(seen.has(key)) continue; seen.add(key);
      if(!cells.some(([a,b])=>placed[`${a},${b}`])) continue;
      words.push({word:cells.map(([a,b])=>getL(board,placed,a,b)).join(''),cells});
    }
  }
  return words;
}

function calcScore(board,placed,words,LV) {
  let total=0;const scored=[];
  for(const{word,cells}of words) {
    let sum=0,wm=1;
    for(const[r,c]of cells) {
      const lv=LV[getL(board,placed,r,c)]||0;let lm=1;
      if(placed[`${r},${c}`]) {
        const pt=PM[`${r},${c}`];
        if(pt==='DL')lm=2;else if(pt==='TL')lm=3;
        else if(pt==='DW'||pt==='STAR')wm*=2;else if(pt==='TW')wm*=3;
      }
      sum+=lv*lm;
    }
    const ws=sum*wm;total+=ws;scored.push({word,score:ws});
  }
  if(Object.keys(placed).length===7) total+=50;
  return{total,scored};
}

function validatePlacement(board,placed,isFirst,ui) {
  const pos=Object.keys(placed).map(k=>k.split(',').map(Number));
  if(!pos.length) return{ok:false,msg:ui.errMin};
  const rows=[...new Set(pos.map(([r])=>r))];
  const cols=[...new Set(pos.map(([,c])=>c))];
  if(rows.length>1&&cols.length>1) return{ok:false,msg:ui.errAlign};
  if(rows.length===1){const r=rows[0],mc=Math.min(...cols),xc=Math.max(...cols);for(let c=mc;c<=xc;c++)if(!getL(board,placed,r,c))return{ok:false,msg:ui.errGap};}
  else{const c=cols[0],mr=Math.min(...rows),xr=Math.max(...rows);for(let r=mr;r<=xr;r++)if(!getL(board,placed,r,c))return{ok:false,msg:ui.errGap};}
  if(isFirst){if(!placed['7,7'])return{ok:false,msg:ui.errCenter};}
  else{const ok=pos.some(([r,c])=>[[-1,0],[1,0],[0,-1],[0,1]].some(([dr,dc])=>{const nr=r+dr,nc=c+dc;return nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr]?.[nc]?.letter&&!placed[`${nr},${nc}`];}));if(!ok)return{ok:false,msg:ui.errTouch};}
  return{ok:true};
}

// Find a hint: simple brute-force horizontal placement on board
function findHint(board, rack, dict, firstPlay) {
  const letters = rack.map(t=>t.letter);
  // Try placing 2-5 letter combos from rack
  function permute(arr, len, prefix=[]) {
    if(prefix.length===len) return [prefix];
    const res=[];
    for(let i=0;i<arr.length;i++) {
      const rem=[...arr];rem.splice(i,1);
      res.push(...permute(rem,len,[...prefix,arr[i]]));
    }
    return res;
  }
  for(let wlen=5;wlen>=2;wlen--) {
    const perms=permute(letters,wlen);
    for(const p of perms) {
      const word=p.join('');
      if(!dict.has(word)) continue;
      // Find placement spot
      if(firstPlay) {
        // Place horizontally at center
        const c=7-Math.floor(wlen/2);
        if(c>=0&&c+wlen<=SIZE) {
          const placed={};
          for(let i=0;i<wlen;i++) placed[`7,${c+i}`]={letter:p[i]};
          return{word,hint:`Essayez "${word}" au centre !`};
        }
      } else {
        // Try to hook onto existing tiles
        for(let r=0;r<SIZE;r++) {
          for(let c=0;c<=SIZE-wlen;c++) {
            if(board[r][c]?.letter) continue;
            // Check if any adjacent existing tile
            let hooks=false;
            const tempPlaced={};
            let valid=true;
            for(let i=0;i<wlen;i++) {
              if(board[r][c+i]?.letter){valid=false;break;}
              tempPlaced[`${r},${c+i}`]={letter:p[i]};
            }
            if(!valid) continue;
            for(let i=0;i<wlen;i++){const nr=r,nc=c+i;if((board[nr-1]?.[nc]?.letter)||(board[nr+1]?.[nc]?.letter))hooks=true;}
            if(c>0&&board[r][c-1]?.letter)hooks=true;
            if(c+wlen<SIZE&&board[r][c+wlen]?.letter)hooks=true;
            if(hooks) return{word,hint:`Essayez "${word}" !`};
          }
        }
      }
    }
  }
  return null;
}

async function fetchDefs(scored,lang) {
  if(!navigator.onLine) return scored.map(w=>({word:w.word,offline:true}));
  const list=scored.map(w=>w.word).join(', ');
  try {
    const res=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,
        messages:[{role:'user',content:CFG[lang].prompt(list)}]})
    });
    const data=await res.json();
    const text=data.content?.map(b=>b.text||'').join('')||'{}';
    const clean=text.replace(/```(?:json)?|```/g,'').trim();
    return JSON.parse(clean).definitions||[];
  } catch { return scored.map(w=>({word:w.word,offline:true})); }
}

// ─── STYLES ──────────────────────────────────────────────────
const btn=(bg,dis,extra={})=>({
  padding:'10px 6px',background:dis?'#2A1A0A':bg,color:dis?'#4A3A2A':'#F5EDCC',
  border:`1px solid ${dis?'#2A1A0A':bg}`,borderRadius:'8px',
  cursor:dis?'not-allowed':'pointer',fontSize:'12px',fontWeight:'bold',
  letterSpacing:'0.2px',fontFamily:"Georgia,serif",WebkitTapHighlightColor:'transparent',
  flex:1,...extra,
});

function useCellSize() {
  const[cs,setCs]=useState(()=>Math.floor((Math.min(window.innerWidth,420)-20)/SIZE));
  useEffect(()=>{
    const h=()=>setCs(Math.floor((Math.min(window.innerWidth,420)-20)/SIZE));
    window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h);
  },[]);
  return Math.max(18,Math.min(27,cs));
}

// ─── TIMER HOOK ──────────────────────────────────────────────
function useTimer(seconds, active, onExpire) {
  const[remaining,setRemaining]=useState(seconds);
  const ref=useRef(null);
  useEffect(()=>{setRemaining(seconds);},[seconds]);
  useEffect(()=>{
    if(!active||!seconds){clearInterval(ref.current);return;}
    ref.current=setInterval(()=>{
      setRemaining(r=>{if(r<=1){clearInterval(ref.current);onExpire();return 0;}return r-1;});
    },1000);
    return()=>clearInterval(ref.current);
  },[active,seconds]);
  return remaining;
}

// ─── SCREENS ─────────────────────────────────────────────────
function LangPicker({onPick}) {
  return(
    <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',
      justifyContent:'center',background:'#130600',
      backgroundImage:'radial-gradient(ellipse 80% 60% at 50% 20%,#2A1004,#130600)',
      fontFamily:"Georgia,serif",color:'#F0E6CC',padding:'24px',gap:'32px'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'30px',marginBottom:'12px'}}>🎯</div>
        <h1 style={{margin:'0 0 8px',fontSize:'26px',letterSpacing:'6px',color:'#D4AC0D',textTransform:'uppercase'}}>Classic Words</h1>
        <p style={{margin:0,fontSize:'11px',color:'#7A6040',letterSpacing:'2px',lineHeight:2}}>Choisissez votre langue · Choose your language</p>
      </div>
      <div style={{display:'flex',gap:'18px',flexWrap:'wrap',justifyContent:'center',width:'100%',maxWidth:'340px'}}>
        {Object.entries(CFG).map(([code,c])=>(
          <button key={code} onClick={()=>onPick(code)} style={{
            flex:'1',minWidth:'130px',padding:'26px 16px',cursor:'pointer',
            background:'rgba(212,172,13,0.06)',border:'1px solid rgba(212,172,13,0.2)',
            borderRadius:'16px',display:'flex',flexDirection:'column',alignItems:'center',gap:'10px',
            fontFamily:"Georgia,serif",WebkitTapHighlightColor:'transparent',transition:'all 0.18s'}}>
            <span style={{fontSize:'44px'}}>{c.flag}</span>
            <span style={{fontSize:'14px',fontWeight:'bold',letterSpacing:'3px',color:'#EDE3A8'}}>{c.name}</span>
            <span style={{fontSize:'10px',color:'#7A6040',fontStyle:'italic',textAlign:'center'}}>{c.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DiffPicker({lang, onPick, onBack, onStats}) {
  const cfg=CFG[lang];
  return(
    <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',
      background:'#130600',backgroundImage:'radial-gradient(ellipse 80% 60% at 50% 20%,#2A1004,#130600)',
      fontFamily:"Georgia,serif",color:'#F0E6CC',padding:'24px',paddingTop:'40px',gap:'20px'}}>
      <div style={{textAlign:'center',marginBottom:'4px'}}>
        <span style={{fontSize:'28px'}}>{cfg.flag}</span>
        <h2 style={{margin:'6px 0 4px',fontSize:'18px',letterSpacing:'4px',color:'#D4AC0D',textTransform:'uppercase'}}>{cfg.name}</h2>
        <p style={{margin:0,fontSize:'10px',color:'#6A5030',letterSpacing:'2px'}}>Choisissez la difficulté</p>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:'10px',width:'100%',maxWidth:'340px'}}>
        {Object.entries(DIFF).map(([key,d])=>(
          <button key={key} onClick={()=>onPick(key)} style={{
            padding:'14px 18px',background:'rgba(212,172,13,0.05)',
            border:'1px solid rgba(212,172,13,0.18)',borderRadius:'12px',cursor:'pointer',
            display:'flex',alignItems:'center',gap:'14px',textAlign:'left',
            fontFamily:"Georgia,serif",WebkitTapHighlightColor:'transparent',transition:'all 0.15s'}}>
            <span style={{fontSize:'22px'}}>{d.emoji}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:'14px',fontWeight:'bold',color:'#EDE3A8',letterSpacing:'1px'}}>{d.label}</div>
              <div style={{fontSize:'10px',color:'#7A6040',marginTop:'2px'}}>{d.desc}</div>
            </div>
            <span style={{color:'#5A4020',fontSize:'14px'}}>›</span>
          </button>
        ))}
      </div>

      <div style={{display:'flex',gap:'12px',width:'100%',maxWidth:'340px',marginTop:'8px'}}>
        <button onClick={onBack} style={{flex:1,padding:'10px',background:'none',border:'1px solid #3A2A1A',
          borderRadius:'8px',color:'#7A6040',cursor:'pointer',fontFamily:"Georgia,serif",fontSize:'12px',WebkitTapHighlightColor:'transparent'}}>
          ← Langue
        </button>
        <button onClick={onStats} style={{flex:1,padding:'10px',background:'rgba(212,172,13,0.08)',border:'1px solid rgba(212,172,13,0.2)',
          borderRadius:'8px',color:'#D4AC0D',cursor:'pointer',fontFamily:"Georgia,serif",fontSize:'12px',WebkitTapHighlightColor:'transparent'}}>
          📊 Stats
        </button>
      </div>
    </div>
  );
}

function StatsScreen({lang, onBack}) {
  const cfg=CFG[lang];
  const ui=cfg.ui;
  const allStats=loadStats()[lang]||{};
  const diffKeys=Object.keys(DIFF);
  const[tab,setTab]=useState('easy');

  return(
    <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',
      background:'#130600',backgroundImage:'radial-gradient(ellipse 80% 60% at 50% 20%,#2A1004,#130600)',
      fontFamily:"Georgia,serif",color:'#F0E6CC',padding:'24px',paddingTop:'40px',gap:'16px'}}>

      <div style={{textAlign:'center'}}>
        <span style={{fontSize:'28px'}}>📊</span>
        <h2 style={{margin:'6px 0 2px',fontSize:'18px',letterSpacing:'3px',color:'#D4AC0D',textTransform:'uppercase'}}>{ui.statsTitle}</h2>
        <p style={{margin:0,fontSize:'10px',color:'#6A5030'}}>{cfg.flag} {cfg.name}</p>
      </div>

      {/* Diff tabs */}
      <div style={{display:'flex',gap:'6px',width:'100%',maxWidth:'360px',flexWrap:'wrap',justifyContent:'center'}}>
        {diffKeys.map(k=>(
          <button key={k} onClick={()=>setTab(k)} style={{
            padding:'6px 12px',borderRadius:'20px',cursor:'pointer',fontFamily:"Georgia,serif",
            fontSize:'11px',fontWeight:'bold',WebkitTapHighlightColor:'transparent',
            background:tab===k?'rgba(212,172,13,0.2)':'rgba(255,255,255,0.04)',
            border:`1px solid ${tab===k?'rgba(212,172,13,0.6)':'rgba(255,255,255,0.08)'}`,
            color:tab===k?'#D4AC0D':'#7A6040'}}>
            {DIFF[k].emoji} {DIFF[k].label}
          </button>
        ))}
      </div>

      {/* Stats card */}
      {(() => {
        const st=allStats[tab];
        if(!st||st.gamesPlayed===0) return(
          <div style={{textAlign:'center',color:'#5A4030',fontSize:'12px',fontStyle:'italic',padding:'30px 0'}}>
            {ui.noStats}
          </div>
        );
        const avg=st.gamesPlayed>0?Math.round(st.totalScore/st.gamesPlayed):0;
        const avgWords=st.gamesPlayed>0?Math.round(st.totalWords/st.gamesPlayed):0;
        const rows=[
          [ui.gamesPlayed, st.gamesPlayed, '🎮'],
          [ui.bestScore, st.bestScore, '🏆'],
          [ui.avgScore, avg, '📈'],
          [ui.totalWords, st.totalWords, '📝'],
          ['Mots moy./partie', avgWords, '🔤'],
        ];
        return(
          <div style={{width:'100%',maxWidth:'360px',display:'flex',flexDirection:'column',gap:'8px'}}>
            {rows.map(([label,val,icon],i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                padding:'12px 16px',background:'rgba(255,255,255,0.04)',borderRadius:'10px',
                border:'1px solid rgba(212,172,13,0.1)'}}>
                <span style={{fontSize:'12px',color:'#9A8060'}}>{icon}&nbsp; {label}</span>
                <strong style={{fontSize:'16px',color:'#D4AC0D'}}>{val}</strong>
              </div>
            ))}
            {st.bestWord&&(
              <div style={{padding:'12px 16px',background:'rgba(212,172,13,0.07)',borderRadius:'10px',
                border:'1px solid rgba(212,172,13,0.2)',textAlign:'center'}}>
                <div style={{fontSize:'10px',color:'#7A6040',marginBottom:'4px'}}>🌟 {ui.bestWord}</div>
                <div style={{fontSize:'20px',fontWeight:'bold',letterSpacing:'3px',color:'#EDE3A8'}}>{st.bestWord}</div>
                <div style={{fontSize:'13px',color:'#D4AC0D'}}>{st.bestWordScore} pts</div>
              </div>
            )}
          </div>
        );
      })()}

      <button onClick={onBack} style={{padding:'11px 28px',background:'none',border:'1px solid #3A2A1A',
        borderRadius:'8px',color:'#7A6040',cursor:'pointer',fontFamily:"Georgia,serif",fontSize:'12px',WebkitTapHighlightColor:'transparent',marginTop:'8px'}}>
        ← Retour
      </button>
    </div>
  );
}

function DictLoader({lang,onLoaded,onError}) {
  const{ui,flag,name}=CFG[lang];
  const[progress,setProgress]=useState(0);
  const done=useRef(false);
  useEffect(()=>{
    if(done.current)return;done.current=true;
    fetch('/'+CFG[lang].dictFile)
      .then(r=>{
        if(!r.ok)throw new Error('HTTP '+r.status);
        const total=parseInt(r.headers.get('content-length')||'0');
        const reader=r.body.getReader();const chunks=[];let received=0;
        function pump(){return reader.read().then(({done:d,value})=>{
          if(d){const text=new TextDecoder().decode(chunks.reduce((a,b)=>{const c=new Uint8Array(a.length+b.length);c.set(a);c.set(b,a.length);return c;},new Uint8Array(0)));onLoaded(new Set(text.split('\n').filter(Boolean)));return;}
          chunks.push(value);received+=value.length;if(total>0)setProgress(Math.round(received/total*100));return pump();
        });}
        return pump();
      }).catch(e=>onError(e.message));
  },[lang]);
  return(
    <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',
      justifyContent:'center',background:'#130600',backgroundImage:'radial-gradient(ellipse 80% 60% at 50% 20%,#2A1004,#130600)',
      fontFamily:"Georgia,serif",color:'#F0E6CC',gap:'20px',padding:'32px'}}>
      <span style={{fontSize:'40px'}}>{flag}</span>
      <h2 style={{margin:0,fontSize:'16px',letterSpacing:'3px',color:'#D4AC0D',textTransform:'uppercase'}}>{name}</h2>
      <p style={{margin:0,fontSize:'12px',color:'#7A6040',fontStyle:'italic'}}>{ui.loading}</p>
      <div style={{width:'220px',height:'6px',background:'#2A1200',borderRadius:'3px',overflow:'hidden'}}>
        <div style={{height:'100%',width:progress+'%',background:'linear-gradient(to right,#8B5E10,#D4AC0D)',transition:'width 0.2s',borderRadius:'3px'}}/>
      </div>
      {progress>0&&<span style={{fontSize:'10px',color:'#5A4020'}}>{progress}%</span>}
    </div>
  );
}

// ─── GAME ────────────────────────────────────────────────────
function Game({lang, diff, dict, onReset, onStats}) {
  const{LV,LD,ui,flag,name,defLabel}=CFG[lang];
  const diffCfg=DIFF[diff];
  const cs=useCellSize();
  const[online,setOnline]=useState(navigator.onLine);
  const[hintMsg,setHintMsg]=useState(null);
  const[gameOver,setGameOver]=useState(false);
  const allScoredWords=useRef([]);

  useEffect(()=>{
    const on=()=>setOnline(true);const off=()=>setOnline(false);
    window.addEventListener('online',on);window.addEventListener('offline',off);
    return()=>{window.removeEventListener('online',on);window.removeEventListener('offline',off);};
  },[]);

  const[gs,setGs]=useState(()=>{
    const bag=mkBag(LD);const rack=drawN(bag,7,LV);
    return{bag,rack,board:Array(SIZE).fill(null).map(()=>Array(SIZE).fill(null)),
      placed:{},sel:null,score:0,firstPlay:true,loading:false,result:null,error:null,turns:0,timerActive:diffCfg.timer>0};
  });
  const pc=Object.keys(gs.placed).length;

  // Timer
  const handleTimerExpire=useCallback(()=>{
    setGs(g=>{
      const ret=Object.values(g.placed);
      return{...g,placed:{},rack:[...g.rack,...ret],sel:null,timerActive:false,
        error:ui.errTimer,result:null};
    });
    setTimeout(()=>setGs(g=>({...g,timerActive:true})),100);
  },[ui]);

  const timerKey=useRef(0);
  const[timerSeed,setTimerSeed]=useState(0);
  const remaining=useTimer(diffCfg.timer, gs.timerActive && diffCfg.timer>0, handleTimerExpire);
  const timerColor=remaining<=10?'#E84040':remaining<=30?'#E8A020':'#2A8A40';

  function resetTimer(){if(diffCfg.timer>0){setTimerSeed(s=>s+1);setGs(g=>({...g,timerActive:true}));}}

  function endGame(){
    recordGame(lang,diff,gs.score,allScoredWords.current);
    setGameOver(true);
    setGs(g=>({...g,timerActive:false}));
  }

  function clickRack(t){setGs(g=>({...g,sel:g.sel===t.id?null:t.id,error:null,result:null}));setHintMsg(null);}

  function clickCell(r,c){
    const key=`${r},${c}`;
    setGs(g=>{
      if(g.placed[key]){const t=g.placed[key];const np={...g.placed};delete np[key];return{...g,placed:np,rack:[...g.rack,{id:t.id,letter:t.letter,value:t.value}],sel:null};}
      if(g.board[r][c])return g;if(g.sel===null)return g;
      const idx=g.rack.findIndex(t=>t.id===g.sel);if(idx<0)return g;
      const tile=g.rack[idx];
      return{...g,rack:g.rack.filter((_,i)=>i!==idx),placed:{...g.placed,[key]:{id:tile.id,letter:tile.letter,value:tile.value}},sel:null,error:null,result:null};
    });
    setHintMsg(null);
  }

  function doHint(){
    const h=findHint(gs.board,gs.rack,dict,gs.firstPlay);
    setHintMsg(h?h.hint:'Aucun indice disponible avec ces lettres.');
  }

  async function confirm(){
    const v=validatePlacement(gs.board,gs.placed,gs.firstPlay,ui);
    if(!v.ok){setGs(g=>({...g,error:v.msg}));return;}
    const words=findWords(gs.board,gs.placed);
    if(!words.length){setGs(g=>({...g,error:ui.errNone}));return;}
    const invalid=words.filter(w=>!dict.has(w.word));
    if(invalid.length>0){setGs(g=>({...g,error:`${ui.invalid}: ${invalid.map(w=>w.word).join(', ')}`}));return;}
    let{total,scored}=calcScore(gs.board,gs.placed,words,LV);
    // Extreme: min score check
    let penalty=0;
    if(diffCfg.minScore>0&&total<diffCfg.minScore){penalty=diffCfg.penalty;total-=penalty;}
    allScoredWords.current.push(...scored);
    setGs(g=>({...g,loading:true,error:null,timerActive:false}));
    const defs=await fetchDefs(scored,lang);
    setGs(g=>{
      const nb=g.board.map(row=>[...row]);
      for(const[k,t]of Object.entries(g.placed)){const[r,c]=k.split(',').map(Number);nb[r][c]={letter:t.letter,value:t.value};}
      const newBag=[...g.bag];const newTiles=drawN(newBag,7-g.rack.length,LV);
      const newScore=Math.max(0,g.score+total);
      return{...g,board:nb,placed:{},rack:[...g.rack,...newTiles],bag:newBag,
        score:newScore,firstPlay:false,loading:false,
        result:{scored,defs,total,penalty},turns:g.turns+1,error:null,timerActive:diffCfg.timer>0};
    });
    resetTimer();
  }

  function recall(){setGs(g=>{const ret=Object.values(g.placed);return{...g,placed:{},rack:[...g.rack,...ret],sel:null,error:null};});setHintMsg(null);}
  function pass(){
    if(diffCfg.minScore>0){setGs(g=>({...g,score:Math.max(0,g.score-diffCfg.penalty),placed:{},rack:[...g.rack,...Object.values(g.placed)],sel:null,result:null,error:null}));}
    else{setGs(g=>{const ret=Object.values(g.placed);return{...g,placed:{},rack:[...g.rack,...ret],sel:null,result:null,error:null};});}
    resetTimer();setHintMsg(null);
  }

  function renderCell(r,c){
    const key=`${r},${c}`,comm=gs.board[r][c],plc=gs.placed[key],prem=PM[key];
    let bg='#B8914E',inner=null;
    const fs=Math.max(7,cs-4),fsv=Math.max(4,cs-11);
    if(comm){bg='#F5EDCC';inner=<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%'}}><span style={{fontSize:fs+'px',fontWeight:'900',color:'#1A0800',lineHeight:1}}>{comm.letter}</span><span style={{fontSize:fsv+'px',color:'#7B5E2A',fontWeight:'bold'}}>{comm.value}</span></div>;}
    else if(plc){bg='#EEE08A';inner=<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%'}}><span style={{fontSize:fs+'px',fontWeight:'900',color:'#1A0800',lineHeight:1}}>{plc.letter}</span><span style={{fontSize:fsv+'px',color:'#7B5E2A',fontWeight:'bold'}}>{plc.value}</span></div>;}
    else if(prem){const pc2=PCOL[prem];bg=pc2.bg;const pfs=prem==='STAR'?cs-4:Math.max(4,cs-14);inner=<span style={{fontSize:pfs+'px',fontWeight:'bold',color:pc2.fg,textAlign:'center',lineHeight:1.1,whiteSpace:'pre'}}>{PLAB[prem]}</span>;}
    return(<div key={key} onClick={()=>clickCell(r,c)} style={{width:cs+'px',height:cs+'px',background:bg,border:plc?'1.5px solid #D4AC0D':'0.5px solid #5A3008',display:'flex',alignItems:'center',justifyContent:'center',boxSizing:'border-box',boxShadow:plc?'0 0 4px rgba(212,172,13,0.8)':'none',WebkitTapHighlightColor:'transparent'}}>{inner}</div>);
  }

  // ── GAME OVER SCREEN ─────────────────────────────────────
  if(gameOver){
    const st=getStatsFor(lang,diff);
    return(
      <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',
        justifyContent:'center',background:'#130600',
        backgroundImage:'radial-gradient(ellipse 80% 60% at 50% 20%,#2A1004,#130600)',
        fontFamily:"Georgia,serif",color:'#F0E6CC',padding:'32px',gap:'20px',textAlign:'center'}}>
        <div style={{fontSize:'48px'}}>🏆</div>
        <h2 style={{margin:0,fontSize:'20px',letterSpacing:'4px',color:'#D4AC0D',textTransform:'uppercase'}}>Partie terminée</h2>
        <div style={{padding:'20px 28px',background:'rgba(212,172,13,0.1)',border:'1px solid rgba(212,172,13,0.3)',borderRadius:'16px'}}>
          <div style={{fontSize:'36px',fontWeight:'bold',color:'#D4AC0D'}}>{gs.score}</div>
          <div style={{fontSize:'11px',color:'#7A6040',marginTop:'4px'}}>points · {gs.turns} tours</div>
          {gs.score>=st.bestScore&&gs.score>0&&<div style={{fontSize:'11px',color:'#D4AC0D',marginTop:'8px'}}>🌟 Nouveau record !</div>}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'10px',width:'100%',maxWidth:'280px'}}>
          <button onClick={()=>onReset('same')} style={{padding:'12px',background:'#1A6E38',border:'none',borderRadius:'8px',color:'#F5EDCC',fontFamily:"Georgia,serif",fontSize:'13px',fontWeight:'bold',cursor:'pointer',WebkitTapHighlightColor:'transparent'}}>
            🔄 {ui.newGame}
          </button>
          <button onClick={onStats} style={{padding:'12px',background:'rgba(212,172,13,0.1)',border:'1px solid rgba(212,172,13,0.3)',borderRadius:'8px',color:'#D4AC0D',fontFamily:"Georgia,serif",fontSize:'13px',cursor:'pointer',WebkitTapHighlightColor:'transparent'}}>
            📊 Voir les statistiques
          </button>
          <button onClick={()=>onReset('menu')} style={{padding:'12px',background:'none',border:'1px solid #3A2A1A',borderRadius:'8px',color:'#7A6040',fontFamily:"Georgia,serif",fontSize:'13px',cursor:'pointer',WebkitTapHighlightColor:'transparent'}}>
            ← Menu principal
          </button>
        </div>
      </div>
    );
  }

  return(
    <div style={{minHeight:'100dvh',background:'#130600',
      backgroundImage:'radial-gradient(ellipse 80% 60% at 50% 0%,#2A1004,#130600)',
      display:'flex',flexDirection:'column',alignItems:'center',
      fontFamily:"Georgia,'Times New Roman',serif",
      padding:'env(safe-area-inset-top,8px) 8px env(safe-area-inset-bottom,14px)',
      color:'#F0E6CC',overflowX:'hidden'}}>

      {/* Header */}
      <div style={{width:'100%',maxWidth:'420px',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'5px',paddingTop:'5px'}}>
        <button onClick={()=>onReset('menu')} style={{background:'none',border:'none',color:'#5A4030',cursor:'pointer',fontSize:'10px',fontFamily:'Georgia,serif',padding:0,WebkitTapHighlightColor:'transparent'}}>← Menu</button>
        <div style={{textAlign:'center'}}>
          <span style={{fontSize:'14px',letterSpacing:'4px',textTransform:'uppercase',color:'#D4AC0D',fontWeight:'bold'}}>Classic Words</span>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',marginTop:'1px'}}>
            <span style={{fontSize:'8px',color:'#6A5030'}}>{flag} {name} · {diffCfg.emoji} {diffCfg.label}</span>
            <span style={{fontSize:'8px',color:online?'#2A7A30':'#7A2A2A'}}>{online?'●':'●'}</span>
          </div>
        </div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <button onClick={onStats} style={{background:'none',border:'none',color:'#7A6030',cursor:'pointer',fontSize:'14px',padding:0,WebkitTapHighlightColor:'transparent'}}>📊</button>
          <button onClick={endGame} style={{background:'none',border:'none',color:'#5A4030',cursor:'pointer',fontSize:'10px',fontFamily:'Georgia,serif',padding:0,WebkitTapHighlightColor:'transparent'}}>Fin</button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{display:'flex',gap:'16px',marginBottom:'5px',fontSize:'11px',color:'#9A7A50',alignItems:'center'}}>
        <span>{ui.score}&nbsp;<strong style={{color:'#D4AC0D',fontSize:'15px'}}>{gs.score}</strong></span>
        <span>Tour&nbsp;<strong style={{color:'#A08040'}}>{gs.turns}</strong></span>
        <span>{ui.bag}&nbsp;<strong style={{color:'#A08040'}}>{gs.bag.length}</strong></span>
        {diffCfg.timer>0&&(
          <span style={{fontWeight:'bold',color:timerColor,fontSize:'14px',
            animation:remaining<=10?'pulse 0.5s infinite':undefined}}>
            ⏱ {Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')}
          </span>
        )}
      </div>

      {/* Board */}
      <div style={{overflowX:'auto',marginBottom:'6px',width:'100%',display:'flex',justifyContent:'center',WebkitOverflowScrolling:'touch'}}>
        <div style={{display:'inline-grid',gridTemplateColumns:`repeat(${SIZE},${cs}px)`,gap:'0.5px',background:'#1A0600',padding:'3px',borderRadius:'4px',boxShadow:'0 8px 30px rgba(0,0,0,0.8)'}}>
          {Array.from({length:SIZE},(_,r)=>Array.from({length:SIZE},(_,c)=>renderCell(r,c)))}
        </div>
      </div>

      {/* Legend */}
      <div style={{display:'flex',gap:'8px',marginBottom:'5px',flexWrap:'wrap',justifyContent:'center'}}>
        {[['TW','Mot×3'],['DW','Mot×2'],['TL','Let×3'],['DL','Let×2']].map(([t,l])=>(
          <div key={t} style={{display:'flex',alignItems:'center',gap:'3px',fontSize:'8px',color:'#6A5030'}}>
            <div style={{width:'8px',height:'8px',background:PCOL[t].bg,borderRadius:'1px'}}/>{l}
          </div>
        ))}
      </div>

      {/* Rack */}
      <div style={{display:'flex',gap:'4px',marginBottom:'6px',padding:'7px 10px',background:'rgba(30,10,0,0.7)',borderRadius:'10px',border:'1px solid #1A0800',flexWrap:'wrap',justifyContent:'center',minHeight:'52px',alignItems:'center',width:'100%',maxWidth:'360px'}}>
        {gs.rack.map(t=>(
          <div key={t.id} onClick={()=>clickRack(t)} style={{
            width:'36px',height:'42px',background:gs.sel===t.id?'#F0DC90':'#F5EDCC',
            border:gs.sel===t.id?'2px solid #D4AC0D':'2px solid #C0943A',
            borderRadius:'5px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
            cursor:'pointer',transform:gs.sel===t.id?'translateY(-7px) scale(1.1)':'none',
            transition:'all 0.12s',boxShadow:gs.sel===t.id?'0 8px 18px rgba(212,172,13,0.5)':'0 3px 6px rgba(0,0,0,0.6)',
            WebkitTapHighlightColor:'transparent'}}>
            <span style={{fontSize:'17px',fontWeight:'900',color:'#1A0800',lineHeight:1}}>{t.letter}</span>
            <span style={{fontSize:'8px',color:'#7B5E2A',fontWeight:'bold'}}>{t.value}</span>
          </div>
        ))}
        {Array.from({length:Math.max(0,7-gs.rack.length-pc)},(_,i)=>(
          <div key={`ph${i}`} style={{width:'36px',height:'42px',border:'2px dashed #2A1800',borderRadius:'5px'}}/>
        ))}
      </div>

      {gs.sel!==null&&<p style={{margin:'0 0 4px',fontSize:'10px',color:'#9A7A50',fontStyle:'italic'}}>{ui.placeHint}</p>}
      {gs.firstPlay&&gs.sel===null&&pc===0&&<p style={{margin:'0 0 4px',fontSize:'10px',color:'#6A5030',fontStyle:'italic'}}>{ui.firstHint}</p>}
      {hintMsg&&<p style={{margin:'0 0 4px',fontSize:'11px',color:'#D4AC0D',fontStyle:'italic',textAlign:'center'}}>{hintMsg}</p>}

      {/* Buttons */}
      <div style={{display:'flex',gap:'6px',marginBottom:'7px',width:'100%',maxWidth:'360px'}}>
        <button onClick={confirm} disabled={gs.loading||pc===0} style={btn('#1A6E38',gs.loading||pc===0)}>
          {gs.loading?ui.analysing:ui.confirm}
        </button>
        <button onClick={recall} disabled={pc===0} style={btn('#7A4010',pc===0)}>{ui.recall}</button>
        <button onClick={pass} style={btn('#3A3A4A',false)}>{ui.pass}</button>
        {diffCfg.hint&&<button onClick={doHint} style={btn('#1A4A6E',false)}>{ui.hint}</button>}
      </div>

      {/* Error */}
      {gs.error&&(
        <div style={{background:'rgba(100,20,10,0.35)',border:'1px solid #7A2010',borderRadius:'7px',padding:'7px 14px',marginBottom:'7px',fontSize:'11px',color:'#E89080',textAlign:'center',maxWidth:'340px'}}>
          ⚠️ {gs.error}
        </div>
      )}

      {/* Result */}
      {gs.result&&(
        <div style={{width:'100%',maxWidth:'370px',background:'rgba(0,0,0,0.5)',border:'1px solid rgba(212,172,13,0.25)',borderRadius:'12px',padding:'12px',animation:'slideUp 0.3s ease'}}>
          <div style={{textAlign:'center',marginBottom:'10px'}}>
            <div style={{display:'inline-block',padding:'4px 16px',background:'rgba(212,172,13,0.12)',border:'1px solid rgba(212,172,13,0.35)',borderRadius:'20px'}}>
              <span style={{fontSize:'19px',fontWeight:'bold',color:'#D4AC0D'}}>+{gs.result.total} pts</span>
              {gs.result.penalty>0&&<span style={{fontSize:'10px',color:'#E84040',marginLeft:'6px'}}>(-{gs.result.penalty} pénalité)</span>}
              {gs.result.scored.length>1&&<span style={{fontSize:'10px',color:'#9A7A50',marginLeft:'6px'}}>{gs.result.scored.length} {ui.words}</span>}
            </div>
          </div>
          {gs.result.defs?.map((d,i)=>{
            const ws=gs.result.scored.find(w=>w.word.toUpperCase()===d.word?.toUpperCase())?.score??gs.result.scored[i]?.score??'?';
            return(
              <div key={i} style={{marginBottom:'7px',padding:'9px 11px',background:'rgba(255,255,255,0.03)',borderRadius:'8px',borderLeft:'3px solid #1A6E38'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:'3px'}}>
                  <div style={{display:'flex',alignItems:'baseline',gap:'6px'}}>
                    <span style={{fontWeight:'bold',fontSize:'13px',letterSpacing:'2px',color:'#EDE3A8',textTransform:'uppercase'}}>{d.word||gs.result.scored[i]?.word}</span>
                    {d.pos&&!d.offline&&<span style={{fontSize:'9px',color:'#7A6040',fontStyle:'italic'}}>{d.pos}</span>}
                  </div>
                  <span style={{fontSize:'12px',color:'#D4AC0D',fontWeight:'bold',whiteSpace:'nowrap'}}>{ws} pts</span>
                </div>
                <p style={{margin:0,fontSize:'11px',lineHeight:'1.45',color:d.offline?'#5A5040':'#B8A888',fontStyle:'italic'}}>
                  {d.offline?ui.offline:d.definition}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        *{-webkit-tap-highlight-color:transparent;}
        ::-webkit-scrollbar{display:none;}
      `}</style>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────
export default function ClassicWords(){
  const[screen,setScreen]=useState('lang'); // lang | diff | stats | dict | game
  const[lang,setLang]=useState(null);
  const[diff,setDiff]=useState(null);
  const[dict,setDict]=useState(null);
  const[dictErr,setDictErr]=useState(null);
  const[prevLang,setPrevLang]=useState(null);

  function pickLang(l){setLang(l);setScreen('diff');}
  function pickDiff(d){setDiff(d);if(dict&&lang===prevLang)setScreen('game');else{setDict(null);setDictErr(null);setScreen('dict');}}
  function goStats(){setScreen('stats');}
  function goBack(to){setScreen(to);}

  function handleReset(mode){
    if(mode==='same'&&lang&&diff){setDict(null);setDictErr(null);setScreen('dict');}
    else{setScreen('lang');}
  }

  if(screen==='lang') return <LangPicker onPick={pickLang}/>;
  if(screen==='diff') return <DiffPicker lang={lang} onPick={pickDiff} onBack={()=>setScreen('lang')} onStats={goStats}/>;
  if(screen==='stats') return <StatsScreen lang={lang||'EN'} onBack={()=>setScreen(lang?'diff':'lang')}/>;
  if(screen==='dict'){
    if(dictErr) return(
      <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#130600',color:'#E89080',fontFamily:'Georgia,serif',gap:'16px',padding:'32px',textAlign:'center'}}>
        <p>⚠️ {CFG[lang].ui.dictErr}</p>
        <p style={{fontSize:'11px',color:'#7A6040'}}>{dictErr}</p>
        <button onClick={()=>{setDictErr(null);}} style={{padding:'10px 20px',background:'#7A4010',color:'#F5EDCC',border:'none',borderRadius:'8px',cursor:'pointer',fontFamily:'Georgia,serif'}}>Réessayer</button>
        <button onClick={()=>setScreen('diff')} style={{padding:'10px 20px',background:'none',color:'#7A6040',border:'1px solid #3A2A1A',borderRadius:'8px',cursor:'pointer',fontFamily:'Georgia,serif'}}>← Retour</button>
      </div>
    );
    return <DictLoader lang={lang} onLoaded={d=>{setDict(d);setPrevLang(lang);setScreen('game');}} onError={setDictErr}/>;
  }
  if(screen==='game') return <Game lang={lang} diff={diff} dict={dict} onReset={handleReset} onStats={goStats}/>;
  return null;
}
