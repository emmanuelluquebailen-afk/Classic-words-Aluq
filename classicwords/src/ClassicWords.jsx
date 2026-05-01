import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const SIZE = 15;
let _id = 0;
const uid = () => ++_id;

// ─── TILE DATA ────────────────────────────────────────────────
const LV_EN = {A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:5,L:1,M:3,N:1,O:1,P:3,Q:10,R:1,S:1,T:1,U:1,V:4,W:4,X:8,Y:4,Z:10};
const LD_EN = {A:9,B:2,C:2,D:4,E:12,F:2,G:3,H:2,I:9,J:1,K:1,L:4,M:2,N:6,O:8,P:2,Q:1,R:6,S:4,T:6,U:4,V:2,W:2,X:1,Y:2,Z:1};
const LV_FR = {A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:10,L:1,M:2,N:1,O:1,P:3,Q:8,R:1,S:1,T:1,U:1,V:4,W:10,X:10,Y:10,Z:10};
const LD_FR = {A:9,B:2,C:2,D:3,E:15,F:2,G:2,H:2,I:8,J:1,K:1,L:5,M:3,N:6,O:6,P:2,Q:1,R:6,S:6,T:6,U:6,V:2,W:1,X:1,Y:1,Z:1};

// ─── THEMES ──────────────────────────────────────────────────
const THEMES = {
  classic: {
    name: 'Classique', emoji: '🔵',
    bg: '#5BB8F5', bgGrad: 'linear-gradient(160deg,#7ECEF7 0%,#4AACE8 100%)',
    boardBg: '#E8F4FC', boardBorder: '#B0D4EE', cellBg: '#FFFFFF',
    cellBorder: '#C8DCF0', placedBg: '#FFE566', placedBorder: '#E8C800',
    tileBase: '#FFE566', tileBorder: '#E8C800', tileText: '#2A1A00',
    tileSel: '#FFD700', headerBg: 'rgba(255,255,255,0.2)',
    text: '#1A3A5C', subText: '#2A6090', scoreColor: '#1A3A5C',
    btnConfirm: '#2E7D32', btnRecall: '#C75000', btnPass: '#455A64', btnHint: '#1565C0',
    resultBg: 'rgba(255,255,255,0.85)', resultBorder: '#B0D4EE',
    errorBg: 'rgba(255,200,200,0.9)', errorText: '#C00000',
    PREM: {
      TW: {bg:'#E53935',fg:'#FFFFFF'}, DW: {bg:'#F48FB1',fg:'#2A0010'},
      TL: {bg:'#1565C0',fg:'#FFFFFF'}, DL: {bg:'#90CAF9',fg:'#0D2A50'},
      STAR: {bg:'#E53935',fg:'#FFFFFF'},
    },
  },
  dark: {
    name: 'Sombre', emoji: '⚫',
    bg: '#130600', bgGrad: 'radial-gradient(ellipse 80% 60% at 50% 0%,#2A1004,#130600)',
    boardBg: '#2A0E00', boardBorder: '#3A1800', cellBg: '#B8914E',
    cellBorder: '#5A3008', placedBg: '#EEE08A', placedBorder: '#D4AC0D',
    tileBase: '#F5EDCC', tileBorder: '#C0943A', tileText: '#1A0800',
    tileSel: '#F0DC90', headerBg: 'rgba(0,0,0,0.3)',
    text: '#F0E6CC', subText: '#9A7A50', scoreColor: '#D4AC0D',
    btnConfirm: '#1A6E38', btnRecall: '#7A4010', btnPass: '#3A3A4A', btnHint: '#1A4A6E',
    resultBg: 'rgba(0,0,0,0.5)', resultBorder: 'rgba(212,172,13,0.3)',
    errorBg: 'rgba(100,20,10,0.4)', errorText: '#E89080',
    PREM: {
      TW: {bg:'#8B1A10',fg:'#FFD0CC'}, DW: {bg:'#C0703A',fg:'#FFEDE0'},
      TL: {bg:'#0E3A6B',fg:'#C0DBFF'}, DL: {bg:'#1A6090',fg:'#D6EEFF'},
      STAR: {bg:'#8B1A10',fg:'#FFD0CC'},
    },
  },
  green: {
    name: 'Vert', emoji: '🟢',
    bg: '#2D5A27', bgGrad: 'linear-gradient(160deg,#3A7A32 0%,#1E4A18 100%)',
    boardBg: '#C8A96E', boardBorder: '#8B6914', cellBg: '#D4B483',
    cellBorder: '#8B6914', placedBg: '#FFE566', placedBorder: '#E8C800',
    tileBase: '#FFF8DC', tileBorder: '#B8860B', tileText: '#2A1A00',
    tileSel: '#FFD700', headerBg: 'rgba(0,0,0,0.25)',
    text: '#FFFFFF', subText: '#C8E6C0', scoreColor: '#FFE082',
    btnConfirm: '#388E3C', btnRecall: '#BF360C', btnPass: '#37474F', btnHint: '#1565C0',
    resultBg: 'rgba(0,0,0,0.5)', resultBorder: 'rgba(200,169,110,0.5)',
    errorBg: 'rgba(180,30,10,0.4)', errorText: '#FFCCBC',
    PREM: {
      TW: {bg:'#C62828',fg:'#FFFFFF'}, DW: {bg:'#E91E63',fg:'#FFFFFF'},
      TL: {bg:'#1565C0',fg:'#FFFFFF'}, DL: {bg:'#42A5F5',fg:'#0D2A50'},
      STAR: {bg:'#C62828',fg:'#FFFFFF'},
    },
  },
};

// ─── DIFFICULTY ───────────────────────────────────────────────
const DIFF = {
  easy:    { label:'Facile',        emoji:'🟢', timer:0,  minScore:0,  penalty:0,  hint:true,  aiMinLen:2, aiMaxLen:4, aiRandom:true,  desc:'Sans minuteur · Indices · IA facile' },
  normal:  { label:'Normal',        emoji:'🟡', timer:0,  minScore:0,  penalty:0,  hint:false, aiMinLen:3, aiMaxLen:6, aiRandom:false, desc:'Sans minuteur · IA normale' },
  hard:    { label:'Difficile',     emoji:'🔴', timer:120,minScore:0,  penalty:0,  hint:false, aiMinLen:4, aiMaxLen:8, aiRandom:false, desc:'2 min par tour · IA difficile' },
  extreme: { label:'Très difficile',emoji:'⚫', timer:60, minScore:10, penalty:20, hint:false, aiMinLen:4, aiMaxLen:10,aiRandom:false, desc:'1 min · Min 10 pts ou -20 · IA optimale' },
};

// ─── LANG CONFIG ─────────────────────────────────────────────
const CFG = {
  EN: {
    flag:'🇬🇧', name:'ENGLISH', sub:'Définitions en français', defLabel:'🇫🇷',
    LV:LV_EN, LD:LD_EN, dictFile:'dict_en.txt',
    ui:{
      loading:'Chargement du dictionnaire…',
      confirm:'✓ Valider', recall:'↩ Rappel', pass:'⏭ Passer', hint:'💡 Indice',
      analysing:'⏳…', score:'Score', bag:'Pioche',
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
      dictErr:'Erreur de chargement du dictionnaire.',
      youLabel:'Vous', aiLabel:'IA',
      aiThinking:'L\'IA réfléchit…', aiPlayed:'L\'IA a joué :',
      aiPass:'L\'IA a passé son tour.',
      statsTitle:'Statistiques', gamesPlayed:'Parties jouées',
      bestScore:'Meilleur score', avgScore:'Score moyen',
      bestWord:'Meilleur mot', totalWords:'Mots joués',
      noStats:'Aucune partie jouée.', newGame:'Nouvelle partie',
      theme:'Thème',
    },
    prompt: list => `You are an English and French lexicography expert. For each English word:
1. Is it valid English? (valid: true/false)
2. Short definition in FRENCH (1-2 sentences)
3. Grammatical category in French
ONLY valid JSON: {"definitions":[{"word":"CAT","valid":true,"pos":"nom masculin","definition":"Animal domestique félin."}]}
Words: ${list}`,
  },
  FR: {
    flag:'🇫🇷', name:'FRANÇAIS', sub:'Definitions in English', defLabel:'🇬🇧',
    LV:LV_FR, LD:LD_FR, dictFile:'dict_fr.txt',
    ui:{
      loading:'Chargement du dictionnaire…',
      confirm:'✓ Valider', recall:'↩ Rappel', pass:'⏭ Passer', hint:'💡 Indice',
      analysing:'⏳…', score:'Score', bag:'Pioche',
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
      dictErr:'Erreur de chargement du dictionnaire.',
      youLabel:'Vous', aiLabel:'IA',
      aiThinking:'L\'IA réfléchit…', aiPlayed:'L\'IA a joué :',
      aiPass:'L\'IA a passé son tour.',
      statsTitle:'Statistiques', gamesPlayed:'Parties jouées',
      bestScore:'Meilleur score', avgScore:'Score moyen',
      bestWord:'Meilleur mot', totalWords:'Mots joués',
      noStats:'Aucune partie jouée.', newGame:'Nouvelle partie',
      theme:'Thème',
    },
    prompt: list => `You are a French and English lexicography expert. For each French word:
1. Is it valid French? (valid: true/false)
2. Short definition in ENGLISH (1-2 sentences)
3. Grammatical category in English
ONLY valid JSON: {"definitions":[{"word":"CHAT","valid":true,"pos":"masculine noun","definition":"A small domesticated carnivorous mammal."}]}
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
const PLAB = {TW:'MT\n×3',DW:'MT\n×2',TL:'LT\n×3',DL:'LT\n×2',STAR:'★'};

// ─── STATS ───────────────────────────────────────────────────
const STATS_KEY = 'aluqwords_stats_v1';
function loadStats(){try{return JSON.parse(localStorage.getItem(STATS_KEY))||{};}catch{return {};}}
function saveStats(s){try{localStorage.setItem(STATS_KEY,JSON.stringify(s));}catch{}}
function getStatsFor(lang,diff){const s=loadStats();return s[lang]?.[diff]||{gamesPlayed:0,bestScore:0,totalScore:0,totalWords:0,bestWord:null,bestWordScore:0};}
function recordGame(lang,diff,score,words){
  const s=loadStats();if(!s[lang])s[lang]={};if(!s[lang][diff])s[lang][diff]={gamesPlayed:0,bestScore:0,totalScore:0,totalWords:0,bestWord:null,bestWordScore:0};
  const d=s[lang][diff];d.gamesPlayed++;d.totalScore+=score;d.totalWords+=words.length;
  if(score>d.bestScore)d.bestScore=score;
  for(const w of words)if(w.score>d.bestWordScore){d.bestWordScore=w.score;d.bestWord=w.word;}
  saveStats(s);
}

// ─── GAME HELPERS ────────────────────────────────────────────
function mkBag(LD){
  const b=[];for(const[l,n]of Object.entries(LD))for(let i=0;i<n;i++)b.push(l);
  for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}
  return b;
}
const mkTile=(l,LV)=>({id:uid(),letter:l,value:LV[l]||0});
const drawN=(bag,n,LV)=>bag.splice(0,Math.min(n,bag.length)).map(l=>mkTile(l,LV));
const getL=(board,placed,r,c)=>placed[`${r},${c}`]?.letter??board[r]?.[c]?.letter??null;

function findWords(board,placed){
  const positions=Object.keys(placed).map(k=>k.split(',').map(Number));
  const seen=new Set(),words=[];
  for(const[pr,pc]of positions){
    for(const[dr,dc]of[[0,1],[1,0]]){
      let[r,c]=[pr,pc];
      while(r-dr>=0&&c-dc>=0&&getL(board,placed,r-dr,c-dc)){r-=dr;c-=dc;}
      const cells=[];let[tr,tc]=[r,c];
      while(tr<SIZE&&tc<SIZE&&getL(board,placed,tr,tc)){cells.push([tr,tc]);tr+=dr;tc+=dc;}
      if(cells.length<2)continue;const key=cells.map(([a,b])=>`${a},${b}`).join('|');
      if(seen.has(key))continue;seen.add(key);
      if(!cells.some(([a,b])=>placed[`${a},${b}`]))continue;
      words.push({word:cells.map(([a,b])=>getL(board,placed,a,b)).join(''),cells});
    }
  }
  return words;
}

function calcScore(board,placed,words,LV){
  let total=0;const scored=[];
  for(const{word,cells}of words){
    let sum=0,wm=1;
    for(const[r,c]of cells){
      const lv=LV[getL(board,placed,r,c)]||0;let lm=1;
      if(placed[`${r},${c}`]){const pt=PM[`${r},${c}`];if(pt==='DL')lm=2;else if(pt==='TL')lm=3;else if(pt==='DW'||pt==='STAR')wm*=2;else if(pt==='TW')wm*=3;}
      sum+=lv*lm;
    }
    const ws=sum*wm;total+=ws;scored.push({word,score:ws});
  }
  if(Object.keys(placed).length===7)total+=50;
  return{total,scored};
}

function validatePlacement(board,placed,isFirst,ui){
  const pos=Object.keys(placed).map(k=>k.split(',').map(Number));
  if(!pos.length)return{ok:false,msg:ui.errMin};
  const rows=[...new Set(pos.map(([r])=>r))];const cols=[...new Set(pos.map(([,c])=>c))];
  if(rows.length>1&&cols.length>1)return{ok:false,msg:ui.errAlign};
  if(rows.length===1){const r=rows[0],mc=Math.min(...cols),xc=Math.max(...cols);for(let c=mc;c<=xc;c++)if(!getL(board,placed,r,c))return{ok:false,msg:ui.errGap};}
  else{const c=cols[0],mr=Math.min(...rows),xr=Math.max(...rows);for(let r=mr;r<=xr;r++)if(!getL(board,placed,r,c))return{ok:false,msg:ui.errGap};}
  if(isFirst){if(!placed['7,7'])return{ok:false,msg:ui.errCenter};}
  else{const ok=pos.some(([r,c])=>[[-1,0],[1,0],[0,-1],[0,1]].some(([dr,dc])=>{const nr=r+dr,nc=c+dc;return nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr]?.[nc]?.letter&&!placed[`${nr},${nc}`];}));if(!ok)return{ok:false,msg:ui.errTouch};}
  return{ok:true};
}

// ─── AI ENGINE ───────────────────────────────────────────────
function aiGetLetters(rack){return rack.map(t=>t.letter);}

function permutations(arr,minLen,maxLen){
  const results=new Set();
  function helper(current,remaining){
    if(current.length>=minLen&&current.length<=maxLen)results.add(current.join(''));
    if(current.length===maxLen)return;
    for(let i=0;i<remaining.length;i++){
      const next=[...remaining];next.splice(i,1);
      helper([...current,remaining[i]],next);
    }
  }
  helper([],[...arr]);
  return results;
}

function findAIMove(board,rack,dict,isFirstPlay,diffKey,LV){
  const dcfg=DIFF[diffKey];
  const letters=aiGetLetters(rack);
  const minLen=dcfg.aiMinLen;
  const maxLen=Math.min(dcfg.aiMaxLen,letters.length);

  // Generate candidate words
  const candidates=[];
  const perms=permutations(letters,minLen,maxLen);
  for(const w of perms){if(dict.has(w))candidates.push(w);}
  if(!candidates.length)return null;

  // Shuffle for easy/random mode
  if(dcfg.aiRandom){candidates.sort(()=>Math.random()-0.5);}

  // Try placements
  const moves=[];

  if(isFirstPlay){
    // Place horizontally through center
    for(const word of candidates.slice(0,50)){
      const wl=word.length;
      const startC=Math.max(0,7-Math.floor(wl/2));
      if(startC+wl>SIZE)continue;
      // Check center is covered
      if(startC>7||startC+wl-1<7)continue;
      const placed={};let valid=true;
      for(let i=0;i<wl;i++){
        if(board[7][startC+i]?.letter){valid=false;break;}
        placed[`7,${startC+i}`]={letter:word[i]};
      }
      if(!valid)continue;
      const{total,scored}=calcScore(board,placed,[{word,cells:Array.from({length:wl},(_,i)=>[7,startC+i])}],LV);
      moves.push({placed,scored,total});
    }
  } else {
    // Find anchor cells (adjacent to existing tiles)
    const anchors=[];
    for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
      if(board[r][c])continue;
      const adj=[[-1,0],[1,0],[0,-1],[0,1]].some(([dr,dc])=>{const nr=r+dr,nc=c+dc;return nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr]?.[nc];});
      if(adj)anchors.push([r,c]);
    }
    if(!anchors.length)return null;

    for(const word of candidates.slice(0,30)){
      const wl=word.length;
      // Try horizontal placements
      for(const[ar,ac]of anchors.slice(0,20)){
        for(let offset=0;offset<wl;offset++){
          const startC=ac-offset;
          if(startC<0||startC+wl>SIZE)continue;
          const placed={};let ok=true;let usesAnchor=false;
          for(let i=0;i<wl;i++){
            const cc=startC+i;
            if(board[ar][cc]?.letter){
              if(board[ar][cc].letter!==word[i]){ok=false;break;}
            } else {
              placed[`${ar},${cc}`]={letter:word[i]};
              if(cc===ac)usesAnchor=true;
            }
          }
          if(!ok||!usesAnchor||!Object.keys(placed).length)continue;
          const v=validatePlacement(board,placed,false,{errMin:'',errAlign:'',errGap:'',errCenter:'',errTouch:''});
          if(!v.ok)continue;
          const ws=findWords(board,placed);
          if(!ws.length)continue;
          const allValid=ws.every(w=>dict.has(w.word));
          if(!allValid)continue;
          const{total,scored}=calcScore(board,placed,ws,LV);
          moves.push({placed,scored,total});
        }
        // Try vertical placements
        for(let offset=0;offset<wl;offset++){
          const startR=ar-offset;
          if(startR<0||startR+wl>SIZE)continue;
          const placed={};let ok=true;let usesAnchor=false;
          for(let i=0;i<wl;i++){
            const rr=startR+i;
            if(board[rr][ac]?.letter){
              if(board[rr][ac].letter!==word[i]){ok=false;break;}
            } else {
              placed[`${rr},${ac}`]={letter:word[i]};
              if(rr===ar)usesAnchor=true;
            }
          }
          if(!ok||!usesAnchor||!Object.keys(placed).length)continue;
          const v=validatePlacement(board,placed,false,{errMin:'',errAlign:'',errGap:'',errCenter:'',errTouch:''});
          if(!v.ok)continue;
          const ws=findWords(board,placed);
          if(!ws.length)continue;
          const allValid=ws.every(w=>dict.has(w.word));
          if(!allValid)continue;
          const{total,scored}=calcScore(board,placed,ws,LV);
          moves.push({placed,scored,total});
        }
      }
    }
  }

  if(!moves.length)return null;

  // Pick move based on difficulty
  moves.sort((a,b)=>b.total-a.total);
  if(dcfg.aiRandom){
    // Easy: pick from worst half
    const idx=Math.floor(Math.random()*Math.ceil(moves.length/2));
    return moves[moves.length-1-idx]||moves[0];
  }
  if(diffKey==='normal'){return moves[Math.floor(moves.length*0.3)]||moves[0];}
  if(diffKey==='hard'){return moves[Math.floor(moves.length*0.1)]||moves[0];}
  return moves[0]; // extreme: best move
}

// ─── HINT ────────────────────────────────────────────────────
function findHint(board,rack,dict,firstPlay){
  const letters=rack.map(t=>t.letter);
  const perms=permutations(letters,2,5);
  for(const w of perms){
    if(!dict.has(w))continue;
    if(firstPlay){return{hint:`Essayez "${w}" au centre !`};}
    return{hint:`Essayez le mot "${w}" !`};
  }
  return null;
}

async function fetchDefs(scored,lang){
  if(!navigator.onLine)return scored.map(w=>({word:w.word,offline:true}));
  const list=scored.map(w=>w.word).join(', ');
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:CFG[lang].prompt(list)}]})});
    const data=await res.json();const text=data.content?.map(b=>b.text||'').join('')||'{}';
    const clean=text.replace(/```(?:json)?|```/g,'').trim();return JSON.parse(clean).definitions||[];
  }catch{return scored.map(w=>({word:w.word,offline:true}));}
}

// ─── CELL SIZE ───────────────────────────────────────────────
function useCellSize(){
  const[cs,setCs]=useState(()=>Math.floor((window.innerWidth-4)/SIZE));
  useEffect(()=>{const h=()=>setCs(Math.floor((window.innerWidth-4)/SIZE));window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h);},[]);
  return Math.max(20,Math.min(42,cs));
}

// ─── TIMER ───────────────────────────────────────────────────
function useTimer(seconds,active,onExpire){
  const[remaining,setRemaining]=useState(seconds);
  const ref=useRef(null);
  useEffect(()=>{setRemaining(seconds);},[seconds]);
  useEffect(()=>{
    if(!active||!seconds){clearInterval(ref.current);return;}
    ref.current=setInterval(()=>{setRemaining(r=>{if(r<=1){clearInterval(ref.current);onExpire();return 0;}return r-1;});},1000);
    return()=>clearInterval(ref.current);
  },[active,seconds]);
  return remaining;
}

// ─── LANG PICKER ─────────────────────────────────────────────
function LangPicker({onPick,theme}){
  const T=THEMES[theme];
  return(
    <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:T.bgGrad,fontFamily:"'Helvetica Neue',Arial,sans-serif",color:T.text,padding:'24px',gap:'28px'}}>
      <div style={{textAlign:'center'}}>
        <h1 style={{margin:'0 0 6px',fontSize:'28px',fontWeight:'900',letterSpacing:'2px',color:T.scoreColor}}>AluQ Words</h1>
        <p style={{margin:0,fontSize:'11px',opacity:0.7,letterSpacing:'2px'}}>Choisissez votre langue · Choose your language</p>
      </div>
      <div style={{display:'flex',gap:'16px',flexWrap:'wrap',justifyContent:'center',width:'100%',maxWidth:'320px'}}>
        {Object.entries(CFG).map(([code,c])=>(
          <button key={code} onClick={()=>onPick(code)} style={{
            flex:'1',minWidth:'128px',padding:'24px 14px',cursor:'pointer',
            background:'rgba(255,255,255,0.15)',border:'2px solid rgba(255,255,255,0.3)',
            borderRadius:'16px',display:'flex',flexDirection:'column',alignItems:'center',gap:'10px',
            fontFamily:"'Helvetica Neue',Arial,sans-serif",WebkitTapHighlightColor:'transparent',
            backdropFilter:'blur(4px)'}}>
            <span style={{fontSize:'42px'}}>{c.flag}</span>
            <span style={{fontSize:'13px',fontWeight:'800',letterSpacing:'2px',color:T.text}}>{c.name}</span>
            <span style={{fontSize:'9px',opacity:0.7,fontStyle:'italic',textAlign:'center'}}>{c.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── DIFF PICKER ─────────────────────────────────────────────
function DiffPicker({lang,onPick,onBack,onStats,theme,onTheme}){
  const T=THEMES[theme];const cfg=CFG[lang];
  return(
    <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',background:T.bgGrad,fontFamily:"'Helvetica Neue',Arial,sans-serif",color:T.text,padding:'20px',paddingTop:'36px',gap:'14px'}}>
      <div style={{textAlign:'center',marginBottom:'4px'}}>
        <h1 style={{margin:'0 0 4px',fontSize:'22px',fontWeight:'900',color:T.scoreColor}}>AluQ Words</h1>
        <span style={{fontSize:'24px'}}>{cfg.flag}</span>
        <p style={{margin:'4px 0 0',fontSize:'10px',opacity:0.7,letterSpacing:'2px'}}>{cfg.name} · Difficulté</p>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:'9px',width:'100%',maxWidth:'330px'}}>
        {Object.entries(DIFF).map(([key,d])=>(
          <button key={key} onClick={()=>onPick(key)} style={{
            padding:'13px 16px',background:'rgba(255,255,255,0.15)',
            border:'1px solid rgba(255,255,255,0.25)',borderRadius:'12px',cursor:'pointer',
            display:'flex',alignItems:'center',gap:'12px',textAlign:'left',
            fontFamily:"'Helvetica Neue',Arial,sans-serif",WebkitTapHighlightColor:'transparent',backdropFilter:'blur(4px)'}}>
            <span style={{fontSize:'20px'}}>{d.emoji}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:'13px',fontWeight:'700',color:T.text}}>{d.label}</div>
              <div style={{fontSize:'9px',opacity:0.65,marginTop:'2px'}}>{d.desc}</div>
            </div>
            <span style={{opacity:0.4,fontSize:'16px'}}>›</span>
          </button>
        ))}
      </div>

      {/* Theme selector */}
      <div style={{display:'flex',gap:'8px',alignItems:'center',marginTop:'4px'}}>
        <span style={{fontSize:'10px',opacity:0.6}}>{cfg.ui.theme}:</span>
        {Object.entries(THEMES).map(([key,th])=>(
          <button key={key} onClick={()=>onTheme(key)} style={{
            width:'28px',height:'28px',borderRadius:'50%',cursor:'pointer',
            background:th.bgGrad,border:theme===key?'3px solid #FFF':'2px solid rgba(255,255,255,0.3)',
            fontSize:'13px',display:'flex',alignItems:'center',justifyContent:'center',
            WebkitTapHighlightColor:'transparent'}}>
            {th.emoji}
          </button>
        ))}
      </div>

      <div style={{display:'flex',gap:'10px',width:'100%',maxWidth:'330px',marginTop:'4px'}}>
        <button onClick={onBack} style={{flex:1,padding:'10px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'8px',color:T.text,cursor:'pointer',fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:'12px',WebkitTapHighlightColor:'transparent'}}>← Langue</button>
        <button onClick={onStats} style={{flex:1,padding:'10px',background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'8px',color:T.scoreColor,cursor:'pointer',fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:'12px',fontWeight:'bold',WebkitTapHighlightColor:'transparent'}}>📊 Stats</button>
      </div>
    </div>
  );
}

// ─── STATS ───────────────────────────────────────────────────
function StatsScreen({lang,onBack,theme}){
  const T=THEMES[theme];const cfg=CFG[lang];const ui=cfg.ui;
  const allStats=loadStats()[lang]||{};
  const[tab,setTab]=useState('easy');
  return(
    <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',background:T.bgGrad,fontFamily:"'Helvetica Neue',Arial,sans-serif",color:T.text,padding:'20px',paddingTop:'36px',gap:'14px'}}>
      <div style={{textAlign:'center'}}>
        <h2 style={{margin:'0 0 4px',fontSize:'20px',fontWeight:'900',color:T.scoreColor}}>📊 {ui.statsTitle}</h2>
        <p style={{margin:0,fontSize:'10px',opacity:0.6}}>{cfg.flag} {cfg.name}</p>
      </div>
      <div style={{display:'flex',gap:'6px',flexWrap:'wrap',justifyContent:'center'}}>
        {Object.keys(DIFF).map(k=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:'5px 11px',borderRadius:'20px',cursor:'pointer',fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:'11px',fontWeight:'bold',WebkitTapHighlightColor:'transparent',background:tab===k?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.1)',border:`1px solid ${tab===k?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.2)'}`,color:T.text}}>
            {DIFF[k].emoji} {DIFF[k].label}
          </button>
        ))}
      </div>
      {(()=>{
        const st=allStats[tab];
        if(!st||st.gamesPlayed===0)return<div style={{textAlign:'center',opacity:0.5,fontSize:'12px',fontStyle:'italic',padding:'24px 0'}}>{ui.noStats}</div>;
        const avg=Math.round(st.totalScore/st.gamesPlayed);
        return(
          <div style={{width:'100%',maxWidth:'340px',display:'flex',flexDirection:'column',gap:'7px'}}>
            {[[ui.gamesPlayed,st.gamesPlayed,'🎮'],[ui.bestScore,st.bestScore,'🏆'],[ui.avgScore,avg,'📈'],[ui.totalWords,st.totalWords,'📝']].map(([label,val,icon],i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 15px',background:'rgba(255,255,255,0.15)',borderRadius:'10px',backdropFilter:'blur(4px)'}}>
                <span style={{fontSize:'12px',opacity:0.8}}>{icon} {label}</span>
                <strong style={{fontSize:'16px',color:T.scoreColor}}>{val}</strong>
              </div>
            ))}
            {st.bestWord&&(
              <div style={{padding:'12px',background:'rgba(255,255,255,0.2)',borderRadius:'10px',textAlign:'center',backdropFilter:'blur(4px)'}}>
                <div style={{fontSize:'10px',opacity:0.7,marginBottom:'4px'}}>🌟 {ui.bestWord}</div>
                <div style={{fontSize:'22px',fontWeight:'900',letterSpacing:'3px',color:T.scoreColor}}>{st.bestWord}</div>
                <div style={{fontSize:'13px',opacity:0.8}}>{st.bestWordScore} pts</div>
              </div>
            )}
          </div>
        );
      })()}
      <button onClick={onBack} style={{padding:'10px 26px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.25)',borderRadius:'8px',color:T.text,cursor:'pointer',fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:'12px',WebkitTapHighlightColor:'transparent',marginTop:'6px'}}>← Retour</button>
    </div>
  );
}

// ─── DICT LOADER ─────────────────────────────────────────────
function DictLoader({lang,onLoaded,onError,theme}){
  const T=THEMES[theme];const{ui,flag,name}=CFG[lang];
  const[progress,setProgress]=useState(0);const done=useRef(false);
  useEffect(()=>{
    if(done.current)return;done.current=true;
    fetch('/'+CFG[lang].dictFile).then(r=>{
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
    <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:T.bgGrad,fontFamily:"'Helvetica Neue',Arial,sans-serif",color:T.text,gap:'18px',padding:'32px'}}>
      <span style={{fontSize:'40px'}}>{flag}</span>
      <h2 style={{margin:0,fontSize:'16px',fontWeight:'800',letterSpacing:'3px',color:T.scoreColor}}>{name}</h2>
      <p style={{margin:0,fontSize:'12px',opacity:0.7,fontStyle:'italic'}}>{ui.loading}</p>
      <div style={{width:'220px',height:'7px',background:'rgba(0,0,0,0.2)',borderRadius:'4px',overflow:'hidden'}}>
        <div style={{height:'100%',width:progress+'%',background:'rgba(255,255,255,0.6)',transition:'width 0.2s',borderRadius:'4px'}}/>
      </div>
      {progress>0&&<span style={{fontSize:'11px',opacity:0.5}}>{progress}%</span>}
    </div>
  );
}

// ─── GAME ────────────────────────────────────────────────────
function Game({lang,diff,dict,onReset,onStats,theme}){
  const{LV,LD,ui,flag,name,defLabel}=CFG[lang];
  const diffCfg=DIFF[diff];
  const T=THEMES[theme];
  const cs=useCellSize();
  const[online,setOnline]=useState(navigator.onLine);
  const[hintMsg,setHintMsg]=useState(null);
  const[gameOver,setGameOver]=useState(false);
  const[aiMsg,setAiMsg]=useState(null);
  const[dragIdx,setDragIdx]=useState(null);
  const allScoredWords=useRef([]);

  useEffect(()=>{
    const on=()=>setOnline(true);const off=()=>setOnline(false);
    window.addEventListener('online',on);window.addEventListener('offline',off);
    return()=>{window.removeEventListener('online',on);window.removeEventListener('offline',off);};
  },[]);

  const initState=()=>{
    const bag=mkBag(LD);
    const playerRack=drawN(bag,7,LV);
    const aiRack=drawN(bag,7,LV);
    return{bag,playerRack,aiRack,board:Array(SIZE).fill(null).map(()=>Array(SIZE).fill(null)),
      placed:{},sel:null,playerScore:0,aiScore:0,firstPlay:true,loading:false,result:null,error:null,turns:0,isAiTurn:false,timerActive:diffCfg.timer>0};
  };
  const[gs,setGs]=useState(initState);
  const pc=Object.keys(gs.placed).length;

  // Live score preview
  const liveScore=useMemo(()=>{
    try{
      if(!Object.keys(gs.placed).length)return null;
      const words=findWords(gs.board,gs.placed);
      if(!words.length)return null;
      const allValid=words.every(w=>dict.has(w.word));
      if(!allValid)return{score:0,invalid:words.filter(w=>!dict.has(w.word)).map(w=>w.word)};
      const{total,scored}=calcScore(gs.board,gs.placed,words,LV);
      return{score:total,scored,invalid:[]};
    }catch{return null;}
  },[gs.placed,gs.board,dict,LV]);

  // AI turn
  useEffect(()=>{
    if(!gs.isAiTurn||gs.loading||gameOver)return;
    setAiMsg(ui.aiThinking);
    const delay=diffCfg.aiRandom?800:1200;
    const t=setTimeout(()=>{
      const move=findAIMove(gs.board,gs.aiRack,dict,gs.firstPlay,diff,LV);
      if(!move){
        setAiMsg(ui.aiPass);
        setGs(g=>({...g,isAiTurn:false,timerActive:diffCfg.timer>0}));
        setTimeout(()=>setAiMsg(null),1500);
        return;
      }
      // Apply AI move
      const words=findWords(gs.board,move.placed);
      const{total,scored}=calcScore(gs.board,move.placed,words,LV);
      allScoredWords.current.push(...scored);
      setAiMsg(`${ui.aiPlayed} ${scored.map(w=>w.word).join(', ')} (+${total} pts)`);
      setGs(g=>{
        const nb=g.board.map(row=>[...row]);
        for(const[k,t2]of Object.entries(move.placed)){const[r,c]=k.split(',').map(Number);nb[r][c]={letter:t2.letter,value:LV[t2.letter]||0};}
        const newBag=[...g.bag];const newAiRack=drawN(newBag,7-g.aiRack.length+Object.keys(move.placed).length,LV);
        const remainingAi=g.aiRack.filter(t2=>!Object.values(move.placed).some(p=>p.letter===t2.letter&&!newAiRack.find(nt=>nt.id===t2.id)));
        return{...g,board:nb,aiRack:[...remainingAi,...newAiRack].slice(0,7),bag:newBag,
          aiScore:g.aiScore+total,firstPlay:false,isAiTurn:false,timerActive:diffCfg.timer>0,turns:g.turns+1};
      });
      setTimeout(()=>setAiMsg(null),2500);
    },delay);
    return()=>clearTimeout(t);
  },[gs.isAiTurn]);

  const handleTimerExpire=useCallback(()=>{
    setGs(g=>{const ret=Object.values(g.placed);return{...g,placed:{},playerRack:[...g.playerRack,...ret],sel:null,timerActive:false,error:ui.errTimer,result:null};});
    setTimeout(()=>setGs(g=>({...g,timerActive:true})),100);
  },[ui]);
  const remaining=useTimer(diffCfg.timer,gs.timerActive&&diffCfg.timer>0&&!gs.isAiTurn,handleTimerExpire);
  const timerColor=remaining<=10?'#E84040':remaining<=30?'#E8A020':'#2A8A40';

  function resetTimer(){if(diffCfg.timer>0)setGs(g=>({...g,timerActive:true}));}

  function endGame(){recordGame(lang,diff,gs.playerScore,allScoredWords.current);setGameOver(true);setGs(g=>({...g,timerActive:false}));}

  function clickRack(t){if(gs.isAiTurn)return;setGs(g=>({...g,sel:g.sel===t.id?null:t.id,error:null,result:null}));setHintMsg(null);}

  function clickCell(r,c){
    if(gs.isAiTurn)return;
    const key=`${r},${c}`;
    setGs(g=>{
      if(g.placed[key]){const t=g.placed[key];const np={...g.placed};delete np[key];return{...g,placed:np,playerRack:[...g.playerRack,{id:t.id,letter:t.letter,value:t.value}],sel:null};}
      if(g.board[r][c])return g;if(g.sel===null)return g;
      const idx=g.playerRack.findIndex(t=>t.id===g.sel);if(idx<0)return g;
      const tile=g.playerRack[idx];
      return{...g,playerRack:g.playerRack.filter((_,i)=>i!==idx),placed:{...g.placed,[key]:{id:tile.id,letter:tile.letter,value:tile.value}},sel:null,error:null,result:null};
    });
    setHintMsg(null);
  }

  async function confirm(){
    if(gs.isAiTurn)return;
    const v=validatePlacement(gs.board,gs.placed,gs.firstPlay,ui);
    if(!v.ok){setGs(g=>({...g,error:v.msg}));return;}
    const words=findWords(gs.board,gs.placed);
    if(!words.length){setGs(g=>({...g,error:ui.errNone}));return;}
    const invalid=words.filter(w=>!dict.has(w.word));
    if(invalid.length>0){setGs(g=>({...g,error:`${ui.invalid}: ${invalid.map(w=>w.word).join(', ')}`}));return;}
    let{total,scored}=calcScore(gs.board,gs.placed,words,LV);
    let penalty=0;
    if(diffCfg.minScore>0&&total<diffCfg.minScore){penalty=diffCfg.penalty;total-=penalty;}
    allScoredWords.current.push(...scored);
    setGs(g=>{
      const nb=g.board.map(row=>[...row]);
      for(const[k,t]of Object.entries(g.placed)){const[r,c]=k.split(',').map(Number);nb[r][c]={letter:t.letter,value:t.value};}
      const newBag=[...g.bag];const newTiles=drawN(newBag,7-g.playerRack.length,LV);
      return{...g,board:nb,placed:{},playerRack:[...g.playerRack,...newTiles],bag:newBag,
        playerScore:Math.max(0,g.playerScore+total),firstPlay:false,result:{scored,total,penalty},turns:g.turns+1,error:null,isAiTurn:true,timerActive:false};
    });
  }

  function recall(){if(gs.isAiTurn)return;setGs(g=>{const ret=Object.values(g.placed);return{...g,placed:{},playerRack:[...g.playerRack,...ret],sel:null,error:null};});setHintMsg(null);}
  function pass(){
    if(gs.isAiTurn)return;
    if(diffCfg.minScore>0)setGs(g=>({...g,playerScore:Math.max(0,g.playerScore-diffCfg.penalty),placed:{},playerRack:[...g.playerRack,...Object.values(g.placed)],sel:null,result:null,error:null,isAiTurn:true,timerActive:false}));
    else setGs(g=>{const ret=Object.values(g.placed);return{...g,placed:{},playerRack:[...g.playerRack,...ret],sel:null,result:null,error:null,isAiTurn:true,timerActive:false};});
    resetTimer();setHintMsg(null);
  }
  function doHint(){const h=findHint(gs.board,gs.playerRack,dict,gs.firstPlay);setHintMsg(h?h.hint:'Aucun indice disponible.');}

  function renderCell(r,c){
    const key=`${r},${c}`,comm=gs.board[r][c],plc=gs.placed[key],prem=PM[key];
    let bg=T.cellBg,inner=null,border=T.cellBorder;
    const fs=Math.max(7,Math.round(cs*0.52)),fsv=Math.max(4,Math.round(cs*0.28));
    if(comm){
      bg=T.cellBg;
      inner=<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',width:'100%',height:'100%',background:T.tileBase,borderRadius:'2px'}}>
        <span style={{fontSize:fs+'px',fontWeight:'900',color:T.tileText,lineHeight:1}}>{comm.letter}</span>
        <span style={{fontSize:fsv+'px',color:T.tileText,fontWeight:'bold',opacity:0.7}}>{comm.value}</span></div>;
    } else if(plc){
      bg=T.placedBg;border=T.placedBorder;
      inner=<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',width:'100%',height:'100%'}}>
        <span style={{fontSize:fs+'px',fontWeight:'900',color:T.tileText,lineHeight:1}}>{plc.letter}</span>
        <span style={{fontSize:fsv+'px',color:T.tileText,fontWeight:'bold',opacity:0.7}}>{plc.value}</span></div>;
    } else if(prem){
      const pc2=T.PREM[prem];bg=pc2.bg;
      const pfs=prem==='STAR'?Math.round(cs*0.55):Math.max(5,Math.round(cs*0.28));
      inner=<span style={{fontSize:pfs+'px',fontWeight:'900',color:pc2.fg,textAlign:'center',lineHeight:1.1,whiteSpace:'pre'}}>{PLAB[prem]}</span>;
    }
    return(<div key={key} onClick={()=>clickCell(r,c)} style={{width:cs+'px',height:cs+'px',background:bg,border:`0.5px solid ${border}`,display:'flex',alignItems:'center',justifyContent:'center',boxSizing:'border-box',boxShadow:plc?`0 0 0 1.5px ${T.placedBorder}`:'none',WebkitTapHighlightColor:'transparent',cursor:comm?'default':'pointer'}}>{inner}</div>);
  }

  // ── GAME OVER ─────────────────────────────────────────────
  if(gameOver){
    const st=getStatsFor(lang,diff);
    const won=gs.playerScore>=gs.aiScore;
    return(
      <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:T.bgGrad,fontFamily:"'Helvetica Neue',Arial,sans-serif",color:T.text,padding:'32px',gap:'18px',textAlign:'center'}}>
        <div style={{fontSize:'52px'}}>{won?'🏆':'😤'}</div>
        <h2 style={{margin:0,fontSize:'22px',fontWeight:'900',color:T.scoreColor}}>{won?'Victoire !':'Défaite !'}</h2>
        <div style={{display:'flex',gap:'20px'}}>
          <div style={{padding:'16px 24px',background:'rgba(255,255,255,0.2)',borderRadius:'14px',backdropFilter:'blur(4px)'}}>
            <div style={{fontSize:'11px',opacity:0.7,marginBottom:'4px'}}>{ui.youLabel}</div>
            <div style={{fontSize:'30px',fontWeight:'900',color:T.scoreColor}}>{gs.playerScore}</div>
          </div>
          <div style={{padding:'16px 24px',background:'rgba(0,0,0,0.15)',borderRadius:'14px'}}>
            <div style={{fontSize:'11px',opacity:0.7,marginBottom:'4px'}}>{ui.aiLabel} {diffCfg.emoji}</div>
            <div style={{fontSize:'30px',fontWeight:'900',opacity:0.8}}>{gs.aiScore}</div>
          </div>
        </div>
        {gs.playerScore>=st.bestScore&&gs.playerScore>0&&<div style={{fontSize:'12px',color:T.scoreColor}}>🌟 Nouveau record personnel !</div>}
        <div style={{display:'flex',flexDirection:'column',gap:'9px',width:'100%',maxWidth:'260px'}}>
          <button onClick={()=>onReset('same')} style={{padding:'12px',background:T.btnConfirm,border:'none',borderRadius:'10px',color:'#FFF',fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:'13px',fontWeight:'700',cursor:'pointer',WebkitTapHighlightColor:'transparent'}}>🔄 {ui.newGame}</button>
          <button onClick={onStats} style={{padding:'12px',background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'10px',color:T.text,fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:'13px',cursor:'pointer',WebkitTapHighlightColor:'transparent'}}>📊 Statistiques</button>
          <button onClick={()=>onReset('menu')} style={{padding:'12px',background:'rgba(0,0,0,0.1)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',color:T.text,fontFamily:"'Helvetica Neue',Arial,sans-serif",fontSize:'13px',cursor:'pointer',WebkitTapHighlightColor:'transparent'}}>← Menu</button>
        </div>
      </div>
    );
  }

  const btnS=(bg,dis)=>({padding:'9px 4px',background:dis?'rgba(0,0,0,0.15)':bg,color:dis?'rgba(255,255,255,0.3)':'#FFF',border:'none',borderRadius:'8px',cursor:dis?'not-allowed':'pointer',fontSize:'11px',fontWeight:'700',fontFamily:"'Helvetica Neue',Arial,sans-serif",WebkitTapHighlightColor:'transparent',flex:1,opacity:dis?0.5:1});

  return(
    <div style={{minHeight:'100dvh',background:T.bgGrad,display:'flex',flexDirection:'column',alignItems:'center',fontFamily:"'Helvetica Neue',Arial,sans-serif",padding:'env(safe-area-inset-top,8px) 8px env(safe-area-inset-bottom,12px)',color:T.text,overflowX:'hidden'}}>

      {/* Header */}
      <div style={{width:'100%',maxWidth:'420px',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'4px',paddingTop:'4px'}}>
        <button onClick={()=>onReset('menu')} style={{background:'rgba(255,255,255,0.15)',border:'none',borderRadius:'8px',color:T.text,cursor:'pointer',fontSize:'10px',padding:'5px 9px',WebkitTapHighlightColor:'transparent'}}>← Menu</button>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'15px',fontWeight:'900',color:T.scoreColor,letterSpacing:'1px'}}>AluQ Words</div>
          <div style={{fontSize:'8px',opacity:0.6}}>{flag} {name} · {diffCfg.emoji} {diffCfg.label}</div>
        </div>
        <div style={{display:'flex',gap:'6px'}}>
          <button onClick={onStats} style={{background:'rgba(255,255,255,0.15)',border:'none',borderRadius:'8px',color:T.text,cursor:'pointer',fontSize:'13px',padding:'5px 8px',WebkitTapHighlightColor:'transparent'}}>📊</button>
          <button onClick={endGame} style={{background:'rgba(255,255,255,0.15)',border:'none',borderRadius:'8px',color:T.text,cursor:'pointer',fontSize:'10px',padding:'5px 8px',WebkitTapHighlightColor:'transparent'}}>Fin</button>
        </div>
      </div>

      {/* Scoreboard */}
      <div style={{display:'flex',gap:'10px',marginBottom:'5px',width:'100%',maxWidth:'380px'}}>
        {[
          {label:ui.youLabel,score:gs.playerScore,active:!gs.isAiTurn},
          {label:`${ui.aiLabel} ${diffCfg.emoji}`,score:gs.aiScore,active:gs.isAiTurn},
        ].map((p,i)=>(
          <div key={i} style={{flex:1,padding:'6px 10px',background:p.active?'rgba(255,255,255,0.25)':'rgba(0,0,0,0.12)',borderRadius:'10px',textAlign:'center',border:p.active?'2px solid rgba(255,255,255,0.5)':'2px solid transparent',transition:'all 0.3s'}}>
            <div style={{fontSize:'9px',opacity:0.7,fontWeight:'600'}}>{p.label}</div>
            <div style={{fontSize:'20px',fontWeight:'900',color:T.scoreColor}}>{p.score}</div>
          </div>
        ))}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minWidth:'40px'}}>
          <div style={{fontSize:'8px',opacity:0.6}}>{ui.bag}</div>
          <div style={{fontSize:'14px',fontWeight:'700',opacity:0.8}}>{gs.bag.length}</div>
          {diffCfg.timer>0&&!gs.isAiTurn&&<div style={{fontSize:'12px',fontWeight:'900',color:timerColor}}>⏱{remaining}</div>}
        </div>
      </div>

      {/* AI message */}
      {aiMsg&&(
        <div style={{marginBottom:'4px',padding:'6px 14px',background:'rgba(0,0,0,0.2)',borderRadius:'20px',fontSize:'11px',color:T.text,fontStyle:'italic',maxWidth:'360px',textAlign:'center'}}>
          {aiMsg}
        </div>
      )}

      {/* Board */}
      <div style={{overflowX:'auto',marginBottom:'5px',width:'100%',display:'flex',justifyContent:'center',WebkitOverflowScrolling:'touch'}}>
        <div style={{display:'inline-grid',gridTemplateColumns:`repeat(${SIZE},${cs}px)`,gap:'0.5px',background:T.boardBorder,padding:'2px',borderRadius:'4px',boxShadow:'0 4px 20px rgba(0,0,0,0.3)'}}>
          {Array.from({length:SIZE},(_,r)=>Array.from({length:SIZE},(_,c)=>renderCell(r,c)))}
        </div>
      </div>

      {/* Legend */}
      <div style={{display:'flex',gap:'8px',marginBottom:'4px',flexWrap:'wrap',justifyContent:'center'}}>
        {[['TW','MT×3'],['DW','MT×2'],['TL','LT×3'],['DL','LT×2']].map(([t,l])=>(
          <div key={t} style={{display:'flex',alignItems:'center',gap:'3px',fontSize:'8px',opacity:0.75}}>
            <div style={{width:'8px',height:'8px',background:T.PREM[t].bg,borderRadius:'1px'}}/>{l}
          </div>
        ))}
      </div>

      {/* Live score preview */}
      {liveScore&&(
        <div style={{marginBottom:'4px',padding:'4px 14px',borderRadius:'16px',
          background:liveScore.invalid?.length?'rgba(200,0,0,0.2)':'rgba(0,180,0,0.2)',
          fontSize:'13px',fontWeight:'900',color:liveScore.invalid?.length?'#E84040':T.btnConfirm,
          display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap',justifyContent:'center'}}>
          {liveScore.invalid?.length
            ? <span>❌ {liveScore.invalid.join(', ')}</span>
            : <>{liveScore.scored?.map((w,i)=><span key={i}>{w.word} <strong>+{w.score}</strong></span>)}</>
          }
        </div>
      )}

      {/* Rack */}
      <div style={{display:'flex',gap:'4px',marginBottom:'5px',padding:'7px 10px',background:'rgba(0,0,0,0.15)',borderRadius:'12px',justifyContent:'center',alignItems:'flex-end',width:'100%',maxWidth:'400px',minHeight:'58px'}}>
        {gs.playerRack.map((t,idx)=>(
          <div key={t.id}
            onClick={()=>clickRack(t)}
            draggable={!gs.isAiTurn}
            onDragStart={()=>setDragIdx(idx)}
            onDragOver={e=>{e.preventDefault();}}
            onDrop={()=>{
              if(dragIdx===null||dragIdx===idx)return;
              setGs(g=>{
                const r=[...g.playerRack];
                const [moved]=r.splice(dragIdx,1);
                r.splice(idx,0,moved);
                return{...g,playerRack:r};
              });
              setDragIdx(null);
            }}
            style={{
              width:'42px',height:'50px',
              background:gs.sel===t.id?T.tileSel:T.tileBase,
              border:`2px solid ${gs.sel===t.id?T.placedBorder:T.tileBorder}`,
              borderRadius:'6px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
              cursor:gs.isAiTurn?'not-allowed':'pointer',
              transform:gs.sel===t.id?'translateY(-8px) scale(1.1)':dragIdx===idx?'scale(0.9)':'none',
              transition:'all 0.12s',opacity:gs.isAiTurn?0.6:1,
              boxShadow:gs.sel===t.id?'0 6px 16px rgba(0,0,0,0.35)':'0 3px 6px rgba(0,0,0,0.25)',
              WebkitTapHighlightColor:'transparent',flexShrink:0}}>
            <span style={{fontSize:'20px',fontWeight:'900',color:T.tileText,lineHeight:1}}>{t.letter}</span>
            <span style={{fontSize:'9px',color:T.tileText,fontWeight:'bold',opacity:0.7}}>{t.value}</span>
          </div>
        ))}
        {Array.from({length:Math.max(0,7-gs.playerRack.length-pc)},(_,i)=>(
          <div key={`ph${i}`} style={{width:'42px',height:'50px',border:'2px dashed rgba(255,255,255,0.2)',borderRadius:'6px',flexShrink:0}}/>
        ))}
      </div>

      {gs.sel!==null&&!gs.isAiTurn&&<p style={{margin:'0 0 4px',fontSize:'10px',opacity:0.7,fontStyle:'italic'}}>{ui.placeHint}</p>}
      {gs.firstPlay&&gs.sel===null&&pc===0&&!gs.isAiTurn&&<p style={{margin:'0 0 4px',fontSize:'10px',opacity:0.6,fontStyle:'italic'}}>{ui.firstHint}</p>}
      {hintMsg&&<p style={{margin:'0 0 4px',fontSize:'11px',color:T.scoreColor,fontStyle:'italic',textAlign:'center'}}>{hintMsg}</p>}

      {/* Buttons */}
      <div style={{display:'flex',gap:'6px',marginBottom:'6px',width:'100%',maxWidth:'360px'}}>
        <button onClick={confirm} disabled={pc===0||gs.isAiTurn} style={btnS(T.btnConfirm,gs.loading||pc===0||gs.isAiTurn)}>
          {ui.confirm}
        </button>
        <button onClick={recall} disabled={pc===0||gs.isAiTurn} style={btnS(T.btnRecall,pc===0||gs.isAiTurn)}>{ui.recall}</button>
        <button onClick={pass} disabled={gs.isAiTurn} style={btnS(T.btnPass,gs.isAiTurn)}>{ui.pass}</button>
        {diffCfg.hint&&<button onClick={doHint} disabled={gs.isAiTurn} style={btnS(T.btnHint,gs.isAiTurn)}>{ui.hint}</button>}
      </div>

      {/* Error */}
      {gs.error&&<div style={{background:T.errorBg,borderRadius:'8px',padding:'7px 14px',marginBottom:'6px',fontSize:'11px',color:T.errorText,textAlign:'center',maxWidth:'340px'}}>⚠️ {gs.error}</div>}

      {/* Result toast */}
      {gs.result&&(
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap',justifyContent:'center',animation:'slideUp 0.25s ease',marginTop:'4px'}}>
          {gs.result.scored.map((w,i)=>(
            <div key={i} style={{padding:'6px 14px',background:'rgba(0,0,0,0.18)',borderRadius:'20px',backdropFilter:'blur(6px)',display:'flex',gap:'8px',alignItems:'center'}}>
              <span style={{fontWeight:'900',fontSize:'13px',letterSpacing:'2px',color:T.text,textTransform:'uppercase'}}>{w.word}</span>
              <span style={{fontSize:'14px',fontWeight:'900',color:T.btnConfirm}}>+{w.score}</span>
            </div>
          ))}
          {gs.result.penalty>0&&(
            <div style={{padding:'6px 14px',background:'rgba(200,0,0,0.2)',borderRadius:'20px'}}>
              <span style={{fontSize:'12px',color:'#E84040',fontWeight:'700'}}>-{gs.result.penalty} pénalité</span>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        *{-webkit-tap-highlight-color:transparent;}::-webkit-scrollbar{display:none;}
      `}</style>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────
export default function AluQWords(){
  const[screen,setScreen]=useState('lang');
  const[lang,setLang]=useState(null);
  const[diff,setDiff]=useState(null);
  const[dict,setDict]=useState(null);
  const[dictErr,setDictErr]=useState(null);
  const[prevLang,setPrevLang]=useState(null);
  const[theme,setTheme]=useState('classic');

  function pickLang(l){setLang(l);setScreen('diff');}
  function pickDiff(d){setDiff(d);if(dict&&lang===prevLang)setScreen('game');else{setDict(null);setDictErr(null);setScreen('dict');}}
  function handleReset(mode){if(mode==='same'&&lang&&diff){setDict(null);setDictErr(null);setScreen('dict');}else setScreen('lang');}

  if(screen==='lang')return<LangPicker onPick={pickLang} theme={theme}/>;
  if(screen==='diff')return<DiffPicker lang={lang} onPick={pickDiff} onBack={()=>setScreen('lang')} onStats={()=>setScreen('stats')} theme={theme} onTheme={setTheme}/>;
  if(screen==='stats')return<StatsScreen lang={lang||'EN'} onBack={()=>setScreen(lang?'diff':'lang')} theme={theme}/>;
  if(screen==='dict'){
    if(dictErr)return(
      <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:THEMES[theme].bgGrad,color:THEMES[theme].text,fontFamily:"'Helvetica Neue',Arial,sans-serif",gap:'16px',padding:'32px',textAlign:'center'}}>
        <p>⚠️ {CFG[lang].ui.dictErr}</p><p style={{fontSize:'11px',opacity:0.5}}>{dictErr}</p>
        <button onClick={()=>setDictErr(null)} style={{padding:'10px 20px',background:'rgba(255,255,255,0.2)',color:THEMES[theme].text,border:'none',borderRadius:'8px',cursor:'pointer'}}>Réessayer</button>
        <button onClick={()=>setScreen('diff')} style={{padding:'10px 20px',background:'none',color:THEMES[theme].text,border:'1px solid rgba(255,255,255,0.2)',borderRadius:'8px',cursor:'pointer'}}>← Retour</button>
      </div>
    );
    return<DictLoader lang={lang} onLoaded={d=>{setDict(d);setPrevLang(lang);setScreen('game');}} onError={setDictErr} theme={theme}/>;
  }
  if(screen==='game')return<Game lang={lang} diff={diff} dict={dict} onReset={handleReset} onStats={()=>setScreen('stats')} theme={theme}/>;
  return null;
}
