/* SIMPLE COOK — Phase 6 ingredient scanner (route #/scan). Matching is deterministic (lib/scan-core.js); AI only proposes detections. */
(function () {
  "use strict";
  const SC = window.SC, W = window.SC_WORLD, S = window.SC_SCAN, World = SC.World;
  if (!W || !S || !World || !World.available) return;
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const L = {
    en: { h: "What's in Your Kitchen?", sub: "Scan your ingredients and discover what you can cook.", cam: "Open Camera", up: "Upload Photo", how: "Take or upload up to 5 photos. The AI proposes ingredients; you confirm or correct them; then we search real Simple Cook recipes.", why: "The camera is used only to take photos you choose to analyse. Photos are sent to an AI service for recognition and are not stored by Simple Cook.", tips: "Tips: good light, spread items apart, keep them fully visible, stay close.", cap: "Capture", close: "Close", analyse: "Analyse photos", rm: "Remove", review: "Check your ingredients", conf: { high: "High confidence", medium: "Medium confidence", low: "Low confidence — please check" }, note: "Confidence is the AI's own estimate from the photo, not a measured probability. Quantities and weights cannot be read from a photo.", add: "Add ingredient", addph: "Type an ingredient (English, Français, العربية)", go: "Find recipes with these ingredients", none: "No ingredients yet. Add some manually.", unknown: "Not in our database — pick the closest one", edit: "Change", pantry: "Assume I have basic pantry ingredients (salt, water, oil…)", allergy: "Exclude allergens", allergynote: "Allergen data may be incomplete. Always check labels and preparation conditions.", sort: "Sort", s: { match: "Best match", missing: "Fewest missing", time: "Shortest time", easy: "Easiest" }, g: ["You have everything", "Missing only one ingredient", "Missing two or three ingredients", "Other possible recipes"], have: "Have", miss: "Missing", opt: "Optional", subst: "Substitute", open: "Open recipe", match: "ingredient match (required ingredients only)", back: "Edit ingredients", empty: "No recipes match yet. Try adding more ingredients.", nobk: "Photo analysis needs the live server and a login. You can still add ingredients manually.", noai: "Photo analysis is not switched on for this site yet (the owner must add an AI key). You can still add ingredients manually.", login: "Log in to analyse photos.", busy: "Analysing…", fail: "Analysis failed. Retry or add ingredients manually.", quota: "Daily photo limit reached. Add ingredients manually or try tomorrow.", bad: "Use JPEG, PNG or WebP under 10 MB (max 5 photos).", denied: "Camera permission was denied. Allow it in the browser settings, or upload a photo instead.", nocam: "No camera was found. Upload a photo instead.", insecure: "The camera needs a secure (HTTPS) page. Upload a photo instead.", inuse: "The camera is in use by another app. Close it or upload a photo.", nolist: "No ingredients were recognised. Add them manually.", servings: "Servings and scaling are available on the recipe page.", ask: "Ask Simple Cook AI" },
    fr: { h: "Qu'y a-t-il dans votre cuisine ?", sub: "Scannez vos ingrédients et découvrez quoi cuisiner.", cam: "Ouvrir la caméra", up: "Importer une photo", how: "Prenez ou importez jusqu'à 5 photos. L'IA propose des ingrédients ; vous confirmez ou corrigez ; puis nous cherchons dans les vraies recettes Simple Cook.", why: "La caméra sert uniquement à prendre les photos que vous choisissez d'analyser. Elles sont envoyées à un service d'IA pour la reconnaissance et ne sont pas conservées par Simple Cook.", tips: "Conseils : bonne lumière, ingrédients espacés et entièrement visibles, photo de près.", cap: "Capturer", close: "Fermer", analyse: "Analyser les photos", rm: "Retirer", review: "Vérifiez vos ingrédients", conf: { high: "Confiance élevée", medium: "Confiance moyenne", low: "Confiance faible — à vérifier" }, note: "La confiance est l'estimation de l'IA à partir de la photo, pas une probabilité mesurée. Les quantités et poids ne se lisent pas sur une photo.", add: "Ajouter un ingrédient", addph: "Saisir un ingrédient (English, Français, العربية)", go: "Trouver des recettes avec ces ingrédients", none: "Aucun ingrédient. Ajoutez-en manuellement.", unknown: "Absent de notre base — choisissez le plus proche", edit: "Modifier", pantry: "Je suppose avoir les bases (sel, eau, huile…)", allergy: "Exclure les allergènes", allergynote: "Les données d'allergènes peuvent être incomplètes. Vérifiez toujours les étiquettes et les conditions de préparation.", sort: "Trier", s: { match: "Meilleure correspondance", missing: "Moins de manquants", time: "Plus rapide", easy: "Plus facile" }, g: ["Vous avez tout", "Il manque un seul ingrédient", "Il manque deux ou trois ingrédients", "Autres recettes possibles"], have: "Vous avez", miss: "Manquants", opt: "Optionnels", subst: "Substitut", open: "Ouvrir la recette", match: "correspondance (ingrédients requis seulement)", back: "Modifier les ingrédients", empty: "Aucune recette pour l'instant. Ajoutez des ingrédients.", nobk: "L'analyse de photos nécessite le backend Supabase, une connexion et la fonction scan-ingredients. Vous pouvez ajouter des ingrédients manuellement.", login: "Connectez-vous pour analyser des photos.", busy: "Analyse…", fail: "Échec de l'analyse. Réessayez ou ajoutez manuellement.", quota: "Limite quotidienne atteinte. Ajoutez manuellement ou réessayez demain.", bad: "JPEG, PNG ou WebP de moins de 10 Mo (5 photos max).", denied: "Accès à la caméra refusé. Autorisez-le dans le navigateur ou importez une photo.", nocam: "Aucune caméra trouvée. Importez une photo.", insecure: "La caméra nécessite une page sécurisée (HTTPS). Importez une photo.", inuse: "La caméra est utilisée par une autre application.", nolist: "Aucun ingrédient reconnu. Ajoutez-les manuellement.", servings: "Portions et mise à l'échelle disponibles sur la page de la recette.", ask: "Demander à Simple Cook IA" },
    ar: { h: "ماذا يوجد في مطبخك؟", sub: "امسح مكوناتك واكتشف ما يمكنك طهيه.", cam: "فتح الكاميرا", up: "رفع صورة", how: "التقط أو ارفع حتى 5 صور. يقترح الذكاء الاصطناعي المكونات وتؤكدها أو تصححها، ثم نبحث في وصفات Simple Cook الحقيقية.", why: "تُستخدم الكاميرا فقط لالتقاط صور تختار تحليلها. تُرسل الصور إلى خدمة ذكاء اصطناعي للتعرف ولا يحتفظ بها Simple Cook.", tips: "نصائح: إضاءة جيدة، باعد بين المكونات، اجعلها ظاهرة كليًا، واقترب.", cap: "التقاط", close: "إغلاق", analyse: "تحليل الصور", rm: "إزالة", review: "راجع مكوناتك", conf: { high: "ثقة عالية", medium: "ثقة متوسطة", low: "ثقة منخفضة — يرجى التحقق" }, note: "الثقة تقدير الذكاء الاصطناعي من الصورة وليست احتمالًا مقاسًا. لا يمكن قراءة الكميات والأوزان من صورة.", add: "إضافة مكون", addph: "اكتب مكونًا (English, Français, العربية)", go: "ابحث عن وصفات بهذه المكونات", none: "لا مكونات بعد. أضف يدويًا.", unknown: "غير موجود في قاعدتنا — اختر الأقرب", edit: "تغيير", pantry: "افترض أن لدي المكونات الأساسية (ملح، ماء، زيت…)", allergy: "استبعاد مسببات الحساسية", allergynote: "قد تكون بيانات مسببات الحساسية ناقصة. تحقق دائمًا من الملصقات وظروف التحضير.", sort: "ترتيب", s: { match: "أفضل تطابق", missing: "أقل نقصًا", time: "الأسرع", easy: "الأسهل" }, g: ["لديك كل شيء", "ينقصك مكون واحد فقط", "ينقصك مكونان أو ثلاثة", "وصفات أخرى ممكنة"], have: "لديك", miss: "ناقص", opt: "اختياري", subst: "بديل", open: "فتح الوصفة", match: "تطابق (المكونات المطلوبة فقط)", back: "تعديل المكونات", empty: "لا وصفات مطابقة بعد. أضف المزيد من المكونات.", nobk: "يتطلب تحليل الصور Supabase وتسجيل الدخول ودالة scan-ingredients. يمكنك إضافة المكونات يدويًا.", login: "سجّل الدخول لتحليل الصور.", busy: "جارٍ التحليل…", fail: "فشل التحليل. أعد المحاولة أو أضف يدويًا.", quota: "بلغت الحد اليومي. أضف يدويًا أو حاول غدًا.", bad: "JPEG أو PNG أو WebP أقل من 10 ميغابايت (5 صور كحد أقصى).", denied: "تم رفض إذن الكاميرا. اسمح به من المتصفح أو ارفع صورة.", nocam: "لم يتم العثور على كاميرا. ارفع صورة.", insecure: "تتطلب الكاميرا صفحة آمنة (HTTPS). ارفع صورة.", inuse: "الكاميرا مستخدمة في تطبيق آخر.", nolist: "لم يتم التعرف على مكونات. أضفها يدويًا.", servings: "الحصص والتحجيم متاحة في صفحة الوصفة.", ask: "اسأل Simple Cook AI" },
  };
  const t = () => L[World.lang()] || L.en, lang = () => World.lang(), idx = S.buildIndex(W.ingredients);
  const name = (id) => World.ingredientName(id, lang());
  const ALL = ["gluten", "milk", "eggs", "peanuts", "nuts", "fish", "shellfish", "soy", "sesame"];
  const st = { step: "home", imgs: [], items: [], pantry: true, allergens: new Set(), sort: "match", stream: null, busy: false, msg: "" };
  let root = null;
  const stop = () => { if (st.stream) { st.stream.getTracks().forEach((x) => x.stop()); st.stream = null; } };

  function mount() {
    const r = $("#sc-root"); if (!r || r.dataset.on) return; r.dataset.on = "1"; root = r;
    Object.assign(st, { step: "home", imgs: [], items: [], msg: "", busy: false }); SC.cleanups.push(stop); draw();
  }
  function draw() {
    if (!root) return; const x = t(); root.dir = lang() === "ar" ? "rtl" : "ltr";
    root.innerHTML = `<div class="sn">${{ home, camera, review, results }[st.step](x)}</div>`; bind();
  }
  const msg = () => (st.msg ? `<p class="sn-msg" role="alert">${esc(st.msg)}</p>` : "");
  function home(x) {
    return `<h1>${x.h}</h1><p>${x.sub}</p><p class="sn-small">${x.how}</p><p class="sn-small">${x.why}</p><p class="sn-small">${x.tips}</p>${msg()}
      <div class="sn-row"><button class="btn btn-primary" id="sn-cam">📷 ${x.cam}</button><label class="btn">🖼️ ${x.up}<input type="file" id="sn-file" accept="image/jpeg,image/png,image/webp" multiple hidden></label></div>
      ${st.imgs.length ? `<div class="sn-thumbs">${st.imgs.map((m, i) => `<figure><img src="${m.url}" alt="Photo ${i + 1}"><button data-rm="${i}" aria-label="${x.rm}">✕</button></figure>`).join("")}</div><button class="btn btn-primary" id="sn-an" ${st.busy ? "disabled" : ""}>${st.busy ? x.busy : x.analyse}</button>` : ""}
      <p><button class="btn btn-sm" id="sn-manual">${x.add} →</button></p>`;
  }
  function camera(x) { return `<div class="sn-cam"><video id="sn-v" autoplay playsinline muted></video><div class="sn-row"><button class="btn btn-primary" id="sn-cap">● ${x.cap}</button><button class="btn" id="sn-sw">⟲</button><button class="btn" id="sn-x">${x.close}</button></div><p class="sn-small">${x.tips}</p></div>`; }
  function review(x) {
    return `<h1>${x.review}</h1>${msg()}<p class="sn-small">${x.note}</p>
      <div class="sn-chips">${st.items.length ? st.items.map((i, k) => `<div class="sn-chip ${i.id ? "" : "unk"}"><b>${i.id ? esc(name(i.id)) : esc(i.raw)}</b>${i.src === "ai" ? `<small>${x.conf[i.conf] || ""}${i.count ? " · ×" + i.count : ""}</small>` : ""}${i.id ? "" : `<small>${x.unknown}</small>`}${i.alts && i.alts.length ? `<small>? ${esc(i.alts.join(" / "))}</small>` : ""}<button data-ed="${k}">${x.edit}</button><button data-del="${k}" aria-label="${x.rm}">✕</button></div>`).join("") : `<p>${x.none}</p>`}</div>
      <div class="sn-add"><input id="sn-in" list="sn-dl" placeholder="${x.addph}" aria-label="${x.add}"><datalist id="sn-dl">${Object.keys(W.ingredients).map((id) => `<option value="${esc(name(id))}">`).join("")}</datalist><button class="btn btn-sm" id="sn-addb">＋ ${x.add}</button></div>
      <label class="sn-ck"><input type="checkbox" id="sn-pt" ${st.pantry ? "checked" : ""}> ${x.pantry}</label>
      <details><summary>${x.allergy}</summary><div class="sn-al">${ALL.map((a) => `<label><input type="checkbox" data-al="${a}" ${st.allergens.has(a) ? "checked" : ""}> ${a}</label>`).join("")}</div><p class="sn-small">${x.allergynote}</p></details>
      <div class="sn-row"><button class="btn" id="sn-bk">←</button><button class="btn btn-primary" id="sn-go" ${st.items.some((i) => i.id) ? "" : "disabled"}>${x.go}</button></div>`;
  }
  function results(x) {
    const have = st.items.filter((i) => i.id).map((i) => i.id), res = S.rank(W.recipes, have, { assumePantry: st.pantry, allergens: [...st.allergens], sort: st.sort });
    const bySlug = (s) => World.get(s), tag = ["✅", "①", "②", "…"];
    const card = (m) => { const r = bySlug(m.slug); if (!r) return ""; return `<article class="sn-rc"><h3>${World.flags(r)} ${esc(World.recipeName(r, lang()))}</h3><p class="sn-small">${esc(World.cuisineName(r.origin.cuisine || ""))} · ${r.times.prep + r.times.cook} min · ${esc(r.difficulty)} · ${r.servings}</p>
      <p><b>${m.pct}%</b> ${x.match} (${m.got}/${m.need})</p>
      ${m.missing.length ? `<p>${x.miss}: ${m.missing.map((i) => esc(name(i))).join(", ")}</p>` : ""}${m.viaSub.length ? `<p>${x.subst}: ${m.viaSub.map((v) => esc(name(v.from)) + " → " + esc(name(v.to)) + (v.note ? " (" + esc(v.note) + ")" : "")).join("; ")}</p>` : ""}${m.optMissing.length ? `<p class="sn-small">${x.opt}: ${m.optMissing.map((i) => esc(name(i))).join(", ")}</p>` : ""}
      <a class="btn btn-sm btn-primary" href="#/recipe/${encodeURIComponent(m.slug)}">${x.open}</a></article>`; };
    const sec = [0, 1, 2, 3].map((g) => { const l = res.filter((m) => m.group === g); return l.length ? `<section><h2>${tag[g]} ${x.g[g]} <small>(${l.length})</small></h2><div class="sn-grid">${l.map(card).join("")}</div></section>` : ""; }).join("");
    return `<h1>🍳 ${x.go}</h1><div class="sn-row"><button class="btn" id="sn-bk2">← ${x.back}</button><label>${x.sort} <select id="sn-so">${Object.keys(x.s).map((k) => `<option value="${k}" ${st.sort === k ? "selected" : ""}>${x.s[k]}</option>`).join("")}</select></label></div>
      <p class="sn-small">${st.pantry ? x.pantry : ""} ${st.allergens.size ? "· " + x.allergy + ": " + [...st.allergens].join(", ") + ". " + x.allergynote : ""} ${x.servings}</p>${sec || `<p>${x.empty}</p>`}`;
  }
  function bind() {
    const x = t(), on = (id, f) => { const e = $(id, root); if (e) e.onclick = f; };
    on("#sn-cam", openCam); on("#sn-manual", () => { st.step = "review"; draw(); }); on("#sn-x", () => { stop(); st.step = "home"; draw(); });
    on("#sn-cap", capture); on("#sn-sw", () => { st.facing = st.facing === "user" ? "environment" : "user"; stop(); openCam(); });
    on("#sn-an", analyse); on("#sn-bk", () => { st.step = "home"; draw(); }); on("#sn-bk2", () => { st.step = "review"; draw(); }); on("#sn-go", () => { st.step = "results"; draw(); });
    on("#sn-addb", addTyped); const inp = $("#sn-in", root); if (inp) inp.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); addTyped(); } };
    const f = $("#sn-file", root); if (f) f.onchange = (e) => { addFiles([...e.target.files]); };
    root.querySelectorAll("[data-rm]").forEach((b) => (b.onclick = () => { URL.revokeObjectURL(st.imgs[+b.dataset.rm].url); st.imgs.splice(+b.dataset.rm, 1); draw(); }));
    root.querySelectorAll("[data-del]").forEach((b) => (b.onclick = () => { st.items.splice(+b.dataset.del, 1); draw(); }));
    root.querySelectorAll("[data-ed]").forEach((b) => (b.onclick = () => { const k = +b.dataset.ed, v = prompt(x.addph, st.items[k].id ? name(st.items[k].id) : st.items[k].raw); if (v == null) return; const id = S.resolve(idx, v); st.items[k] = Object.assign(st.items[k], { id, raw: v, conf: "high", src: "user", alts: [] }); draw(); }));
    const pt = $("#sn-pt", root); if (pt) pt.onchange = (e) => { st.pantry = e.target.checked; };
    root.querySelectorAll("[data-al]").forEach((c) => (c.onchange = () => { c.checked ? st.allergens.add(c.dataset.al) : st.allergens.delete(c.dataset.al); }));
    const so = $("#sn-so", root); if (so) so.onchange = (e) => { st.sort = e.target.value; draw(); };
    const v = $("#sn-v", root); if (v && st.stream) v.srcObject = st.stream;
  }
  function addTyped() {
    const v = $("#sn-in", root).value.trim(); if (!v) return; const id = S.resolve(idx, v);
    if (id && st.items.some((i) => i.id === id)) { $("#sn-in", root).value = ""; return; }                   // no duplicates
    st.items.push({ id, raw: v, conf: "high", src: "user", alts: [], count: null }); draw();
  }
  async function openCam() {
    const x = t(); st.msg = "";
    if (!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { st.msg = !window.isSecureContext ? x.insecure : x.nocam; st.step = "home"; return draw(); }
    try { try { st.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: st.facing || "environment" } }, audio: false }); } catch (e) { if (e.name === "OverconstrainedError") st.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); else throw e; }
      st.step = "camera"; draw(); }
    catch (e) { st.msg = e.name === "NotAllowedError" || e.name === "SecurityError" ? x.denied : e.name === "NotFoundError" || e.name === "OverconstrainedError" ? x.nocam : e.name === "NotReadableError" ? x.inuse : x.nocam; st.step = "home"; draw(); }
  }
  function capture() {
    const v = $("#sn-v", root); if (!v || !v.videoWidth) return; const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext("2d").drawImage(v, 0, 0);
    c.toBlob((b) => { stop(); if (b) pushImg(b); st.step = "home"; draw(); }, "image/jpeg", 0.9);
  }
  function pushImg(b) { if (st.imgs.length >= 5) { st.msg = t().bad; return; } st.imgs.push({ blob: b, url: URL.createObjectURL(b) }); }
  async function addFiles(files) {
    st.msg = ""; for (const f of files) {
      if (!/^image\/(jpeg|png|webp)$/.test(f.type) || f.size > 10 * 1024 * 1024 || st.imgs.length >= 5) { st.msg = t().bad; continue; }
      try { const bm = await createImageBitmap(f); bm.close && bm.close(); pushImg(f); } catch (e) { st.msg = t().bad; }   // decode = verify it really is an image
    } draw();
  }
  async function toJpeg(blob) {   // resize to max 1280 px and re-encode: smaller upload, strips metadata
    const bm = await createImageBitmap(blob), k = Math.min(1, 1280 / Math.max(bm.width, bm.height)), c = document.createElement("canvas"); c.width = Math.round(bm.width * k); c.height = Math.round(bm.height * k);
    c.getContext("2d").drawImage(bm, 0, 0, c.width, c.height); const d = c.toDataURL("image/jpeg", 0.8); return d.slice(d.indexOf(",") + 1);
  }
  async function analyse() {
    const x = t(), d = SC.dm; if (st.busy) return; st.msg = "";
    if (!d || !d.invoke) { st.msg = x.nobk; return draw(); } if (!d.me()) { st.msg = x.login; return draw(); }
    st.busy = true; draw();
    try {
      const images = []; for (const m of st.imgs) images.push({ mime: "image/jpeg", data: await toJpeg(m.blob) });
      const r = await d.invoke("scan-ingredients", { images });
      if (r.error) { const body = r.error.context && r.error.context.status; st.msg = body === 429 ? x.quota : body === 503 ? (x.noai || x.fail) : body === 401 ? x.login : x.fail; st.busy = false; return draw(); }
      const list = (r.data && r.data.ingredients) || [];
      list.forEach((a) => { const id = S.resolve(idx, a.name); const dupe = id && st.items.find((i) => i.id === id);
        if (dupe) { dupe.count = Math.max(dupe.count || 0, a.count || 0) || null; return; }
        st.items.push({ id, raw: a.name, conf: a.confidence, count: a.count, alts: a.alternatives || [], src: "ai" }); });
      if (!list.length) st.msg = x.nolist;
      st.imgs.forEach((m) => URL.revokeObjectURL(m.url)); st.imgs = []; st.busy = false; st.step = "review"; draw();
    } catch (e) { st.msg = x.fail; st.busy = false; draw(); }
  }
  new MutationObserver(mount).observe(document.getElementById("app"), { childList: true, subtree: true }); mount();
})();
