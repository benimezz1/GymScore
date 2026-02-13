function isMinor(age){
  return Number.isFinite(age) && age < 18;
}

function normalizeInput(raw){
  const age = Number(raw.age);
  const height = raw.height === "" ? null : Number(raw.height);
  const weight = raw.weight === "" ? null : Number(raw.weight);
  const days = Number(raw.days);

  return {
    age: Number.isFinite(age) ? age : null,
    height: (height !== null && Number.isFinite(height)) ? height : null,
    weight: (weight !== null && Number.isFinite(weight)) ? weight : null,
    sex: raw.sex || "",
    level: raw.level || "",
    days,
    duration: raw.duration || "",
    place: raw.place || "",
    focus: raw.focus || "",
    injuries: Array.isArray(raw.injuries) ? raw.injuries : [],
    cardio: raw.cardio || "",
    gear: Array.isArray(raw.gear) ? raw.gear : []
  };
}

function validateInput(x){
  if(!x.level || !x.duration || !x.place || !x.focus) return false;
  if(!Number.isFinite(x.days) || x.days < 1 || x.days > 7) return false;
  if(!Number.isFinite(x.age) || x.age < 8 || x.age > 99) return false;

  if(x.height !== null && (x.height < 100 || x.height > 230)) return false;
  if(x.weight !== null && (x.weight < 30 || x.weight > 250)) return false;

  return true;
}

function baseScores(){
  return { FB3:0, FB4:0, UL4:0, PPL5:0, PPL6:0, HOME3:0, HOME4:0 };
}
function add(scores, id, pts){ scores[id] = (scores[id]||0) + pts; }

function scorePlan(x){
  const scores = baseScores();

  // Local
  if(x.place === "home"){
    add(scores,"HOME3", 12); add(scores,"HOME4", 10);
    add(scores,"FB3", -6); add(scores,"UL4",-6); add(scores,"PPL5",-7); add(scores,"PPL6",-8); add(scores,"FB4",-6);
  } else {
    add(scores,"FB3", 4); add(scores,"UL4",4); add(scores,"FB4",3); add(scores,"PPL5",2); add(scores,"PPL6",2);
  }

  // Dias
  if(x.days <= 2){
    add(scores,"FB3", 6); add(scores,"HOME3", 6);
    add(scores,"PPL6",-10); add(scores,"PPL5",-6);
  } else if(x.days === 3){
    add(scores,"FB3", 10); add(scores,"HOME3", 10);
    add(scores,"UL4", 2); add(scores,"FB4", 1);
    add(scores,"PPL5",-2); add(scores,"PPL6",-5);
  } else if(x.days === 4){
    add(scores,"UL4", 10); add(scores,"FB4", 9); add(scores,"HOME4", 9);
    add(scores,"FB3", 2); add(scores,"PPL5", 2);
  } else if(x.days === 5){
    add(scores,"PPL5", 10);
    add(scores,"UL4", 4); add(scores,"FB4", 3);
    add(scores,"PPL6", 2);
  } else { // 6–7
    add(scores,"PPL6", 10);
    add(scores,"PPL5", 6);
    add(scores,"UL4", 3);
    add(scores,"FB4", 2);
  }

  // Nível
  if(x.level === "beg"){
    add(scores,"FB3", 5); add(scores,"HOME3", 5);
    add(scores,"UL4", 3); add(scores,"FB4", 2); add(scores,"HOME4", 2);
    add(scores,"PPL6",-5);
  } else if(x.level === "int"){
    add(scores,"UL4", 3); add(scores,"FB4", 2); add(scores,"PPL5", 2);
  } else if(x.level === "adv"){
    add(scores,"PPL5", 3); add(scores,"PPL6", 4); add(scores,"UL4", 2);
  }

  // Menor de idade => conservador
  if(isMinor(x.age)){
    add(scores,"FB3", 3); add(scores,"HOME3", 3);
    add(scores,"PPL6",-2);
  }

  // Duração
  if(x.duration === "fast"){
    add(scores,"FB3", 3); add(scores,"HOME3", 3);
    add(scores,"PPL6",-2);
  } else if(x.duration === "vslow"){
    add(scores,"UL4", 2); add(scores,"PPL5", 2);
  }

  // Foco (inclui os novos)
  if(x.focus === "strength"){
    add(scores,"UL4", 2); add(scores,"FB3", 1);
  } else if(x.focus === "hypertrophy"){
    add(scores,"PPL5", 2); add(scores,"UL4", 1);
  } else if(x.focus === "fatloss"){
    add(scores,"FB3", 2); add(scores,"HOME3", 2);
  } else if(x.focus === "conditioning"){
    add(scores,"FB3", 1); add(scores,"HOME3", 2);
  } else if(x.focus === "definition"){
    add(scores,"UL4", 2); add(scores,"FB3", 2); add(scores,"PPL5", 1);
  } else if(x.focus === "calisthenics"){
    add(scores,"HOME3", 6); add(scores,"HOME4", 6);
    add(scores,"FB3", -2); add(scores,"PPL6", -3);
  } else if(x.focus === "health"){
    add(scores,"FB3", 3); add(scores,"UL4", 2); add(scores,"HOME3", 2);
    add(scores,"PPL6", -4);
  } else if(x.focus === "posture"){
    add(scores,"FB3", 2); add(scores,"UL4", 2); add(scores,"HOME3", 2);
    add(scores,"PPL6", -2);
  }

  // Cardio (só leve ajuste no plano)
  if(x.cardio === "mod"){
    add(scores,"FB3", 1); add(scores,"HOME3", 1);
  }

  // Equipamentos (casa)
  if(x.place === "home"){
    const gearSet = new Set(x.gear);
    if(gearSet.has("dumbbells")) add(scores,"HOME4", 2);
    if(gearSet.has("bands")) add(scores,"HOME3", 1);
    if(gearSet.has("pullup")) add(scores,"HOME4", 1);
  }

  // Lesões: ajuste leve na escolha do plano
  if(x.injuries.includes("spine")) { add(scores,"PPL6",-2); add(scores,"PPL5",-1); add(scores,"FB3", 1); }
  if(x.injuries.includes("knee")) { add(scores,"PPL6",-1); add(scores,"UL4", 1); }
  if(x.injuries.includes("shoulder")) { add(scores,"PPL6",-1); add(scores,"FB3", 1); }

  // Vencedor
  let bestId = Object.keys(scores)[0];
  for(const id of Object.keys(scores)){
    if(scores[id] > scores[bestId]) bestId = id;
  }

  return { bestId, scores };
}
