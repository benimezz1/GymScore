// MVP (beta): biblioteca enxuta. Depois ampliamos (mais exercícios, variações e substituições).
const PLANS = {
  FB3: { id:"FB3", title:{pt:"Full Body 3x", en:"Full Body 3x"}, place:["gym"] },
  FB4: { id:"FB4", title:{pt:"Full Body 4x (A/B)", en:"Full Body 4x (A/B)"}, place:["gym"] },
  UL4: { id:"UL4", title:{pt:"Upper/Lower 4x", en:"Upper/Lower 4x"}, place:["gym"] },
  PPL5:{ id:"PPL5",title:{pt:"PPL 5x", en:"PPL 5x"}, place:["gym"] },
  PPL6:{ id:"PPL6",title:{pt:"PPL 6x", en:"PPL 6x"}, place:["gym"] },
  HOME3:{ id:"HOME3",title:{pt:"Casa 3x", en:"Home 3x"}, place:["home"] },
  HOME4:{ id:"HOME4",title:{pt:"Casa 4x (A/B)", en:"Home 4x (A/B)"}, place:["home"] },
};

const WARMUP = {
  pt: [
    "5–8 min de aquecimento geral (caminhada leve, polichinelo leve, corda leve)",
    "Mobilidade: ombros/quadril/tornozelo (2–4 min)",
    "1–2 séries leves do primeiro exercício"
  ],
  en: [
    "5–8 min general warm-up (easy walk, light jumping jacks, light jump rope)",
    "Mobility: shoulders/hips/ankles (2–4 min)",
    "1–2 light sets of the first exercise"
  ]
};

function ex(namePT, nameEN, sets, reps, rest, notesPT="", notesEN=""){
  return { name:{pt:namePT,en:nameEN}, sets, reps, rest, notes:{pt:notesPT,en:notesEN} };
}

const WEEK_TEMPLATES = {
  FB3: [
    { day:"A", items:[
      ex("Agachamento (máquina ou livre)","Squat (machine or free)","3","6–10","2–3 min"),
      ex("Supino (máquina ou livre)","Press (machine or free)","3","8–12","1–2 min"),
      ex("Remada (máquina/cabo)","Row (machine/cable)","3","8–12","1–2 min"),
      ex("Posterior (mesa flexora)","Hamstring curl","2","10–15","1–2 min"),
      ex("Prancha","Plank","2","30–45s","1 min"),
    ]},
    { day:"B", items:[
      ex("Leg press","Leg press","3","8–12","2–3 min"),
      ex("Puxada na frente (pulldown)","Lat pulldown","3","8–12","1–2 min"),
      ex("Desenvolvimento (leve/moderado)","Shoulder press (light/moderate)","2","8–12","1–2 min",
         "Se ombro dói: trocar por máquina guiada leve ou elevar lateral bem leve.",
         "If shoulder pain: swap for light guided machine or very light lateral raise."
      ),
      ex("Elevação de panturrilha","Calf raise","3","10–15","1–2 min"),
      ex("Abdominal (crunch controlado)","Controlled crunch","2","10–15","1 min"),
    ]},
    { day:"C", items:[
      ex("Agachamento guiado (ou variação)","Guided squat (or variation)","3","6–10","2–3 min"),
      ex("Supino inclinado (máquina/halter)","Incline press (machine/dumbbells)","3","8–12","1–2 min"),
      ex("Remada unilateral","One-arm row","3","8–12","1–2 min"),
      ex("Glúteo (máquina ou ponte)","Glutes (machine or hip bridge)","2","10–15","1–2 min"),
      ex("Prancha lateral","Side plank","2","20–40s","1 min"),
    ]}
  ],

  HOME3: [
    { day:"A", items:[
      ex("Agachamento (peso corporal)","Bodyweight squat","3","10–15","1–2 min"),
      ex("Flexão (ajoelhada se preciso)","Push-up (knees if needed)","3","6–12","1–2 min"),
      ex("Remada com elástico (se tiver) / isometria","Band row (if available) / isometric","3","10–15","1–2 min"),
      ex("Ponte de glúteo","Glute bridge","3","10–15","1–2 min"),
      ex("Prancha","Plank","2","20–45s","1 min")
    ]},
    { day:"B", items:[
      ex("Afundo (curto e controlado)","Lunge (short, controlled)","3","8–12","1–2 min"),
      ex("Pike push-up leve / elevação lateral com elástico","Light pike push-up / band lateral raise","2","6–12","1–2 min"),
      ex("Remada (variação)","Row variation","3","10–15","1–2 min"),
      ex("Panturrilha (degrau)","Calf raise (step)","3","12–20","1–2 min"),
      ex("Dead bug","Dead bug","2","8–12","1 min"),
    ]},
    { day:"C", items:[
      ex("Agachamento pausa","Paused squat","3","8–12","1–2 min"),
      ex("Flexão (variação)","Push-up variation","3","6–12","1–2 min"),
      ex("Remada (segura) com elástico/toalha","Safe row with band/towel","3","8–12","1–2 min"),
      ex("RDL com halter (se tiver) / ponte unilateral","DB RDL (if any) / single-leg bridge","2","8–12","1–2 min"),
      ex("Prancha lateral","Side plank","2","20–40s","1 min"),
    ]}
  ],
};

function getWarmup(lang){ return WARMUP[lang] || WARMUP.pt; }
