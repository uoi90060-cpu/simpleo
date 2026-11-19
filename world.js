/* ==========================================================================
   SIMPLE COOK — world recipes data layer (world.js)
   Wraps data/world.js (generated) + lib/recipe-core.js: language, names, search, country index.
   Local demo mode: world recipes are also registered as official recipe items so likes/saves/comments/points work.
   Supabase mode: social items come from the database catalog; rich fields (origin, scaling data) come from this file by slug.
   ========================================================================== */
(function () {
  "use strict";
  const SC = (window.SC = window.SC || {}), W = window.SC_WORLD, core = window.SC_CORE, D = window.SC_DATA;
  const LANGS = ["en", "fr", "ar"], LANG_LABEL = { en: "English", fr: "Français", ar: "العربية" };
  const norm = core ? core.norm : (s) => String(s || "").toLowerCase();
  const World = { available: !!(W && core), LANGS, LANG_LABEL };
  SC.World = World;
  if (!World.available) return;

  const bySlug = new Map(W.recipes.map((r) => [r.slug, r]));
  World.get = (slug) => bySlug.get(slug) || null;
  World.all = () => W.recipes;

  /* ---------- language ---------- */
  World.lang = () => { try { const l = localStorage.getItem("sc.lang"); return LANGS.includes(l) ? l : "en"; } catch (e) { return "en"; } };
  World.setLang = (l) => { try { localStorage.setItem("sc.lang", l); } catch (e) { /* ignore */ } };
  World.dir = (l) => ((l || World.lang()) === "ar" ? "rtl" : "ltr");

  /* ---------- names ---------- */
  World.recipeName = (r, l) => (r.names && r.names[l || World.lang()]) || r.name;
  World.countryName = (c, l) => { const x = W.countries[c]; return x ? x[l || World.lang()] || x.en : c; };
  World.regionName = (id, l) => { const x = W.regions[id]; if (!x) return id; return x[{ en: 0, fr: 1, ar: 2 }[l || World.lang()]] || x[0]; };
  World.ingredientName = (id, l) => { const x = W.ingredients[id]; return x ? x[l || World.lang()] || x.en : id; };
  World.flag = (c) => (/^[A-Z]{2}$/.test(c) ? String.fromCodePoint(...[...c].map((ch) => 127397 + ch.charCodeAt(0))) : "");
  World.flags = (r) => r.origin.countries.map(World.flag).join(" ");
  World.cuisineName = (id) => W.cuisines[id] || id;
  World.diets = [["vegetarian", "Vegetarian"], ["vegan", "Vegan"], ["gluten_free", "Gluten-free"], ["dairy_free", "Dairy-free"], ["nut_free", "Nut-free"], ["halal_friendly_no_pork_or_alcohol", "No pork or alcohol"]];
  World.meals = [["breakfast", "Breakfast"], ["lunch", "Lunch"], ["dinner", "Dinner"], ["snack", "Snack"], ["soup", "Soup"], ["salad", "Salad"], ["dessert", "Dessert"], ["starter", "Starter"], ["street-food", "Street food"]];

  /* A scaled, localised ingredient line, e.g. "2 onions, finely chopped". Prep notes stay English until translated. */
  World.ingredientLine = (ing, factor, l) => {
    l = l || "en";
    const base = l === "en" ? core.ingredientLine(ing, World.ingredientName(ing.ingredient_id, "en"), factor) : lineIn(ing, factor, l);
    return base + (ing.prep ? ", " + ing.prep : "");
  };
  function lineIn(ing, factor, l) {   // localised name, same scaling
    const s = core.scaleIngredient(ing, factor), nm = World.ingredientName(ing.ingredient_id, l);
    return (s.scalable ? [s.amount, s.unit].filter(Boolean).join(" ") + " " : "") + nm + (s.scalable ? "" : (l === "ar" ? " (حسب الذوق)" : l === "fr" ? " (selon le goût)" : " (to taste)"));
  }

  /* ---------- indexes ---------- */
  const hay = new Map();
  W.recipes.forEach((r) => {
    const parts = [Object.values(r.names).join(" "), r.local_name, r.alt_names.join(" "), r.description, r.origin.cuisine, r.tags.join(" "), r.meal.join(" "),
      r.origin.countries.map((c) => ["en", "fr", "ar"].map((l) => W.countries[c][l]).join(" ")).join(" "),
      r.ingredients.map((i) => ["en", "fr", "ar"].map((l) => World.ingredientName(i.ingredient_id, l)).join(" ")).join(" ")];
    const text = norm(parts.join(" ")); hay.set(r.slug, { text, words: new Set(text.split(" ")) });
  });
  const lev = (a, b) => { const m = a.length, n = b.length; let p = Array.from({ length: n + 1 }, (_, j) => j); for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[n]; };
  function tokenMatches(h, t) {
    if (h.text.includes(t)) return true;
    if (t.length < 5) return false;                         // typo tolerance only for longer words (1 edit; 2 for 8+)
    const max = t.length >= 8 ? 2 : 1;
    for (const w of h.words) if (Math.abs(w.length - t.length) <= max && lev(w, t) <= max) return true;
    return false;
  }

  /* ---------- search / filter / sort / paginate (local equivalent of the SQL function search_recipes) ---------- */
  World.search = function (p) {
    p = p || {};
    const toks = norm(p.q).split(" ").filter(Boolean);
    const diets = (p.diets || []).filter(Boolean);
    let list = W.recipes.filter((r) => {
      const h = hay.get(r.slug);
      if (toks.length && !toks.every((t) => tokenMatches(h, t))) return false;
      if (p.country && !r.origin.countries.includes(p.country)) return false;
      if (p.region && !r.origin.countries.some((c) => W.countries[c].region === p.region)) return false;
      if (p.cuisine && r.origin.cuisine_id !== p.cuisine) return false;
      if (p.meal && !r.meal.includes(p.meal)) return false;
      if (p.diff && r.difficulty !== p.diff) return false;
      if (p.maxActive && r.times.active > p.maxActive) return false;
      if (p.maxTotal && r.times.total > p.maxTotal) return false;
      if (p.ingredient && !r.ingredients.some((i) => i.ingredient_id === p.ingredient)) return false;
      if (diets.some((d) => !r.diet[d])) return false;
      return true;
    });
    const Api = SC.Api, item = (r) => Api.item("recipe:" + r.slug), cnt = (r) => (item(r) ? Api.counts(item(r)) : { likes: 0, views: 0, saves: 0, comments: 0, dislikes: 0 });
    const alpha = (a, b) => World.recipeName(a).localeCompare(World.recipeName(b));
    const sorts = {
      popular: (a, b) => cnt(b).views - cnt(a).views || alpha(a, b),
      liked: (a, b) => cnt(b).likes - cnt(a).likes || alpha(a, b),
      newest: (a, b) => b.published_at.localeCompare(a.published_at) || alpha(a, b),
      fastest: (a, b) => a.times.active - b.times.active || alpha(a, b),
      trending: (a, b) => { const s = (r) => { const c = cnt(r); return (c.likes * 5 + c.saves * 10 + c.comments * 8 + c.views); }; return s(b) - s(a) || alpha(a, b); },
      rated: (a, b) => { const s = (r) => { const c = cnt(r), n = c.likes + c.dislikes; return n ? c.likes / n : -1; }; return s(b) - s(a) || alpha(a, b); },   // unrated recipes sort last; nothing is invented
      az: alpha,
    };
    list.sort(sorts[p.sort] || (toks.length ? alpha : sorts.popular));
    const limit = Math.min(Math.max(p.limit || 24, 1), 60), offset = Math.max(p.offset || 0, 0);
    return { total: list.length, items: list.slice(offset, offset + limit), offset, limit };
  };

  /* facets for filter chips, computed from the data (never hard-coded counts) */
  World.facets = function () {
    const regions = {}, countries = {}, cuisines = {};
    W.recipes.forEach((r) => {
      const seen = new Set();
      r.origin.countries.forEach((c) => { countries[c] = (countries[c] || 0) + 1; const rg = W.countries[c].region; if (!seen.has(rg)) { seen.add(rg); regions[rg] = (regions[rg] || 0) + 1; } });
      cuisines[r.origin.cuisine_id] = (cuisines[r.origin.cuisine_id] || 0) + 1;
    });
    return { regions, countries, cuisines };
  };

  /* ---------- local-mode registration as official recipe items ---------- */
  if (SC.backend && (SC.backend.mode === "local" || SC.backend.mode === "railway") && D) {
    const art = (r) => {
      const ids = r.ingredients.map((i) => i.ingredient_id);
      if (r.meal.includes("dessert")) return "desserts";
      if (r.meal.includes("breakfast")) return "breakfast";
      if (ids.some((i) => /spaghetti|macaroni/.test(i))) return "pasta";
      if (ids.some((i) => /^chicken-(breast|thigh|pieces)/.test(i))) return "chicken";
      if (ids.some((i) => /^beef-|lamb-/.test(i))) return "beef";
      if (r.origin.countries.includes("MX")) return "mexican";
      if (r.origin.countries.includes("IT")) return "italian";
      if (["east-asia", "southeast-asia", "south-asia"].includes(W.countries[r.origin.primary].region)) return "asian";
      return r.diet.vegetarian ? "vegetarian" : "healthy";
    };
    W.recipes.forEach((r) => {
      D.RECIPES.push({ type: "recipe", source: "fixed", author: D.OFFICIAL, id: r.slug, title: r.name, desc: r.description, ph: r.image && r.image.file ? r.image.file : "", cats: [art(r)],
        tags: r.tags.slice(), prep: r.times.prep, cook: r.times.cook, serves: r.servings, diff: r.difficulty,
        ing: r.ingredients.map((i) => World.ingredientLine(i, 1)), steps: r.steps.map((s) => s.text), tips: r.tips.slice(),
        likes: 0, dislikes: 0, comments: 0, saves: 0, shares: 0, views: 0, age: 1, world: true });   // zero engagement: nothing invented
    });
  }
})();
