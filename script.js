/* ==========================================================================
   SIMPLE COOK — app core  (script.js)
   Router, global event handling, forms, header, search, modals, boot.
   Load order: config.js → data.js → api.js → backend/supabase-adapter.js → ui.js → views.js → script.js
   ========================================================================== */
(function () {
  "use strict";
  const SC = window.SC, D = window.SC_DATA, Api = SC.Api, U = SC.ui, V = SC.views;
  const { $, $$, esc, icon, fmt, fmtFull, toast, openModal, closeModal, avatar } = U;
  const app = $("#app");
  let lastPage = "#/";

  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  /* ==================================================================== */
  /* Keep every on-screen counter / button state in sync                   */
  /* ==================================================================== */
  function sync() {
    $$("[data-key]").forEach((el) => {
      const item = Api.item(el.dataset.key); if (!item) return;
      const c = Api.counts(item), m = Api.my(el.dataset.key);
      if (el.classList.contains("act")) {
        const a = el.dataset.act;
        const on = a === "like" ? m.reaction === 1 : a === "dislike" ? m.reaction === -1 : a === "save" ? m.saved : null;
        if (on !== null) { el.classList.toggle("on", on); el.setAttribute("aria-pressed", String(on)); }
      }
      if (el.dataset.stat === "like") el.classList.toggle("on", m.reaction === 1);
      $$("[data-count]", el).forEach((s) => { s.textContent = fmt(c[s.dataset.count]); });
    });
    $$("[data-rating-key]").forEach((el) => {          // the star rating appears as soon as a real vote exists
      const it = Api.item(el.dataset.ratingKey), v = $(".rate-val", el); if (!it || !v) return;
      const c = Api.counts(it);
      v.innerHTML = c.likes + c.dislikes ? `${icon("star", "i-fill star")}<b>${Api.rating(it).toFixed(1)}</b>` : '<b class="muted">Not rated yet</b>';
    });
    $$('[data-act="follow"]').forEach((b) => {
      const on = Api.isFollowing(b.dataset.user);
      b.classList.toggle("on", on); b.textContent = on ? "Following" : "Follow"; b.setAttribute("aria-pressed", String(on));
    });
    $$("[data-ustat]").forEach((el) => {
      const s = Api.stats(el.dataset.user); if (!s) return;
      const k = el.dataset.ustat;
      el.textContent = k === "points" ? fmtFull(s.points) : fmt(s[k]);
    });
  }
  SC.sync = sync;

  const pop = (btn) => { if (!btn) return; btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop"); };

  /* ==================================================================== */
  /* Theme                                                                 */
  /* ==================================================================== */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    const m = $("#meta-theme"); if (m) m.setAttribute("content", t === "dark" ? "#131211" : "#f5f4f1");
    const b = $(".theme-btn"); if (b) b.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }

  /* ==================================================================== */
  /* Header: user slot, search                                             */
  /* ==================================================================== */
  function renderUser() {
    const me = Api.me(), slot = $("#user-slot");
    if (!me) {
      slot.innerHTML = `<a class="btn btn-ghost btn-sm" href="#/login">Log in</a><a class="btn btn-soft btn-sm hide-sm" href="#/signup">Sign up</a>`;
      return;
    }
    const s = Api.stats(me.username);
    slot.innerHTML = `<div class="user-menu">
      <button class="avatar-btn" data-act="user-menu" aria-haspopup="menu" aria-expanded="false" aria-label="Account menu">${avatar(me, 38, "ring")}</button>
      <div class="dropdown" role="menu" hidden>
        <a class="dd-head" href="#/profile/${esc(me.username)}">${avatar(me, 44)}<span><b>${esc(me.name)}</b><small>@${esc(me.username)}</small></span></a>
        <div class="dd-points">${icon("sparkle")}<b data-user="${esc(me.username)}" data-ustat="points">${fmtFull(s.points)}</b><span>points</span></div>
        <a role="menuitem" href="#/profile/${esc(me.username)}">${icon("user")}My profile</a>
        <a role="menuitem" href="#/profile/${esc(me.username)}?tab=saved">${icon("bookmark")}Saved</a>
        <a role="menuitem" href="#/create">${icon("plus")}Create</a>
        <button role="menuitem" data-act="logout">${icon("logout")}Log out</button>
      </div>
    </div>`;
  }
  const closeUserMenu = () => {
    const dd = $(".user-menu .dropdown"); if (!dd || dd.hidden) return;
    dd.hidden = true; const b = $('[data-act="user-menu"]'); if (b) b.setAttribute("aria-expanded", "false");
  };

  const sInput = $("#search-input"), sDrop = $("#search-drop"), sForm = $("#header-search");
  const closeDrop = () => { sDrop.hidden = true; };
  function suggest() {
    const q = sInput.value.trim();
    if (!q) {
      const quick = ["Pizza", "Pasta", "Crispy chicken", "Chocolate cake", "Salad", "Breakfast"];
      sDrop.innerHTML = `<p class="sd-title">Popular searches</p><div class="sd-chips">${quick.map((t) => `<a href="#/explore?q=${encodeURIComponent(t)}">${icon("search")}${t}</a>`).join("")}</div>`;
      sDrop.hidden = false; return;
    }
    const r = Api.search(q, 4);
    const part = (title, arr) => arr.length ? `<p class="sd-title">${title}</p>${arr.join("")}` : "";
    const rec = r.recipes.map((x) => `<a class="sd-item" href="#/recipe/${esc(x.id)}"><span class="sd-thumb">${U.img(x, { w: 96, h: 96, alt: "" })}</span><span class="sd-text"><b>${esc(x.title)}</b><small>${x.source === "fixed" ? "Official recipe" : "Recipe by @" + esc(x.author)}</small></span></a>`);
    const cr = r.creators.map((u) => `<a class="sd-item" href="#/profile/${esc(u.username)}"><span class="sd-thumb round">${avatar(u, 40)}</span><span class="sd-text"><b>${esc(u.name)}</b><small>@${esc(u.username)}</small></span></a>`);
    const rl = r.reels.map((x) => `<a class="sd-item" href="#/reels/${esc(x.id)}"><span class="sd-thumb">${U.img(x, { w: 96, h: 96, alt: "" })}</span><span class="sd-text"><b>${esc(x.title)}</b><small>Reel by @${esc(x.author)}</small></span></a>`);
    const vd = r.videos.map((x) => `<a class="sd-item" href="#/video/${esc(x.id)}"><span class="sd-thumb">${U.img(x, { w: 96, h: 96, alt: "" })}</span><span class="sd-text"><b>${esc(x.title)}</b><small>Video by @${esc(x.author)}</small></span></a>`);
    const any = rec.length + cr.length + rl.length + vd.length;
    sDrop.innerHTML = any
      ? part("Recipes", rec) + part("Creators", cr) + part("Reels", rl) + part("Videos", vd) + `<a class="sd-all" href="#/explore?q=${encodeURIComponent(q)}">See all results for “${esc(q)}”${icon("arrow")}</a>`
      : `<p class="sd-empty">No matches for “${esc(q)}”. Try “pasta” or “chicken”.</p>`;
    sDrop.hidden = false;
  }
  sInput.addEventListener("input", debounce(suggest, 90));
  sInput.addEventListener("focus", suggest);
  sInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { const f = $(".sd-item, .sd-chips a", sDrop); if (f) { e.preventDefault(); f.focus(); } }
  });
  sDrop.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const items = $$(".sd-item, .sd-chips a, .sd-all", sDrop), i = items.indexOf(document.activeElement);
    e.preventDefault();
    if (e.key === "ArrowDown") (items[i + 1] || items[0]).focus();
    else if (i <= 0) sInput.focus(); else items[i - 1].focus();
  });
  sForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = sInput.value.trim();
    closeDrop(); $("#site-header").classList.remove("search-open"); sInput.blur();
    location.hash = "#/explore" + (q ? "?q=" + encodeURIComponent(q) : "");
  });

  /* ==================================================================== */
  /* Router                                                                */
  /* ==================================================================== */
  const ROUTES = [
    [/^\/?$/, V.home], [/^\/explore$/, V.explore], [/^\/recipe\/(.+)$/, V.recipe],
    [/^\/reels(?:\/(.+))?$/, V.reels], [/^\/videos$/, V.videos], [/^\/video\/(.+)$/, V.video],
    [/^\/create$/, V.create], [/^\/login$/, V.login], [/^\/signup$/, V.signup], [/^\/forgot$/, V.forgot],
    [/^\/profile\/(.+)$/, V.profile],
    [/^\/food$/, () => ({ title: "AI Food Scanner", html: '<div id="fs-root"></div>' })],
    [/^\/scan$/, () => ({ title: "Ingredient Scanner", html: '<div id="sc-root"></div>' })],
    [/^\/map$/, () => ({ title: "Food map", html: '<div id="fm-root"></div>' })],
    [/^\/messages(?:\/(.+))?$/, (c) => ({ title: "Messages", html: '<div id="dm-root" data-arg="' + String(c.args[0] || "").replace(/[^A-Za-z0-9\/_.%-]/g, "") + '"></div>' })],
  ];
  function parseHash() {
    const raw = location.hash.replace(/^#/, "") || "/";
    const i = raw.indexOf("?");
    return { path: i < 0 ? raw : raw.slice(0, i), params: new URLSearchParams(i < 0 ? "" : raw.slice(i + 1)) };
  }
  function setNav(path) {
    $$("[data-nav]").forEach((a) => {
      const k = a.dataset.nav;
      const on = k === "home" ? path === "/"
        : k === "explore" ? path === "/explore" || path.startsWith("/recipe/")
        : k === "videos" ? path === "/videos" || path.startsWith("/video/")
        : path === "/" + k || path.startsWith("/" + k + "/");
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }
  function render(opts) {
    SC.cleanups.splice(0).forEach((f) => { try { f(); } catch (e) { /* ignore */ } });
    const { path, params } = parseHash();
    const isAuth = /^\/(login|signup|forgot)$/.test(path);

    if (path === "/profile") { const me = Api.me(); location.replace(me ? "#/profile/" + me.username : "#/login"); return; }
    if (isAuth && Api.me()) { location.replace(lastPage || "#/"); return; }

    let match = null;
    for (const [re, fn] of ROUTES) { const m = path.match(re); if (m) { match = { fn, args: m.slice(1) }; break; } }
    const ctx = { path, params, args: match ? match.args : [] };
    const view = match ? match.fn(ctx) : V.notFound("page");

    document.title = (view.title ? view.title + " | " : "") + "Simple Cook";
    app.innerHTML = view.html;
    document.body.classList.toggle("route-reels", /^\/reels/.test(path));
    document.body.classList.toggle("route-auth", isAuth);
    document.body.classList.toggle("route-messages", /^\/messages/.test(path));
    if (!isAuth) lastPage = "#" + (location.hash.replace(/^#/, "") || "/");
    setNav(path);
    closeUserMenu(); closeDrop(); $("#site-header").classList.remove("search-open");
    if (!(opts && opts.keepScroll)) window.scrollTo({ top: 0, behavior: "instant" });
    app.classList.remove("page-in"); void app.offsetWidth; app.classList.add("page-in");
    if (view.mount) view.mount(app, ctx);
    renderUser();
    if (!(opts && opts.keepScroll) && opts !== "init") app.focus({ preventScroll: true });
  }

  /* ==================================================================== */
  /* Auth gate + social actions                                            */
  /* ==================================================================== */
  function requireAuth(msg) {
    if (Api.me()) return true;
    openModal(`<div class="modal-body gate">
      <div class="gate-art">${icon("heart", "i-fill")}</div>
      <h2>Join Simple Cook</h2><p>${esc(msg || "Log in to do that.")}</p>
      <div class="btn-row"><a class="btn btn-primary" href="#/signup" data-act="close-modal">Create account</a><a class="btn btn-ghost" href="#/login" data-act="close-modal">Log in</a></div>
    </div>`, "modal-sm");
    return false;
  }
  function react(key, v, btn) {
    if (!requireAuth(v === 1 ? "Log in to like recipes, reels and videos." : "Log in to give feedback on posts.")) return;
    Api.react(key, v); pop(btn); sync();
  }
  function save(key, btn) {
    if (!requireAuth("Log in to save recipes, reels and videos.")) return;
    const on = Api.toggleSave(key); pop(btn); sync();
    const me = Api.me();
    toast(on ? "Saved to your collection" : "Removed from saved", on ? { icon: "bookmark", href: "#/profile/" + me.username + "?tab=saved", label: "View" } : {});
  }
  function follow(username, btn) {
    if (!requireAuth("Log in to follow creators.")) return;
    const on = Api.toggleFollow(username); if (on === null) return;
    pop(btn); sync(); toast(on ? `You're following @${username}` : `Unfollowed @${username}`);
  }
  SC.actions = {
    likeIfNot(key) {
      if (!requireAuth("Log in to like reels.")) return false;
      if (Api.my(key).reaction !== 1) react(key, 1, $(`.reel[data-key="${key}"] .act-like`));
      return true;
    },
  };

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.cssText = "position:fixed;opacity:0;top:0"; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch (_) { /* ignore */ }
      ta.remove(); return ok;
    }
  }
  function shareUrl(item, username) {
    const base = location.href.split("#")[0];
    if (username) return base + "#/profile/" + username;
    const route = item.type === "recipe" ? "recipe" : item.type === "reel" ? "reels" : "video";
    return base + "#/" + route + "/" + encodeURIComponent(item.id);
  }
  function openShare(key, username) {
    const item = key ? Api.item(key) : null;
    const url = shareUrl(item, username), title = item ? item.title : "@" + username + " on Simple Cook";
    const text = encodeURIComponent(title + " on Simple Cook"), u = encodeURIComponent(url);
    openModal(`<div class="modal-body share" data-share-key="${esc(key || "")}">
      <h2>Share</h2><p class="muted">${esc(title)}</p>
      <div class="share-link"><input id="share-url" type="text" readonly value="${esc(url)}" aria-label="Link"><button class="btn btn-primary btn-sm" data-act="copy-link">${icon("copy")}Copy link</button></div>
      <div class="share-targets">
        <a href="https://wa.me/?text=${text}%20${u}" target="_blank" rel="noopener noreferrer" data-act="shared"><span class="st-ic st-wa">W</span>WhatsApp</a>
        <a href="https://twitter.com/intent/tweet?text=${text}&url=${u}" target="_blank" rel="noopener noreferrer" data-act="shared"><span class="st-ic st-x">X</span>X</a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${u}" target="_blank" rel="noopener noreferrer" data-act="shared"><span class="st-ic st-fb">f</span>Facebook</a>
        <a href="mailto:?subject=${text}&body=${u}" data-act="shared"><span class="st-ic st-mail">${icon("mail")}</span>Email</a>
      </div>
      ${navigator.share ? `<button class="btn btn-ghost btn-block" data-act="native-share">${icon("share")}Share with another app</button>` : ""}
    </div>`, "modal-sm");
    const inp = $("#share-url"); if (inp) inp.addEventListener("focus", () => inp.select());
  }
  function countShare(key) { if (key && Api.share(key)) sync(); }

  function openComments(key) {
    const it = Api.item(key); if (!it) return;
    openModal(`<div class="modal-body comments-modal"><h2>Comments</h2><p class="muted small">${esc(it.title)}</p>${U.commentsBlock(key, { noTitle: true })}</div>`, "modal-comments");
  }

  function openPointsInfo() {
    const P = Api.POINTS;
    const rows = [
      ["Posting a recipe", "+" + P.post_recipe], ["Posting a reel", "+" + P.post_reel], ["Posting a video", "+" + P.post_video],
      ["Someone likes your post", "+" + P.like], ["Someone saves your post", "+" + P.save], ["Someone comments", "+" + P.comment],
      ["Someone shares your post", "+" + P.share], ["A new follower", "+" + P.follow], ["Each new view", "+" + P.view],
      ["Commenting on others' posts", "+" + P.comment_made], ["Someone dislikes your post", String(P.dislike)],
    ];
    openModal(`<div class="modal-body points-info"><h2>How points work</h2><p class="muted">Points reward creators whose posts people enjoy. “Active creators” sorting ranks by points.</p>
      <ul class="points-list">${rows.map((r) => `<li><span>${r[0]}</span><b class="${r[1].startsWith("-") ? "neg" : ""}">${r[1]}</b></li>`).join("")}</ul>
      <p class="note">${icon("info")}Prototype scoring. A real backend would compute this on the server.</p></div>`, "modal-sm");
  }

  function openEditProfile() {
    const me = Api.me(); if (!me) return;
    SC.draft.avatar = null;
    openModal(`<form class="modal-body" data-form="edit-profile" novalidate>
      <h2>Edit profile</h2>
      <div class="avatar-pick"><label class="drop round has" data-drop="avatar"><input type="file" name="avatar" accept="image/*" data-file="avatar" hidden><span class="drop-empty">${icon("user")}</span><span class="drop-preview"><img src="${esc(U.avatarSrc(me))}" alt=""></span></label><div><b>Profile picture</b><small>Click the picture to change it.</small></div></div>
      <div class="field" data-field="name"><label for="f-name">Display name</label><input id="f-name" name="name" type="text" maxlength="40" value="${esc(me.name)}"><p class="field-msg" role="alert"></p></div>
      <div class="field" data-field="bio"><label for="f-bio">Bio</label><textarea id="f-bio" name="bio" rows="3" maxlength="160">${esc(me.bio || "")}</textarea><p class="field-msg" role="alert"></p></div>
      <div class="btn-row end"><button type="button" class="btn btn-ghost" data-act="close-modal">Cancel</button><button class="btn btn-primary" type="submit">Save changes</button></div>
    </form>`, "modal-sm");
  }

  /* ==================================================================== */
  /* Click delegation                                                      */
  /* ==================================================================== */
  const ACTIONS = {
    like: (t) => react(t.dataset.key, 1, t),
    dislike: (t) => react(t.dataset.key, -1, t),
    save: (t) => save(t.dataset.key, t),
    follow: (t) => follow(t.dataset.user, t),
    comment: (t) => {
      const key = t.dataset.key, inline = $(`#comments [data-comments="${key}"]`);
      if (inline) { inline.scrollIntoView({ behavior: "smooth", block: "center" }); const f = $("input[name=text]", inline); if (f) setTimeout(() => f.focus({ preventScroll: true }), 350); }
      else openComments(key);
    },
    share: (t) => openShare(t.dataset.key),
    "share-profile": (t) => openShare(null, t.dataset.user),
    "copy-link": async () => {
      const inp = $("#share-url"), box = $(".share"); const ok = await copyText(inp.value);
      countShare(box && box.dataset.shareKey);
      toast(ok ? "Link copied to clipboard" : "Press Ctrl+C to copy the link", { icon: ok ? "copy" : "info" });
    },
    shared: () => countShare($(".share").dataset.shareKey),
    "native-share": async () => {
      const inp = $("#share-url");
      try { await navigator.share({ title: "Simple Cook", url: inp.value }); countShare($(".share").dataset.shareKey); } catch (e) { /* cancelled */ }
    },
    "toggle-theme": () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.classList.add("theme-anim");
      applyTheme(next); Api.setTheme(next);
      setTimeout(() => document.documentElement.classList.remove("theme-anim"), 350);
    },
    "toggle-menu": (t) => {
      const m = $("#mobile-menu"), on = m.hidden; m.hidden = !on; t.setAttribute("aria-expanded", String(on));
    },
    "toggle-search": (t) => {
      const h = $("#site-header"), on = h.classList.toggle("search-open");
      t.setAttribute("aria-expanded", String(on));
      if (on) setTimeout(() => sInput.focus(), 60);
    },
    "user-menu": (t) => {
      const dd = $(".user-menu .dropdown"); dd.hidden = !dd.hidden;
      t.setAttribute("aria-expanded", String(!dd.hidden));
    },
    lang: (t) => { const y = window.scrollY; SC.World.setLang(t.dataset.lang); render({ keepScroll: true }); window.scrollTo({ top: y, behavior: "instant" }); },
    logout: async () => {
      await Api.logout(); renderUser(); closeUserMenu();
      toast("You're logged out. See you soon!");
      if (location.hash === "#/" || location.hash === "") render(); else location.hash = "#/";
    },
    "close-modal": () => closeModal(),
    "edit-profile": openEditProfile,
    "points-info": openPointsInfo,
    delete: async (t) => {
      if (!window.confirm("Delete this post? This can't be undone.")) return;
      if (await Api.remove(t.dataset.key)) { toast("Post deleted"); render({ keepScroll: true }); }
    },
    "add-row": (t) => {
      const rows = $(`[data-rows="${t.dataset.kind}"]`);
      rows.insertAdjacentHTML("beforeend", V.row(t.dataset.kind));
      const f = rows.lastElementChild.querySelector("input,textarea"); if (f) f.focus();
    },
    "rm-row": (t) => {
      const item = t.closest(".row-item"), rows = item.parentElement;
      if (rows.children.length > 1) item.remove(); else item.querySelectorAll("input,textarea").forEach((i) => { i.value = ""; });
    },
    "drop-clear": (t, e) => {
      e.preventDefault(); e.stopPropagation();
      const wrap = t.closest(".drop"), name = wrap.dataset.drop, inp = $("input[type=file]", wrap);
      if (name === "video" && SC.draft.video) URL.revokeObjectURL(SC.draft.video.url);
      delete SC.draft[name]; inp.value = ""; wrap.classList.remove("has"); $(".drop-preview", wrap).innerHTML = "";
    },
    "toggle-pw": (t) => {
      const inp = t.closest(".pw").querySelector("input");
      inp.type = inp.type === "password" ? "text" : "password";
      t.innerHTML = icon(inp.type === "password" ? "eye" : "eye-off");
      t.setAttribute("aria-label", inp.type === "password" ? "Show password" : "Hide password");
    },
    "fill-demo": () => { $("#f-identifier").value = Api.DEMO.username; $("#f-password").value = Api.DEMO.password; },
    "reset-demo": () => {
      if (!window.confirm("Reset all demo data (accounts, likes, posts, comments)?")) return;
      Api.resetAll(); applyTheme(Api.theme()); renderUser(); toast("Demo data reset");
      if (location.hash === "#/" || location.hash === "") render(); else location.hash = "#/";
    },
  };

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".user-menu")) closeUserMenu();
    if (!e.target.closest("#header-search")) closeDrop();
    const t = e.target.closest("[data-act]"); if (!t) return;
    const fn = ACTIONS[t.dataset.act]; if (fn) fn(t, e);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeModal(); closeUserMenu(); closeDrop(); $("#site-header").classList.remove("search-open"); }
  });

  /* ==================================================================== */
  /* Forms                                                                 */
  /* ==================================================================== */
  const clearErrors = (f) => {
    $$(".field", f).forEach((w) => { w.classList.remove("invalid"); const m = $(".field-msg", w); if (m && !w.classList.contains("valid")) m.textContent = ""; });
    const fe = $(".form-error", f); if (fe) fe.textContent = "";
  };
  function fieldErr(f, name, msg) {
    const w = $(`[data-field="${name}"]`, f);
    if (!w) { toast(msg, { type: "error" }); return; }
    w.classList.remove("valid"); w.classList.add("invalid");
    const m = $(".field-msg", w); if (m) m.textContent = msg;
    const i = $("input,textarea,select", w); if (i) i.focus();
  }
  const formErr = (f, msg) => { const fe = $(".form-error", f); if (fe) fe.textContent = msg; };
  const splitList = (s) => String(s || "").split(/[,\s]+/).map((x) => x.replace(/^#/, "").trim()).filter(Boolean);

  document.addEventListener("submit", async (e) => {
    const f = e.target.closest("form[data-form]"); if (!f) return;
    e.preventDefault(); clearErrors(f);
    if (f.dataset.busy) return;                       // ignore double submits while a request is in flight
    const name = f.dataset.form, el = f.elements, REAL = SC.backend.mode !== "local";
    const submitBtn = f.querySelector('[type=submit]');
    f.dataset.busy = "1"; if (submitBtn) submitBtn.disabled = true;
    try { await handleForm(f, name, el, REAL); }
    catch (err) { console.error(err); toast("Something went wrong. Please try again.", { type: "error" }); }
    finally { delete f.dataset.busy; if (submitBtn) submitBtn.disabled = false; }
  });

  async function handleForm(f, name, el, REAL) {

    if (name === "login") {
      if (!el.identifier.value.trim()) return fieldErr(f, "identifier", "Enter your username or email.");
      if (!el.password.value) return fieldErr(f, "password", "Enter your password.");
      const r = await Api.login(el.identifier.value, el.password.value);
      if (r.error) return formErr(f, r.error);
      renderUser(); toast(`Welcome back, ${r.user.name}!`);
      location.hash = lastPage && !/login|signup|forgot/.test(lastPage) ? lastPage : "#/";
    }

    else if (name === "signup") {
      const username = el.username.value.trim().toLowerCase(), email = el.email.value.trim();
      if (!/^[a-z0-9_.]{3,20}$/.test(username)) return fieldErr(f, "username", "Use 3 to 20 letters, numbers, dots or underscores.");
      if (Api.usernameTaken(username)) return fieldErr(f, "username", "That username is taken. Try another.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fieldErr(f, "email", "Enter a valid email address.");
      if (Api.emailTaken(email)) return fieldErr(f, "email", "An account with this email already exists.");
      if (el.password.value.length < 8) return fieldErr(f, "password", "Use at least 8 characters.");
      if (el.confirm.value !== el.password.value) return fieldErr(f, "confirm", "Passwords don't match.");
      const r = await Api.signUp({ username, email, password: el.password.value, name: username[0].toUpperCase() + username.slice(1), avatar: SC.draft.avatar || null });
      if (r.error) return formErr(f, r.error);
      if (r.needsVerification) {                       // real backend with "Confirm email" enabled
        SC.draft = {};
        toast("Almost there! Check your inbox and click the link to verify your email, then log in.", { icon: "mail-check", ms: 12000 });
        location.hash = "#/login"; return;
      }
      if (REAL && SC.draft.avatar) await Api.updateProfile({ avatar: SC.draft.avatar });   // uploads need a session, so avatar goes up after sign-up
      SC.draft = {}; renderUser(); toast(`Welcome to Simple Cook, @${r.user.username}!`);
      location.hash = "#/profile/" + r.user.username;
    }

    else if (name === "forgot1") {
      const email = el.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fieldErr(f, "email", "Enter a valid email address.");
      if (REAL) {                                        // real email; the response never reveals whether the account exists
        const r = await Api.requestPasswordReset(email);
        if (r.error) return formErr(f, r.error);
        $("#forgot-body").innerHTML = V.forgotStep2(email);
        toast("If an account exists for that email, we've sent a code.", { icon: "mail", ms: 8000 });
        return;
      }
      if (!Api.accountExists(email)) return fieldErr(f, "email", "We couldn't find an account with that email.");
      if (Api.isDemoEmail(email)) return formErr(f, "The demo account's password can't be changed. Try a new account instead.");
      const code = String(Math.floor(100000 + Math.random() * 900000));
      SC.resetCode = { email: email.toLowerCase(), code };
      $("#forgot-body").innerHTML = V.forgotStep2(email);
      toast(`Demo mode: your reset code is ${code}. A real app would email it.`, { icon: "mail", ms: 12000 });
    }

    else if (name === "forgot2") {
      if (el.password.value.length < 8) return fieldErr(f, "password", "Use at least 8 characters.");
      if (REAL) {
        const r = await Api.completePasswordReset(f.dataset.email, el.code.value, el.password.value);
        if (r.error) return fieldErr(f, "code", r.error);
        toast("Password updated. Log in with your new password."); location.hash = "#/login"; return;
      }
      const rc = SC.resetCode;
      if (!rc || el.code.value.trim() !== rc.code) return fieldErr(f, "code", "That code doesn't match. Check and try again.");
      const r = Api.resetPassword(rc.email, el.password.value);
      if (r.error) return formErr(f, r.error);
      SC.resetCode = null; toast("Password updated. Log in with your new password."); location.hash = "#/login";
    }

    else if (name === "comment") {
      const key = f.dataset.key, text = el.text.value.trim();
      if (!text) return;
      if (!(await Api.addComment(key, text))) return;
      el.text.value = "";
      $$(`[data-comments-list="${key}"]`).forEach((ul) => { ul.innerHTML = U.commentItems(key); });
      sync();
    }

    else if (name === "edit-profile") {
      const n = el.name.value.trim();
      if (n.length < 2) return fieldErr(f, "name", "Enter a display name.");
      const patch = { name: n, bio: el.bio.value.trim() };
      if (SC.draft.avatar) patch.avatar = SC.draft.avatar;
      await Api.updateProfile(patch); SC.draft.avatar = null;
      closeModal(); renderUser(); render({ keepScroll: true }); toast("Profile updated");
    }

    else if (name === "create") await submitCreate(f);
  }

  async function submitCreate(f) {
    const type = f.dataset.type, el = f.elements, me = Api.me();
    if (!me) return requireAuth("Log in to post.");
    const title = el.title.value.trim();
    if (title.length < 3) return fieldErr(f, "title", "Give it a title of at least 3 characters.");
    const draft = SC.draft;
    let data;

    if (type === "recipe") {
      const ing = $$("[name=ing]", f).map((i) => i.value.trim()).filter(Boolean);
      const steps = $$("[name=step]", f).map((i) => i.value.trim()).filter(Boolean);
      const prep = Math.max(0, parseInt(el.prep.value, 10) || 0), cook = Math.max(0, parseInt(el.cook.value, 10) || 0);
      if (prep + cook === 0) return fieldErr(f, "prep", "Add a preparation or cooking time.");
      if (!ing.length) return fieldErr(f, "ing", "Add at least one ingredient.");
      if (!steps.length) return fieldErr(f, "step", "Add at least one step.");
      const cat = el.category.value;
      data = {
        title, ph: draft.photo || "", cats: [cat], tags: String(el.tags.value).split(",").map((x) => x.trim()).filter(Boolean).slice(0, 8),
        prep, cook, diff: (f.querySelector("[name=difficulty]:checked") || {}).value || "Easy",
        serves: Math.max(1, parseInt(el.servings.value, 10) || 1),
        desc: `A ${Api.catName(cat).toLowerCase()} recipe shared by @${me.username}.`,
        ing, steps, tips: String(el.tips.value).split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 8),
      };
    } else {
      if (!draft.cover) return toast(type === "reel" ? "Add a cover image (or a video, and we'll grab one)." : "Add a thumbnail (or a video, and we'll grab one).", { type: "error" });
      const linked = type === "reel" && el.recipe.value ? Api.recipe(el.recipe.value) : null;
      if (type === "reel") {
        data = { title, ph: draft.cover, cats: linked ? linked.cats : [], cap: el.caption.value.trim(), tags: splitList(el.hashtags.value).slice(0, 8), recipe: linked ? linked.id : "", dur: (draft.video && draft.video.dur) || 30 };
      } else {
        const links = String(el.links.value).split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
          const parts = l.includes("|") ? l.split("|").map((s) => s.trim()) : [null, l];
          const url = U.safeUrl(parts[1] || parts[0]);
          return url ? { label: (parts[0] || l.replace(/^https?:\/\//i, "")).slice(0, 60), url } : null;
        }).filter(Boolean).slice(0, 6);
        data = { title, ph: draft.cover, cats: [el.category.value], desc: el.description.value.trim(), tags: splitList(el.hashtags.value).slice(0, 8), links, dur: (draft.video && draft.video.dur) || 0 };
      }
    }

    if (draft.video && draft.video.file) data._videoFile = draft.video.file;   // real backend uploads it to storage
    const res = await Api.create(type, data);
    if (res.error) return toast(res.error, { type: "error" });
    if (draft.video && !res.item._pid) SC.runtime.blobs[res.item.id] = draft.video.url;   // local demo mode only
    SC.draft = {};
    const pts = Api.POINTS["post_" + type];
    const dest = type === "recipe" ? "#/recipe/" + res.item.id : type === "reel" ? "#/reels/" + res.item.id : "#/video/" + res.item.id;
    toast(`Published! You earned +${pts} points.`, { icon: "sparkle" });
    if (!res.persisted) toast("Browser storage is full, so this post will only last until you close the tab.", { type: "error", ms: 6000 });
    location.hash = dest;
  }

  /* ---------- live field feedback (signup) ---------- */
  document.addEventListener("input", (e) => {
    const t = e.target, form = t.form;
    if (!form || form.dataset.form !== "signup") return;
    const w = t.closest(".field"), msg = w && $(".field-msg", w);
    if (t.id === "f-username") {
      const v = t.value.trim().toLowerCase();
      w.classList.remove("invalid", "valid");
      if (!v) { msg.textContent = ""; return; }
      if (!/^[a-z0-9_.]{3,20}$/.test(v)) { w.classList.add("invalid"); msg.textContent = "Use 3 to 20 letters, numbers, dots or underscores."; }
      else if (Api.usernameTaken(v)) { w.classList.add("invalid"); msg.textContent = "@" + v + " is taken."; }
      else { w.classList.add("valid"); msg.textContent = "@" + v + " is available"; }
    }
    if (t.id === "f-password") {
      const v = t.value; let s = 0;
      if (v.length >= 8) s++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++; if (/\d/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v) || v.length >= 14) s++;
      const m = $(".pw-meter", w); if (m) { m.dataset.s = v ? s : 0; }
    }
  });

  /* ---------- file uploads (images resized, video kept in memory) ---------- */
  function readImage(file, max, square) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = reject;
      fr.onload = () => {
        const im = new Image();
        im.onerror = reject;
        im.onload = () => {
          const c = document.createElement("canvas"), ctx = c.getContext("2d");
          if (square) {
            const s = Math.min(im.width, im.height); c.width = c.height = max;
            ctx.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, max, max);
          } else {
            const k = Math.min(1, max / Math.max(im.width, im.height));
            c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
            ctx.drawImage(im, 0, 0, c.width, c.height);
          }
          resolve(c.toDataURL("image/jpeg", 0.82));
        };
        im.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }
  function videoMeta(url) {
    return new Promise((resolve) => {
      const v = document.createElement("video");
      v.preload = "metadata"; v.muted = true; v.playsInline = true;
      let done = false, d = 0;
      const fin = (o) => { if (!done) { done = true; clearTimeout(timer); resolve(o); } };
      const timer = setTimeout(() => fin({ dur: d, frame: null }), 4500);
      v.onloadedmetadata = () => {
        d = isFinite(v.duration) ? Math.round(v.duration) : 0;
        try { v.currentTime = Math.min(1, (v.duration || 1) / 3); } catch (e) { fin({ dur: d, frame: null }); }
      };
      v.onseeked = () => {
        let frame = null;
        try {
          const k = Math.min(1, 1000 / Math.max(v.videoWidth, v.videoHeight)), c = document.createElement("canvas");
          c.width = Math.round(v.videoWidth * k); c.height = Math.round(v.videoHeight * k);
          c.getContext("2d").drawImage(v, 0, 0, c.width, c.height); frame = c.toDataURL("image/jpeg", 0.8);
        } catch (e) { /* ignore */ }
        fin({ dur: d, frame });
      };
      v.onerror = () => fin({ dur: 0, frame: null });
      v.src = url;
    });
  }
  const showPreview = (wrap, html) => { wrap.classList.add("has"); $(".drop-preview", wrap).innerHTML = html; };
  const imgPreview = (url) => `<img src="${esc(url)}" alt="Preview"><button type="button" class="drop-clear" data-act="drop-clear" aria-label="Remove">${icon("x")}</button>`;
  const bytes = (n) => (n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB");

  document.addEventListener("change", async (e) => {
    const inp = e.target.closest("input[type=file][data-file]"); if (!inp) return;
    const name = inp.dataset.file, file = inp.files && inp.files[0], wrap = inp.closest(".drop");
    if (!file) return;
    try {
      if (name === "video") {
        if (!file.type.startsWith("video/")) return toast("Please choose a video file.", { type: "error" });
        if (SC.draft.video) URL.revokeObjectURL(SC.draft.video.url);
        const url = URL.createObjectURL(file), meta = await videoMeta(url);
        SC.draft.video = { url, name: file.name, size: file.size, dur: meta.dur, file };
        showPreview(wrap, `<span class="file-chip">${icon("video")}<span><b>${esc(file.name)}</b><small>${bytes(file.size)}${meta.dur ? " · " + U.dur(meta.dur) : ""}</small></span><button type="button" class="drop-clear" data-act="drop-clear" aria-label="Remove">${icon("x")}</button></span>`);
        const cw = $('[data-drop="cover"]');
        if (meta.frame && cw && !SC.draft.cover) { SC.draft.cover = meta.frame; showPreview(cw, imgPreview(meta.frame)); toast("We grabbed a cover from your video.", { icon: "image" }); }
      } else {
        if (!file.type.startsWith("image/")) return toast("Please choose an image file.", { type: "error" });
        const url = await readImage(file, name === "avatar" ? 256 : 1400, name === "avatar");
        SC.draft[name] = url; showPreview(wrap, imgPreview(url));
      }
    } catch (err) { toast("Sorry, we couldn't read that file.", { type: "error" }); }
  });

  /* ==================================================================== */
  /* Global image fallback: illustrated plate instead of a broken image    */
  /* ==================================================================== */
  window.addEventListener("error", (e) => {
    const t = e.target;
    if (t && t.tagName === "IMG" && t.dataset && t.dataset.cat && !t.dataset.fb) {
      t.dataset.fb = "1";
      t.src = U.art(t.dataset.cat, t.dataset.seed || "x");
      const amb = $("#reels-ambient");
      if (amb && t.closest(".reel.playing")) amb.style.backgroundImage = `url("${t.src}")`;
    }
  }, true);

  /* Dev helper: run SC_checkImages() in the browser console to list any photo that fails to load. */
  window.SC_checkImages = () => Promise.all(Object.keys(D.PHOTO).map((k) => new Promise((res) => {
    const im = new Image(); im.onload = () => res([k, true]); im.onerror = () => res([k, false]); im.src = D.photoUrl(k, 200);
  }))).then((r) => {
    const bad = r.filter((x) => !x[1]).map((x) => x[0]);
    console.log(bad.length ? `${bad.length} of ${r.length} photos failed. Replace these keys in data.js: ${bad.join(", ")}` : `All ${r.length} photos loaded.`);
    return bad;
  });

  /* ==================================================================== */
  /* Boot                                                                  */
  /* ==================================================================== */
  applyTheme(Api.theme());
  $("#year").textContent = new Date().getFullYear();
  if (SC.backend.mode !== "local") {
    $("#footer-note").textContent = "Cook something amazing.";
    const rb = $("#reset-demo-btn"); if (rb) rb.remove();
  }
  window.addEventListener("hashchange", () => { closeModal(); const mm = $("#mobile-menu"); if (mm) mm.hidden = true; const mb = $("[data-act=toggle-menu]"); if (mb) mb.setAttribute("aria-expanded", "false"); render(); });

  // Live updates from the backend adapter (all no-ops in local demo mode)
  document.addEventListener("sc:comments", (e) => { $$(`[data-comments-list="${e.detail.key}"]`).forEach((ul) => { ul.innerHTML = U.commentItems(e.detail.key); }); });
  document.addEventListener("sc:stats", sync);
  document.addEventListener("sc:rollback", sync);
  document.addEventListener("sc:auth", () => { renderUser(); render({ keepScroll: true }); });

  (async function boot() {
    app.innerHTML = '<p class="muted" style="padding:3rem 1rem;text-align:center">Loading Simple Cook…</p>';
    try { await Api.init(); }
    catch (err) {
      console.error("[boot]", err);
      app.innerHTML = '<div style="padding:3rem 1rem;text-align:center"><h2>We can’t reach Simple Cook right now</h2><p class="muted">Check your connection and try again.</p><button class="btn btn-primary" onclick="location.reload()">Retry</button></div>';
      return;
    }
    render("init");
  })();
})();
