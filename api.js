/* ==========================================================================
   SIMPLE COOK — data layer  (api.js)
   --------------------------------------------------------------------------
   This is the ONLY file that reads or writes localStorage. Every screen talks
   to `SC.Api`, never to storage directly.

   ⚠ localStorage is NOT a production backend. It is per-browser, unencrypted
   and trivially editable. Passwords here are salted-hashed with a small
   non-cryptographic hash purely so they aren't stored as plain text in the
   demo; a real backend must use proper auth (Supabase Auth, Firebase Auth,
   OAuth, bcrypt/argon2 on a server, etc.).

   Moving to a real backend
   ------------------------
   Each method below maps to a table or endpoint. Replace the body of a method
   with a fetch()/SDK call (and make it async); the UI code in script.js only
   needs `await` added where it calls them.

     users          → profiles table (+ auth provider)
     posts          → recipes / reels / videos tables
     reactions      → reactions(user_id, item_key, value)   value = 1 | -1
     saves          → saves(user_id, item_key)
     follows        → follows(follower_id, followee_id)
     comments       → comments(id, item_key, user_id, body, created_at)
     views / shares → events tables (or counters updated by a server function)
     points         → computed on the server; see POINTS + buildIndex() below
   ========================================================================== */
(function () {
  "use strict";
  const D = window.SC_DATA;
  const SC = (window.SC = window.SC || {});

  /* ------------------------------------------------------------------ */
  /* Storage wrapper                                                     */
  /* ------------------------------------------------------------------ */
  const NS = "simplecook:v1:";
  const mem = {}; // fallback if localStorage is blocked or full

  const Store = {
    get(key, fallback) {
      if (key in mem) return mem[key];
      try {
        const raw = localStorage.getItem(NS + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(NS + key, JSON.stringify(value));
        delete mem[key];
        return true;
      } catch (e) {
        mem[key] = value; // keep working for this session
        console.warn("[Store] could not persist '" + key + "':", e && e.name);
        return false;
      }
    },
    clearAll() {
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith(NS))
          .forEach((k) => localStorage.removeItem(k));
      } catch (e) { /* ignore */ }
      Object.keys(mem).forEach((k) => delete mem[k]);
    },
  };

  /* ------------------------------------------------------------------ */
  /* Small helpers                                                       */
  /* ------------------------------------------------------------------ */
  const DAY = 86400000;
  const NOW = Date.now();

  /** cyrb53: tiny deterministic hash. Used for demo password hashing and art seeds. */
  function hash(str, seed) {
    seed = seed || 0;
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const keyOf = (item) => item.type + ":" + item.id;
  const uid = () => "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  /** Points awarded for activity. Replace with a server-side algorithm later. */
  const POINTS = {
    post_recipe: 50, post_reel: 30, post_video: 80,
    view: 1, like: 5, dislike: -2, comment: 8, comment_made: 2, save: 10, share: 6, follow: 15,
  };

  const DEMO = { username: "anis", email: "anis@simplecook.demo", password: "demo1234" };
  const RESERVED = ["simplecook", "admin", "support", "me", "explore", "create", "reels", "videos", "login", "signup", "profile"];

  // Give seed content a timestamp so "Newest" sorting works.
  [].concat(D.RECIPES, D.REELS, D.VIDEOS).forEach((i) => { i.createdAt = NOW - i.age * DAY; });

  /* ------------------------------------------------------------------ */
  /* Cached index (rebuilt after any mutation)                           */
  /* ------------------------------------------------------------------ */
  let cache = null;
  const invalidate = () => { cache = null; };

  function buildIndex() {
    const posts = Store.get("posts", []);
    const items = new Map();
    [].concat(D.RECIPES, D.REELS, D.VIDEOS, posts).forEach((i) => items.set(keyOf(i), i));

    const a = { likes: {}, dislikes: {}, saves: {}, shares: {}, views: {}, comments: {}, followers: {}, following: {}, points: {} };
    const inc = (o, k, n) => { o[k] = (o[k] || 0) + (n === undefined ? 1 : n); };
    const award = (owner, actor, n) => {
      if (!owner || owner === D.OFFICIAL || owner === actor) return;
      inc(a.points, owner, n);
    };
    const split = (k) => { const i = k.indexOf("|"); return [k.slice(0, i), k.slice(i + 1)]; };

    Object.entries(Store.get("reactions", {})).forEach(([k, v]) => {
      const [user, key] = split(k); const it = items.get(key); if (!it) return;
      if (v === 1) { inc(a.likes, key); award(it.author, user, POINTS.like); }
      else if (v === -1) { inc(a.dislikes, key); award(it.author, user, POINTS.dislike); }
    });
    Object.keys(Store.get("saves", {})).forEach((k) => {
      const [user, key] = split(k); const it = items.get(key); if (!it) return;
      inc(a.saves, key); award(it.author, user, POINTS.save);
    });
    Object.keys(Store.get("shares", {})).forEach((k) => {
      const [user, key] = split(k); const it = items.get(key); if (!it) return;
      inc(a.shares, key); award(it.author, user, POINTS.share);
    });
    Object.keys(Store.get("views", {})).forEach((k) => {
      const [user, key] = split(k); const it = items.get(key); if (!it) return;
      inc(a.views, key); award(it.author, user, POINTS.view);
    });
    Object.entries(Store.get("comments", {})).forEach(([key, list]) => {
      const it = items.get(key); if (!it) return;
      list.forEach((c) => {
        inc(a.comments, key); award(it.author, c.user, POINTS.comment);
        if (c.user !== it.author) inc(a.points, c.user, POINTS.comment_made);
      });
    });
    Object.keys(Store.get("follows", {})).forEach((k) => {
      const [follower, target] = split(k);
      inc(a.followers, target); inc(a.following, follower);
      award(target, follower, POINTS.follow);
    });
    posts.forEach((p) => award(p.author, null, POINTS["post_" + p.type] || 0));

    cache = { items, posts, a };
    return cache;
  }
  const idx = () => cache || buildIndex();

  /* ------------------------------------------------------------------ */
  /* Users                                                               */
  /* ------------------------------------------------------------------ */
  const registered = () => Store.get("users", []);
  const overrides = () => Store.get("profile_overrides", {});

  function allUsers() {
    const ov = overrides();
    const seed = D.USERS.map((u) => ({ ...u, seed: true, email: u.username === DEMO.username ? DEMO.email : undefined }));
    return seed.concat(registered()).map((u) => ({ ...u, ...(ov[u.username] || {}) }));
  }
  const OFFICIAL_USER = { id: D.OFFICIAL, username: D.OFFICIAL, name: "Simple Cook", official: true, avatar: "assets/logo.svg", bio: "Official recipes from the Simple Cook kitchen." };

  /* ------------------------------------------------------------------ */
  /* Public API                                                          */
  /* ------------------------------------------------------------------ */
  const Api = {
    POINTS, DEMO, keyOf, hash, norm,
    categories: D.CATEGORIES,
    cat: (id) => D.CATEGORIES.find((c) => c.id === id),
    catName: (id) => (D.CATEGORIES.find((c) => c.id === id) || {}).name || id,

    /* ---------- theme ---------- */
    theme() {
      const t = Store.get("theme", null);
      return t === "light" || t === "dark" ? t : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    },
    setTheme(t) { Store.set("theme", t); },

    /* ---------- auth ---------- */
    me() {
      const id = Store.get("session", null);
      return id ? this.user(id) : null;
    },
    user(username) {
      if (!username) return null;
      if (username === D.OFFICIAL) return OFFICIAL_USER;
      const u = String(username).toLowerCase();
      return allUsers().find((x) => x.username === u) || null;
    },
    author(item) { return this.user(item.author) || OFFICIAL_USER; },
    users() { return allUsers(); },
    usernameTaken(u) {
      u = String(u || "").trim().toLowerCase();
      return RESERVED.includes(u) || allUsers().some((x) => x.username === u);
    },
    emailTaken(e) {
      e = String(e || "").trim().toLowerCase();
      return allUsers().some((x) => (x.email || "").toLowerCase() === e);
    },
    signUp(d) {
      const username = String(d.username || "").trim().toLowerCase();
      const email = String(d.email || "").trim().toLowerCase();
      if (!/^[a-z0-9_.]{3,20}$/.test(username)) return { error: "Use 3 to 20 letters, numbers, dots or underscores." };
      if (this.usernameTaken(username)) return { error: "That username is taken." };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
      if (this.emailTaken(email)) return { error: "An account with this email already exists." };
      if (String(d.password || "").length < 8) return { error: "Use at least 8 characters." };
      const salt = Math.random().toString(36).slice(2, 10);
      const user = {
        id: username, username, email, name: d.name || username, bio: "New on Simple Cook. Cooking something amazing.",
        avatar: d.avatar || null, salt, pass: hash(salt + ":" + d.password).toString(36),
        createdAt: Date.now(), hue: hash(username) % 360, followers: 0, following: 0, points: 0,
      };
      Store.set("users", registered().concat(user));
      Store.set("session", user.id);
      invalidate();
      return { user };
    },
    login(identifier, password) {
      const id = String(identifier || "").trim().toLowerCase();
      const u = allUsers().find((x) => x.username === id || (x.email || "").toLowerCase() === id);
      const bad = { error: "Incorrect username/email or password." };
      if (!u) return bad;
      if (u.seed) {
        if (u.username !== DEMO.username || password !== DEMO.password) return bad;
      } else if (hash(u.salt + ":" + password).toString(36) !== u.pass) return bad;
      Store.set("session", u.id);
      return { user: u };
    },
    logout() { Store.set("session", null); },
    updateProfile(patch) {
      const me = this.me(); if (!me) return null;
      const ov = overrides();
      ov[me.username] = { ...(ov[me.username] || {}), ...patch };
      Store.set("profile_overrides", ov);
      return this.me();
    },
    resetPassword(email, newPassword) {
      const e = String(email || "").trim().toLowerCase();
      const list = registered();
      const u = list.find((x) => (x.email || "").toLowerCase() === e);
      if (!u) return { error: "No account found for that email." };
      u.salt = Math.random().toString(36).slice(2, 10);
      u.pass = hash(u.salt + ":" + newPassword).toString(36);
      Store.set("users", list);
      return { ok: true };
    },
    accountExists(email) { return this.emailTaken(email); },
    isDemoEmail(email) { return String(email || "").trim().toLowerCase() === DEMO.email; },

    /* ---------- content ---------- */
    recipes() { return [].concat(idx().posts.filter((p) => p.type === "recipe"), D.RECIPES); },
    reels() { return [].concat(idx().posts.filter((p) => p.type === "reel"), D.REELS); },
    videos() { return [].concat(idx().posts.filter((p) => p.type === "video"), D.VIDEOS); },
    item(key) { return idx().items.get(key) || null; },
    recipe(id) { return this.item("recipe:" + id); },
    reel(id) { return this.item("reel:" + id); },
    video(id) { return this.item("video:" + id); },
    itemsBy(username, type) {
      const list = type === "recipe" ? this.recipes() : type === "reel" ? this.reels() : this.videos();
      return list.filter((i) => i.author === username);
    },
    isOwn(item) { const me = this.me(); return !!(me && item && item.author === me.username && idx().posts.includes(item)); },
    create(type, data) {
      const me = this.me(); if (!me) return { error: "Log in to post." };
      const item = {
        type, id: uid(), author: me.username, source: "community", createdAt: Date.now(), age: 0,
        likes: 0, dislikes: 0, comments: 0, saves: 0, shares: 0, views: 0, ...data,
      };
      const persisted = Store.set("posts", [item].concat(Store.get("posts", [])));
      invalidate();
      return { item, persisted };
    },
    remove(key) {
      const it = this.item(key);
      if (!it || !this.isOwn(it)) return false;
      Store.set("posts", Store.get("posts", []).filter((p) => keyOf(p) !== key));
      invalidate();
      return true;
    },

    /* ---------- counts + my state ---------- */
    counts(item) {
      const a = idx().a, k = keyOf(item);
      return {
        likes: item.likes + (a.likes[k] || 0),
        dislikes: item.dislikes + (a.dislikes[k] || 0),
        comments: item.comments + (a.comments[k] || 0),
        saves: item.saves + (a.saves[k] || 0),
        shares: item.shares + (a.shares[k] || 0),
        views: item.views + (a.views[k] || 0),
      };
    },
    rating(item) {
      const c = this.counts(item);
      const total = c.likes + c.dislikes;
      return total ? Math.round((3 + 1.9 * (c.likes / total)) * 10) / 10 : 4.5; // 4.9 max: no dish is perfect
    },
    my(key) {
      const me = this.me();
      if (!me) return { reaction: 0, saved: false };
      return {
        reaction: Store.get("reactions", {})[me.id + "|" + key] || 0,
        saved: !!Store.get("saves", {})[me.id + "|" + key],
      };
    },

    /* ---------- social actions ---------- */
    react(key, value) {
      const me = this.me(); if (!me) return null;
      const r = Store.get("reactions", {}), k = me.id + "|" + key;
      if (r[k] === value) delete r[k]; else r[k] = value;
      Store.set("reactions", r); invalidate();
      return r[k] || 0;
    },
    toggleSave(key) {
      const me = this.me(); if (!me) return null;
      const s = Store.get("saves", {}), k = me.id + "|" + key;
      if (s[k]) delete s[k]; else s[k] = 1;
      Store.set("saves", s); invalidate();
      return !!s[k];
    },
    saved() {
      const me = this.me(); if (!me) return [];
      const s = Store.get("saves", {});
      return Object.keys(s).filter((k) => k.startsWith(me.id + "|")).map((k) => this.item(k.slice(me.id.length + 1))).filter(Boolean);
    },
    isFollowing(username) {
      const me = this.me();
      return !!(me && Store.get("follows", {})[me.id + "|" + username]);
    },
    toggleFollow(username) {
      const me = this.me(); if (!me || me.username === username) return null;
      const f = Store.get("follows", {}), k = me.id + "|" + username;
      if (f[k]) delete f[k]; else f[k] = 1;
      Store.set("follows", f); invalidate();
      return !!f[k];
    },
    /** Counts one view per person per item. Returns true if it was new. */
    view(key) {
      const me = this.me(), who = me ? me.id : "guest";
      const v = Store.get("views", {}), k = who + "|" + key;
      if (v[k]) return false;
      v[k] = 1; Store.set("views", v); invalidate();
      return true;
    },
    /* Report an inaccurate recipe. Local demo mode keeps reports on this device only; the real backend writes to the `reports` table. */
    reportRecipe(key, reason, details) {
      const me = this.me(); if (!me) return { error: "Log in to report a problem." };
      const ok = ["inaccurate_recipe", "wrong_origin", "unsafe_instructions", "other"];
      if (!ok.includes(reason)) return { error: "Choose what is wrong." };
      let list = []; try { list = JSON.parse(localStorage.getItem("sc.reports") || "[]"); } catch (e) { list = []; }
      if (list.some((r) => r.key === key && r.by === me.username)) return { error: "You have already reported this recipe." };
      list.push({ key, by: me.username, reason, details: String(details || "").slice(0, 1000), at: Date.now() });
      try { localStorage.setItem("sc.reports", JSON.stringify(list)); } catch (e) { return { error: "Could not save the report." }; }
      return { ok: true, message: "Thanks! Your report was saved on this device (demo mode)." };
    },
    share(key) {
      const me = this.me(), who = me ? me.id : "guest";
      const s = Store.get("shares", {}), k = who + "|" + key;
      if (s[k]) return false;
      s[k] = 1; Store.set("shares", s); invalidate();
      return true;
    },
    comments(key) {
      const it = this.item(key); if (!it) return [];
      const local = (Store.get("comments", {})[key] || []).slice().reverse();
      // A few believable seed comments so threads never look empty.
      const pool = D.SEED_COMMENTS, h = hash(key);
      const others = D.USERS.filter((u) => u.username !== it.author);
      const n = it.comments > 200 ? 4 : it.comments > 90 ? 3 : it.comments > 0 ? 2 : 0;
      const seed = [];
      for (let i = 0; i < n; i++) {
        const u = others[(h + i * 3) % others.length];
        seed.push({ id: "s" + i, user: u.username, text: pool[(h + i * 5) % pool.length], ts: NOW - (i + 1) * (((h >> i) % 7) + 2) * 3600000 * 5, seed: true });
      }
      return local.concat(seed);
    },
    addComment(key, text) {
      const me = this.me(); text = String(text || "").trim().slice(0, 500);
      if (!me || !text) return null;
      const all = Store.get("comments", {});
      const c = { id: uid(), user: me.username, text, ts: Date.now() };
      all[key] = (all[key] || []).concat(c);
      Store.set("comments", all); invalidate();
      return c;
    },

    /* ---------- users: stats + rankings ---------- */
    stats(username) {
      const u = this.user(username); if (!u) return null;
      const a = idx().a;
      return {
        followers: (u.followers || 0) + (a.followers[username] || 0),
        following: (u.following || 0) + (a.following[username] || 0),
        points: Math.max(0, (u.points || 0) + (a.points[username] || 0)),
        posts: this.itemsBy(username, "recipe").length + this.itemsBy(username, "reel").length + this.itemsBy(username, "video").length,
      };
    },
    creators() {
      return allUsers().map((u) => ({ u, s: this.stats(u.username) })).sort((x, y) => y.s.points - x.s.points).map((x) => x.u);
    },

    /* ---------- ranking + search ---------- */
    score(item) {
      const c = this.counts(item), age = Math.max(0, (Date.now() - item.createdAt) / DAY);
      return (c.likes + c.comments * 2 + c.saves * 3 + c.shares * 2 + c.views * 0.02) / Math.pow(1 + age / 14, 0.8);
    },
    rank(list, mode) {
      const l = list.slice();
      if (mode === "liked") return l.sort((a, b) => this.counts(b).likes - this.counts(a).likes);
      if (mode === "newest") return l.sort((a, b) => b.createdAt - a.createdAt);
      if (mode === "active") {
        return l.sort((a, b) => (this.stats(b.author) || { points: 0 }).points - (this.stats(a.author) || { points: 0 }).points || this.score(b) - this.score(a));
      }
      return l.sort((a, b) => this.score(b) - this.score(a));
    },
    matches(item, q) {
      const tokens = norm(q).split(/\s+/).filter(Boolean);
      if (!tokens.length) return true;
      const u = this.user(item.author) || {};
      const hay = norm([
        item.title, item.desc, item.cap, (item.tags || []).join(" "), (item.cats || []).map((c) => this.catName(c)).join(" "),
        (item.ing || []).join(" "), u.username, u.name,
      ].join(" "));
      return tokens.every((t) => hay.includes(t.replace(/^#/, "")));
    },
    matchUser(u, q) {
      const tokens = norm(q).split(/\s+/).filter(Boolean);
      if (!tokens.length) return false;
      const hay = norm(u.username + " " + u.name + " " + (u.bio || ""));
      return tokens.every((t) => hay.includes(t.replace(/^@/, "")));
    },
    search(q, limit) {
      limit = limit || 4;
      return {
        recipes: this.rank(this.recipes().filter((r) => this.matches(r, q)), "trending").slice(0, limit),
        creators: this.creators().filter((u) => this.matchUser(u, q)).slice(0, limit),
        reels: this.rank(this.reels().filter((r) => this.matches(r, q)), "trending").slice(0, 2),
        videos: this.rank(this.videos().filter((r) => this.matches(r, q)), "trending").slice(0, 2),
      };
    },
    related(recipe, n) {
      const set = new Set(recipe.cats || []);
      return this.recipes()
        .filter((r) => r.id !== recipe.id)
        .map((r) => ({ r, o: (r.cats || []).filter((c) => set.has(c)).length }))
        .filter((x) => x.o > 0)
        .sort((a, b) => b.o - a.o || this.score(b.r) - this.score(a.r))
        .slice(0, n).map((x) => x.r);
    },
    resetAll() { Store.clearAll(); invalidate(); },
  };

  Api._invalidate = invalidate;   // used by backend adapters after they replace the data behind Store
  SC.Store = Store;
  SC.Api = Api;
})();
