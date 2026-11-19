/* ==========================================================================
   SIMPLE COOK — page views  (views.js)
   Each view returns { title, html, mount?(root, ctx) }.
   `mount` runs after the HTML is in the page (event wiring, observers).
   ========================================================================== */
(function () {
  "use strict";
  const SC = window.SC, D = window.SC_DATA, Api = SC.Api;
  const { $, $$, esc, icon, fmt, fmtFull, mins, dur, ago, safeUrl, img, photo, avatar, toast } = SC.ui;
  const U = SC.ui;
  const REAL = SC.backend && SC.backend.mode !== "local";   // real backend: no demo account
  const EMAIL_ONLY = SC.backend && SC.backend.mode === "supabase";   // Supabase logs in by email only; the Railway server accepts username or email

  SC.runtime = SC.runtime || { blobs: {} }; // uploaded video files live here for this session only
  SC.draft = {};                             // in-progress uploads on the Create page
  SC.cleanups = [];                          // functions to run when leaving a page

  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const field = (id, label, inner, hint) => `<div class="field" data-field="${id}"><label for="f-${id}">${label}</label>${inner}${hint ? `<p class="field-hint">${hint}</p>` : ""}<p class="field-msg" role="alert"></p></div>`;
  const grid = (cls, items) => `<div class="${cls}">${items.join("")}</div>`;

  /* ==================================================================== */
  /* HOME                                                                  */
  /* ==================================================================== */
  function home() {
    const me = Api.me();
    const recipes = Api.recipes();
    const trending = Api.rank(recipes, "trending").slice(0, 9);
    const tIds = new Set(trending.map((r) => r.id));
    const popular = Api.rank(recipes, "liked").filter((r) => !tIds.has(r.id)).slice(0, 8);
    const creators = Api.creators().slice(0, 8);
    const reels = Api.rank(Api.reels(), "newest").slice(0, 9);
    const videos = Api.rank(Api.videos(), "trending").slice(0, 3);
    const featured = Api.recipe("tuna-pizza") || trending[0];
    const topCreator = creators[0], topStats = Api.stats(topCreator.username);
    const totalCreators = Api.creators().length;

    const hero = `
    <section class="hero wrap">
      <div class="hero-copy">
        <h1>Cook something amazing.</h1>
        <p class="lead">Discover recipes, creators and food you'll want to make.</p>
        <div class="hero-cta">
          <a class="btn btn-primary btn-lg" href="#/explore">Explore recipes</a>
          <a class="btn btn-ghost btn-lg" href="#/create">Start creating</a>
        </div>
        <div class="hero-proof">
          <span class="stack">${creators.slice(0, 5).map((u) => avatar(u, 38)).join("")}</span>
          <p><b>${recipes.length} recipes</b> from ${totalCreators} home cooks and the Simple Cook kitchen</p>
        </div>
      </div>
      <div class="hero-visual" aria-hidden="false">
        <div class="hv-glow"></div>
        <div class="hv-plate hv-main">${photo("heroMain", "quick", "hero-main", { w: 1000, h: 1000, eager: true, alt: "A beautifully plated meal" })}</div>
        <div class="hv-plate hv-a">${photo("heroPizza", "pizza", "hero-pizza", { w: 600, h: 600, eager: true, alt: "Fresh pizza" })}</div>
        <div class="hv-plate hv-b">${photo("heroPasta", "pasta", "hero-pasta", { w: 500, h: 500, eager: true, alt: "Creamy pasta" })}</div>
        <a class="float-card fc-recipe" href="#/recipe/${esc(featured.id)}">
          <span class="fc-thumb">${img(featured, { w: 160, h: 160, alt: "" })}</span>
          <span class="fc-text"><b>${esc(featured.title)}</b><span>${icon("clock")}${mins(featured.prep + featured.cook)}<i></i>${icon("heart")}${fmt(Api.counts(featured).likes)}</span></span>
        </a>
        <a class="float-card fc-points" href="#/profile/${esc(topCreator.username)}">
          ${avatar(topCreator, 36)}<span class="fc-text"><b>@${esc(topCreator.username)}</b><span>${icon("sparkle")}${fmtFull(topStats.points)} points</span></span>
        </a>
      </div>
    </section>`;

    const cats = `
    <section class="section wrap">
      ${U.sectionHead("What are you craving?", "Jump into a category.", "#/explore", "All recipes")}
      <div class="cat-grid">${D.CATEGORIES.filter((c) => c.home).map(U.catTile).join("")}</div>
    </section>`;

    const trendingHtml = `
    <section class="section wrap">
      ${U.sectionHead("Trending recipes", "What everyone is cooking right now.", "#/explore", "Explore all")}
      <div class="grid-trending">${trending.map((r, i) => U.recipeCard(r, { featured: i === 0 })).join("")}</div>
    </section>`;

    const creatorsHtml = `
    <section class="section wrap">
      ${U.sectionHead("Trending creators", "Follow cooks who keep delivering.", "#/explore?sort=active", "Active creators")}
      <div class="h-scroll creators-row">${creators.map(U.creatorCard).join("")}</div>
    </section>`;

    const reelsHtml = `
    <section class="section wrap">
      ${U.sectionHead("Fresh from Reels", "Quick cooking clips, made to be saved.", "#/reels", "Watch reels")}
      <div class="h-scroll reels-row">${reels.map((r) => U.reelTile(r)).join("")}</div>
    </section>`;

    const videosHtml = `
    <section class="section wrap">
      ${U.sectionHead("Watch and learn", "Full-length tutorials, from 10 minutes to a whole Sunday.", "#/videos", "All videos")}
      <div class="grid-videos">${videos.map((v) => U.videoCard(v)).join("")}</div>
    </section>`;

    const popularHtml = `
    <section class="section wrap">
      ${U.sectionHead("Popular recipes", "The most-loved dishes on Simple Cook.", "#/explore?sort=liked", "See most liked")}
      <div class="grid-cards">${popular.map((r) => U.recipeCard(r)).join("")}</div>
    </section>`;

    const cta = `
    <section class="wrap section">
      <div class="cta">
        ${photo("ctaBg", "italian", "cta-bg", { w: 1600, h: 700, cls: "cta-bg", alt: "" })}
        <div class="cta-shade"></div>
        <div class="cta-inner">
          <h2>Ready to cook something?</h2>
          <p>Join Simple Cook and share your food.</p>
          <div class="hero-cta">
            ${me
              ? `<a class="btn btn-primary btn-lg" href="#/create?type=recipe">Share a recipe</a><a class="btn btn-light btn-lg" href="#/create?type=reel">Post a reel</a>`
              : `<a class="btn btn-primary btn-lg" href="#/signup">Create free account</a><a class="btn btn-light btn-lg" href="#/login">Log in</a>`}
          </div>
        </div>
      </div>
    </section>`;

    return { title: "Cook something amazing", html: hero + cats + trendingHtml + creatorsHtml + reelsHtml + videosHtml + popularHtml + cta };
  }

  /* ==================================================================== */
  /* EXPLORE                                                               */
  /* ==================================================================== */
  const SORTS = [
    { id: "trending", label: "Trending", ic: "flame" },
    { id: "liked", label: "Most liked", ic: "heart" },
    { id: "newest", label: "Newest", ic: "sparkle" },
    { id: "active", label: "Active creators", ic: "users" },
  ];

  function filterRecipes(st, source) {
    let l = Api.recipes().filter((r) => r.source === source);
    if (st.cat) l = l.filter((r) => (r.cats || []).includes(st.cat));
    if (st.diff) l = l.filter((r) => r.diff === st.diff);
    if (st.q) l = l.filter((r) => Api.matches(r, st.q));
    return l;
  }

  function explore(ctx) {
    const p = ctx.params;
    const st = {
      tab: p.get("tab") === "fixed" ? "fixed" : "community",
      q: p.get("q") || "", cat: p.get("cat") || "", diff: p.get("diff") || "",
      sort: SORTS.some((s) => s.id === p.get("sort")) ? p.get("sort") : "trending",
    };
    const controls = () => {
      const nC = filterRecipes(st, "community").length, nF = filterRecipes(st, "fixed").length;
      const fixed = st.tab === "fixed";
      return `
      <div class="seg" role="tablist" aria-label="Recipe source">
        <button role="tab" aria-selected="${!fixed}" class="seg-btn${!fixed ? " on" : ""}" data-ex="tab" data-v="community">${icon("users")}Community<span class="seg-count">${nC}</span></button>
        <button role="tab" aria-selected="${fixed}" class="seg-btn${fixed ? " on" : ""}" data-ex="tab" data-v="fixed">${icon("chef")}Fixed recipes<span class="seg-count">${nF}</span></button>
      </div>
      <p class="seg-note">${fixed ? "Official recipes from the Simple Cook kitchen. Newer ones are editorial drafts, marked on each recipe page, and are not yet kitchen-tested." : "Recipes shared by home cooks like you."}</p>
      <div class="filter-row" aria-label="Sort">
        ${SORTS.map((s) => {
          const dis = fixed && s.id === "active";
          const on = (fixed && st.sort === "active" ? "trending" : st.sort) === s.id;
          return `<button class="chip${on ? " on" : ""}" data-ex="sort" data-v="${s.id}" ${dis ? 'disabled title="Official recipes are not tied to a creator"' : ""} aria-pressed="${on}">${icon(s.ic)}${s.label}</button>`;
        }).join("")}
        <span class="filter-sep"></span>
        ${["", "Easy", "Medium", "Hard"].map((d) => `<button class="chip chip-diff${st.diff === d ? " on" : ""}" data-ex="diff" data-v="${d}" aria-pressed="${st.diff === d}">${d || "Any difficulty"}</button>`).join("")}
      </div>
      <div class="cat-chips" aria-label="Categories">
        <button class="chip${!st.cat ? " on" : ""}" data-ex="cat" data-v="">All</button>
        ${D.CATEGORIES.map((c) => `<button class="chip chip-cat${st.cat === c.id ? " on" : ""}" data-ex="cat" data-v="${c.id}" aria-pressed="${st.cat === c.id}"><span class="chip-thumb">${photo(c.photo, c.id, "chip-" + c.id, { w: 80, h: 80, alt: "" })}</span>${esc(c.name)}</button>`).join("")}
      </div>`;
    };
    const results = () => {
      const source = st.tab === "fixed" ? "fixed" : "community";
      const sort = source === "fixed" && st.sort === "active" ? "trending" : st.sort;
      const list = Api.rank(filterRecipes(st, source), sort);
      let creators = [];
      if (source === "community") {
        if (st.q) creators = Api.creators().filter((u) => Api.matchUser(u, st.q)).slice(0, 6);
        else if (sort === "active") creators = Api.creators().slice(0, 8);
      }
      const head = `<div class="result-head"><h2>${list.length} ${list.length === 1 ? "recipe" : "recipes"}${st.q ? ` for “${esc(st.q)}”` : ""}</h2>${st.q || st.cat || st.diff ? `<button class="link-btn" data-ex="clear">Clear filters</button>` : ""}</div>`;
      const cr = creators.length
        ? `<div class="result-block"><h3 class="mini-title">${sort === "active" && !st.q ? "Most active creators" : "Creators"}</h3><div class="h-scroll creators-row">${creators.map(U.creatorCard).join("")}</div></div>`
        : "";
      const body = list.length
        ? `<div class="grid-cards">${list.map((r) => U.recipeCard(r)).join("")}</div>`
        : U.emptyState("Nothing matches yet", "Try a different word, another category or clear your filters.", `<button class="btn btn-primary" data-ex="clear">Clear filters</button>`);
      return cr + head + body;
    };

    const html = `
    <section class="wrap explore" id="explore">
      <div class="page-head"><h1>Explore</h1><p>Find your next dinner, dessert or obsession.</p></div>
      <div class="explore-search">
        ${icon("search")}
        <input id="ex-input" type="search" value="${esc(st.q)}" placeholder="Search recipes, dishes or creators..." aria-label="Search recipes, dishes or creators" autocomplete="off">
        <button class="icon-btn" data-ex="clearq" aria-label="Clear search" ${st.q ? "" : "hidden"}>${icon("x")}</button>
      </div>
      <div id="ex-controls">${controls()}</div>
      <div id="ex-results">${results()}</div>
    </section>`;

    return {
      title: "Explore", html,
      mount() {
        const root = $("#explore"), input = $("#ex-input", root), clearq = $('[data-ex="clearq"]', root);
        const paint = () => {
          $("#ex-controls", root).innerHTML = controls();
          $("#ex-results", root).innerHTML = results();
          clearq.hidden = !st.q;
          const q = new URLSearchParams();
          if (st.tab !== "community") q.set("tab", st.tab);
          if (st.q) q.set("q", st.q);
          if (st.cat) q.set("cat", st.cat);
          if (st.diff) q.set("diff", st.diff);
          if (st.sort !== "trending") q.set("sort", st.sort);
          try { history.replaceState(null, "", "#/explore" + (q.toString() ? "?" + q : "")); } catch (e) { /* ignore */ }
        };
        root.addEventListener("click", (e) => {
          const b = e.target.closest("[data-ex]"); if (!b || b.disabled) return;
          const k = b.dataset.ex, v = b.dataset.v;
          if (k === "tab") st.tab = v;
          else if (k === "sort") st.sort = v;
          else if (k === "cat") st.cat = st.cat === v ? "" : v;
          else if (k === "diff") st.diff = v;
          else if (k === "clearq") { st.q = ""; input.value = ""; input.focus(); }
          else if (k === "clear") { st.q = ""; st.cat = ""; st.diff = ""; input.value = ""; }
          paint();
        });
        input.addEventListener("input", debounce(() => { st.q = input.value.trim(); paint(); }, 140));
        $("#ex-input", root).form && $("#ex-input", root).form.addEventListener("submit", (e) => e.preventDefault());
      },
    };
  }

  /* ==================================================================== */
  /* RECIPE                                                                */
  /* ==================================================================== */
  function recipe(ctx) {
    const r = Api.recipe(decodeURIComponent(ctx.args[0]));
    if (!r) return notFound("recipe");
    const key = Api.keyOf(r), u = Api.author(r), c = Api.counts(r);
    const w = WD() && WD().available ? WD().get(r.id) : null, lang = WD() ? WD().lang() : "en";
    const total = w ? w.times.total : r.prep + r.cook;
    const related = Api.related(r, 4);
    const byline = u.official
      ? `<a class="byline" href="#/explore?tab=fixed">${avatar(u, 46)}<span><b>Simple Cook</b><small>Official recipe</small></span><span class="official-tick" title="Official">${icon("check")}</span></a>`
      : `<div class="byline"><a href="#/profile/${esc(u.username)}">${avatar(u, 46)}</a><span><a href="#/profile/${esc(u.username)}"><b>${esc(u.name)}</b></a><small>@${esc(u.username)}</small></span>${U.followBtn(u.username)}</div>`;
    const tiles = [
      ["Prep time", mins(r.prep), "clock"], ["Cooking time", mins(r.cook), "flame"], ["Total time", mins(total), "clock"],
      ["Difficulty", r.diff, "bars"], ["Servings", `${r.serves} ${r.serves === 1 ? "serving" : "servings"}`, "users"],
    ];
    if (w && w.times.rest) tiles.splice(2, 0, ["Resting / soaking", mins(w.times.rest), "clock"]);
    const votes = c.likes + c.dislikes;   // no votes, no rating: nothing is invented
    const html = `
    <article class="recipe-page" data-key="${key}">
      <div class="wrap">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#/explore${r.source === "fixed" ? "?tab=fixed" : ""}">${r.source === "fixed" ? "Fixed recipes" : "Community"}</a>${icon("chev-right")}${(r.cats || [])[0] ? `<a href="#/explore?cat=${r.cats[0]}">${esc(Api.catName(r.cats[0]))}</a>${icon("chev-right")}` : ""}<span>${esc(r.title)}</span></nav>
        <div class="recipe-photo">${img(r, { w: 1600, h: 800, eager: true })}<span class="card-shade"></span></div>
        <div class="recipe-head">
          <div class="rh-main">
            <div class="chips-inline">${(r.cats || []).map((cid) => `<a class="mini-chip" href="#/explore?cat=${cid}">${esc(Api.catName(cid))}</a>`).join("")}${r.source === "fixed" ? '<span class="mini-chip is-official">Official recipe</span>' : ""}</div>
            <h1 dir="auto">${esc(w ? WD().recipeName(w, lang) : r.title)}</h1>
            ${w ? `<p class="origin-line"><span class="origin-flags">${WD().flags(w)}</span> ${esc(w.origin.countries.map((c2) => WD().countryName(c2, lang)).join(" · "))} · ${esc(w.origin.cuisine)}${w.local_name ? ` · <span dir="auto" class="local-name">${esc(w.local_name)}</span>` : ""}</p><div class="head-tools">${langBar()}<button type="button" class="btn btn-primary btn-sm" data-cook>${icon("flame")} Start cooking mode</button></div>` : ""}
            <p class="lead">${esc(r.desc)}</p>
            ${byline}
          </div>
          <div class="rh-side">
            <div class="rating" data-rating-key="${key}"><span class="rate-val">${votes ? icon("star", "i-fill star") + `<b>${Api.rating(r).toFixed(1)}</b>` : `<b class="muted">Not rated yet</b>`}</span><span><span data-key="${key}"><b data-count="likes">${fmt(c.likes)}</b></span> likes</span></div>
            <div class="rating-sub"><span data-key="${key}">${icon("comment")}<b data-count="comments">${fmt(c.comments)}</b></span><span data-key="${key}">${icon("eye")}<b data-count="views">${fmt(c.views)}</b></span></div>
            <div class="action-row">
              ${U.actBtn("like", r)}${U.actBtn("dislike", r)}${U.actBtn("save", r, { text: "Save", count: false, cls: "act-wide" })}${U.actBtn("share", r, { count: false, text: "Share", cls: "act-wide" })}
            </div>
          </div>
          <div class="stat-tiles">${tiles.map((t) => `<div class="tile">${icon(t[2])}<span>${t[0]}</span><b>${esc(t[1])}</b></div>`).join("")}</div>
        </div>

        <div class="recipe-cols">
          ${w ? worldIngredients(w, lang, r.serves) : `<aside class="ingredients">
            <h2>Ingredients</h2>
            <p class="muted small">For ${r.serves} ${r.serves === 1 ? "serving" : "servings"}. Tap to tick off as you go.</p>
            <ul>${(r.ing || []).map((t, i) => `<li><label class="ing"><input type="checkbox" aria-label="${esc(t)}"><span class="box">${icon("check")}</span><span class="ing-text">${esc(t)}</span></label></li>`).join("")}</ul>
          </aside>`}
          <section class="method">
            <h2>How to make it</h2>
            <ol class="steps">${w ? w.steps.map((st) => `<li data-step tabindex="0"><span class="num">${st.n}</span><p><b>${esc(st.title)}.</b> ${esc(st.text)}${st.minutes || st.temp_c ? `<small class="step-meta">${st.minutes ? "⏱ " + st.minutes + " min" : ""}${st.minutes && st.temp_c ? " · " : ""}${st.temp_c ? "🌡 " + st.temp_c + " °C" : ""}</small>` : ""}</p></li>`).join("") : (r.steps || []).map((s, i) => `<li data-step tabindex="0"><span class="num">${i + 1}</span><p>${esc(s)}</p></li>`).join("")}</ol>
            ${(r.tips || []).length ? `<div class="tips"><h3>${icon("sparkle")}Cooking tips</h3><ul>${r.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>` : ""}
            ${w ? worldExtras(w, lang) : ""}
            ${(r.tags || []).length ? `<div class="tag-row">${r.tags.map((t) => `<a class="mini-chip" href="#/explore?q=${encodeURIComponent(t)}">#${esc(String(t).replace(/\s+/g, ""))}</a>`).join("")}</div>` : ""}
          </section>
        </div>

        <section class="comments-section" id="comments">${U.commentsBlock(key)}</section>
      </div>
      ${related.length ? `<section class="section wrap">${U.sectionHead("Related recipes", "More like this.", "", "")}<div class="grid-cards">${related.map((x) => U.recipeCard(x)).join("")}</div></section>` : ""}
    </article>`;

    return {
      title: r.title, html,
      mount(root) {
        if (Api.view(key)) SC.sync();
        if (w) {
          let servings = r.serves; const MAXS = 48;
          const refresh = () => { const f = servings / w.servings;
            $$("[data-ing]", root).forEach((el) => { const i = w.ingredients[+el.dataset.ing]; el.firstChild.textContent = WD().ingredientLine(i, f, lang); });
            $("[data-serv-out]", root).innerHTML = `<b>${servings}</b> ${servings === 1 ? "serving" : "servings"}`;
            $("[data-serv=reset]", root).hidden = servings === w.servings; };
          const pageEl = $(".recipe-page", root);   // fresh element per render, so handlers never stack up across navigations
          pageEl.addEventListener("click", (e) => {
            const b = e.target.closest("[data-serv]"); if (b) { const v = b.dataset.serv; servings = v === "reset" ? w.servings : Math.min(MAXS, Math.max(1, servings + +v)); refresh(); }
            if (e.target.closest("[data-cook]")) openCooking(w, lang, servings);
          });
          const rf = $(".report-form", root);
          if (rf) rf.addEventListener("submit", async (e) => { e.preventDefault(); const res = await Api.reportRecipe(key, rf.reason.value, rf.details.value); toast(res.ok ? res.message : res.error, res.ok ? {} : { type: "error" }); if (res.ok) { rf.reset(); rf.closest("details").open = false; } });
        }
        $(".steps", root).addEventListener("click", (e) => { const li = e.target.closest("[data-step]"); if (li) li.classList.toggle("done"); });
        $(".steps", root).addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { const li = e.target.closest("[data-step]"); if (li) { e.preventDefault(); li.classList.toggle("done"); } } });
      },
    };
  }

  /* ==================================================================== */
  /* REELS                                                                 */
  /* ==================================================================== */
  function reelSlide(r, i) {
    const key = Api.keyOf(r), u = Api.author(r), rec = r.recipe ? Api.recipe(r.recipe) : null, blob = SC.runtime.blobs[r.id];
    return `<article class="reel" data-reel="${esc(r.id)}" data-key="${key}" data-dur="${r.dur || 30}" data-idx="${i}">
      <div class="reel-media">
        ${img(r, { w: 720, h: 1280, eager: i < 2 })}
        ${blob ? `<video class="reel-vid" src="${esc(blob)}" muted loop playsinline preload="auto"></video>` : ""}
        <span class="reel-shade"></span>
        <button class="reel-hit" data-reel-tap aria-label="Play or pause reel"></button>
        <span class="reel-state">${icon("play", "i-fill")}</span>
        <span class="reel-heart">${icon("heart", "i-fill")}</span>
        <div class="reel-info">
          <div class="reel-by">
            <a href="#/profile/${esc(u.username)}">${avatar(u, 38)}</a>
            <a class="reel-user" href="#/profile/${esc(u.username)}">@${esc(u.username)}</a>
            ${U.followBtn(u.username, { cls: "btn-sm btn-on-dark" })}
          </div>
          <h3>${esc(r.title)}</h3>
          <p class="reel-cap">${esc(r.cap || "")}</p>
          <p class="reel-tags">${(r.tags || []).map((t) => `<a href="#/explore?q=${encodeURIComponent(t)}">#${esc(t)}</a>`).join(" ")}</p>
          ${rec ? `<a class="reel-recipe" href="#/recipe/${esc(rec.id)}">${icon("utensils")}<span>Recipe: ${esc(rec.title)}</span>${icon("chev-right")}</a>` : ""}
        </div>
        <div class="reel-progress"><i></i></div>
      </div>
      <div class="reel-rail">
        ${U.actBtn("like", r)}${U.actBtn("dislike", r)}${U.actBtn("comment", r)}${U.actBtn("save", r)}${U.actBtn("share", r)}
      </div>
    </article>`;
  }

  function reels(ctx) {
    const list = Api.reels();
    const html = `
    <section class="reels-page" id="reels-page">
      <div class="reels-ambient" id="reels-ambient"></div>
      <div class="reels-feed" id="reels-feed" tabindex="0" aria-label="Reels feed. Use arrow keys to move between reels.">${list.map(reelSlide).join("")}</div>
      <div class="reels-nav">
        <button class="icon-btn" data-reel-nav="-1" aria-label="Previous reel">${icon("chev-up")}</button>
        <button class="icon-btn" data-reel-nav="1" aria-label="Next reel">${icon("chev-down")}</button>
      </div>
    </section>`;

    return {
      title: "Reels", html, wide: true,
      mount() {
        const page = $("#reels-page"), feed = $("#reels-feed"), ambient = $("#reels-ambient");
        const slides = $$(".reel", feed);
        let active = null, tapTimer = null, snapTimer = null;

        const restartBar = (el) => {
          const bar = $(".reel-progress i", el);
          bar.style.animation = "none"; void bar.offsetWidth;
          bar.style.animation = `reelbar ${el.dataset.dur}s linear infinite`;
        };
        const setActive = (el) => {
          if (active === el) return;
          if (active) { active.classList.remove("playing", "paused"); const pv = $("video", active); if (pv) pv.pause(); }
          active = el;
          el.classList.add("playing");
          const nv = $("video", el); if (nv) { nv.currentTime = 0; nv.play().catch(() => {}); }
          restartBar(el);
          const item = Api.item(el.dataset.key), im = $("img", el);
          if (im && im.src && !im.src.startsWith("data:")) ambient.style.backgroundImage = `url("${im.currentSrc || im.src}")`;
          else if (im) ambient.style.backgroundImage = `url("${im.src}")`;
          try { history.replaceState(null, "", "#/reels/" + encodeURIComponent(el.dataset.reel)); } catch (e) { /* ignore */ }
          if (item && Api.view(el.dataset.key)) SC.sync();
        };
        const io = new IntersectionObserver((entries) => {
          entries.forEach((en) => { if (en.isIntersecting && en.intersectionRatio >= 0.6) setActive(en.target); });
        }, { root: feed, threshold: [0.6] });
        slides.forEach((s) => io.observe(s));

        const toggle = (el) => {
          el.classList.toggle("paused"); el.classList.toggle("playing", !el.classList.contains("paused"));
          const v = $("video", el); if (v) { if (el.classList.contains("paused")) v.pause(); else v.play().catch(() => {}); }
        };
        feed.addEventListener("click", (e) => {
          const hit = e.target.closest("[data-reel-tap]"); if (!hit) return;
          const el = hit.closest(".reel");
          if (tapTimer) { // second tap = like
            clearTimeout(tapTimer); tapTimer = null;
            const heart = $(".reel-heart", el);
            heart.classList.remove("burst"); void heart.offsetWidth; heart.classList.add("burst");
            if (SC.actions.likeIfNot(el.dataset.key)) { /* liked */ }
          } else {
            tapTimer = setTimeout(() => { tapTimer = null; toggle(el); }, 230);
          }
        });
        const go = (dir) => {
          const i = Math.max(0, Math.min(slides.length - 1, (active ? +active.dataset.idx : 0) + dir));
          // Snapping is paused during the animation: mandatory snap can hijack programmatic smooth scrolls.
          feed.style.scrollSnapType = "none";
          feed.scrollTo({ top: slides[i].offsetTop, behavior: "smooth" });
          clearTimeout(snapTimer);
          snapTimer = setTimeout(() => { feed.style.scrollSnapType = ""; }, 700);
        };
        page.addEventListener("click", (e) => { const b = e.target.closest("[data-reel-nav]"); if (b) go(+b.dataset.reelNav); });
        const onKey = (e) => {
          if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.body.classList.contains("modal-open")) return;
          if (e.key === "ArrowDown" || e.key === "j") { e.preventDefault(); go(1); }
          else if (e.key === "ArrowUp" || e.key === "k") { e.preventDefault(); go(-1); }
          else if (e.key === " " && active) { e.preventDefault(); toggle(active); }
        };
        document.addEventListener("keydown", onKey);
        SC.cleanups.push(() => { io.disconnect(); document.removeEventListener("keydown", onKey); clearTimeout(tapTimer); clearTimeout(snapTimer); });

        const target = ctx.args[0] && feed.querySelector(`[data-reel="${CSS.escape(decodeURIComponent(ctx.args[0]))}"]`);
        if (target) feed.scrollTop = target.offsetTop; else if (slides[0]) setActive(slides[0]);
      },
    };
  }

  /* ==================================================================== */
  /* VIDEOS (list + watch page)                                            */
  /* ==================================================================== */
  function videos() {
    const all = Api.videos();
    const catIds = Array.from(new Set(all.flatMap((v) => v.cats || [])));
    let sel = "";
    const paint = () => {
      const list = Api.rank(all.filter((v) => !sel || (v.cats || []).includes(sel)), sel ? "newest" : "trending");
      $("#v-chips").innerHTML = `<button class="chip${!sel ? " on" : ""}" data-vcat="">All</button>` + catIds.map((c) => `<button class="chip${sel === c ? " on" : ""}" data-vcat="${c}">${esc(Api.catName(c))}</button>`).join("");
      $("#v-grid").innerHTML = list.length ? list.map((v) => U.videoCard(v)).join("") : U.emptyState("No videos here yet", "Be the first to upload one.", '<a class="btn btn-primary" href="#/create?type=video">Upload a video</a>');
    };
    return {
      title: "Videos",
      html: `<section class="wrap videos-page">
        <div class="page-head"><h1>Videos</h1><p>Full-length cooking tutorials and kitchen adventures.</p></div>
        <div class="cat-chips" id="v-chips"></div>
        <div class="grid-videos big" id="v-grid"></div>
      </section>`,
      mount(root) {
        paint();
        $("#v-chips").addEventListener("click", (e) => { const b = e.target.closest("[data-vcat]"); if (b) { sel = b.dataset.vcat; paint(); } });
      },
    };
  }

  function video(ctx) {
    const v = Api.video(decodeURIComponent(ctx.args[0]));
    if (!v) return notFound("video");
    const key = Api.keyOf(v), u = Api.author(v), c = Api.counts(v), s = Api.stats(u.username);
    const blob = SC.runtime.blobs[v.id];
    const next = Api.rank(Api.videos().filter((x) => x.id !== v.id), "trending").slice(0, 6);
    const links = (v.links || []).map((l) => ({ label: l.label, url: safeUrl(l.url) })).filter((l) => l.url);
    const player = blob
      ? `<div class="player is-native"><video src="${esc(blob)}" poster="${esc(v.ph && !String(v.ph).startsWith("data:") ? D.photoUrl(v.ph, 1280, 720) : v.ph || "")}" controls playsinline preload="metadata"></video></div>`
      : `<div class="player" id="player" data-dur="${v.dur}" tabindex="-1">
          ${img(v, { w: 1280, h: 720, cls: "player-poster", eager: true })}
          <span class="player-shade"></span>
          <button class="player-big" data-p="toggle" aria-label="Play video">${icon("play", "i-fill")}</button>
          <div class="player-bar">
            <button class="pbtn" data-p="toggle" aria-label="Play or pause"><span class="ic-play">${icon("play", "i-fill")}</span><span class="ic-pause">${icon("pause", "i-fill")}</span></button>
            <span class="ptime"><b id="p-cur">0:00</b><span> / ${dur(v.dur)}</span></span>
            <div class="ptrack" data-p="seek" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="${v.dur}" aria-valuenow="0"><div class="pfill" id="p-fill"></div><div class="pknob" id="p-knob"></div></div>
            <button class="pbtn ptxt" data-p="speed" aria-label="Playback speed">1×</button>
            <button class="pbtn" data-p="full" aria-label="Fullscreen">${icon("fullscreen")}</button>
          </div>
        </div>`;
    const html = `
    <article class="wrap watch" data-key="${key}">
      <div class="watch-main">
        ${player}
        <h1 class="watch-title">${esc(v.title)}</h1>
        <div class="watch-row">
          <div class="channel">
            <a href="#/profile/${esc(u.username)}">${avatar(u, 46)}</a>
            <span><a href="#/profile/${esc(u.username)}"><b>${esc(u.name)}</b></a><small><span data-user="${esc(u.username)}" data-ustat="followers">${fmt(s.followers)}</span> followers</small></span>
            ${U.followBtn(u.username)}
          </div>
          <div class="action-row">
            ${U.actBtn("like", v)}${U.actBtn("dislike", v)}${U.actBtn("comment", v, { text: "Comment", count: true })}${U.actBtn("save", v, { text: "Save", count: false, cls: "act-wide" })}${U.actBtn("share", v, { text: "Share", count: false, cls: "act-wide" })}
          </div>
        </div>
        <div class="desc-card">
          <p class="desc-stats"><span data-key="${key}">${icon("eye")}<b data-count="views">${fmt(c.views)}</b> views</span><span>${ago(v.createdAt)}</span><span>${(v.cats || []).map((cid) => `<a href="#/explore?cat=${cid}">${esc(Api.catName(cid))}</a>`).join(", ")}</span></p>
          <p class="desc-text">${esc(v.desc || "").replace(/\n/g, "<br>")}</p>
          ${(v.tags || []).length ? `<p class="hashtags">${v.tags.map((t) => `<a href="#/explore?q=${encodeURIComponent(t)}">#${esc(String(t).replace(/\s+/g, ""))}</a>`).join(" ")}</p>` : ""}
          ${links.length ? `<div class="link-list">${links.map((l) => `<a class="link-chip" href="${esc(l.url)}" ${l.url.startsWith("#") ? "" : 'target="_blank" rel="noopener noreferrer"'}>${icon("link")}${esc(l.label)}</a>`).join("")}</div>` : ""}
        </div>
        <section class="comments-section" id="comments">${U.commentsBlock(key)}</section>
      </div>
      <aside class="watch-side"><h3 class="mini-title">Up next</h3>${next.map((x) => U.videoCard(x, { compact: true })).join("")}</aside>
    </article>`;

    return {
      title: v.title, html,
      mount(root) {
        const nativeVid = $("video", root);
        if (nativeVid) { nativeVid.addEventListener("play", () => { if (Api.view(key)) SC.sync(); }, { once: true }); return; }
        const el = $("#player", root), total = v.dur, cur = $("#p-cur", root), fill = $("#p-fill", root), knob = $("#p-knob", root), track = $(".ptrack", el);
        let t = 0, playing = false, speed = 1, timer = null;
        const speeds = [1, 1.5, 2, 4];
        const paint = () => {
          const pct = total ? (t / total) * 100 : 0;
          fill.style.width = pct + "%"; knob.style.left = pct + "%";
          cur.textContent = dur(t); track.setAttribute("aria-valuenow", Math.round(t));
        };
        const stop = () => { playing = false; clearInterval(timer); el.classList.remove("playing"); };
        const play = () => {
          if (t >= total) t = 0;
          playing = true; el.classList.add("playing", "started");
          clearInterval(timer);
          timer = setInterval(() => { t = Math.min(total, t + 0.25 * speed); paint(); if (t >= total) { stop(); el.classList.add("ended"); } }, 250);
          el.classList.remove("ended");
          if (Api.view(key)) SC.sync();
        };
        const seekTo = (clientX) => { const r = track.getBoundingClientRect(); t = Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * total; el.classList.remove("ended"); paint(); };
        el.addEventListener("click", (e) => {
          const b = e.target.closest("[data-p]"); if (!b) return;
          const k = b.dataset.p;
          if (k === "toggle") playing ? stop() : play();
          else if (k === "seek") seekTo(e.clientX);
          else if (k === "speed") { speed = speeds[(speeds.indexOf(speed) + 1) % speeds.length]; b.textContent = speed + "×"; }
          else if (k === "full") { (document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen && el.requestFullscreen()); }
        });
        track.addEventListener("keydown", (e) => {
          if (e.key === "ArrowRight") { t = Math.min(total, t + 10); paint(); e.preventDefault(); }
          if (e.key === "ArrowLeft") { t = Math.max(0, t - 10); paint(); e.preventDefault(); }
        });
        SC.cleanups.push(() => clearInterval(timer));
      },
    };
  }

  /* ==================================================================== */
  /* CREATE                                                                */
  /* ==================================================================== */
  const drop = (name, label, accept, hint, kind) => `
    <label class="drop" data-drop="${name}">
      <input type="file" name="${name}" accept="${accept}" data-file="${name}" hidden>
      <span class="drop-empty">${icon(kind === "video" ? "video" : "image")}<b>${label}</b><span>${hint}</span></span>
      <span class="drop-preview"></span>
    </label>`;
  const row = (kind, val) => kind === "ing"
    ? `<div class="row-item"><input name="ing" type="text" placeholder="e.g. 200 g spaghetti" value="${esc(val || "")}" maxlength="120" aria-label="Ingredient"><button type="button" class="icon-btn" data-act="rm-row" aria-label="Remove ingredient">${icon("x")}</button></div>`
    : `<div class="row-item is-step"><span class="row-num"></span><textarea name="step" rows="2" placeholder="Describe this step" maxlength="600" aria-label="Step">${esc(val || "")}</textarea><button type="button" class="icon-btn" data-act="rm-row" aria-label="Remove step">${icon("x")}</button></div>`;
  const catSelect = () => `<select id="f-category" name="category">${D.CATEGORIES.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select>`;

  const CREATE_TYPES = [
    { id: "recipe", label: "Recipe", ic: "utensils", desc: "Ingredients, steps and tips for a dish." },
    { id: "reel", label: "Reel", ic: "reels", desc: "A short vertical clip with a caption." },
    { id: "video", label: "Video", ic: "video", desc: "A long-form tutorial or cooking story." },
  ];

  function createForm(type) {
    if (type === "recipe") {
      return `<form class="form-card" data-form="create" data-type="recipe" novalidate>
        <div class="form-grid">
          <div class="form-col">
            ${field("title", "Recipe title", '<input id="f-title" name="title" type="text" maxlength="80" placeholder="e.g. Smoky Chicken Tacos" required>')}
            <div class="field"><label>Food photo</label>${drop("photo", "Add a food photo", "image/*", "JPG or PNG. Natural light and a close-up work best.", "image")}</div>
            <div class="field-row">
              ${field("prep", "Preparation time (min)", '<input id="f-prep" name="prep" type="number" min="0" max="1440" value="15" inputmode="numeric">')}
              ${field("cook", "Cooking time (min)", '<input id="f-cook" name="cook" type="number" min="0" max="1440" value="30" inputmode="numeric">')}
            </div>
            <div class="field-row">
              ${field("servings", "Servings", '<input id="f-servings" name="servings" type="number" min="1" max="50" value="4" inputmode="numeric">')}
              <div class="field"><label>Difficulty</label><div class="seg-radio" role="radiogroup" aria-label="Difficulty">${["Easy", "Medium", "Hard"].map((d, i) => `<label><input type="radio" name="difficulty" value="${d}" ${i === 0 ? "checked" : ""}><span>${d}</span></label>`).join("")}</div></div>
            </div>
            <div class="field-row">
              ${field("category", "Category", catSelect())}
              ${field("tags", "Tags", '<input id="f-tags" name="tags" type="text" placeholder="spicy, weeknight, tacos" maxlength="100">', "Separate with commas.")}
            </div>
          </div>
          <div class="form-col">
            <div class="field" data-field="ing"><label>Ingredients</label><div class="rows" data-rows="ing">${row("ing")}${row("ing")}${row("ing")}</div><button type="button" class="btn btn-ghost btn-sm" data-act="add-row" data-kind="ing">${icon("plus")}Add ingredient</button><p class="field-msg" role="alert"></p></div>
            <div class="field" data-field="step"><label>Steps</label><div class="rows" data-rows="step">${row("step")}${row("step")}</div><button type="button" class="btn btn-ghost btn-sm" data-act="add-row" data-kind="step">${icon("plus")}Add step</button><p class="field-msg" role="alert"></p></div>
            ${field("tips", "Cooking tips", '<textarea id="f-tips" name="tips" rows="3" placeholder="One tip per line" maxlength="800"></textarea>', "Optional. One tip per line.")}
          </div>
        </div>
        <div class="form-actions"><button class="btn btn-primary btn-lg" type="submit">Publish recipe</button></div>
      </form>`;
    }
    const note = `<p class="note">${icon("info")}Prototype: video files aren't uploaded anywhere. The video plays during this session, while the cover and details are saved in your browser.</p>`;
    if (type === "reel") {
      return `<form class="form-card narrow" data-form="create" data-type="reel" novalidate>
        <div class="form-grid">
          <div class="form-col">
            ${field("title", "Title", '<input id="f-title" name="title" type="text" maxlength="80" placeholder="e.g. 3 Minute Creamy Pasta" required>')}
            <div class="field"><label>Video</label>${drop("video", "Upload a vertical video", "video/*", "MP4 or MOV, up to 90 seconds.", "video")}${note}</div>
            <div class="field"><label>Cover image</label>${drop("cover", "Add a cover image", "image/*", "Auto-filled from your video when possible.", "image")}</div>
          </div>
          <div class="form-col">
            ${field("caption", "Caption", '<textarea id="f-caption" name="caption" rows="4" maxlength="300" placeholder="Tell people what you are making"></textarea>')}
            ${field("hashtags", "Hashtags", '<input id="f-hashtags" name="hashtags" type="text" placeholder="#pasta #quickmeals" maxlength="100">')}
            ${field("recipe", "Link a recipe (optional)", `<select id="f-recipe" name="recipe"><option value="">No linked recipe</option>${Api.recipes().slice().sort((a, b) => a.title.localeCompare(b.title)).map((r) => `<option value="${esc(r.id)}">${esc(r.title)}</option>`).join("")}</select>`)}
          </div>
        </div>
        <div class="form-actions"><button class="btn btn-primary btn-lg" type="submit">Post reel</button></div>
      </form>`;
    }
    return `<form class="form-card narrow" data-form="create" data-type="video" novalidate>
      <div class="form-grid">
        <div class="form-col">
          ${field("title", "Title", '<input id="f-title" name="title" type="text" maxlength="100" placeholder="e.g. Complete Pasta Tutorial" required>')}
          <div class="field"><label>Video</label>${drop("video", "Upload your video", "video/*", "Any length. MP4 or MOV works best.", "video")}${note}</div>
          <div class="field"><label>Thumbnail</label>${drop("cover", "Add a thumbnail", "image/*", "Auto-filled from your video when possible.", "image")}</div>
        </div>
        <div class="form-col">
          ${field("category", "Category", catSelect())}
          ${field("description", "Description", '<textarea id="f-description" name="description" rows="4" maxlength="1500" placeholder="What will people learn?"></textarea>')}
          ${field("hashtags", "Hashtags", '<input id="f-hashtags" name="hashtags" type="text" placeholder="#tutorial #baking" maxlength="100">')}
          ${field("links", "Links", '<textarea id="f-links" name="links" rows="3" placeholder="Label | https://example.com (one per line)" maxlength="600"></textarea>', "Optional. One link per line.")}
        </div>
      </div>
      <div class="form-actions"><button class="btn btn-primary btn-lg" type="submit">Publish video</button></div>
    </form>`;
  }

  function create(ctx) {
    const me = Api.me();
    if (!me) {
      return {
        title: "Create",
        html: `<section class="wrap narrow-page">${U.emptyState("Log in to start creating", "Create a free account to share recipes, reels and videos with the community.", '<div class="btn-row"><a class="btn btn-primary" href="#/signup">Create account</a><a class="btn btn-ghost" href="#/login">Log in</a></div>')}</section>`,
      };
    }
    const type = CREATE_TYPES.some((t) => t.id === ctx.params.get("type")) ? ctx.params.get("type") : "recipe";
    SC.draft = {};
    return {
      title: "Create",
      html: `<section class="wrap create">
        <div class="page-head"><h1>Create</h1><p>Share something delicious with the community.</p></div>
        <div class="type-picker" role="tablist">${CREATE_TYPES.map((t) => `<a role="tab" aria-selected="${t.id === type}" class="type-card${t.id === type ? " on" : ""}" href="#/create?type=${t.id}"><span class="tc-ic">${icon(t.ic)}</span><span><b>${t.label}</b><small>${t.desc}</small></span></a>`).join("")}</div>
        ${createForm(type)}
      </section>`,
    };
  }

  /* ==================================================================== */
  /* AUTH                                                                  */
  /* ==================================================================== */
  const authShell = (title, sub, inner, foot) => `
    <section class="auth">
      <div class="auth-art">${photo("authBg", "italian", "auth-bg", { w: 1200, h: 1400, alt: "", eager: true })}<span class="auth-shade"></span>
        <div class="auth-quote"><b>Cook something amazing.</b><span>Recipes, reels and videos from people who love food.</span></div>
      </div>
      <div class="auth-panel"><div class="auth-card">
        <a class="brand" href="#/"><img class="brand-mark" src="assets/logo.svg" alt="" width="36" height="36"><span class="brand-word">Simple Cook</span></a>
        <h1>${title}</h1><p class="auth-sub">${sub}</p>
        ${inner}
        <p class="auth-foot">${foot}</p>
      </div></div>
    </section>`;
  const pwField = (id, label, extra) => field(id, label, `<div class="pw"><input id="f-${id}" name="${id}" type="password" autocomplete="${id === "password" ? "current-password" : "new-password"}" placeholder="At least 8 characters"><button type="button" class="icon-btn" data-act="toggle-pw" aria-label="Show password">${icon("eye")}</button></div>${extra || ""}`);

  function login() {
    return {
      title: "Log in",
      html: authShell("Welcome back", "Log in to like, save, comment and follow.",
        `<form data-form="login" novalidate>
          ${field("identifier", EMAIL_ONLY ? "Email" : "Username or email", EMAIL_ONLY ? '<input id="f-identifier" name="identifier" type="email" autocomplete="email" placeholder="you@email.com">' : '<input id="f-identifier" name="identifier" type="text" autocomplete="username" placeholder="' + (REAL ? "username or you@email.com" : "anis or you@email.com") + '">')}
          ${pwField("password", "Password")}
          <div class="auth-row"><a href="#/forgot">Forgot password?</a></div>
          <p class="form-error" role="alert"></p>
          <button class="btn btn-primary btn-lg btn-block" type="submit">Log in</button>
        </form>
        ${REAL ? "" : `<div class="demo-box">${icon("info")}<span>Want a quick look? Use the demo account <b>anis</b> / <b>demo1234</b>.</span><button type="button" class="link-btn" data-act="fill-demo">Fill it in</button></div>`}`,
        `New here? <a href="#/signup">Create an account</a>`),
    };
  }
  function signup() {
    return {
      title: "Sign up",
      html: authShell("Join Simple Cook", "Pick a username and start sharing your food.",
        `<form data-form="signup" novalidate>
          <div class="avatar-pick"><label class="drop round" data-drop="avatar"><input type="file" name="avatar" accept="image/*" data-file="avatar" hidden><span class="drop-empty">${icon("user")}</span><span class="drop-preview"></span></label><div><b>Profile picture</b><small>Optional. You can change it later.</small></div></div>
          ${field("username", "Username", '<div class="prefix"><span>@</span><input id="f-username" name="username" type="text" autocomplete="username" maxlength="20" placeholder="yourname"></div>', "3 to 20 letters, numbers, dots or underscores.")}
          ${field("email", "Email", '<input id="f-email" name="email" type="email" autocomplete="email" placeholder="you@email.com">')}
          ${pwField("password", "Password", '<div class="pw-meter" aria-hidden="true"><i></i></div>')}
          ${pwField("confirm", "Confirm password")}
          <p class="form-error" role="alert"></p>
          <button class="btn btn-primary btn-lg btn-block" type="submit">Create account</button>
        </form>`,
        `Already have an account? <a href="#/login">Log in</a>`),
    };
  }
  function forgot() {
    return {
      title: "Forgot password",
      html: authShell("Reset your password", "Enter your email and we'll send you a reset code.",
        `<div id="forgot-body"><form data-form="forgot1" novalidate>
          ${field("email", "Email", '<input id="f-email" name="email" type="email" autocomplete="email" placeholder="you@email.com">')}
          <p class="form-error" role="alert"></p>
          <button class="btn btn-primary btn-lg btn-block" type="submit">Send reset code</button>
        </form></div>`,
        `Remembered it? <a href="#/login">Back to log in</a>`),
    };
  }
  const forgotStep2 = (email) => `<form data-form="forgot2" data-email="${esc(email)}" novalidate>
      <div class="demo-box">${icon("mail-check")}<span>Code sent to <b>${esc(email)}</b>.</span></div>
      ${field("code", "Reset code", '<input id="f-code" name="code" type="text" inputmode="numeric" maxlength="6" placeholder="6-digit code" autocomplete="one-time-code">')}
      ${pwField("password", "New password")}
      <p class="form-error" role="alert"></p>
      <button class="btn btn-primary btn-lg btn-block" type="submit">Set new password</button>
    </form>`;

  /* ==================================================================== */
  /* PROFILE                                                               */
  /* ==================================================================== */
  function profileTab(u, tab) {
    const own = Api.me() && Api.me().username === u.username;
    if (tab === "saved") {
      const saved = Api.saved();
      if (!saved.length) return U.emptyState("Nothing saved yet", "Tap the bookmark on any recipe, reel or video to keep it here.", '<a class="btn btn-primary" href="#/explore">Explore recipes</a>');
      const rs = saved.filter((i) => i.type === "recipe"), rl = saved.filter((i) => i.type === "reel"), vs = saved.filter((i) => i.type === "video");
      return (rs.length ? `<h3 class="mini-title">Recipes</h3><div class="grid-cards">${rs.map((r) => U.recipeCard(r)).join("")}</div>` : "")
        + (rl.length ? `<h3 class="mini-title">Reels</h3><div class="grid-reels">${rl.map((r) => `<div class="reel-wrap">${U.reelTile(r)}</div>`).join("")}</div>` : "")
        + (vs.length ? `<h3 class="mini-title">Videos</h3><div class="grid-videos">${vs.map((v) => U.videoCard(v)).join("")}</div>` : "");
    }
    const type = tab === "reels" ? "reel" : tab === "videos" ? "video" : "recipe";
    const list = Api.rank(Api.itemsBy(u.username, type), "newest");
    if (!list.length) {
      return U.emptyState(own ? `No ${tab} yet` : `@${u.username} hasn't posted ${tab} yet`, own ? "Share your first one. It only takes a minute." : "Check back soon.", own ? `<a class="btn btn-primary" href="#/create?type=${type}">Create ${type}</a>` : "");
    }
    if (type === "recipe") return `<div class="grid-cards">${list.map((r) => U.recipeCard(r, { deletable: true })).join("")}</div>`;
    if (type === "reel") return `<div class="grid-reels">${list.map((r) => `<div class="reel-wrap">${U.reelTile(r, { deletable: true })}</div>`).join("")}</div>`;
    return `<div class="grid-videos">${list.map((v) => U.videoCard(v, { deletable: true })).join("")}</div>`;
  }

  function profile(ctx) {
    const me = Api.me();
    const u = Api.user(decodeURIComponent(ctx.args[0]));
    if (!u || u.official) return notFound("profile");
    const own = !!(me && me.username === u.username);
    const s = Api.stats(u.username);
    let tab = ["recipes", "reels", "videos", "saved"].includes(ctx.params.get("tab")) ? ctx.params.get("tab") : "recipes";
    if (tab === "saved" && !own) tab = "recipes";
    const counts = { recipes: Api.itemsBy(u.username, "recipe").length, reels: Api.itemsBy(u.username, "reel").length, videos: Api.itemsBy(u.username, "video").length, saved: own ? Api.saved().length : 0 };
    const top = Api.rank(Api.itemsBy(u.username, "recipe").concat(Api.itemsBy(u.username, "reel")), "trending")[0];
    const hue = u.hue != null ? u.hue : Api.hash(u.username) % 360;
    const tabs = ["recipes", "reels", "videos"].concat(own ? ["saved"] : []);

    const html = `
    <section class="profile" data-user-page="${esc(u.username)}">
      <div class="profile-cover" style="--hue:${hue}">${top ? img(top, { w: 1600, h: 420, alt: "" }) : ""}<span></span></div>
      <div class="wrap">
        <div class="profile-head">
          <div class="profile-avatar">${avatar(u, 132, "ring xl")}</div>
          <div class="profile-id">
            <h1>${esc(u.name)}</h1>
            <p class="handle">@${esc(u.username)}${u.seed ? `<span class="pill-verified" title="Featured creator">${icon("check")}Creator</span>` : ""}</p>
            <p class="bio">${esc(u.bio || "")}</p>
          </div>
          <div class="profile-actions">
            ${own ? `<button class="btn btn-ghost" data-act="edit-profile">${icon("edit")}Edit profile</button><button class="btn btn-ghost" data-act="logout">${icon("logout")}Log out</button>` : U.followBtn(u.username, { cls: "btn-lg" }) + `<button class="btn btn-ghost btn-lg" data-act="share-profile" data-user="${esc(u.username)}">${icon("share")}Share</button>`}
          </div>
        </div>
        <div class="pstats">
          <div><b data-user="${esc(u.username)}" data-ustat="followers">${fmt(s.followers)}</b><span>Followers</span></div>
          <div><b data-user="${esc(u.username)}" data-ustat="following">${fmt(s.following)}</b><span>Following</span></div>
          <div class="pstat-points"><b data-user="${esc(u.username)}" data-ustat="points">${fmtFull(s.points)}</b><span>Points<button class="info-btn" data-act="points-info" aria-label="How points work">${icon("info")}</button></span></div>
        </div>
        <div class="tabs" role="tablist" id="ptabs">${tabs.map((t) => `<button role="tab" aria-selected="${t === tab}" class="tab${t === tab ? " on" : ""}" data-ptab="${t}">${t[0].toUpperCase() + t.slice(1)}<span>${counts[t]}</span></button>`).join("")}</div>
        <div class="tab-body" id="profile-content">${profileTab(u, tab)}</div>
      </div>
    </section>`;

    return {
      title: `${u.name} (@${u.username})`, html,
      mount(root) {
        $("#ptabs", root).addEventListener("click", (e) => {
          const b = e.target.closest("[data-ptab]"); if (!b) return;
          tab = b.dataset.ptab;
          $$(".tab", root).forEach((t) => { const on = t === b; t.classList.toggle("on", on); t.setAttribute("aria-selected", on); });
          $("#profile-content", root).innerHTML = profileTab(u, tab);
          try { history.replaceState(null, "", `#/profile/${u.username}${tab === "recipes" ? "" : "?tab=" + tab}`); } catch (er) { /* ignore */ }
        });
      },
      refreshTab: () => { $("#profile-content").innerHTML = profileTab(u, tab); },
    };
  }

  /* ==================================================================== */
  /* Recipe extras (Phase 2): language bar, ingredients/serving scaler, cooking mode */
  /* ==================================================================== */
  const WD = () => SC.World;
  const langBar = () => {
    const cur = WD().lang();
    return `<div class="lang-switch" role="group" aria-label="Language">${WD().LANGS.map((l) => `<button type="button" data-act="lang" data-lang="${l}" class="${l === cur ? "on" : ""}" lang="${l}" aria-pressed="${l === cur}">${l.toUpperCase()}</button>`).join("")}</div>`;
  };
  /* ---- recipe page pieces for world recipes ---- */
  const CONF_LABEL = { high: "Well documented", medium: "Reasonably documented, details vary", disputed: "Shared or disputed origin", low: "Origin uncertain" };
  const dietChips = (w) => WD().diets.filter(([k]) => w.diet[k]).map(([k, n]) => `<span class="mini-chip ok">${esc(n)}</span>`).join("");
  function worldIngredients(w, lang, servings) {
    const f = servings / w.servings;
    return `<aside class="ingredients" ${lang === "ar" ? 'dir="rtl"' : ""}>
      <h2>Ingredients</h2>
      <div class="serv-ctl" role="group" aria-label="Servings"><button type="button" data-serv="-1" aria-label="Fewer servings">−</button><output data-serv-out aria-live="polite"><b>${servings}</b> ${servings === 1 ? "serving" : "servings"}</output><button type="button" data-serv="1" aria-label="More servings">+</button><button type="button" class="link-btn" data-serv="reset"${servings === w.servings ? " hidden" : ""}>Reset</button></div>
      ${lang !== "en" ? `<p class="muted small lang-note" dir="${lang === "ar" ? "rtl" : "ltr"}">${lang === "fr" ? "Les étapes, descriptions et notes de préparation sont encore en anglais. Les noms des plats et des ingrédients sont traduits (traductions à relire)." : "الخطوات والأوصاف وملاحظات التحضير متوفرة بالإنجليزية حاليا. أسماء الأطباق والمكونات مترجمة (الترجمات قيد المراجعة)."}</p>` : ""}
      <p class="muted small">Original recipe: ${w.servings} ${w.servings === 1 ? "serving" : "servings"}. Quantities update automatically. Tap to tick off as you go.</p>
      <ul>${w.ingredients.map((i, k) => { const t = WD().ingredientLine(i, f, lang); return `<li><label class="ing"><input type="checkbox" aria-label="${esc(t)}"><span class="box">${icon("check")}</span><span class="ing-text" data-ing="${k}" dir="auto">${esc(t)}${i.optional ? ' <em class="opt">(optional)</em>' : ""}</span></label></li>`; }).join("")}</ul>
    </aside>`;
  }
  function worldExtras(w, lang) {
    const origin = w.origin, ctry = origin.countries.map((c) => `${WD().flag(c)} ${esc(WD().countryName(c, "en"))}`).join(" · ");
    const subs = w.substitutions.map((s) => `<li><b>${esc(WD().ingredientName(s.from, lang))}</b> → ${esc(WD().ingredientName(s.to, lang))}${s.note ? `: ${esc(s.note)}` : ""}</li>`).join("");
    const refs = w.refs.length ? w.refs.map((u) => `<li><a href="${esc(safeUrl(u))}" target="_blank" rel="noopener noreferrer">${esc(u.replace(/^https:\/\//, ""))}</a></li>`).join("") : "<li>No source URL has been recorded for this recipe yet. Origin information is from general culinary knowledge and is awaiting verification.</li>";
    return `
      <section class="world-extra" data-extra>
        <div class="notice">${icon("info")}<span><b>Editorial draft.</b> ${esc(w.review.note)} Please <a href="#report">report anything that looks wrong</a>.</span></div>
        <h3>Where it comes from</h3>
        <p class="origin-line"><span class="origin-flags">${ctry}</span> <span class="mini-chip">${esc(CONF_LABEL[origin.confidence])}</span> <span class="mini-chip">${esc(origin.cuisine)}</span></p>
        <p>${esc(origin.note)}</p>
        ${w.mistakes.length ? `<h3>Common mistakes</h3><ul>${w.mistakes.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
        ${subs ? `<h3>Substitutions</h3><ul>${subs}</ul>` : ""}
        <h3>Storage and reheating</h3><p>${esc(w.storage)} ${esc(w.reheat)}</p>
        <h3>Allergens and diet</h3>
        <p>${w.allergens.length ? `Contains (from listed ingredients): <b>${esc(w.allergens.join(", "))}</b>.` : "No major allergens in the listed ingredients."} ${w.contains.includes("pork") ? "<b>Contains pork.</b> " : ""}${w.contains.includes("alcohol") ? "<b>Contains alcohol.</b> " : ""}</p>
        <div class="chips-inline">${dietChips(w)}</div>
        <p class="muted small">Derived from ingredient data. Packaged stocks, sauces and pastes vary by brand and cross-contamination is possible, so always check labels. This is not medical advice.</p>
        <h3>Nutrition</h3><p class="muted">Nutrition information is not available for this recipe yet. We only publish values that are calculated from a reliable food-composition source and labelled as calculated or estimated.</p>
        <h3>Sources</h3><ul class="small">${refs}</ul>
        <details class="report-box" id="report"><summary>Report an inaccuracy</summary>
          <form class="report-form"><label>What is wrong? <select name="reason"><option value="inaccurate_recipe">Ingredients or method</option><option value="wrong_origin">Origin or country</option><option value="unsafe_instructions">Unsafe instruction</option><option value="other">Something else</option></select></label>
          <label>Details <textarea name="details" rows="3" maxlength="1000" placeholder="Tell us what to fix"></textarea></label><button class="btn btn-primary btn-sm" type="submit">Send report</button></form></details>
      </section>`;
  }
  function openCooking(w, lang, servings) {
    const steps = w.steps; let i = 0, timer = null, left = 0, wake = null;
    const root = document.createElement("div"); root.className = "cook-mode"; root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.setAttribute("aria-label", "Cooking mode");
    document.body.appendChild(root); document.body.classList.add("no-scroll");
    const f = servings / w.servings, clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    function draw() {
      const s = steps[i];
      root.innerHTML = `<div class="cm-top"><b dir="auto">${esc(WD().recipeName(w, lang))}</b><span>Step ${i + 1} of ${steps.length}</span><button type="button" data-cm="ings" class="btn btn-ghost btn-sm">Ingredients</button><button type="button" data-cm="close" class="btn btn-ghost btn-sm" aria-label="Close cooking mode">Close</button></div>
        <div class="cm-bar"><i style="width:${((i + 1) / steps.length) * 100}%"></i></div>
        <div class="cm-body"><h2>${esc(s.title)}</h2>
          ${s.temp_c ? `<p class="cm-temp">${icon("flame")} ${s.temp_c} °C</p>` : ""}
          <p class="cm-text">${esc(s.text)}</p>
          ${s.minutes ? `<div class="cm-timer"><output data-cm-time aria-live="off">${clock(left || s.minutes * 60)}</output><button type="button" class="btn btn-primary" data-cm="timer">${timer ? "Pause" : "Start timer"}</button><button type="button" class="btn btn-ghost" data-cm="reset">Reset</button></div>` : ""}
          ${i < steps.length - 1 ? `<p class="muted cm-next">Next: ${esc(steps[i + 1].title)}</p>` : '<p class="cm-next">Last step. Enjoy!</p>'}</div>
        <div class="cm-nav"><button type="button" class="btn btn-ghost" data-cm="prev"${i === 0 ? " disabled" : ""}>Previous</button><button type="button" class="btn btn-primary" data-cm="next">${i === steps.length - 1 ? "Finish" : "Next step"}</button></div>
        <div class="cm-ings" hidden dir="${lang === "ar" ? "rtl" : "auto"}"><h3>Ingredients (${servings} ${servings === 1 ? "serving" : "servings"})</h3><ul>${w.ingredients.map((x) => `<li>${esc(WD().ingredientLine(x, f, lang))}</li>`).join("")}</ul></div>`;
    }
    function stop() { clearInterval(timer); timer = null; }
    function go(d) { stop(); left = 0; i = Math.min(steps.length - 1, Math.max(0, i + d)); draw(); }
    function close() { stop(); root.remove(); document.body.classList.remove("no-scroll"); document.removeEventListener("keydown", key); if (wake) { try { wake.release(); } catch (e) { /* ignore */ } } }
    function key(e) { if (e.key === "Escape") close(); else if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1); }
    root.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cm]"); if (!b) return; const a = b.dataset.cm;
      if (a === "close") close(); else if (a === "next") { if (i === steps.length - 1) close(); else go(1); } else if (a === "prev") go(-1);
      else if (a === "ings") { const p = $(".cm-ings", root); p.hidden = !p.hidden; }
      else if (a === "reset") { stop(); left = 0; draw(); }
      else if (a === "timer") {
        if (timer) { stop(); draw(); return; }
        if (!left) left = steps[i].minutes * 60;
        timer = setInterval(() => { left--; const o = $("[data-cm-time]", root); if (o) o.textContent = clock(Math.max(left, 0)); if (left <= 0) { stop(); left = 0; if (navigator.vibrate) navigator.vibrate([300, 150, 300]); toast("Timer finished: " + steps[i].title); draw(); } }, 1000);
        draw();
      }
    });
    document.addEventListener("keydown", key); draw();
    if (navigator.wakeLock) navigator.wakeLock.request("screen").then((l) => { wake = l; }, () => {});
    $("[data-cm=next]", root).focus();
  }

  /* ==================================================================== */
  function notFound(what) {
    return {
      title: "Not found",
      html: `<section class="wrap narrow-page">${U.emptyState("We couldn't find that " + what, "It may have been removed, or the link is wrong.", '<a class="btn btn-primary" href="#/">Back to home</a>')}</section>`,
    };
  }

  SC.views = { home, explore, recipe, reels, videos, video, create, login, signup, forgot, forgotStep2, profile, notFound, createForm, row, profileTab };
})();
