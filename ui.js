/* ==========================================================================
   SIMPLE COOK — UI helpers & components  (ui.js)
   Pure presentation: string templates, formatting, toasts, modals.
   ========================================================================== */
(function () {
  "use strict";
  const SC = window.SC, D = window.SC_DATA, Api = SC.Api;

  /* ------------------------------------------------------------------ */
  /* Tiny helpers                                                        */
  /* ------------------------------------------------------------------ */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (n, cls) => `<svg class="i${cls ? " " + cls : ""}" aria-hidden="true"><use href="#i-${n}"/></svg>`;

  const fmt = (n) => {
    n = +n || 0;
    if (n < 1000) return String(n);
    if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    if (n < 1e6) return Math.round(n / 1000) + "K";
    return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  };
  const fmtFull = (n) => (+n || 0).toLocaleString("en-US");
  const mins = (m) => {
    if (!m) return "No cook";
    if (m < 60) return m + " min";
    const h = Math.floor(m / 60), r = m % 60;
    return r ? `${h} h ${r} min` : `${h} h`;
  };
  const dur = (sec) => {
    sec = Math.max(0, Math.round(sec || 0));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const p = (n) => String(n).padStart(2, "0");
    return h ? `${h}:${p(m)}:${p(s)}` : `${m}:${p(s)}`;
  };
  const ago = (ts) => {
    const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400) return Math.floor(s / 3600) + "h ago";
    if (s < 86400 * 30) return Math.floor(s / 86400) + "d ago";
    if (s < 86400 * 365) return Math.floor(s / (86400 * 30)) + "mo ago";
    return Math.floor(s / (86400 * 365)) + "y ago";
  };
  const safeUrl = (u) => {
    u = String(u || "").trim();
    if (/^https?:\/\//i.test(u) || /^#\//.test(u)) return u;
    return "";
  };

  /* ------------------------------------------------------------------ */
  /* Illustrated fallback "photos"                                       */
  /* Shown only if a remote photo fails to load. Never a broken icon.    */
  /* ------------------------------------------------------------------ */
  const PAL = {
    pizza: { bg: ["#f6d19a", "#a85423"], plate: "#f4e7d1", f: ["#e9b654", "#cf3b25", "#f2d27a", "#a5281a"], g: "#3e7d32", m: "round" },
    pasta: { bg: ["#f4e3c5", "#c98a4b"], plate: "#fbf6ec", f: ["#f0c96a", "#d9573a", "#f6dc9a", "#c2452d"], g: "#4a8a36", m: "heap" },
    chicken: { bg: ["#efc98f", "#8f4a1a"], plate: "#f3ead9", f: ["#d98a2a", "#b5601a", "#e9b04f", "#8c4514"], g: "#5b8f3a", m: "heap" },
    beef: { bg: ["#d8b48d", "#5b3222"], plate: "#efe6d8", f: ["#7a3b24", "#a5562f", "#5b2a1a", "#d9a066"], g: "#4d8035", m: "heap" },
    desserts: { bg: ["#f0c9c4", "#7a3b34"], plate: "#fbf1ea", f: ["#4b2618", "#7b4128", "#f3e2c8", "#d24a5a"], g: "#3f7a34", m: "round" },
    breakfast: { bg: ["#f7dfae", "#d38a3a"], plate: "#fffaf0", f: ["#efb84a", "#f6e2b0", "#c96a2b", "#d4432f"], g: "#4d8a37", m: "round" },
    healthy: { bg: ["#cfe6b4", "#4f8a47"], plate: "#f6faee", f: ["#4f9a3c", "#7cc255", "#e2483a", "#f2c744"], g: "#2f7a34", m: "leaf" },
    vegetarian: { bg: ["#d8e6b8", "#5f8f3e"], plate: "#f7f9ee", f: ["#5aa53f", "#e8683a", "#f5c342", "#3e8a3a"], g: "#2c7a34", m: "leaf" },
    asian: { bg: ["#f1cf9c", "#a3401f"], plate: "#f9f2e6", f: ["#e2a33d", "#c9432a", "#f6e1a4", "#7a3a1c"], g: "#3f8a3a", m: "heap" },
    italian: { bg: ["#f2d9ab", "#b45a2a"], plate: "#faf3e6", f: ["#e8b955", "#cc3a26", "#f6e2a3", "#a2281a"], g: "#43873a", m: "heap" },
    mexican: { bg: ["#f2c58a", "#a63d22"], plate: "#f5e8d2", f: ["#d99a3a", "#c83a25", "#6ea336", "#f2d27a"], g: "#4b8a34", m: "heap" },
    baking: { bg: ["#f3d7a8", "#9a5a2c"], plate: "#f8efe0", f: ["#cf8a3f", "#e6b56b", "#a55d26", "#f1d29a"], g: "#5c8c3a", m: "round" },
    quick: { bg: ["#f6dda6", "#c56b2e"], plate: "#fff8ea", f: ["#e9b04a", "#d4432f", "#f6e2a3", "#7aa73a"], g: "#4d8a37", m: "heap" },
    drinks: { bg: ["#f6c7b0", "#b23a48"], plate: "#fdf1ea", f: ["#e0405a", "#f28aa0", "#f7d24a", "#c22e4a"], g: "#3f8a3a", m: "cup" },
  };
  const rng = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  function art(cat, seed) {
    const p = PAL[cat] || PAL.pizza;
    const r = rng(Api.hash(String(seed) + cat) % 2147483647);
    const pick = (arr) => arr[Math.floor(r() * arr.length)];
    const cx = 400, cy = 300;
    let o = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' preserveAspectRatio='xMidYMid slice'>";
    o += `<defs><radialGradient id='bg' cx='.28' cy='.2' r='1.05'><stop offset='0' stop-color='${p.bg[0]}'/><stop offset='1' stop-color='${p.bg[1]}'/></radialGradient>`;
    o += "<radialGradient id='vg' cx='.5' cy='.5' r='.75'><stop offset='.6' stop-color='#000' stop-opacity='0'/><stop offset='1' stop-color='#000' stop-opacity='.38'/></radialGradient>";
    o += "<filter id='bl' x='-20%' y='-20%' width='140%' height='140%'><feGaussianBlur stdDeviation='14'/></filter></defs>";
    o += "<rect width='800' height='600' fill='url(#bg)'/>";
    for (let i = 1; i < 6; i++) o += `<rect y='${i * 100 - 3}' width='800' height='3' fill='#000' opacity='.05'/>`;

    const leaf = (x, y, s, c) => `<ellipse cx='${x.toFixed(1)}' cy='${y.toFixed(1)}' rx='${(22 * s).toFixed(1)}' ry='${(9 * s).toFixed(1)}' fill='${c}' transform='rotate(${Math.floor(r() * 360)} ${x.toFixed(1)} ${y.toFixed(1)})'/>`;
    const disc = (x, y, rad, c, op) => `<circle cx='${x.toFixed(1)}' cy='${y.toFixed(1)}' r='${rad.toFixed(1)}' fill='${c}' opacity='${op || 1}'/>`;
    const polar = (max) => { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * max; return [cx + Math.cos(a) * d, cy + Math.sin(a) * d]; };

    if (p.m === "cup") {
      o += `<circle cx='${cx + 12}' cy='${cy + 22}' r='196' fill='#000' opacity='.3' filter='url(#bl)'/>`;
      o += disc(cx, cy, 190, "#ffffff", 0.35) + disc(cx, cy, 172, p.f[0], 0.92) + disc(cx, cy, 172, "url(#bg)", 0.18);
      for (let i = 0; i < 9; i++) { const [x, y] = polar(130); o += `<rect x='${(x - 26).toFixed(1)}' y='${(y - 26).toFixed(1)}' width='52' height='52' rx='12' fill='#fff' opacity='.38' transform='rotate(${Math.floor(r() * 60)} ${x.toFixed(1)} ${y.toFixed(1)})'/>`; }
      for (let i = 0; i < 2; i++) { const [x, y] = polar(90); o += disc(x, y, 44, p.f[2], 0.9) + disc(x, y, 34, "#fff3b0", 0.85); }
      o += `<rect x='${cx + 20}' y='${cy - 250}' width='16' height='300' rx='8' fill='#fff' opacity='.9' transform='rotate(24 ${cx + 28} ${cy})'/>`;
      for (let i = 0; i < 6; i++) { const [x, y] = polar(120); o += leaf(x, y, 1.1, p.g); }
    } else {
      o += `<circle cx='${cx + 14}' cy='${cy + 26}' r='238' fill='#000' opacity='.32' filter='url(#bl)'/>`;
      o += disc(cx, cy, 234, p.plate) + `<circle cx='${cx}' cy='${cy}' r='198' fill='none' stroke='#000' stroke-opacity='.07' stroke-width='7'/>` + disc(cx, cy, 172, "#fff", 0.4);
      if (p.m === "round") {
        o += disc(cx, cy, 158, p.f[0]) + disc(cx, cy, 156, "#000", 0.08) + disc(cx, cy, 134, p.f[1]);
        for (let i = 0; i < 16; i++) { const [x, y] = polar(112); o += disc(x, y, 12 + r() * 14, pick([p.f[2], p.f[3], p.f[2]]), 0.95); }
        for (let i = 0; i < 7; i++) { const [x, y] = polar(108); o += leaf(x, y, 1.1, p.g); }
      } else if (p.m === "leaf") {
        for (let i = 0; i < 46; i++) { const [x, y] = polar(140); o += leaf(x, y, 1.1 + r() * 0.9, pick([p.f[0], p.f[1], p.g, p.f[0]])); }
        for (let i = 0; i < 12; i++) { const [x, y] = polar(130); o += disc(x, y, 9 + r() * 9, pick([p.f[2], p.f[3]]), 0.95); }
      } else {
        for (let i = 0; i < 52; i++) {
          const [x, y] = polar(132), c = pick(p.f);
          o += `<ellipse cx='${x.toFixed(1)}' cy='${y.toFixed(1)}' rx='${(18 + r() * 16).toFixed(1)}' ry='${(9 + r() * 7).toFixed(1)}' fill='${c}' transform='rotate(${Math.floor(r() * 360)} ${x.toFixed(1)} ${y.toFixed(1)})'/>`;
          if (i % 3 === 0) o += `<ellipse cx='${(x - 3).toFixed(1)}' cy='${(y - 3).toFixed(1)}' rx='7' ry='3' fill='#fff' opacity='.3'/>`;
        }
        for (let i = 0; i < 8; i++) { const [x, y] = polar(120); o += leaf(x, y, 1, p.g); }
      }
    }
    o += "<rect width='800' height='600' fill='url(#vg)'/></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(o);
  }

  /** <img> for a content item. Falls back to art() on load error (see script.js). */
  function img(item, o) {
    o = o || {};
    const cat = (item.cats && item.cats[0]) || "pizza";
    const src = item.ph ? D.photoUrl(item.ph, o.w || 900, o.h) : art(cat, item.id);
    return `<img class="${o.cls || ""}" src="${esc(src)}" alt="${esc(o.alt === undefined ? item.title : o.alt)}" ${o.eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async" data-cat="${esc(cat)}" data-seed="${esc(item.id)}">`;
  }
  /** <img> for a raw PHOTO key (hero, categories, banners). */
  function photo(key, cat, seed, o) {
    o = o || {};
    return `<img class="${o.cls || ""}" src="${esc(D.photoUrl(key, o.w || 900, o.h))}" alt="${esc(o.alt || "")}" ${o.eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async" data-cat="${esc(cat)}" data-seed="${esc(seed)}">`;
  }

  /* ------------------------------------------------------------------ */
  /* Avatars                                                             */
  /* ------------------------------------------------------------------ */
  function avatarSrc(u) {
    if (u.avatar) return u.avatar;
    const h = u.hue != null ? u.hue : Api.hash(u.username || "x") % 360;
    const ch = esc(((u.name || u.username || "?").trim()[0] || "?").toUpperCase());
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${h},82%,62%)'/><stop offset='1' stop-color='hsl(${(h + 38) % 360},78%,44%)'/></linearGradient></defs><rect width='64' height='64' fill='url(#g)'/><text x='32' y='43' text-anchor='middle' font-family='Arial,Helvetica,sans-serif' font-weight='700' font-size='30' fill='#fff'>${ch}</text></svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }
  const avatar = (u, size, cls) => `<span class="avatar ${cls || ""}" style="--s:${size || 40}px"><img src="${esc(avatarSrc(u))}" alt="" loading="lazy" decoding="async"></span>`;

  /* ------------------------------------------------------------------ */
  /* Toasts + modals                                                     */
  /* ------------------------------------------------------------------ */
  function toast(msg, o) {
    o = o || {};
    const root = $("#toast-root"); if (!root) return;
    const el = document.createElement("div");
    el.className = "toast" + (o.type ? " toast-" + o.type : "");
    el.innerHTML = `${icon(o.icon || (o.type === "error" ? "x" : "check"))}<span>${esc(msg)}</span>${o.href ? `<a href="${esc(o.href)}">${esc(o.label || "View")}</a>` : ""}`;
    root.appendChild(el);
    while (root.children.length > 3) root.firstChild.remove();
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 260); }, o.ms || 3200);
  }

  let lastFocus = null;
  function openModal(html, cls) {
    const root = $("#modal-root");
    lastFocus = document.activeElement;
    root.classList.remove("closing");
    root.innerHTML = `<div class="modal-backdrop" data-act="close-modal"></div><div class="modal ${cls || ""}" role="dialog" aria-modal="true"><button class="modal-x icon-btn" data-act="close-modal" aria-label="Close">${icon("x")}</button>${html}</div>`;
    root.classList.add("open");
    document.body.classList.add("modal-open");
    const f = root.querySelector("input:not([type=hidden]),textarea,.modal-body button,.modal-body a");
    if (f) setTimeout(() => f.focus({ preventScroll: true }), 30);
  }
  function closeModal() {
    const root = $("#modal-root");
    if (!root.classList.contains("open")) return;
    root.classList.add("closing");
    setTimeout(() => {
      root.classList.remove("open", "closing");
      root.innerHTML = "";
      document.body.classList.remove("modal-open");
      if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }, 170);
  }

  /* ------------------------------------------------------------------ */
  /* Reusable components                                                 */
  /* ------------------------------------------------------------------ */
  const ACT = {
    like: { ic: "heart", c: "likes", label: "Like" },
    dislike: { ic: "dislike", c: "dislikes", label: "Dislike" },
    comment: { ic: "comment", c: "comments", label: "Comments" },
    save: { ic: "bookmark", c: "saves", label: "Save" },
    share: { ic: "share", c: "shares", label: "Share" },
  };

  /** Action button (like / dislike / comment / save / share). State + counts are kept in sync by syncUI(). */
  function actBtn(act, item, o) {
    o = o || {};
    const key = Api.keyOf(item), m = Api.my(key), c = Api.counts(item), a = ACT[act];
    const on = (act === "like" && m.reaction === 1) || (act === "dislike" && m.reaction === -1) || (act === "save" && m.saved);
    const toggles = act === "like" || act === "dislike" || act === "save";
    return `<button type="button" class="act act-${act}${on ? " on" : ""}${o.cls ? " " + o.cls : ""}" data-act="${act}" data-key="${key}" aria-label="${a.label}"${toggles ? ` aria-pressed="${on}"` : ""}>${icon(a.ic)}${o.count === false ? "" : `<span data-count="${a.c}">${fmt(c[a.c])}</span>`}${o.text ? `<span class="act-text">${o.text}</span>` : ""}</button>`;
  }
  /** Read-only stat that still stays in sync (heart / comment counts on cards). */
  const statChip = (item, kind) => {
    const key = Api.keyOf(item), a = ACT[kind], c = Api.counts(item), m = Api.my(key);
    return `<span class="stat${kind === "like" && m.reaction === 1 ? " on" : ""}" data-key="${key}" data-stat="${kind}">${icon(a.ic)}<b data-count="${a.c}">${fmt(c[a.c])}</b></span>`;
  };
  function followBtn(username, o) {
    o = o || {};
    const me = Api.me();
    if (me && me.username === username) return "";
    const on = Api.isFollowing(username);
    return `<button type="button" class="btn btn-follow ${o.cls || "btn-sm"}${on ? " on" : ""}" data-act="follow" data-user="${esc(username)}" aria-pressed="${on}">${on ? "Following" : "Follow"}</button>`;
  }
  const diffBadge = (d) => `<span class="diff diff-${String(d).toLowerCase()}">${icon("bars")}${esc(d)}</span>`;

  function authorChip(item, size) {
    const u = Api.author(item);
    if (u.official) return `<a class="author" href="#/explore?tab=fixed">${avatar(u, size || 26)}<span>Simple Cook</span><span class="official-tick" title="Official">${icon("check")}</span></a>`;
    return `<a class="author" href="#/profile/${esc(u.username)}">${avatar(u, size || 26)}<span>@${esc(u.username)}</span></a>`;
  }

  function recipeCard(r, o) {
    o = o || {};
    const key = Api.keyOf(r), href = "#/recipe/" + encodeURIComponent(r.id);
    const own = Api.isOwn(r);
    return `<article class="card recipe-card${o.featured ? " is-featured" : ""}">
      <a class="card-media" href="${href}" aria-label="Open recipe: ${esc(r.title)}">
        ${img(r, { w: o.featured ? 1200 : 760, eager: o.eager })}
        <span class="card-shade"></span>
        ${diffBadge(r.difficulty || r.diff)}
      </a>
      ${actBtn("save", r, { count: false, cls: "save-fab" })}
      ${own && o.deletable ? `<button class="del-fab" data-act="delete" data-key="${key}" aria-label="Delete">${icon("trash")}</button>` : ""}
      <div class="card-body">
        <h3 class="card-title"><a href="${href}">${esc(r.title)}</a></h3>
        ${o.featured ? `<p class="card-desc">${esc(r.desc)}</p>` : ""}
        <div class="card-meta"><span>${icon("clock")}${mins(r.prep + r.cook)}</span>${r.source === "fixed" ? '<span class="tag-official">Official</span>' : ""}</div>
        <div class="card-foot">
          ${authorChip(r)}
          <span class="card-stats">${statChip(r, "like")}${statChip(r, "comment")}</span>
        </div>
      </div>
    </article>`;
  }

  function reelTile(r, o) {
    o = o || {};
    const u = Api.author(r), c = Api.counts(r);
    return `<a class="reel-tile" href="#/reels/${esc(r.id)}" aria-label="Watch reel: ${esc(r.title)}">
      ${img(r, { w: 480, h: 860 })}
      <span class="rt-shade"></span>
      <span class="rt-top"><span class="rt-views">${icon("play", "i-fill")}${fmt(c.views)}</span><span class="rt-dur">${dur(r.dur)}</span></span>
      <span class="rt-bottom"><span class="rt-title">${esc(r.title)}</span><span class="rt-by">${avatar(u, 22)}<span>@${esc(u.username)}</span></span></span>
    </a>${o.deletable && Api.isOwn(r) ? `<button class="del-fab" data-act="delete" data-key="${Api.keyOf(r)}" aria-label="Delete">${icon("trash")}</button>` : ""}`;
  }

  function videoCard(v, o) {
    o = o || {};
    const u = Api.author(v), c = Api.counts(v);
    const href = "#/video/" + esc(v.id);
    return `<article class="vcard${o.compact ? " is-compact" : ""}">
      <a class="vthumb" href="${href}" aria-label="Watch: ${esc(v.title)}">${img(v, { w: 720, h: 405 })}<span class="vplay">${icon("play", "i-fill")}</span><span class="vdur">${v.dur ? dur(v.dur) : "New"}</span></a>
      ${o.deletable && Api.isOwn(v) ? `<button class="del-fab" data-act="delete" data-key="${Api.keyOf(v)}" aria-label="Delete">${icon("trash")}</button>` : ""}
      <div class="vmeta">
        <a href="#/profile/${esc(u.username)}" aria-label="@${esc(u.username)}">${avatar(u, o.compact ? 32 : 40)}</a>
        <div>
          <h3><a href="${href}">${esc(v.title)}</a></h3>
          <a class="vby" href="#/profile/${esc(u.username)}">@${esc(u.username)}</a>
          <p class="vstats"><span>${icon("eye")}${fmt(c.views)} views</span><span>${ago(v.createdAt)}</span></p>
        </div>
      </div>
    </article>`;
  }

  function creatorCard(u) {
    const s = Api.stats(u.username);
    const top = Api.rank([].concat(Api.itemsBy(u.username, "recipe"), Api.itemsBy(u.username, "reel")), "trending")[0];
    return `<article class="creator-card">
      <a class="cc-cover" href="#/profile/${esc(u.username)}" tabindex="-1" aria-hidden="true">${top ? img(top, { w: 480, h: 280, alt: "" }) : ""}<span></span></a>
      <a class="cc-avatar" href="#/profile/${esc(u.username)}" aria-label="${esc(u.name)}">${avatar(u, 76, "ring")}</a>
      <h3><a href="#/profile/${esc(u.username)}">${esc(u.name)}</a></h3>
      <p class="handle">@${esc(u.username)}</p>
      <div class="cc-stats">
        <div><b data-user="${esc(u.username)}" data-ustat="followers">${fmt(s.followers)}</b><span>Followers</span></div>
        <div><b data-user="${esc(u.username)}" data-ustat="points">${fmtFull(s.points)}</b><span>Points</span></div>
      </div>
      ${followBtn(u.username, { cls: "btn-block" }) || `<a class="btn btn-ghost btn-block" href="#/profile/${esc(u.username)}">View profile</a>`}
    </article>`;
  }

  const catTile = (c) => `<a class="cat" href="#/explore?cat=${c.id}"><span class="cat-plate">${photo(c.photo, c.id, "cat-" + c.id, { w: 360, h: 360, alt: "" })}</span><span class="cat-name">${esc(c.name)}</span></a>`;

  const sectionHead = (title, sub, href, label) => `<div class="section-head"><div><h2>${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ""}</div>${href ? `<a class="see-all" href="${href}">${esc(label || "See all")}${icon("chev-right")}</a>` : ""}</div>`;

  const emptyState = (title, text, btn) => `<div class="empty"><div class="empty-art">${icon("utensils")}</div><h3>${esc(title)}</h3><p>${esc(text)}</p>${btn || ""}</div>`;

  /* ---------- comments ---------- */
  function commentItems(key) {
    const list = Api.comments(key);
    if (!list.length) return '<li class="c-empty">No comments yet. Start the conversation.</li>';
    return list.map((c) => {
      const u = Api.user(c.user) || { username: c.user, name: c.user };
      return `<li class="comment"><a href="#/profile/${esc(u.username)}">${avatar(u, 36)}</a><div><p class="c-head"><a href="#/profile/${esc(u.username)}"><b>@${esc(u.username)}</b></a><time>${ago(c.ts)}</time></p><p class="c-text">${esc(c.text)}</p></div></li>`;
    }).join("");
  }
  function commentsBlock(key, o) {
    o = o || {};
    const me = Api.me(), item = Api.item(key), c = item ? Api.counts(item) : { comments: 0 };
    return `<div class="comments" data-comments="${key}">
      ${o.noTitle ? "" : `<h3 class="comments-title">Comments <span class="ccount" data-key="${key}"><b data-count="comments">${fmt(c.comments)}</b></span></h3>`}
      ${me
        ? `<form class="comment-form" data-form="comment" data-key="${key}">${avatar(me, 36)}<input name="text" type="text" placeholder="Add a comment..." maxlength="500" autocomplete="off" aria-label="Add a comment"><button class="btn btn-primary btn-sm" type="submit">Post</button></form>`
        : `<div class="c-gate"><a href="#/login">Log in</a> or <a href="#/signup">sign up</a> to join the conversation.</div>`}
      <ul class="comment-list" data-comments-list="${key}">${commentItems(key)}</ul>
    </div>`;
  }

  SC.ui = {
    $, $$, esc, icon, fmt, fmtFull, mins, dur, ago, safeUrl, art, img, photo, avatar, avatarSrc,
    toast, openModal, closeModal,
    actBtn, statChip, followBtn, diffBadge, authorChip,
    recipeCard, reelTile, videoCard, creatorCard, catTile, sectionHead, emptyState,
    commentItems, commentsBlock,
  };
})();
