import { useState, useEffect, useRef, useCallback } from "react";

const SIZE = 15;
let _uid = 0;
const uid = () => ++_uid;

const LV_EN={A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:5,L:1,M:3,N:1,O:1,P:3,Q:10,R:1,S:1,T:1,U:1,V:4,W:4,X:8,Y:4,Z:10};
const LD_EN={A:9,B:2,C:2,D:4,E:12,F:2,G:3,H:2,I:9,J:1,K:1,L:4,M:2,N:6,O:8,P:2,Q:1,R:6,S:4,T:6,U:4,V:2,W:2,X:1,Y:2,Z:1};
const LV_FR={A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:10,L:1,M:2,N:1,O:1,P:3,Q:8,R:1,S:1,T:1,U:1,V:4,W:10,X:10,Y:10,Z:10,'?':0};
const LD_FR={A:9,B:2,C:2,D:3,E:15,F:2,G:2,H:2,I:8,J:1,K:1,L:5,M:3,N:6,O:6,P:2,Q:1,R:6,S:6,T:6,U:6,V:2,W:1,X:1,Y:1,Z:1,'?':2};

const THEMES={
  classic:{name:'Classique',emoji:'🔵',bgGrad:'linear-gradient(160deg,#7ECEF7,#4AACE8)',
    boardBorder:'#A0C8E8',cellBg:'#F0F8FF',cellBorder:'#D8EAF5',
    placedBg:'#FFE566',placedBorder:'#D4A800',
    tileBase:'#FFE566',tileBorder:'#C8A000',tileText:'#1A0800',tileSel:'#FFD700',
    text:'#1A3A5C',scoreColor:'#1A3A5C',
    btnConfirm:'#2E7D32',btnRecall:'#C75000',btnPass:'#455A64',btnHint:'#1565C0',
    errorBg:'rgba(255,200,200,0.9)',errorText:'#C00000',
    PREM:{
      TW:{bg:'#DC143C',fg:'#FFFFFF'},
      DW:{bg:'#FFB6C1',fg:'#8B0000'},
      TL:{bg:'#4169E1',fg:'#FFFFFF'},
      DL:{bg:'#ADD8E6',fg:'#00008B'},
      STAR:{bg:'#DC143C',fg:'#FFFFFF'}
    },
  },
  dark:{name:'Sombre',emoji:'⚫',bgGrad:'radial-gradient(ellipse 80% 60% at 50% 0%,#2A1004,#130600)',
    boardBorder:'#3A1800',cellBg:'#B8914E',cellBorder:'#5A3008',
    placedBg:'#EEE08A',placedBorder:'#D4AC0D',
    tileBase:'#F5EDCC',tileBorder:'#C0943A',tileText:'#1A0800',tileSel:'#F0DC90',
    text:'#F0E6CC',scoreColor:'#D4AC0D',
    btnConfirm:'#1A6E38',btnRecall:'#7A4010',btnPass:'#3A3A4A',btnHint:'#1A4A6E',
    errorBg:'rgba(100,20,10,0.4)',errorText:'#E89080',
    PREM:{TW:{bg:'#8B1A10',fg:'#FFD0CC'},DW:{bg:'#C0703A',fg:'#FFEDE0'},TL:{bg:'#0E3A6B',fg:'#C0DBFF'},DL:{bg:'#1A6090',fg:'#D6EEFF'},STAR:{bg:'#8B1A10',fg:'#FFD0CC'}},
  },
  green:{name:'Vert',emoji:'🟢',bgGrad:'linear-gradient(160deg,#3A7A32,#1E4A18)',
    boardBorder:'#8B6914',cellBg:'#D4B483',cellBorder:'#8B6914',
    placedBg:'#FFE566',placedBorder:'#E8C800',
    tileBase:'#FFF8DC',tileBorder:'#B8860B',tileText:'#2A1A00',tileSel:'#FFD700',
    text:'#FFFFFF',scoreColor:'#FFE082',
    btnConfirm:'#388E3C',btnRecall:'#BF360C',btnPass:'#37474F',btnHint:'#1565C0',
    errorBg:'rgba(180,30,10,0.4)',errorText:'#FFCCBC',
    PREM:{TW:{bg:'#C62828',fg:'#FFF'},DW:{bg:'#E91E63',fg:'#FFF'},TL:{bg:'#1565C0',fg:'#FFF'},DL:{bg:'#42A5F5',fg:'#0D2A50'},STAR:{bg:'#C62828',fg:'#FFF'}},
  },
};

const DIFF={
  easy:   {label:'Facile',       emoji:'🟢',timer:0,  minScore:0, penalty:0, hint:true, aiMinLen:2,aiMaxLen:4,aiRandom:true, desc:'Sans minuteur · Indices · IA facile'},
  normal: {label:'Normal',       emoji:'🟡',timer:0,  minScore:0, penalty:0, hint:false,aiMinLen:2,aiMaxLen:6,aiRandom:false,desc:'Sans minuteur · IA normale'},
  hard:   {label:'Difficile',    emoji:'🔴',timer:0,  minScore:0, penalty:0, hint:false,aiMinLen:4,aiMaxLen:8,aiRandom:false,desc:'Sans minuteur · IA difficile'},
  extreme:{label:'Très difficile',emoji:'⚫',timer:60,minScore:10,penalty:20,hint:false,aiMinLen:4,aiMaxLen:10,aiRandom:false,desc:'1 min · Min 10 pts ou -20 · IA optimale'},
};

const CFG={
  EN:{flag:'🇬🇧',name:'ENGLISH',sub:'Définitions en français',defLabel:'🇫🇷',LV:LV_EN,LD:LD_EN,dictFile:'dict_en.txt',
    ui:{confirm:'✓ Valider',recall:'↩ Rappel',pass:'⏭ Passer',hint:'💡 Indice',
      score:'Score',bag:'Pioche',placeHint:'Touchez une case pour placer',firstHint:'Le 1er mot doit passer par ★',
      youLabel:'Vous',aiLabel:'IA',aiThinking:"L'IA réfléchit…",aiPlayed:"L'IA a joué :",aiPass:"L'IA a passé.",
      invalid:'❌ Mot invalide',words:'mots',
      errAlign:'Alignez en ligne ou colonne.',errGap:'Trou dans le mot.',errCenter:'Passer par ★.',
      errTouch:'Touchez un mot existant.',errNone:'Aucun mot valide.',errMin:'Placez une lettre.',errTimer:'⏰ Temps écoulé !',
      statsTitle:'Statistiques',gamesPlayed:'Parties',bestScore:'Meilleur score',avgScore:'Score moyen',
      bestWord:'Meilleur mot',totalWords:'Mots joués',noStats:'Aucune partie.',newGame:'Nouvelle partie',theme:'Thème',
    },
  },
  FR:{flag:'🇫🇷',name:'FRANÇAIS',sub:'Definitions in English',defLabel:'🇬🇧',LV:LV_FR,LD:LD_FR,dictFile:'dict_fr.txt',
    ui:{confirm:'✓ Valider',recall:'↩ Rappel',pass:'⏭ Passer',hint:'💡 Indice',
      score:'Score',bag:'Pioche',placeHint:'Touchez une case pour placer',firstHint:'Le 1er mot doit passer par ★',
      youLabel:'Vous',aiLabel:'IA',aiThinking:"L'IA réfléchit…",aiPlayed:"L'IA a joué :",aiPass:"L'IA a passé.",
      invalid:'❌ Mot invalide',words:'mots',
      errAlign:'Alignez en ligne ou colonne.',errGap:'Trou dans le mot.',errCenter:'Passer par ★.',
      errTouch:'Touchez un mot existant.',errNone:'Aucun mot valide.',errMin:'Placez une lettre.',errTimer:'⏰ Temps écoulé !',
      statsTitle:'Statistiques',gamesPlayed:'Parties',bestScore:'Meilleur score',avgScore:'Score moyen',
      bestWord:'Meilleur mot',totalWords:'Mots joués',noStats:'Aucune partie.',newGame:'Nouvelle partie',theme:'Thème',
    },
  },
};

const PM=(()=>{
  const m={};
  const a=(t,ps)=>ps.forEach(([r,c])=>{m[`${r},${c}`]=t;});
  a('TW',[[0,0],[0,7],[0,14],[7,0],[7,14],[14,0],[14,7],[14,14]]);
  a('DW',[[1,1],[2,2],[3,3],[4,4],[10,4],[11,3],[12,2],[13,1],[1,13],[2,12],[3,11],[4,10],[10,10],[11,11],[12,12],[13,13]]);
  a('TL',[[1,5],[1,9],[5,1],[5,5],[5,9],[5,13],[9,1],[9,5],[9,9],[9,13],[13,5],[13,9]]);
  a('DL',[[0,3],[0,11],[2,6],[2,8],[3,0],[3,7],[3,14],[6,2],[6,6],[6,8],[6,12],[7,3],[7,11],[8,2],[8,6],[8,8],[8,12],[11,0],[11,7],[11,14],[12,6],[12,8],[14,3],[14,11]]);
  m['7,7']='STAR';
  return m;
})();
const PLAB={TW:'MT',DW:'MD',TL:'LT',DL:'LD',STAR:'★'};

// STATS
const SK='aluq_stats_v1';
function loadStats(){try{return JSON.parse(localStorage.getItem(SK))||{};}catch{return {};}}
function saveStats(s){try{localStorage.setItem(SK,JSON.stringify(s));}catch{}}
function getStats(lang,diff){const s=loadStats();return s[lang]?.[diff]||{gamesPlayed:0,bestScore:0,totalScore:0,totalWords:0,bestWord:null,bestWordScore:0};}
function recordGame(lang,diff,score,words){
  const s=loadStats();if(!s[lang])s[lang]={};if(!s[lang][diff])s[lang][diff]={gamesPlayed:0,bestScore:0,totalScore:0,totalWords:0,bestWord:null,bestWordScore:0};
  const d=s[lang][diff];d.gamesPlayed++;d.totalScore+=score;d.totalWords+=words.length;
  if(score>d.bestScore)d.bestScore=score;
  for(const w of words)if(w.score>d.bestWordScore){d.bestWordScore=w.score;d.bestWord=w.word;}
  saveStats(s);
}

// SAVE/LOAD GAME
const SAVE_KEY = 'aluq_saved_game_v1';

function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch(e) {}
}

function loadGame() {
  try {
    const s = localStorage.getItem(SAVE_KEY);
    return s ? JSON.parse(s) : null;
  } catch(e) { return null; }
}

function clearSavedGame() {
  try { localStorage.removeItem(SAVE_KEY); } catch(e) {}
}

// GAME HELPERS
const VOWELS=new Set(['A','E','I','O','U','Y']);
function mkBag(LD){
  const b=[];for(const[l,n]of Object.entries(LD))for(let i=0;i<n;i++)b.push(l);
  for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}
  return b;
}
const mkTile=(l,LV)=>({id:uid(),letter:l,value:LV[l]||0});
const drawN=(bag,n,LV)=>bag.splice(0,Math.min(n,bag.length)).map(l=>mkTile(l,LV));
// Tirage équilibré voyelles/consonnes pour la main initiale
function drawBalanced(bag,LV){
  if(bag.length<7)return drawN(bag,bag.length,LV);
  // Tente jusqu'à 8 shuffles pour obtenir 2-5 voyelles sur 7 tuiles
  for(let attempt=0;attempt<8;attempt++){
    const sample=bag.slice(0,7);
    const v=sample.filter(l=>VOWELS.has(l)).length;
    if(v>=2&&v<=5)break;
    // Reshuffle la partie non encore piochée
    for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
  }
  return bag.splice(0,7).map(l=>mkTile(l,LV));
}
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
      if(cells.length<2)continue;
      const key=cells.map(([a,b])=>`${a},${b}`).join('|');
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
      if(placed[`${r},${c}`]){
        const pt=PM[`${r},${c}`];
        if(pt==='DL')lm=2;else if(pt==='TL')lm=3;
        else if(pt==='DW'||pt==='STAR')wm*=2;else if(pt==='TW')wm*=3;
      }
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
  const rows=[...new Set(pos.map(([r])=>r))];
  const cols=[...new Set(pos.map(([,c])=>c))];
  if(rows.length>1&&cols.length>1)return{ok:false,msg:ui.errAlign};
  if(rows.length===1){const r=rows[0],mc=Math.min(...cols),xc=Math.max(...cols);for(let c=mc;c<=xc;c++)if(!getL(board,placed,r,c))return{ok:false,msg:ui.errGap};}
  else{const c=cols[0],mr=Math.min(...rows),xr=Math.max(...rows);for(let r=mr;r<=xr;r++)if(!getL(board,placed,r,c))return{ok:false,msg:ui.errGap};}
  if(isFirst){if(!placed['7,7'])return{ok:false,msg:ui.errCenter};}
  else{
    const ok=pos.some(([r,c])=>[[-1,0],[1,0],[0,-1],[0,1]].some(([dr,dc])=>{
      const nr=r+dr,nc=c+dc;return nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr]?.[nc]?.letter&&!placed[`${nr},${nc}`];
    }));
    if(!ok)return{ok:false,msg:ui.errTouch};
  }
  return{ok:true};
}

// AI
function perms(arr,minL,maxL){
  const res=new Set();
  function h(cur,rem){
    if(cur.length>=minL)res.add(cur.join(''));
    if(cur.length>=maxL||!rem.length)return;
    for(let i=0;i<rem.length;i++){const r=[...rem];r.splice(i,1);h([...cur,rem[i]],r);}
  }
  h([],[...arr]);return res;
}

function findAIMove(board,rack,dict,isFirst,diffKey,LV){
  const dc=DIFF[diffKey];
  const rackLetters=rack.map(t=>t.letter);
  const moves=[];
  const ui2={errMin:'',errAlign:'',errGap:'',errCenter:'',errTouch:''};
  const maxMoves={easy:15,normal:40,hard:120}[diffKey]||40;
  const maxWordLen={easy:4,normal:5,hard:8}[diffKey]||5;
  // En fin de partie (peu de tuiles), on abaisse le minimum à 2
  const minWordLen=Math.min(dc.aiMinLen,Math.max(2,rackLetters.length-1));

  // Génère des mots depuis un ensemble de lettres disponibles
  function wordsFrom(avail,minL,maxL){
    const res=new Set();
    function h(cur,rem){
      if(cur.length>=minL&&dict.has(cur.join('')))res.add(cur.join(''));
      if(cur.length>=maxL||!rem.length)return;
      for(let i=0;i<rem.length;i++){const r=[...rem];r.splice(i,1);h([...cur,rem[i]],r);}
    }
    h([],[...avail]);return res;
  }

  // Essaie de placer un mot sur le plateau dans une direction donnée
  function tryPlace(word,sr,sc,DR,DC){
    const wl=word.length;
    if(sr<0||sc<0||sr+(wl-1)*DR>=SIZE||sc+(wl-1)*DC>=SIZE)return;
    const placed={};const rackCopy=[...rackLetters];let rackUsed=0;
    for(let i=0;i<wl;i++){
      const rr=sr+i*DR,cc=sc+i*DC;
      if(board[rr][cc]?.letter){
        if(board[rr][cc].letter!==word[i])return;
      }else{
        const ri=rackCopy.indexOf(word[i]);
        if(ri<0)return;
        rackCopy.splice(ri,1);
        placed[`${rr},${cc}`]={letter:word[i]};
        rackUsed++;
      }
    }
    if(rackUsed===0||!Object.keys(placed).length)return;
    if(!validatePlacement(board,placed,isFirst,ui2).ok)return;
    const ws=findWords(board,placed);if(!ws.length)return;
    if(!ws.every(w2=>dict.has(w2.word)))return;
    const{total,scored}=calcScore(board,placed,ws,LV);
    moves.push({placed,scored,total});
  }

  if(isFirst){
    const rackWords=wordsFrom(rackLetters,minWordLen,Math.min(maxWordLen,rackLetters.length));
    for(const word of rackWords){
      const wl=word.length;
      for(let off=0;off<wl;off++){
        tryPlace(word,7,7-off,0,1);
        tryPlace(word,7-off,7,1,0);
      }
    }
  }else{
    const anchors=new Map();
    for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
      if(board[r][c]){
        const l=board[r][c].letter;
        if(!anchors.has(l))anchors.set(l,[]);
        anchors.get(l).push([r,c]);
      }
    }
    const seenLetters=new Set();
    for(const[letter,positions]of anchors){
      if(seenLetters.has(letter))continue;
      seenLetters.add(letter);
      const avail=[...rackLetters,letter];
      const words=wordsFrom(avail,minWordLen,Math.min(maxWordLen,avail.length));
      for(const word of words){
        const wl=word.length;
        for(let wi=0;wi<wl;wi++){
          if(word[wi]!==letter)continue;
          for(const[ar,ac]of positions){
            tryPlace(word,ar,ac-wi,0,1);
            tryPlace(word,ar-wi,ac,1,0);
            if(moves.length>=maxMoves)break;
          }
          if(moves.length>=maxMoves)break;
        }
        if(moves.length>=maxMoves)break;
      }
      if(moves.length>=maxMoves)break;
    }
    if(moves.length<5){
      const rackWords=wordsFrom(rackLetters,2,Math.min(maxWordLen,rackLetters.length));
      for(const word of rackWords){
        const wl=word.length;
        for(const[DR,DC]of[[0,1],[1,0]]){
          for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE-(wl-1)*(1-DR);c++){
            let adj=false;
            const placed2={};let ok=true;const rc2=[...rackLetters];
            for(let i=0;i<wl;i++){
              const rr=r+i*DR,cc=c+i*DC;
              if(board[rr]?.[cc]){ok=false;break;}
              const ri=rc2.indexOf(word[i]);if(ri<0){ok=false;break;}
              rc2.splice(ri,1);placed2[`${rr},${cc}`]={letter:word[i]};
            }
            if(!ok)continue;
            for(const k of Object.keys(placed2)){
              const[pr,pc3]=k.split(',').map(Number);
              if([[-1,0],[1,0],[0,-1],[0,1]].some(([dr,dc3])=>board[pr+dr]?.[pc3+dc3]))adj=true;
            }
            if(!adj)continue;
            if(!validatePlacement(board,placed2,false,ui2).ok)continue;
            const ws=findWords(board,placed2);if(!ws.length)continue;
            if(!ws.every(w2=>dict.has(w2.word)))continue;
            const{total,scored}=calcScore(board,placed2,ws,LV);
            moves.push({placed:placed2,scored,total});
            if(moves.length>=10)break;
          }
          if(moves.length>=10)break;
        }
        if(moves.length>=10)break;
      }
    }
    if(!moves.length)return null;
  }

  if(!moves.length)return null;
  moves.sort((a,b)=>b.total-a.total);
  if(dc.aiRandom)return moves[Math.floor(Math.random()*moves.length)];
  if(diffKey==='easy')return moves[moves.length-1];
  if(diffKey==='normal')return moves[Math.floor(moves.length*0.4)]||moves[0];
  return moves[Math.floor(moves.length*0.1)]||moves[0]; // hard : top 10%
}
function findHint(board,rack,dict,firstPlay){
  const letters=rack.map(t=>t.letter);
  for(const w of perms(letters,2,5))if(dict.has(w))return firstPlay?`Essayez "${w}" au centre !`:`Essayez "${w}" !`;
  return null;
}

// TIMER HOOK
function useTimer(seconds,active,onExpire){
  const[rem,setRem]=useState(seconds);
  const ref=useRef(null);
  useEffect(()=>{setRem(seconds);},[seconds]);
  useEffect(()=>{
    if(!active||!seconds){clearInterval(ref.current);return;}
    ref.current=setInterval(()=>{setRem(r=>{if(r<=1){clearInterval(ref.current);onExpire();return 0;}return r-1;});},1000);
    return()=>clearInterval(ref.current);
  },[active,seconds]);
  return rem;
}

const FF="'Helvetica Neue',Arial,sans-serif";

// LANG PICKER
function LangPicker({onPick,theme}){
  const T=THEMES[theme];
  return(
    <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:T.bgGrad,fontFamily:FF,color:T.text,padding:'24px',gap:'28px'}}>
      <div style={{textAlign:'center'}}>
        <img src="/icon.png" alt="WORDAQ" style={{width:'140px',height:'140px',borderRadius:'28px',boxShadow:'0 8px 32px rgba(0,0,0,0.5)',marginBottom:'14px',display:'block',margin:'0 auto 14px'}}/>
        <p style={{margin:0,fontSize:'11px',opacity:0.7,letterSpacing:'2px'}}>Choisissez votre langue</p>
      </div>
      <div style={{display:'flex',gap:'16px',flexWrap:'wrap',justifyContent:'center',width:'100%',maxWidth:'320px'}}>
        {Object.entries(CFG).map(([code,c])=>(
          <button key={code} onClick={()=>onPick(code)} style={{
            flex:'1',minWidth:'128px',padding:'24px 14px',cursor:'pointer',
            background:'rgba(255,255,255,0.15)',border:'2px solid rgba(255,255,255,0.3)',borderRadius:'16px',
            display:'flex',flexDirection:'column',alignItems:'center',gap:'10px',
            fontFamily:FF,WebkitTapHighlightColor:'transparent'}}>
            <span style={{fontSize:'42px'}}>{c.flag}</span>
            <span style={{fontSize:'13px',fontWeight:'800',letterSpacing:'2px',color:T.text}}>{c.name}</span>
            <span style={{fontSize:'9px',opacity:0.7,fontStyle:'italic',textAlign:'center'}}>{c.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// DIFF PICKER
function DiffPicker({lang,onPick,onBack,onStats,onAbout,theme,onTheme}){
  const T=THEMES[theme];const cfg=CFG[lang];
  return(
    <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',background:T.bgGrad,fontFamily:FF,color:T.text,padding:'20px',paddingTop:'36px',gap:'12px'}}>
      <div style={{textAlign:'center',marginBottom:'4px'}}>
        <img src="/icon.png" alt="WORDAQ" style={{width:'90px',height:'90px',borderRadius:'20px',boxShadow:'0 6px 20px rgba(0,0,0,0.5)',marginBottom:'8px',display:'block',margin:'0 auto 8px'}}/>
        <span style={{fontSize:'24px'}}>{cfg.flag}</span>
        <p style={{margin:'4px 0 0',fontSize:'10px',opacity:0.7,letterSpacing:'2px'}}>{cfg.name} · Difficulté</p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'8px',width:'100%',maxWidth:'340px'}}>
        {Object.entries(DIFF).map(([key,d])=>(
          <button key={key} onClick={()=>onPick(key)} style={{
            padding:'13px 16px',background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.25)',
            borderRadius:'12px',cursor:'pointer',display:'flex',alignItems:'center',gap:'12px',textAlign:'left',
            fontFamily:FF,WebkitTapHighlightColor:'transparent'}}>
            <span style={{fontSize:'20px'}}>{d.emoji}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:'13px',fontWeight:'700',color:T.text}}>{d.label}</div>
              <div style={{fontSize:'9px',opacity:0.65,marginTop:'2px'}}>{d.desc}</div>
            </div>
            <span style={{opacity:0.4,fontSize:'16px'}}>›</span>
          </button>
        ))}
      </div>
      <div style={{display:'flex',gap:'8px',alignItems:'center',marginTop:'4px'}}>
        <span style={{fontSize:'10px',opacity:0.6}}>Thème:</span>
        {Object.entries(THEMES).map(([key,th])=>(
          <button key={key} onClick={()=>onTheme(key)} style={{
            width:'28px',height:'28px',borderRadius:'50%',cursor:'pointer',background:th.bgGrad,
            border:theme===key?'3px solid #FFF':'2px solid rgba(255,255,255,0.3)',
            fontSize:'13px',display:'flex',alignItems:'center',justifyContent:'center',
            WebkitTapHighlightColor:'transparent'}}>
            {th.emoji}
          </button>
        ))}
      </div>
      <div style={{display:'flex',gap:'10px',width:'100%',maxWidth:'340px',marginTop:'4px'}}>
        <button onClick={onBack} style={{flex:1,padding:'10px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'8px',color:T.text,cursor:'pointer',fontFamily:FF,fontSize:'12px',WebkitTapHighlightColor:'transparent'}}>← Langue</button>
        <button onClick={onStats} style={{flex:1,padding:'10px',background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'8px',color:T.scoreColor,cursor:'pointer',fontFamily:FF,fontSize:'12px',fontWeight:'bold',WebkitTapHighlightColor:'transparent'}}>📊 Stats</button>
        <button onClick={onAbout} style={{padding:'10px 14px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'8px',color:T.text,cursor:'pointer',fontFamily:FF,fontSize:'14px',WebkitTapHighlightColor:'transparent'}}>ℹ️</button>
      </div>
    </div>
  );
}

// ABOUT SCREEN
function AboutScreen({onBack,theme}){
  const T=THEMES[theme];
  return(
    <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:T.bgGrad,fontFamily:FF,color:T.text,padding:'28px',gap:'20px',textAlign:'center'}}>
      <img src="/icon.png" alt="WORDAQ" style={{width:'100px',height:'100px',borderRadius:'22px',boxShadow:'0 6px 24px rgba(0,0,0,0.5)'}}/>
      <div>
        <div style={{fontSize:'26px',fontWeight:'900',color:T.scoreColor,letterSpacing:'2px'}}>WORDAQ</div>
        <div style={{fontSize:'11px',opacity:0.6,letterSpacing:'3px',marginTop:'2px'}}>JEU DE LETTRES</div>
      </div>
      <div style={{background:'rgba(255,255,255,0.1)',borderRadius:'14px',padding:'20px 24px',width:'100%',maxWidth:'320px',display:'flex',flexDirection:'column',gap:'14px'}}>
        <div>
          <div style={{fontSize:'9px',opacity:0.5,letterSpacing:'2px',marginBottom:'4px'}}>PROPRIÉTÉ DE</div>
          <div style={{fontSize:'16px',fontWeight:'700',color:T.scoreColor}}>aluQ Entertainment</div>
        </div>
        <div style={{height:'1px',background:'rgba(255,255,255,0.15)'}}/>
        <div>
          <div style={{fontSize:'9px',opacity:0.5,letterSpacing:'2px',marginBottom:'4px'}}>DÉVELOPPÉ PAR</div>
          <div style={{fontSize:'15px',fontWeight:'700'}}>Emmanuel Luque Bailen</div>
        </div>
        <div style={{height:'1px',background:'rgba(255,255,255,0.15)'}}/>
        <div style={{fontSize:'10px',opacity:0.4}}>© 2026 aluQ Entertainment<br/>Tous droits réservés</div>
      </div>
      <button onClick={onBack} style={{padding:'12px 32px',background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'10px',color:T.text,cursor:'pointer',fontFamily:FF,fontSize:'13px',touchAction:'manipulation'}}>← Retour</button>
    </div>
  );
}

// STATS SCREEN
function StatsScreen({lang,onBack,theme}){
  const T=THEMES[theme];const cfg=CFG[lang];const ui=cfg.ui;
  const allS=loadStats()[lang]||{};
  const[tab,setTab]=useState('easy');
  return(
    <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',background:T.bgGrad,fontFamily:FF,color:T.text,padding:'20px',paddingTop:'36px',gap:'12px'}}>
      <div style={{textAlign:'center'}}>
        <h2 style={{margin:'0 0 4px',fontSize:'20px',fontWeight:'900',color:T.scoreColor}}>📊 {ui.statsTitle}</h2>
        <p style={{margin:0,fontSize:'10px',opacity:0.6}}>{cfg.flag} {cfg.name}</p>
      </div>
      <div style={{display:'flex',gap:'6px',flexWrap:'wrap',justifyContent:'center'}}>
        {Object.keys(DIFF).map(k=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:'5px 11px',borderRadius:'20px',cursor:'pointer',fontFamily:FF,fontSize:'11px',fontWeight:'bold',WebkitTapHighlightColor:'transparent',background:tab===k?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.1)',border:`1px solid ${tab===k?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.2)'}`,color:T.text}}>
            {DIFF[k].emoji} {DIFF[k].label}
          </button>
        ))}
      </div>
      {(()=>{
        const st=allS[tab];
        if(!st||st.gamesPlayed===0)return<div style={{textAlign:'center',opacity:0.5,fontSize:'12px',fontStyle:'italic',padding:'24px 0'}}>{ui.noStats}</div>;
        const avg=Math.round(st.totalScore/st.gamesPlayed);
        return(
          <div style={{width:'100%',maxWidth:'340px',display:'flex',flexDirection:'column',gap:'7px'}}>
            {[[ui.gamesPlayed,st.gamesPlayed,'🎮'],[ui.bestScore,st.bestScore,'🏆'],[ui.avgScore,avg,'📈'],[ui.totalWords,st.totalWords,'📝']].map(([label,val,icon],i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 15px',background:'rgba(255,255,255,0.15)',borderRadius:'10px'}}>
                <span style={{fontSize:'12px',opacity:0.8}}>{icon} {label}</span>
                <strong style={{fontSize:'16px',color:T.scoreColor}}>{val}</strong>
              </div>
            ))}
            {st.bestWord&&(
              <div style={{padding:'12px',background:'rgba(255,255,255,0.2)',borderRadius:'10px',textAlign:'center'}}>
                <div style={{fontSize:'10px',opacity:0.7,marginBottom:'4px'}}>🌟 {ui.bestWord}</div>
                <div style={{fontSize:'22px',fontWeight:'900',letterSpacing:'3px',color:T.scoreColor}}>{st.bestWord}</div>
                <div style={{fontSize:'13px',opacity:0.8}}>{st.bestWordScore} pts</div>
              </div>
            )}
          </div>
        );
      })()}
      <button onClick={onBack} style={{padding:'10px 26px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.25)',borderRadius:'8px',color:T.text,cursor:'pointer',fontFamily:FF,fontSize:'12px',WebkitTapHighlightColor:'transparent'}}>← Retour</button>
    </div>
  );
}

// DICT LOADER
function DictLoader({lang,onLoaded,onError,theme}){
  const T=THEMES[theme];const{flag,name}=CFG[lang];
  const[progress,setProgress]=useState(0);const done=useRef(false);
  useEffect(()=>{
    if(done.current)return;done.current=true;
    fetch('/'+CFG[lang].dictFile).then(r=>{
      if(!r.ok)throw new Error('HTTP '+r.status);
      const total=parseInt(r.headers.get('content-length')||'0');
      const reader=r.body.getReader();const chunks=[];let received=0;
      function pump(){return reader.read().then(({done:d,value})=>{
        if(d){
          const text=new TextDecoder().decode(chunks.reduce((a,b)=>{const c=new Uint8Array(a.length+b.length);c.set(a);c.set(b,a.length);return c;},new Uint8Array(0)));
          onLoaded(new Set(text.split('\n').filter(Boolean)));return;
        }
        chunks.push(value);received+=value.length;if(total>0)setProgress(Math.round(received/total*100));return pump();
      });}
      return pump();
    }).catch(e=>onError(e.message));
  },[]);
  return(
    <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:T.bgGrad,fontFamily:FF,color:T.text,gap:'18px',padding:'32px'}}>
      <span style={{fontSize:'40px'}}>{flag}</span>
      <h2 style={{margin:0,fontSize:'16px',fontWeight:'800',letterSpacing:'3px',color:T.scoreColor}}>{name}</h2>
      <p style={{margin:0,fontSize:'12px',opacity:0.7,fontStyle:'italic'}}>Chargement du dictionnaire…</p>
      <div style={{width:'220px',height:'7px',background:'rgba(0,0,0,0.2)',borderRadius:'4px',overflow:'hidden'}}>
        <div style={{height:'100%',width:progress+'%',background:'rgba(255,255,255,0.6)',transition:'width 0.2s',borderRadius:'4px'}}/>
      </div>
      {progress>0&&<span style={{fontSize:'11px',opacity:0.5}}>{progress}%</span>}
    </div>
  );
}

// GAME
function Game({lang,diff,dict,onReset,onStats,theme,savedState}){
  const{LV,LD,ui,flag,name}=CFG[lang];
  const dc=DIFF[diff];
  const T=THEMES[theme];

  const[cs,setCs]=useState(()=>Math.floor(window.innerWidth/SIZE));
  useEffect(()=>{
    const h=()=>setCs(Math.floor(window.innerWidth/SIZE));
    window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h);
  },[]);

  const[gameOver,setGameOver]=useState(false);
  const[aiMsg,setAiMsg]=useState(null);
  const[error,setError]=useState(null);
  const[result,setResult]=useState(null);
  const[zoom,setZoom]=useState(()=>savedState?.zoom||1.0);
  const allWords=useRef([]);
  const consecutivePasses=useRef(0);
  // Exchange tiles
  const[exchangeMode,setExchangeMode]=useState(false);
  const[toExchange,setToExchange]=useState(new Set());
  // Joker : quand un joker est posé, on demande quelle lettre il représente
  const[jokerPending,setJokerPending]=useState(null); // {cellKey, tileId}
  // Drag & drop — géré via useEffect non-passif pour éviter le conflit scroll
  const dragRef=useRef({active:false,tile:null,ghostEl:null,overCell:null,startX:0,startY:0});
  const[dragOverCell,setDragOverCell]=useState(null);
  // Refs miroir (initialisées après board/placed ci-dessous)
  const boardRef2=useRef(null);
  const placedRef2=useRef(null);

  const S=savedState;
  const mkBoard=()=>Array(SIZE).fill(null).map(()=>Array(SIZE).fill(null));
  const[board,setBoard]=useState(()=>S?.board||mkBoard());
  const[placed,setPlaced]=useState(()=>S?.placed||{});
  const[rack,setRack]=useState(()=>S?.rack||(()=>{const b=mkBag(LD);return drawBalanced(b,LV);})());
  const[sel,setSel]=useState(null); // selected tile id from rack
  const[aiRack,setAiRack]=useState(()=>S?.aiRack||(()=>{const b=mkBag(LD);return drawBalanced(b,LV);})());
  const[bag,setBag]=useState(()=>S?.bag||mkBag(LD));
  const[playerScore,setPlayerScore]=useState(()=>S?.playerScore||0);
  const[aiScore,setAiScore]=useState(()=>S?.aiScore||0);
  const[firstPlay,setFirstPlay]=useState(()=>S?.firstPlay!==undefined?S.firstPlay:true);
  const[isAiTurn,setIsAiTurn]=useState(()=>S?.isAiTurn||false);
  const[timerActive,setTimerActive]=useState(dc.timer>0);

  // Sync refs miroir — APRÈS tous les useState
  useEffect(()=>{boardRef2.current=board;},[board]);
  useEffect(()=>{placedRef2.current=placed;},[placed]);

  const pc=Object.keys(placed).length;

  // Auto-save
  useEffect(()=>{
    if(gameOver)return;
    saveGame({lang,diff,theme,board,placed,rack,sel:null,aiRack,bag,playerScore,aiScore,firstPlay,isAiTurn,zoom});
  },[board,placed,rack,aiRack,bag,playerScore,aiScore,firstPlay,isAiTurn]);

  // Live score
  let liveScore=null;
  try{
    if(pc>0){
      const ws=findWords(board,placed);
      if(ws.length){
        const inv=ws.filter(w=>!dict.has(w.word));
        if(inv.length)liveScore={invalid:inv.map(w=>w.word)};
        else{const{total,scored}=calcScore(board,placed,ws,LV);liveScore={scored,total};}
      }
    }
  }catch(e){}

  // Auto-end when player rack + bag empty
  useEffect(()=>{
    if(bag.length===0&&rack.length===0&&pc===0&&!gameOver&&!isAiTurn){
      const aiPenalty=aiRack.reduce((sum,t)=>sum+(t.value||0),0);
      if(aiPenalty>0){setAiScore(s=>Math.max(0,s-aiPenalty));setPlayerScore(s=>s+aiPenalty);setAiMsg(`Fin ! Pénalité IA : -${aiPenalty} pts`);}
      setTimeout(()=>endGame(),1500);
    }
  },[bag.length,rack.length,pc,isAiTurn]);

  // Timer
  const handleExpire=useCallback(()=>{
    const ret=Object.values(placed);
    setPlaced({});setSel(null);
    setRack(r=>[...r,...ret.map(t=>({id:t.id,letter:t.letter,value:t.value}))]);
    setError(ui.errTimer);setTimeout(()=>setTimerActive(true),200);
  },[placed,ui]);
  const rem=useTimer(dc.timer,timerActive&&dc.timer>0&&!isAiTurn,handleExpire);
  const timerColor=rem<=10?"#E84040":rem<=30?"#E8A020":"#2A8A40";

  // AI turn
  useEffect(()=>{
    if(!isAiTurn||gameOver)return;
    setAiMsg(ui.aiThinking);
    const t=setTimeout(()=>{
      const move=findAIMove(board,aiRack,dict,firstPlay,diff,LV);
      if(!move){
        consecutivePasses.current++;
        if(consecutivePasses.current>=2){setAiMsg("Fin de partie !");setTimeout(()=>endGame(),1500);return;}
        setAiMsg(ui.aiPass);setIsAiTurn(false);setTimerActive(dc.timer>0);
        setTimeout(()=>setAiMsg(null),1500);return;
      }
      consecutivePasses.current=0;
      const ws=findWords(board,move.placed);
      const{total,scored}=calcScore(board,move.placed,ws,LV);
      allWords.current.push(...scored);
      setAiMsg(`${ui.aiPlayed} ${scored.map(w=>w.word).join(", ")} (+${total}pts)`);
      setBoard(b=>{const nb=b.map(r=>[...r]);for(const[k,t2]of Object.entries(move.placed)){const[r,c]=k.split(",").map(Number);nb[r][c]={letter:t2.letter,value:LV[t2.letter]||0};}return nb;});
      const used=Object.values(move.placed).map(p=>p.letter);
      setAiRack(r=>{
        let rem2=[...r];for(const l of used){const i=rem2.findIndex(t=>t.letter===l);if(i>=0)rem2.splice(i,1);}
        setBag(bg=>{const nb=[...bg];const nw=drawN(nb,used.length,LV);
          // Check if AI emptied rack with empty bag
          if(nb.length===0&&rem2.length===0){
            setTimeout(()=>{
              setRack(pr=>{
                const pen=pr.reduce((s,t)=>s+(t.value||0),0);
                if(pen>0){setPlayerScore(ps=>Math.max(0,ps-pen));setAiScore(as=>as+pen);setAiMsg(`Fin ! Pénalité joueur : -${pen} pts`);}
                return pr;
              });
              setTimeout(()=>endGame(),1500);
            },2800);
          }
          setAiRack(old=>[...rem2,...nw]);return nb;});
        return rem2;
      });
      setAiScore(s=>s+total);setFirstPlay(false);setIsAiTurn(false);setTimerActive(dc.timer>0);
      setTimeout(()=>setAiMsg(null),2500);
    },dc.aiRandom?600:1000);
    return()=>clearTimeout(t);
  },[isAiTurn]);

  // === CLASSIC WORDS STYLE INTERACTION ===
  // Tap rack tile → select/deselect/swap (ou toggle pour échange)
  function tapRack(t){
    if(isAiTurn)return;
    if(exchangeMode){
      setToExchange(s=>{const n=new Set(s);n.has(t.id)?n.delete(t.id):n.add(t.id);return n;});
      return;
    }
    if(sel!==null&&sel!==t.id){
      // Une tuile déjà sélectionnée → swap des positions dans le chevalet
      setRack(r=>{
        const n=[...r];
        const iA=n.findIndex(x=>x.id===sel);
        const iB=n.findIndex(x=>x.id===t.id);
        if(iA>=0&&iB>=0)[n[iA],n[iB]]=[n[iB],n[iA]];
        return n;
      });
      setSel(null);
    }else{
      setSel(s=>s===t.id?null:t.id);
      setError(null);setResult(null);
    }
  }

  // Tap board cell → place selected tile OR recall placed tile
  function tapCell(r,c){
    if(isAiTurn)return;
    const key=`${r},${c}`;
    // Tap already-placed tile → return to rack
    if(placed[key]){
      const t=placed[key];
      setPlaced(p=>{const n={...p};delete n[key];return n;});
      // Remet le joker avec son letter original '?'
      setRack(r2=>[...r2,{id:t.id,letter:t.isJoker?'?':t.letter,value:0,isJoker:t.isJoker}]);
      setSel(null);return;
    }
    if(board[r][c])return;
    if(!sel)return;
    const tile=rack.find(t=>t.id===sel);
    if(!tile)return;
    setRack(r2=>r2.filter(t=>t.id!==sel));
    if(tile.letter==='?'||tile.isJoker){
      // Joker : pose la case vide et ouvre le modal
      setPlaced(p=>({...p,[key]:{id:tile.id,letter:'?',value:0,isJoker:true}}));
      setJokerPending({cellKey:key,tileId:tile.id});
      setSel(null);setError(null);setResult(null);
    }else{
      setPlaced(p=>({...p,[key]:{id:tile.id,letter:tile.letter,value:tile.value}}));
      setSel(null);setError(null);setResult(null);
    }
  }

  // Choix de lettre pour un joker
  function resolveJoker(letter){
    if(!jokerPending)return;
    const{cellKey,tileId}=jokerPending;
    setPlaced(p=>({...p,[cellKey]:{id:tileId,letter,value:0,isJoker:true}}));
    setJokerPending(null);
  }

  function confirm(){
    if(isAiTurn||pc===0)return;
    const v=validatePlacement(board,placed,firstPlay,ui);
    if(!v.ok){setError(v.msg);return;}
    const ws=findWords(board,placed);
    if(!ws.length){setError(ui.errNone);return;}
    const inv=ws.filter(w=>!dict.has(w.word));
    if(inv.length){setError(`${ui.invalid}: ${inv.map(w=>w.word).join(", ")}`);return;}
    let{total,scored}=calcScore(board,placed,ws,LV);
    let penalty=0;
    if(dc.minScore>0&&total<dc.minScore){penalty=dc.penalty;total-=penalty;}
    allWords.current.push(...scored);
    consecutivePasses.current=0;
    const nPlaced=pc;
    setBoard(b=>{const nb=b.map(r=>[...r]);for(const[k,t]of Object.entries(placed)){const[r,c]=k.split(",").map(Number);nb[r][c]={letter:t.letter,value:t.value};}return nb;});
    setBag(bg=>{const nb=[...bg];const newT=drawN(nb,nPlaced,LV);setRack(r=>[...r,...newT]);return nb;});
    setPlayerScore(s=>Math.max(0,s+total-penalty));setFirstPlay(false);
    setResult({scored,total,penalty});setError(null);setSel(null);
    setPlaced({});setIsAiTurn(true);setTimerActive(false);
  }

  function recall(){
    if(isAiTurn)return;
    const ret=Object.values(placed).map(t=>({id:t.id,letter:t.letter,value:t.value}));
    setRack(r=>[...r,...ret]);setPlaced({});setSel(null);setError(null);
  }

  function pass(){
    if(isAiTurn)return;
    recall();
    consecutivePasses.current++;
    if(dc.minScore>0)setPlayerScore(s=>Math.max(0,s-dc.penalty));
    setResult(null);setIsAiTurn(true);setTimerActive(false);
  }

  // Échange de tuiles
  function startExchange(){
    if(isAiTurn)return;
    recall();setExchangeMode(true);setToExchange(new Set());setError(null);setResult(null);
  }
  function cancelExchange(){setExchangeMode(false);setToExchange(new Set());}
  function confirmExchange(){
    if(toExchange.size===0){cancelExchange();return;}
    if(bag.length<1){setError('Pioche vide !');cancelExchange();return;}
    const count=Math.min(toExchange.size,bag.length);
    const tilesToReturn=rack.filter(t=>toExchange.has(t.id)).slice(0,count);
    const keptRack=rack.filter(t=>!toExchange.has(t.id));
    const lettersToReturn=tilesToReturn.map(t=>t.letter);
    setBag(bg=>{
      const nb=[...bg];
      const newTiles=drawN(nb,tilesToReturn.length,LV);
      lettersToReturn.forEach(l=>nb.push(l));
      setRack([...keptRack,...newTiles]);
      return nb;
    });
    setToExchange(new Set());setExchangeMode(false);
    consecutivePasses.current++;
    setIsAiTurn(true);setTimerActive(false);
  }

  // Drag & drop — handlers non-passifs via useEffect
  useEffect(()=>{
    function onTouchMove(e){
      const ds=dragRef.current;
      if(!ds.tile)return;
      const touch=e.touches[0];
      if(!ds.active){
        // Seuil 8px avant d'activer — le scroll reste possible en dessous
        const dx=touch.clientX-ds.startX,dy=touch.clientY-ds.startY;
        if(Math.sqrt(dx*dx+dy*dy)<8)return;
        // Créer ghost
        const tw=Math.floor((window.innerWidth-32)/7);
        const th=Math.round(tw*1.18);
        const ghost=document.createElement('div');
        ghost.style.cssText=`position:fixed;pointer-events:none;z-index:9999;width:${tw}px;height:${th}px;background:#FFE566;border:2px solid #C8A000;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:${Math.round(tw*0.52)}px;font-weight:900;color:#1A0800;opacity:0.9;box-shadow:0 8px 24px rgba(0,0,0,0.4);left:${touch.clientX-tw/2}px;top:${touch.clientY-th*0.85}px`;
        ghost.textContent=ds.tile.letter;
        document.body.appendChild(ghost);
        ds.active=true;ds.ghostEl=ghost;
        setSel(null);setError(null); // vide sel seulement quand drag vraiment actif
        setDragOverCell(null);
      }
      // Bloque le scroll seulement pendant un drag actif
      if(e.cancelable)e.preventDefault();
      const{ghostEl}=ds;
      const tw=Math.floor((window.innerWidth-32)/7);
      const th=Math.round(tw*1.18);
      if(ghostEl){ghostEl.style.left=`${touch.clientX-tw/2}px`;ghostEl.style.top=`${touch.clientY-th*0.85}px`;}
      // Trouve la case sous le doigt
      if(ghostEl)ghostEl.style.display='none';
      let el=document.elementFromPoint(touch.clientX,touch.clientY);
      if(ghostEl)ghostEl.style.display='';
      let cellKey=null;
      while(el&&!cellKey){cellKey=el.dataset?.cellkey;el=el.parentElement;}
      if(cellKey!==ds.overCell){ds.overCell=cellKey||null;setDragOverCell(cellKey||null);}
    }
    function onTouchEnd(){
      const ds=dragRef.current;
      if(!ds.tile)return;
      const{tile,ghostEl,overCell,active}=ds;
      if(ghostEl&&ghostEl.parentNode)ghostEl.parentNode.removeChild(ghostEl);
      dragRef.current={active:false,tile:null,ghostEl:null,overCell:null,startX:0,startY:0};
      setDragOverCell(null);
      if(active&&overCell&&tile){
        const[r,c]=overCell.split(',').map(Number);
        const b=boardRef2.current,p=placedRef2.current;
        if(!b[r][c]&&!p[overCell]){
          setRack(r2=>r2.filter(t=>t.id!==tile.id));
          setPlaced(prev=>({...prev,[overCell]:{id:tile.id,letter:tile.letter,value:tile.value}}));
          setResult(null);setError(null);
        }
      }
    }
    document.addEventListener('touchmove',onTouchMove,{passive:false});
    document.addEventListener('touchend',onTouchEnd);
    return()=>{
      document.removeEventListener('touchmove',onTouchMove);
      document.removeEventListener('touchend',onTouchEnd);
    };
  },[]);// eslint-disable-line react-hooks/exhaustive-deps

  function startDrag(e,tile){
    if(isAiTurn||exchangeMode)return;
    const touch=e.touches[0];
    dragRef.current={active:false,tile,ghostEl:null,overCell:null,startX:touch.clientX,startY:touch.clientY};
    // Ne pas vider sel ici — tapRack s'en charge via onClick
  }

  function doHint(){
    const h=findHint(board,rack,dict,firstPlay);
    setSel(null);setError(h||"Aucun indice disponible.");
  }

  function endGame(){
    recordGame(lang,diff,playerScore,allWords.current);
    setGameOver(true);setTimerActive(false);clearSavedGame();
  }

  // === RENDER CELL ===
  function renderCell(r,c){
    const key=`${r},${c}`;
    const comm=board[r][c];const plc=placed[key];const prem=PM[key];
    let bg=T.cellBg,border=T.cellBorder,inner=null;
    const zcs=Math.round(cs*zoom);
    const fs=Math.max(7,Math.round(zcs*0.5));
    const fsv=Math.max(4,Math.round(zcs*0.27));
    // Drag highlight
    if(dragOverCell===key&&!comm&&!plc)bg='rgba(100,220,255,0.55)';
    if(comm){
      const isJ=comm.isJoker;
      inner=<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:"100%",height:"100%",background:isJ?"#E8E0FF":T.tileBase,borderRadius:"1px"}}>
        <span style={{fontSize:fs+"px",fontWeight:"900",color:isJ?"#5000CC":T.tileText,lineHeight:1,fontStyle:isJ?"italic":"normal"}}>{comm.letter}</span>
        <span style={{fontSize:fsv+"px",color:isJ?"#5000CC":T.tileText,opacity:0.7,fontWeight:"bold"}}>{isJ?'*':comm.value}</span></div>;
    }else if(plc){
      const isJ=plc.isJoker;
      bg=isJ?"#E8E0FF":T.placedBg;border=isJ?"#8B5CF6":T.placedBorder;
      inner=<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:"100%",height:"100%"}}>
        <span style={{fontSize:fs+"px",fontWeight:"900",color:isJ?"#5000CC":T.tileText,lineHeight:1,fontStyle:isJ?"italic":"normal"}}>{plc.letter==='?'?'?':plc.letter}</span>
        <span style={{fontSize:fsv+"px",color:isJ?"#5000CC":T.tileText,opacity:0.7,fontWeight:"bold"}}>{isJ?'*':plc.value}</span></div>;
    }else if(prem){
      const P=T.PREM[prem];bg=P.bg;
      const pfs=prem==="STAR"?Math.round(zcs*0.55):Math.max(5,Math.round(zcs*0.28));
      inner=<span style={{fontSize:pfs+"px",fontWeight:"900",color:P.fg,textAlign:"center",lineHeight:1.15,whiteSpace:"pre"}}>{PLAB[prem]}</span>;
    }
    return(
      <div key={key} data-cellkey={key} onClick={()=>tapCell(r,c)}
        style={{width:zcs+"px",height:zcs+"px",background:bg,
          border:`0.5px solid ${plc?T.placedBorder:border}`,
          display:"flex",alignItems:"center",justifyContent:"center",boxSizing:"border-box",
          boxShadow:plc?`0 0 0 1.5px ${T.placedBorder}`:"none",
          cursor:comm?"default":"pointer",WebkitTapHighlightColor:"transparent",touchAction:"manipulation"}}>
        {inner}
      </div>
    );
  }

  // === GAME OVER ===
  if(gameOver){
    const st=getStats(lang,diff);const won=playerScore>=aiScore;
    return(
      <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:T.bgGrad,fontFamily:FF,color:T.text,padding:"32px",gap:"18px",textAlign:"center"}}>
        <div style={{fontSize:"52px"}}>{won?"🏆":"😤"}</div>
        <h2 style={{margin:0,fontSize:"22px",fontWeight:"900",color:T.scoreColor}}>{won?"Victoire !":"Défaite !"}</h2>
        <div style={{display:"flex",gap:"20px"}}>
          <div style={{padding:"16px 24px",background:"rgba(255,255,255,0.2)",borderRadius:"14px"}}>
            <div style={{fontSize:"11px",opacity:0.7,marginBottom:"4px"}}>{ui.youLabel}</div>
            <div style={{fontSize:"30px",fontWeight:"900",color:T.scoreColor}}>{playerScore}</div>
          </div>
          <div style={{padding:"16px 24px",background:"rgba(0,0,0,0.15)",borderRadius:"14px"}}>
            <div style={{fontSize:"11px",opacity:0.7,marginBottom:"4px"}}>{ui.aiLabel} {dc.emoji}</div>
            <div style={{fontSize:"30px",fontWeight:"900",opacity:0.8}}>{aiScore}</div>
          </div>
        </div>
        {playerScore>=st.bestScore&&playerScore>0&&<div style={{fontSize:"12px",color:T.scoreColor}}>🌟 Nouveau record !</div>}
        <div style={{display:"flex",flexDirection:"column",gap:"9px",width:"100%",maxWidth:"260px"}}>
          <button onClick={()=>onReset("same")} style={{padding:"12px",background:T.btnConfirm,border:"none",borderRadius:"10px",color:"#FFF",fontFamily:FF,fontSize:"13px",fontWeight:"700",cursor:"pointer",touchAction:"manipulation"}}>🔄 {ui.newGame}</button>
          <button onClick={onStats} style={{padding:"12px",background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:"10px",color:T.text,fontFamily:FF,fontSize:"13px",cursor:"pointer",touchAction:"manipulation"}}>📊 Stats</button>
          <button onClick={()=>onReset("menu")} style={{padding:"12px",background:"rgba(0,0,0,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"10px",color:T.text,fontFamily:FF,fontSize:"13px",cursor:"pointer",touchAction:"manipulation"}}>← Menu</button>
        </div>
      </div>
    );
  }

  // === RENDER ===
  const tileW=Math.floor((window.innerWidth-32)/7); // 32px total margin
  const tileH=Math.round(tileW*1.18);
  const bS=(bg,dis)=>({flex:1,padding:"10px 4px",background:dis?"rgba(0,0,0,0.15)":bg,color:dis?"rgba(255,255,255,0.3)":"#FFF",border:"none",borderRadius:"8px",cursor:dis?"not-allowed":"pointer",fontSize:"11px",fontWeight:"700",fontFamily:FF,opacity:dis?0.5:1,touchAction:"manipulation"});

  return(
    <div
      style={{minHeight:"100dvh",background:T.bgGrad,display:"flex",flexDirection:"column",alignItems:"center",fontFamily:FF,paddingBottom:"env(safe-area-inset-bottom,10px)",color:T.text,overflowX:"hidden"}}>

      {/* Header */}
      <div style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 8px",boxSizing:"border-box"}}>
        <button onClick={()=>onReset("menu")} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"8px",color:T.text,cursor:"pointer",fontSize:"10px",padding:"5px 9px",touchAction:"manipulation"}}>← Menu</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"15px",fontWeight:"900",color:T.scoreColor}}>WORDAQ</div>
          <div style={{fontSize:"8px",opacity:0.6}}>{flag} {name} · {dc.emoji} {dc.label}</div>
        </div>
        <div style={{display:"flex",gap:"5px"}}>
          <button onClick={onStats} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"8px",color:T.text,cursor:"pointer",fontSize:"13px",padding:"5px 8px",touchAction:"manipulation"}}>📊</button>
          <button onClick={endGame} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:"8px",color:T.text,cursor:"pointer",fontSize:"10px",padding:"5px 8px",touchAction:"manipulation"}}>Fin</button>
        </div>
      </div>

      {/* Scores */}
      <div style={{display:"flex",gap:"8px",width:"100%",padding:"0 8px",boxSizing:"border-box",marginBottom:"3px"}}>
        {[{label:ui.youLabel,score:playerScore,active:!isAiTurn},{label:`${ui.aiLabel} ${dc.emoji}`,score:aiScore,active:isAiTurn}].map((p,i)=>(
          <div key={i} style={{flex:1,padding:"4px 8px",background:p.active?"rgba(255,255,255,0.3)":"rgba(0,0,0,0.1)",borderRadius:"8px",textAlign:"center",border:p.active?"2px solid rgba(255,255,255,0.6)":"2px solid transparent",transition:"all 0.3s"}}>
            <div style={{fontSize:"9px",opacity:0.7}}>{p.label}</div>
            <div style={{fontSize:"19px",fontWeight:"900",color:T.scoreColor}}>{p.score}</div>
          </div>
        ))}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minWidth:"38px"}}>
          <div style={{fontSize:"8px",opacity:0.5}}>{ui.bag}</div>
          <div style={{fontSize:"13px",fontWeight:"700"}}>{bag.length}</div>
          {dc.timer>0&&!isAiTurn&&<div style={{fontSize:"12px",fontWeight:"900",color:timerColor}}>⏱{rem}</div>}
        </div>
      </div>

      {aiMsg&&<div style={{marginBottom:"2px",padding:"4px 12px",background:"rgba(0,0,0,0.2)",borderRadius:"16px",fontSize:"11px",maxWidth:"90%",textAlign:"center"}}>{aiMsg}</div>}

      {/* Board */}
      <div style={{width:"100%",overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        <div style={{display:"inline-grid",gridTemplateColumns:`repeat(${SIZE},${Math.round(cs*zoom)}px)`,gridTemplateRows:`repeat(${SIZE},${Math.round(cs*zoom)}px)`}}>
          {Array.from({length:SIZE},(_,r)=>Array.from({length:SIZE},(_,c)=>renderCell(r,c)))}
        </div>
      </div>

      {/* Zoom + Legend compacte */}
      <div style={{display:"flex",gap:"8px",padding:"2px 8px",alignItems:"center",justifyContent:"center",flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:"4px",alignItems:"center"}}>
          <button onClick={()=>setZoom(z=>Math.max(0.7,+(z-0.1).toFixed(1)))} style={{width:"24px",height:"22px",background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"5px",color:T.text,fontSize:"14px",cursor:"pointer",touchAction:"manipulation",lineHeight:1}}>−</button>
          <button onClick={()=>setZoom(z=>Math.min(1.8,+(z+0.1).toFixed(1)))} style={{width:"24px",height:"22px",background:"rgba(255,255,255,0.2)",border:"none",borderRadius:"5px",color:T.text,fontSize:"14px",cursor:"pointer",touchAction:"manipulation",lineHeight:1}}>+</button>
        </div>
        {[["TW","MT×3"],["DW","MT×2"],["TL","LT×3"],["DL","LT×2"]].map(([t,l])=>(
          <div key={t} style={{display:"flex",alignItems:"center",gap:"2px",fontSize:"8px",opacity:0.7}}>
            <div style={{width:"8px",height:"8px",background:T.PREM[t].bg,borderRadius:"1px"}}/>{l}
          </div>
        ))}
      </div>

      {/* Live score */}
      {liveScore&&(
        <div style={{padding:"5px 16px",borderRadius:"18px",fontSize:"14px",fontWeight:"900",
          background:liveScore.invalid?"rgba(220,0,0,0.85)":"rgba(0,160,0,0.85)",
          color:"#FFF",boxShadow:"0 3px 10px rgba(0,0,0,0.3)",
          display:"flex",gap:"10px",flexWrap:"wrap",justifyContent:"center",alignItems:"center",margin:"2px 8px"}}>
          {liveScore.invalid
            ?<span>❌ {liveScore.invalid.join(", ")}</span>
            :liveScore.scored?.map((w,i)=><span key={i}>{w.word} <strong>+{w.score}</strong></span>)
          }
        </div>
      )}

      {/* Mode échange — overlay */}
      {exchangeMode&&(
        <div style={{padding:"6px 8px",background:"rgba(0,0,0,0.35)",borderRadius:"12px",margin:"2px 8px",textAlign:"center",width:"calc(100% - 16px)",boxSizing:"border-box"}}>
          <div style={{fontSize:"11px",fontWeight:"700",color:"#FFE082",marginBottom:"4px"}}>
            ⇄ Touchez les tuiles à échanger ({toExchange.size} sélectionnée{toExchange.size>1?'s':''})
          </div>
          <div style={{display:"flex",gap:"6px",justifyContent:"center"}}>
            <button onClick={confirmExchange} disabled={toExchange.size===0} style={{...bS(T.btnConfirm,toExchange.size===0),flex:'none',padding:"7px 16px"}}>✓ Échanger</button>
            <button onClick={cancelExchange} style={{...bS(T.btnRecall,false),flex:'none',padding:"7px 16px"}}>✗ Annuler</button>
          </div>
        </div>
      )}

      {/* Modal joker — choix de lettre */}
      {jokerPending&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
          <div style={{background:'#1E3A2A',border:'2px solid rgba(255,255,255,0.3)',borderRadius:'16px',padding:'16px',maxWidth:'320px',width:'90%',textAlign:'center'}}>
            <div style={{fontSize:'13px',fontWeight:'700',color:'#FFE082',marginBottom:'12px'}}>Joker — Choisissez une lettre</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'5px',justifyContent:'center'}}>
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l=>(
                <button key={l} onClick={()=>resolveJoker(l)}
                  style={{width:'34px',height:'38px',background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'6px',color:'#FFF',fontSize:'14px',fontWeight:'900',cursor:'pointer',touchAction:'manipulation'}}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RACK */}
      <div style={{display:"flex",gap:"2px",padding:"4px 8px",justifyContent:"center",width:"100%",boxSizing:"border-box"}}>
        {rack.map(t=>{
          const isExSel=toExchange.has(t.id);
          const isSel=sel===t.id;
          const isJ=t.letter==='?'||t.isJoker;
          return(
            <button key={t.id}
              onClick={()=>tapRack(t)}
              onTouchStart={e=>startDrag(e,t)}
              style={{
                width:tileW+"px",height:tileH+"px",
                background:isExSel?"rgba(255,200,0,0.5)":isSel?T.tileSel:isJ?"#E8E0FF":T.tileBase,
                border:`2px solid ${isExSel?"#FFD700":isSel?T.placedBorder:isJ?"#8B5CF6":T.tileBorder}`,
                borderRadius:"6px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                cursor:"pointer",
                transform:isSel?"translateY(-8px) scale(1.08)":isExSel?"translateY(-4px)":"none",
                transition:"transform 0.1s",
                boxShadow:isSel?"0 6px 14px rgba(0,0,0,0.3)":"0 3px 6px rgba(0,0,0,0.2)",
                touchAction:"manipulation",outline:"none",padding:0,fontFamily:"inherit",flexShrink:0}}>
              <span style={{fontSize:Math.round(tileW*0.52)+"px",fontWeight:"900",color:isJ?"#5000CC":T.tileText,lineHeight:1,fontStyle:isJ?"italic":"normal"}}>{isJ?'★':t.letter}</span>
              <span style={{fontSize:Math.round(tileW*0.22)+"px",color:isJ?"#5000CC":T.tileText,fontWeight:"bold",opacity:0.7}}>{isJ?'0':t.value}</span>
            </button>
          );
        })}
        {Array.from({length:Math.max(0,7-rack.length-pc)},(_,i)=>(
          <div key={`e${i}`} style={{width:tileW+"px",height:tileH+"px",border:"2px dashed rgba(255,255,255,0.2)",borderRadius:"6px",flexShrink:0}}/>
        ))}
      </div>

      {/* Buttons */}
      {!exchangeMode&&(
        <div style={{display:"flex",gap:"5px",padding:"4px 8px",width:"100%",boxSizing:"border-box"}}>
          <button onClick={confirm} disabled={pc===0||isAiTurn} style={bS(T.btnConfirm,pc===0||isAiTurn)}>{ui.confirm}</button>
          <button onClick={recall} disabled={pc===0||isAiTurn} style={bS(T.btnRecall,pc===0||isAiTurn)}>{ui.recall}</button>
          <button onClick={pass} disabled={isAiTurn} style={bS(T.btnPass,isAiTurn)}>{ui.pass}</button>
          <button onClick={startExchange} disabled={isAiTurn||bag.length<1} style={bS(T.btnHint,isAiTurn||bag.length<1)}>⇄</button>
          {dc.hint&&<button onClick={doHint} disabled={isAiTurn} style={bS(T.btnHint,isAiTurn)}>{ui.hint}</button>}
        </div>
      )}

      {error&&<div style={{background:T.errorBg,borderRadius:"8px",padding:"5px 14px",margin:"2px 8px",fontSize:"11px",color:T.errorText,textAlign:"center"}}>⚠️ {error}</div>}

      {result&&(
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap",justifyContent:"center",padding:"3px 8px"}}>
          {result.scored.map((w,i)=>(
            <div key={i} style={{padding:"4px 12px",background:"rgba(0,0,0,0.18)",borderRadius:"16px",display:"flex",gap:"6px",alignItems:"center"}}>
              <span style={{fontWeight:"900",fontSize:"12px",letterSpacing:"2px",textTransform:"uppercase"}}>{w.word}</span>
              <span style={{fontSize:"14px",fontWeight:"900",color:T.btnConfirm}}>+{w.score}</span>
            </div>
          ))}
          {result.penalty>0&&<div style={{padding:"4px 12px",background:"rgba(200,0,0,0.2)",borderRadius:"16px"}}><span style={{fontSize:"11px",color:"#E84040",fontWeight:"700"}}>-{result.penalty}</span></div>}
        </div>
      )}

      <style>{`*{-webkit-tap-highlight-color:transparent;}::-webkit-scrollbar{display:none;}button{touch-action:manipulation;-webkit-appearance:none;}`}</style>
    </div>
  );
}

// ROOT
export default function AluQWords(){
  const[screen,setScreen]=useState('lang');
  const[lang,setLang]=useState(null);
  const[diff,setDiff]=useState(null);
  const[dict,setDict]=useState(null);
  const[dictErr,setDictErr]=useState(null);
  const[prevLang,setPrevLang]=useState(null);
  const[theme,setTheme]=useState('classic');
  const[savedGame,setSavedGame]=useState(()=>loadGame());

  function pickLang(l){setLang(l);setScreen('diff');}
  function pickDiff(d){setDiff(d);if(dict&&lang===prevLang)setScreen('game');else{setDict(null);setDictErr(null);setScreen('dict');}}
  function handleReset(mode){
    clearSavedGame();setSavedGame(null);
    if(mode==='same'&&lang&&diff){setDict(null);setDictErr(null);setScreen('dict');}else setScreen('lang');
  }

  // Resume saved game
  function resumeGame(){
    const s=savedGame;
    if(!s)return;
    setLang(s.lang);setDiff(s.diff);setTheme(s.theme||'classic');
    setDict(null);setDictErr(null);setScreen('dict_resume');
  }
  function discardSave(){
    clearSavedGame();setSavedGame(null);
  }

  const T=THEMES[theme];

  // Show resume prompt on first load if saved game exists
  if(screen==='lang'&&savedGame){
    return(
      <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:T.bgGrad,fontFamily:FF,color:T.text,padding:'28px',gap:'20px',textAlign:'center'}}>
        <img src="/icon.png" alt="WORDAQ" style={{width:'100px',height:'100px',borderRadius:'22px',boxShadow:'0 6px 24px rgba(0,0,0,0.5)'}}/>
        <h2 style={{margin:0,fontSize:'20px',fontWeight:'900',color:T.scoreColor}}>Partie en cours</h2>
        <p style={{margin:0,fontSize:'12px',opacity:0.7}}>
          {CFG[savedGame.lang]?.flag} {CFG[savedGame.lang]?.name} · {DIFF[savedGame.diff]?.emoji} {DIFF[savedGame.diff]?.label}
        </p>
        <div style={{display:'flex',gap:'10px',alignItems:'center',fontSize:'13px',opacity:0.8}}>
          <span>Vous : <strong style={{color:T.scoreColor}}>{savedGame.playerScore}</strong></span>
          <span>·</span>
          <span>IA : <strong>{savedGame.aiScore}</strong></span>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'10px',width:'100%',maxWidth:'260px',marginTop:'8px'}}>
          <button onClick={resumeGame} style={{padding:'13px',background:T.btnConfirm,border:'none',borderRadius:'10px',color:'#FFF',fontFamily:FF,fontSize:'14px',fontWeight:'700',cursor:'pointer',touchAction:'manipulation'}}>
            ▶ Reprendre la partie
          </button>
          <button onClick={discardSave} style={{padding:'13px',background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.25)',borderRadius:'10px',color:T.text,fontFamily:FF,fontSize:'13px',cursor:'pointer',touchAction:'manipulation'}}>
            🗑 Nouvelle partie
          </button>
        </div>
      </div>
    );
  }

  if(screen==='lang')return<LangPicker onPick={pickLang} theme={theme}/>;
  if(screen==='diff')return<DiffPicker lang={lang} onPick={pickDiff} onBack={()=>setScreen('lang')} onStats={()=>setScreen('stats')} onAbout={()=>setScreen('about')} theme={theme} onTheme={setTheme}/>;
  if(screen==='stats')return<StatsScreen lang={lang||'EN'} onBack={()=>setScreen(lang?'diff':'lang')} theme={theme}/>;
  if(screen==='about')return<AboutScreen onBack={()=>setScreen('diff')} theme={theme}/>;

  if(screen==='dict'||screen==='dict_resume'){
    if(dictErr)return(
      <div style={{minHeight:'100dvh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:T.bgGrad,color:T.text,fontFamily:FF,gap:'16px',padding:'32px',textAlign:'center'}}>
        <p>⚠️ Erreur de chargement</p><p style={{fontSize:'11px',opacity:0.5}}>{dictErr}</p>
        <button onClick={()=>setDictErr(null)} style={{padding:'10px 20px',background:'rgba(255,255,255,0.2)',color:T.text,border:'none',borderRadius:'8px',cursor:'pointer',touchAction:'manipulation'}}>Réessayer</button>
        <button onClick={()=>setScreen('diff')} style={{padding:'10px 20px',background:'none',color:T.text,border:'1px solid rgba(255,255,255,0.2)',borderRadius:'8px',cursor:'pointer',touchAction:'manipulation'}}>← Retour</button>
      </div>
    );
    const isResume=screen==='dict_resume';
    return<DictLoader lang={lang} onLoaded={d=>{setDict(d);setPrevLang(lang);setScreen('game');}} onError={setDictErr} theme={theme}/>;
  }

  if(screen==='game')return<Game lang={lang} diff={diff} dict={dict} onReset={handleReset} onStats={()=>setScreen('stats')} theme={theme} savedState={screen==='game'&&savedGame&&savedGame.lang===lang&&savedGame.diff===diff?savedGame:null}/>;
  return null;
}
