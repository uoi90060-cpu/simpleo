/* SIMPLE COOK — Phase 5 food map (route #/map). Map: MapLibre GL JS. Places: our own PostGIS table via SC.dm (RLS + RPC). */
(function () {
  "use strict";
  const SC = window.SC, Api = SC.Api, P = window.SC_PLACE, CFG = window.SC_CONFIG || {};
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ML = "https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl";
  const CATS = { restaurant: "🍽️", "fast-food": "🍔", cafe: "☕", bakery: "🥐", "food-truck": "🚚", "street-food": "🌮", market: "🛒", dessert: "🍰", "ice-cream": "🍦", seafood: "🦐", vegan: "🥗", other: "📍" };
  const L = {
    en: { title: "Explore Food Places", search: "Search a city or address", name: "Filter by place name", all: "All", near: "Near me", rating: "Min rating", price: "Price", open: "Open now", saved: "Saved", add: "Add a food place", nobk: "The food map needs the live server. Open the site from your Railway deployment (see docs/RAILWAY.md).", nomap: "The map could not load. The list still works.", none: "No approved places in this area yet. Zoom out, change filters, or add a missing place.", zoomin: "Zoom in to see places.", cityhint: "Zoom in on a city to see all its restaurants, fast food, cafés and bakeries.", loadingcity: "Loading restaurants and food places in this area… (the first time in a new city takes a few seconds)", loading: "Loading…", deny: "Location permission denied. Search for a city instead.", locwhy: "Simple Cook uses your location once, only to show places near you. It is not stored.", dir: "Directions", call: "Call", web: "Website", save: "Save", unsave: "Saved ✓", copy: "Copy address", info: "Information unavailable", hours: "Opening hours", unk: "Hours not available", isopen: "Open now", closed: "Closed now", reviews: "Simple Cook reviews", noreviews: "No reviews yet", write: "Write a review", post: "Post review", login: "Log in to do this.", src: { osm: "Source: OpenStreetMap contributors (ODbL)", user: "Community-added, not verified", partner: "Partner data" }, helpful: "Helpful", report: "Report", pick: "Click the map to set the position, then fill in the form.", submit: "Submit for review", pending: "Thanks! Your place is waiting for moderator approval.", added: "Thanks! Your place was added. It shows as community-added (not verified).", demo: "Demo map tiles (OpenStreetMap public server) — configure mapStyleUrl for production.", radius: "Radius (km)", c: { restaurant: "Restaurants", "fast-food": "Fast food", cafe: "Cafés", bakery: "Bakeries", "food-truck": "Food trucks", "street-food": "Street food", market: "Markets", dessert: "Desserts", "ice-cream": "Ice cream", seafood: "Seafood", vegan: "Vegan / vegetarian", other: "Other" } },
    fr: { title: "Explorer les lieux gourmands", search: "Rechercher une ville ou une adresse", name: "Filtrer par nom", all: "Tous", near: "Près de moi", rating: "Note min.", price: "Prix", open: "Ouvert", saved: "Enregistrés", add: "Ajouter un lieu", nobk: "La carte nécessite le serveur en ligne. Ouvrez le site depuis votre déploiement Railway (voir docs/RAILWAY.md).", nomap: "Impossible de charger la carte. La liste reste disponible.", none: "Aucun lieu approuvé ici pour l'instant. Dézoomez, changez les filtres ou ajoutez un lieu.", zoomin: "Zoomez pour voir les lieux.", cityhint: "Zoomez sur une ville pour voir tous ses restaurants, fast-foods, cafés et boulangeries.", loadingcity: "Chargement des restaurants de cette zone… (quelques secondes la première fois dans une nouvelle ville)", loading: "Chargement…", deny: "Localisation refusée. Recherchez une ville.", locwhy: "Simple Cook utilise votre position une seule fois pour afficher les lieux proches. Elle n'est pas enregistrée.", dir: "Itinéraire", call: "Appeler", web: "Site web", save: "Enregistrer", unsave: "Enregistré ✓", copy: "Copier l'adresse", info: "Information indisponible", hours: "Horaires", unk: "Horaires indisponibles", isopen: "Ouvert", closed: "Fermé", reviews: "Avis Simple Cook", noreviews: "Aucun avis", write: "Écrire un avis", post: "Publier", login: "Connectez-vous.", src: { osm: "Source : contributeurs OpenStreetMap (ODbL)", user: "Ajouté par la communauté, non vérifié", partner: "Données partenaire" }, helpful: "Utile", report: "Signaler", pick: "Cliquez sur la carte pour la position, puis remplissez le formulaire.", submit: "Envoyer pour validation", pending: "Merci ! Votre lieu attend la validation d'un modérateur.", added: "Merci ! Votre lieu est ajouté. Il apparaît comme ajouté par la communauté (non vérifié).", demo: "Fond de carte de démo (serveur public OpenStreetMap) — configurez mapStyleUrl en production.", radius: "Rayon (km)", c: { restaurant: "Restaurants", "fast-food": "Fast-food", cafe: "Cafés", bakery: "Boulangeries", "food-truck": "Food trucks", "street-food": "Street food", market: "Marchés", dessert: "Desserts", "ice-cream": "Glaces", seafood: "Fruits de mer", vegan: "Végé / vegan", other: "Autre" } },
    ar: { title: "استكشف أماكن الطعام", search: "ابحث عن مدينة أو عنوان", name: "تصفية بالاسم", all: "الكل", near: "بالقرب مني", rating: "أدنى تقييم", price: "السعر", open: "مفتوح الآن", saved: "المحفوظة", add: "أضف مكانًا", nobk: "تحتاج الخريطة إلى الخادم المباشر. افتح الموقع من نشر Railway (راجع docs/RAILWAY.md).", nomap: "تعذر تحميل الخريطة. القائمة ما زالت متاحة.", none: "لا توجد أماكن معتمدة هنا بعد. صغّر الخريطة أو غيّر التصفية أو أضف مكانًا.", zoomin: "كبّر الخريطة لعرض الأماكن.", cityhint: "كبّر الخريطة على مدينة لعرض كل المطاعم والوجبات السريعة والمقاهي والمخابز.", loadingcity: "جارٍ تحميل المطاعم وأماكن الطعام في هذه المنطقة… (يستغرق بضع ثوانٍ في المرة الأولى لكل مدينة)", loading: "جارٍ التحميل…", deny: "تم رفض الموقع. ابحث عن مدينة.", locwhy: "يستخدم Simple Cook موقعك مرة واحدة فقط لعرض الأماكن القريبة ولا يحفظه.", dir: "الاتجاهات", call: "اتصال", web: "الموقع", save: "حفظ", unsave: "تم الحفظ ✓", copy: "نسخ العنوان", info: "المعلومة غير متوفرة", hours: "ساعات العمل", unk: "ساعات العمل غير متوفرة", isopen: "مفتوح الآن", closed: "مغلق الآن", reviews: "تقييمات Simple Cook", noreviews: "لا توجد تقييمات", write: "اكتب تقييمًا", post: "نشر", login: "سجّل الدخول.", src: { osm: "المصدر: مساهمو OpenStreetMap (ODbL)", user: "أضافه المجتمع، غير موثّق", partner: "بيانات شريك" }, helpful: "مفيد", report: "إبلاغ", pick: "انقر على الخريطة لتحديد الموقع ثم املأ النموذج.", submit: "إرسال للمراجعة", pending: "شكرًا! مكانك بانتظار موافقة المشرف.", added: "شكرًا! تمت إضافة مكانك. يظهر كمضاف من المجتمع (غير موثّق).", demo: "خريطة تجريبية (خادم OpenStreetMap العام) — اضبط mapStyleUrl للإنتاج.", radius: "النطاق (كم)", c: { restaurant: "مطاعم", "fast-food": "وجبات سريعة", cafe: "مقاهي", bakery: "مخابز", "food-truck": "عربات طعام", "street-food": "طعام الشارع", market: "أسواق", dessert: "حلويات", "ice-cream": "آيس كريم", seafood: "مأكولات بحرية", vegan: "نباتي", other: "أخرى" } },
  };
  const lg = () => { const l = (document.documentElement.lang || "en").slice(0, 2); return L[l] || L.en; };
  const dm = () => SC.dm, me = () => (dm() && dm().me()) || null;
  const st = { map: null, places: [], sel: null, f: { cat: "", rating: "", price: "", open: false, q: "", saved: false }, ctl: null, tm: 0, savedIds: new Set(), pickMode: false, pick: null, root: null };
  const loadOnce = (u, css) => new Promise((res, rej) => { const e = document.createElement(css ? "link" : "script"); if (css) { e.rel = "stylesheet"; e.href = u; } else e.src = u; e.crossOrigin = "anonymous"; e.onload = res; e.onerror = () => rej(new Error("load")); document.head.appendChild(e); if (css) res(); });
  const toast = (m) => { const e = document.createElement("div"); e.className = "dm-toast"; e.textContent = m; document.body.appendChild(e); setTimeout(() => e.remove(), 4000); };

  async function mount() {
    const root = $("#fm-root"); if (!root || root.dataset.on) return; root.dataset.on = "1"; st.root = root; const t = lg();
    root.dir = (document.documentElement.lang || "").startsWith("ar") ? "rtl" : "ltr";
    if (!dm()) { root.innerHTML = `<p class="dm-empty">${t.nobk}</p>`; return; }
    root.innerHTML = `<div class="fm"><div class="fm-top"><h1>${t.title}</h1><div class="fm-sb"><input id="fm-geo" type="search" placeholder="${t.search}" aria-label="${t.search}" autocomplete="off"><div id="fm-sug" class="fm-sug" role="listbox"></div></div>
      <button class="btn btn-sm" id="fm-near">📍 ${t.near}</button><button class="btn btn-sm btn-primary" id="fm-add">＋ ${t.add}</button></div>
      <div class="fm-filters"><input id="fm-q" placeholder="${t.name}" aria-label="${t.name}"><div class="fm-chips" id="fm-chips"></div>
        <select id="fm-r" aria-label="${t.rating}"><option value="">${t.rating}</option><option>3</option><option>4</option><option>4.5</option></select>
        <select id="fm-p" aria-label="${t.price}"><option value="">${t.price}</option><option value="1">$</option><option value="2">$$</option><option value="3">$$$</option><option value="4">$$$$</option></select>
        <label><input type="checkbox" id="fm-o"> ${t.open}</label><label><input type="checkbox" id="fm-s"> ${t.saved}</label></div>
      <div class="fm-body"><div id="fm-map" class="fm-map" aria-label="Map"></div><aside class="fm-side"><div id="fm-status" role="status" aria-live="polite"></div><div id="fm-list" class="fm-list"></div><div id="fm-det" class="fm-det" hidden></div></aside></div></div>`;
    $("#fm-chips").innerHTML = ["", ...Object.keys(CATS)].map((c) => `<button class="fm-chip ${c === "" ? "on" : ""}" data-c="${c}">${c ? CATS[c] + " " + t.c[c] : t.all}</button>`).join("");
    $("#fm-chips").onclick = (e) => { const b = e.target.closest("[data-c]"); if (!b) return; st.f.cat = b.dataset.c; document.querySelectorAll(".fm-chip").forEach((x) => x.classList.toggle("on", x === b)); search(); };
    $("#fm-q").oninput = (e) => { st.f.q = e.target.value; clearTimeout(st.tq); st.tq = setTimeout(search, 400); };
    $("#fm-r").onchange = (e) => { st.f.rating = e.target.value; search(); }; $("#fm-p").onchange = (e) => { st.f.price = e.target.value; search(); };
    $("#fm-o").onchange = (e) => { st.f.open = e.target.checked; render(); }; $("#fm-s").onchange = (e) => { st.f.saved = e.target.checked; render(); };
    $("#fm-near").onclick = near; $("#fm-add").onclick = addMode; geocoder();
    SC.cleanups.push(() => { if (st.map) { st.map.remove(); st.map = null; } if (st.ctl) st.ctl.abort(); });
    try {
      await loadOnce(ML + ".css", true); await loadOnce(ML + ".js");
      const demo = !CFG.mapStyleUrl;
      const style = CFG.mapStyleUrl || { version: 8, sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, maxzoom: 19, attribution: "© OpenStreetMap contributors" } }, layers: [{ id: "osm", type: "raster", source: "osm" }] };
      st.map = new window.maplibregl.Map({ container: "fm-map", style, center: [10, 30], zoom: 3, attributionControl: { compact: true } });
      st.map.addControl(new window.maplibregl.NavigationControl({ showCompass: false }), "top-right");
      if (demo) $("#fm-status").textContent = t.demo;
      st.map.on("load", () => {
        st.map.addSource("pl", { type: "geojson", data: { type: "FeatureCollection", features: [] }, cluster: true, clusterRadius: 50, clusterMaxZoom: 15 });
        st.map.addLayer({ id: "cl", type: "circle", source: "pl", filter: ["has", "point_count"], paint: { "circle-color": "#e8442a", "circle-opacity": 0.85, "circle-radius": ["step", ["get", "point_count"], 14, 10, 20, 50, 28], "circle-stroke-width": 2, "circle-stroke-color": "#fff" } });
        st.map.addLayer({ id: "pt", type: "circle", source: "pl", filter: ["!", ["has", "point_count"]], paint: { "circle-color": ["case", ["==", ["get", "id"], st.sel || ""], "#1c1a17", "#e8442a"], "circle-radius": 8, "circle-stroke-width": 2, "circle-stroke-color": "#fff" } });
        st.map.on("click", "cl", (e) => { const f = st.map.queryRenderedFeatures(e.point, { layers: ["cl"] })[0]; st.map.getSource("pl").getClusterExpansionZoom(f.properties.cluster_id).then((z) => st.map.easeTo({ center: f.geometry.coordinates, zoom: z })); });
        st.map.on("click", "pt", (e) => select(e.features[0].properties.id, false));
        st.map.on("click", (e) => { if (st.pickMode) { st.pick = e.lngLat; if (st.pm) st.pm.remove(); st.pm = new window.maplibregl.Marker().setLngLat(e.lngLat).addTo(st.map); } });
        st.map.on("moveend", () => { clearTimeout(st.tm); st.tm = setTimeout(search, 450); });
        search();
      });
      st.map.on("error", () => { if (!st.map.loaded() && !st.mapErr) { st.mapErr = 1; $("#fm-status").textContent = t.nomap; } });
    } catch (e) { $("#fm-status").textContent = t.nomap; search(); }
    if (me()) dm().from("saved_places").select("place_id").then((r) => { st.savedIds = new Set((r.data || []).map((x) => x.place_id)); });
  }

  async function search() {
    const t = lg(), m = st.map; if (st.ctl) st.ctl.abort(); st.ctl = new AbortController(); const ctl = st.ctl;
    let b = m ? m.getBounds() : null, z = m ? m.getZoom() : 0;
    if (b && z < 3) { $("#fm-status").textContent = t.zoomin; st.places = []; render(); return; }
    const w = b ? Math.max(-180, Math.min(180, b.getWest())) : -180, e = b ? Math.max(-180, Math.min(180, b.getEast())) : 180;
    $("#fm-status").textContent = z >= 12 ? t.loadingcity : t.loading;
    const r = await dm().rpc("search_places", { p_west: e - w >= 359 ? -180 : w, p_south: b ? Math.max(-90, b.getSouth()) : -90, p_east: e - w >= 359 ? 180 : e, p_north: b ? Math.min(90, b.getNorth()) : 90,
      p_q: st.f.q || null, p_cat: st.f.cat || null, p_min_rating: st.f.rating ? +st.f.rating : null, p_price: st.f.price ? +st.f.price : null, p_limit: 300 }).abortSignal(ctl.signal);
    if (ctl.signal.aborted) return;
    if (r.error) { $("#fm-status").innerHTML = `${esc(r.error.message)} <button class="btn btn-sm" id="fm-retry">↻</button>`; $("#fm-retry").onclick = search; return; }
    st.places = r.data || []; $("#fm-status").textContent = z && z < 12 ? t.cityhint : ""; render();
  }
  function visible() { return st.places.filter((p) => (!st.f.open || P.openNow(p.opening_hours, p.timezone) === true) && (!st.f.saved || st.savedIds.has(p.id))); }
  function render() {
    const t = lg(), v = visible(), list = $("#fm-list"); if (!list) return;
    if (st.map && st.map.getSource("pl")) st.map.getSource("pl").setData({ type: "FeatureCollection", features: v.map((p) => ({ type: "Feature", geometry: { type: "Point", coordinates: [p.lng, p.lat] }, properties: { id: p.id } })) });
    list.innerHTML = v.length ? v.map((p) => `<button class="fm-card ${p.id === st.sel ? "on" : ""}" data-id="${p.id}"><span class="fm-ic">${CATS[p.category_id] || "📍"}</span><span><b>${esc(p.name)}</b><small>${esc([p.city, p.address].filter(Boolean).join(" · ") || t.info)}</small><small>${p.rating_count ? "★ " + Number(p.rating_avg).toFixed(1) + " (" + p.rating_count + ")" : ""}${p.price_level ? " · " + "$".repeat(p.price_level) : ""}</small></span></button>`).join("") : `<p class="dm-empty">${t.none}</p>`;
    list.onclick = (e) => { const b = e.target.closest("[data-id]"); if (b) select(b.dataset.id, true); };
  }
  function select(id, fly) {
    st.sel = id; const p = st.places.find((x) => x.id === id); if (!p) return;
    if (st.map && st.map.getLayer("pt")) st.map.setPaintProperty("pt", "circle-color", ["case", ["==", ["get", "id"], id], "#1c1a17", "#e8442a"]);
    if (fly && st.map) st.map.easeTo({ center: [p.lng, p.lat], zoom: Math.max(st.map.getZoom(), 15) });
    render(); detail(p);
  }
  function hoursBlock(p, t) {
    const o = P.openNow(p.opening_hours, p.timezone); if (o === null) return `<p>${t.hours}: <i>${t.unk}</i></p>`;
    const D = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `<p>${t.hours}: <b>${o ? t.isopen : t.closed}</b> <small>(${esc(p.timezone)})</small></p><ul class="fm-h">${p.opening_hours.periods.map((q) => `<li>${D[q.d]} ${esc(q.o)}–${esc(q.c)}</li>`).join("")}</ul>`;
  }
  async function detail(p) {
    const t = lg(), d = $("#fm-det"), u = P.dirUrls(p.lat, p.lng), web = P.safeHttp(p.website); d.hidden = false;
    d.innerHTML = `<button class="fm-x" id="fm-close" aria-label="Close">✕</button><h2>${CATS[p.category_id] || ""} ${esc(p.name)}</h2><p>${esc([p.address, p.city, p.country_code].filter(Boolean).join(", ") || t.info)}</p>
      <p class="fm-src">${esc(p.attribution || (t.src[p.source] || ""))}${p.verification !== "community" ? " · ✔ " + esc(p.verification) : ""}</p>${hoursBlock(p, t)}
      <p>${p.price_level ? "$".repeat(p.price_level) : ""}</p>
      <div class="fm-act"><a class="btn btn-sm btn-primary" target="_blank" rel="noopener noreferrer" href="${u.google}">${t.dir} (Google)</a><a class="btn btn-sm" target="_blank" rel="noopener noreferrer" href="${u.osm}">OSM</a><a class="btn btn-sm" target="_blank" rel="noopener noreferrer" href="${u.apple}">Apple</a>
        ${p.phone ? `<a class="btn btn-sm" href="tel:${esc(p.phone.replace(/[^+\d]/g, ""))}">${t.call}</a>` : ""}${web ? `<a class="btn btn-sm" target="_blank" rel="noopener noreferrer" href="${esc(web)}">${t.web}</a>` : ""}
        <button class="btn btn-sm" id="fm-copy">${t.copy}</button><button class="btn btn-sm" id="fm-save">${st.savedIds.has(p.id) ? t.unsave : t.save}</button></div>
      <h3>${t.reviews}</h3><p>${p.rating_count ? "★ " + Number(p.rating_avg).toFixed(1) + " · " + p.rating_count : t.noreviews}</p><div id="fm-rv"></div>
      <form id="fm-rf" class="fm-rf"><label>${t.write}<select id="fm-rs">${[5, 4, 3, 2, 1].map((n) => `<option value="${n}">${"★".repeat(n)}</option>`).join("")}</select></label><textarea id="fm-rt" maxlength="2000" rows="3"></textarea><button class="btn btn-primary btn-sm">${t.post}</button></form>`;
    $("#fm-close").onclick = () => { d.hidden = true; st.sel = null; render(); };
    $("#fm-copy").onclick = () => navigator.clipboard && navigator.clipboard.writeText([p.name, p.address, p.city].filter(Boolean).join(", "));
    $("#fm-save").onclick = async () => {
      if (!me()) return toast(t.login); const on = st.savedIds.has(p.id);
      const r = on ? await dm().from("saved_places").delete().eq("place_id", p.id).eq("profile_id", me()) : await dm().from("saved_places").insert({ place_id: p.id, profile_id: me() });
      if (r.error) return toast(r.error.message); on ? st.savedIds.delete(p.id) : st.savedIds.add(p.id); $("#fm-save").textContent = on ? t.save : t.unsave;
    };
    $("#fm-rf").onsubmit = async (e) => { e.preventDefault(); if (!me()) return toast(t.login);
      const r = await dm().from("food_place_reviews").upsert({ place_id: p.id, author_id: me(), rating: +$("#fm-rs").value, body: $("#fm-rt").value.trim() || null }, { onConflict: "place_id,author_id" });
      if (r.error) return toast(r.error.message); await search(); const np = st.places.find((x) => x.id === p.id); if (np) detail(np); };
    const rv = await dm().from("food_place_reviews").select("id,rating,body,created_at,author_id,food_review_votes(count)").eq("place_id", p.id).order("created_at", { ascending: false }).limit(20);
    const box = $("#fm-rv"); if (!box || st.sel !== p.id) return;
    box.innerHTML = (rv.data || []).map((x) => { const a = Api.users().find((y) => y.uuid === x.author_id) || { username: "user" };
      return `<div class="fm-rev"><b>@${esc(a.username)}</b> ${"★".repeat(x.rating)} <small>${new Date(x.created_at).toLocaleDateString()}</small>${x.body ? `<p>${esc(x.body)}</p>` : ""}<button class="btn btn-sm" data-v="${x.id}">👍 ${t.helpful} ${(x.food_review_votes && x.food_review_votes[0] && x.food_review_votes[0].count) || 0}</button> <button class="btn btn-sm" data-rp="${x.id}">${t.report}</button></div>`; }).join("");
    box.onclick = async (e) => {
      const v = e.target.closest("[data-v]"), rp = e.target.closest("[data-rp]"); if (!v && !rp) return; if (!me()) return toast(t.login);
      const r = v ? await dm().from("food_review_votes").insert({ review_id: v.dataset.v, profile_id: me() }) : await dm().from("reports").insert({ reporter_id: me(), target_type: "place", target_id: rp.dataset.rp, reason: "other", details: "review" });
      toast(r.error ? (r.error.code === "23505" ? "Already done." : r.error.message) : "OK");
    };
  }
  // ---- location: explicit user actions only; nothing is stored -----------------------------------
  function near() {   // 2 km around you; no pop-up question, so it also works on phones
    const t = lg(); if (!navigator.geolocation) return toast(t.deny); if (!confirm(t.locwhy)) return;
    navigator.geolocation.getCurrentPosition((pos) => { const b = P.radiusBounds(pos.coords.latitude, pos.coords.longitude, 2); st.map && st.map.fitBounds([[b.west, b.south], [b.east, b.north]], { duration: 600 }); }, () => toast(t.deny), { timeout: 10000, maximumAge: 60000 });
  }
  function geocoder() {
    const inp = $("#fm-geo"), box = $("#fm-sug"); let tm = 0, ctl = null;
    inp.oninput = () => { clearTimeout(tm); const q = inp.value.trim(); if (q.length < 3) { box.innerHTML = ""; return; }
      tm = setTimeout(async () => { if (ctl) ctl.abort(); ctl = new AbortController(); try {
        const url = (CFG.geocoderUrl || "https://photon.komoot.io/api/") + "?limit=5&q=" + encodeURIComponent(q) + "&lang=" + (document.documentElement.lang || "en").slice(0, 2).replace("ar", "en");
        const j = await (await fetch(url, { signal: ctl.signal })).json();
        box.innerHTML = (j.features || []).map((f, i) => { const p = f.properties || {}; return `<button data-i="${i}">${esc([p.name, p.city, p.state, p.country].filter(Boolean).join(", "))}</button>`; }).join("");
        box.onclick = (e) => { const b = e.target.closest("[data-i]"); if (!b) return; const f = j.features[+b.dataset.i], ex = f.properties.extent; box.innerHTML = ""; inp.value = b.textContent;
          if (st.map) st.map.easeTo({ center: f.geometry.coordinates, zoom: ex && Math.abs(ex[2] - ex[0]) < 0.02 ? 16 : 13 }); };   // zoom 13 = city streets, where restaurants load
      } catch (e) { if (e.name !== "AbortError") box.innerHTML = ""; } }, 500); };
  }
  // ---- add a place (moderated) -------------------------------------------------------------------
  function addMode() {
    const t = lg(); if (!me()) return toast(t.login); st.pickMode = true; st.pick = null; const d = $("#fm-det"); d.hidden = false;
    d.innerHTML = `<button class="fm-x" id="fm-close" aria-label="Close">✕</button><h2>${t.add}</h2><p>${t.pick}</p><form id="fm-af" class="fm-rf"><input id="a-n" required minlength="2" maxlength="120" placeholder="Name"><select id="a-c">${Object.keys(CATS).map((c) => `<option value="${c}">${CATS[c]} ${t.c[c]}</option>`).join("")}</select><input id="a-a" maxlength="200" placeholder="Address"><input id="a-t" maxlength="80" placeholder="City"><input id="a-cc" maxlength="2" placeholder="Country code (DZ)"><input id="a-p" maxlength="30" placeholder="Phone"><input id="a-w" type="url" placeholder="https://"><button class="btn btn-primary btn-sm">${t.submit}</button></form>`;
    $("#fm-close").onclick = () => { st.pickMode = false; d.hidden = true; if (st.pm) st.pm.remove(); };
    $("#fm-af").onsubmit = async (e) => { e.preventDefault(); if (!st.pick) return toast(t.pick);
      const args = { p_name: $("#a-n").value, p_category: $("#a-c").value, p_lat: st.pick.lat, p_lng: st.pick.lng, p_address: $("#a-a").value || null, p_city: $("#a-t").value || null, p_country: $("#a-cc").value || null, p_phone: $("#a-p").value || null, p_website: $("#a-w").value || null };
      let r = await dm().rpc("submit_place", args);
      if (r.error && /possible duplicate/.test(r.error.message) && confirm(r.error.message + "\nSubmit anyway?")) r = await dm().rpc("submit_place", Object.assign(args, { p_ignore_duplicate: true }));
      if (r.error) return toast(r.error.message); st.pickMode = false; d.hidden = true; if (st.pm) st.pm.remove(); const review = CFG.features && CFG.features.placesReview; toast(review ? t.pending : t.added); if (!review) search(); };
  }
  new MutationObserver(mount).observe(document.getElementById("app"), { childList: true, subtree: true });
  mount();
})();
