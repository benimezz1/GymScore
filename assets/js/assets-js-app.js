document.addEventListener("DOMContentLoaded", ()=>{
  document.querySelectorAll("[data-lang]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      setLang(btn.getAttribute("data-lang"));
    });
  });
  applyI18n();

  const path = location.pathname.split("/").pop();
  if(path === "form.html") initForm();
  if(path === "final.html") initFinal();
  if(path === "result.html") initResult();
});

function showError(msg){
  const box = document.getElementById("errorBox");
  if(!box) return;
  box.textContent = msg;
  box.classList.remove("hidden");
}
function hideError(){
  const box = document.getElementById("errorBox");
  if(!box) return;
  box.textContent = "";
  box.classList.add("hidden");
}

function readInjuries(){
  return Array.from(document.querySelectorAll(".inj:checked")).map(x=>x.value);
}

function initForm(){
  const form = document.getElementById("mainForm");
  if(!form) return;

  const draft = JSON.parse(localStorage.getItem("gymscore_main") || "null");
  if(draft){
    for(const k of ["age","height","weight","sex","level","days","duration","place"]){
      const el = document.getElementById(k);
      if(el && draft[k] !== undefined) el.value = draft[k];
    }
    if(draft.focus){
      const radio = document.querySelector(`input[name="focus"][value="${draft.focus}"]`);
      if(radio) radio.checked = true;
    }
    if(Array.isArray(draft.injuries)){
      draft.injuries.forEach(v=>{
        const cb = document.querySelector(`.inj[value="${v}"]`);
        if(cb) cb.checked = true;
      });
    }
  }

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    hideError();

    const raw = {
      age: document.getElementById("age").value,
      height: document.getElementById("height").value,
      weight: document.getElementById("weight").value,
      sex: document.getElementById("sex").value,
      level: document.getElementById("level").value,
      days: document.getElementById("days").value,
      duration: document.getElementById("duration").value,
      place: document.getElementById("place").value,
      focus: (document.querySelector('input[name="focus"]:checked')||{}).value,
      injuries: readInjuries()
    };

    localStorage.setItem("gymscore_main", JSON.stringify(raw));

    const x = normalizeInput(raw);
    if(!validateInput(x)){
      showError(t("err_invalid"));
      return;
    }

    location.href = "final.html";
  });
}

function initFinal(){
  const main = JSON.parse(localStorage.getItem("gymscore_main") || "null");
  if(!main){
    location.href = "form.html";
    return;
  }

  const x = normalizeInput(main);
  if(!validateInput(x)){
    location.href = "form.html";
    return;
  }

  const review = document.getElementById("review");
  if(review){
    const rows = [
      ["Idade / Age", x.age],
      ["Nível / Level", x.level],
      ["Dias / Days", x.days],
      ["Duração / Duration", x.duration],
      ["Local / Place", x.place],
      ["Foco / Focus", x.focus],
      ["Lesões / Injuries", (x.injuries.length? x.injuries.join(", "): "-")]
    ];
    review.innerHTML = rows.map(([k,v])=>(
      `<div class="reviewRow"><span class="muted">${k}</span><span class="badge ok">${String(v)}</span></div>`
    )).join("");
  }

  const homeGear = document.getElementById("homeGear");
  if(homeGear && x.place === "home") homeGear.classList.remove("hidden");

  const form = document.getElementById("finalForm");
  form.addEventListener("submit",(e)=>{
    e.preventDefault();
    hideError();

    const cardio = (document.querySelector('input[name="cardio"]:checked')||{}).value;
    if(!cardio){
      showError(t("err_invalid"));
      return;
    }

    const gear = (x.place === "home")
      ? Array.from(document.querySelectorAll(".gear:checked")).map(g=>g.value)
      : [];

    const merged = { ...main, cardio, gear };
    localStorage.setItem("gymscore_full", JSON.stringify(merged));
    location.href = "result.html";
  });
}

function planTitle(planId){
  const lang = getLang();
  const plan = PLANS[planId];
  return plan ? (plan.title[lang] || plan.title.pt) : planId;
}

function injuryWarnings(x){
  const w = [];
  if(x.injuries.includes("shoulder")) w.push({pt:"Ajuste: evitar cargas desconfortáveis acima da cabeça.", en:"Adjustment: avoid uncomfortable overhead loads."});
  if(x.injuries.includes("knee")) w.push({pt:"Ajuste: priorizar amplitude controlada e variações mais amigáveis ao joelho.", en:"Adjustment: prioritize controlled range and knee-friendly variations."});
  if(x.injuries.includes("spine")) w.push({pt:"Ajuste: evitar cargas altas sem suporte; foco em técnica e estabilidade.", en:"Adjustment: avoid high loads without support; focus on technique and stability."});
  return w;
}

function durationToMinutes(d){
  if(d==="fast") return 35;
  if(d==="med") return 50;
  if(d==="slow") return 65;
  if(d==="vslow") return 85;
  return 50;
}
function cardioToMinutes(c){
  if(c==="light") return 12; // 10–15
  if(c==="mod") return 20;   // 15–25
  return 0;
}

function restHint(x){
  if(x.duration === "fast") return (getLang()==="en" ? "1–2 min avg" : "1–2 min em média");
  if(x.focus === "strength") return (getLang()==="en" ? "2–3 min main lifts" : "2–3 min nos principais");
  return (getLang()==="en" ? "1–3 min" : "1–3 min");
}

function renderWeek(container, planId, x){
  const lang = getLang();
  const tpl = WEEK_TEMPLATES[planId] || WEEK_TEMPLATES.FB3;

  const daysToShow = Math.max(1, Math.min(x.days, tpl.length));
  const slice = tpl.slice(0, daysToShow);

  container.innerHTML = slice.map((d, idx)=>{
    const dayLabel = `${lang==="en" ? "Day" : "Dia"} ${idx+1} • ${d.day}`;
    const exHtml = d.items.map(it=>{
      const name = it.name[lang] || it.name.pt;
      const notes = (it.notes && (it.notes[lang] || it.notes.pt))
        ? `<div class="tiny muted">${it.notes[lang] || it.notes.pt}</div>`
        : "";
      return `
        <div class="exercise">
          <div>
            <b>${name}</b>
            ${notes}
          </div>
          <div class="muted">${it.sets}×${it.reps}<br><span class="tiny">${it.rest}</span></div>
        </div>
      `;
    }).join("");

    return `
      <div class="dayCard">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
          <h3 style="margin:0">${dayLabel}</h3>
          <span class="badge">${lang==="en" ? "Rest" : "Descanso"}: ${restHint(x)}</span>
        </div>
        ${exHtml}
      </div>
    `;
  }).join("");
}

function initResult(){
  const full = JSON.parse(localStorage.getItem("gymscore_full") || "null");
  if(!full){
    location.href = "form.html";
    return;
  }

  const x = normalizeInput(full);
  if(!validateInput(x) || !x.cardio){
    location.href = "form.html";
    return;
  }

  const meta = document.getElementById("resultMeta");
  const warnings = document.getElementById("warnings");
  const warmup = document.getElementById("warmup");
  const weekPlan = document.getElementById("weekPlan");

  const scored = scorePlan(x);
  const chosen = scored.bestId;

  // Mostrar tempo de treino e cardio separado
  if(meta){
    const workoutMin = durationToMinutes(x.duration);
    const cardioMin = cardioToMinutes(x.cardio);
    const lang = getLang();
    const placeTxt = x.place==="home" ? (lang==="en"?"Home":"Casa") : (lang==="en"?"Gym":"Academia");
    const daysTxt = lang==="en" ? "days" : "dias";
    const wTxt = lang==="en" ? "Workout" : "Treino";
    const cTxt = lang==="en" ? "Cardio" : "Cardio";
    const sepTxt = lang==="en" ? "separate" : "separado";

    meta.textContent =
      `${planTitle(chosen)} • ${x.days} ${daysTxt} • ${placeTxt} • ${wTxt}: ~${workoutMin}min` +
      (x.cardio!=="none" ? ` • ${cTxt}: ${cardioMin}min (${sepTxt})` : "");
  }

  // warnings
  const lang = getLang();
  const warnList = [];
  if(x.days >= 6) warnList.push({txt: t("warn_rest")});
  if(isMinor(x.age)) warnList.push({txt: t("warn_minor")});
  injuryWarnings(x).forEach(o=> warnList.push({txt: o[lang]}));

  if(warnings){
    warnings.innerHTML = warnList.map(w=>(
      `<div class="alert" style="border-color:rgba(255,214,107,.5);background:rgba(255,214,107,.08);color:#ffe9b5">${w.txt}</div>`
    )).join("");
  }

  if(warmup){
    warmup.innerHTML = `<ul class="list">${getWarmup(lang).map(s=>`<li>${s}</li>`).join("")}</ul>`;
  }

  // Escolher template compatível (MVP)
  let renderId = chosen;
  if(x.place === "home" && !WEEK_TEMPLATES[renderId]) renderId = "HOME3";
  if(x.place === "gym" && !WEEK_TEMPLATES[renderId]) renderId = "FB3";

  renderWeek(weekPlan, renderId, x);

  // 5 weeks
  const btn5w = document.getElementById("btn5w");
  const plan5w = document.getElementById("plan5w");
  if(btn5w && plan5w){
    btn5w.addEventListener("click", ()=>{
      plan5w.innerHTML = "";
      for(let w=1; w<=5; w++){
        const text = (lang==="en")
          ? `Week ${w}: keep form clean. If reps hit the top range, add a bit of load next week.`
          : `Semana ${w}: mantenha técnica limpa. Se bater o topo das reps, aumente um pouco a carga na semana seguinte.`;
        plan5w.innerHTML += `<div class="dayCard"><b>${lang==="en" ? "Week" : "Semana"} ${w}</b><div class="muted">${text}</div></div>`;
      }
    });
  }

  // PDF
  const btnPdf = document.getElementById("btnPdf");
  if(btnPdf){
    btnPdf.addEventListener("click", downloadPdf);
  }
}
