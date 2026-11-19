/* SIMPLE COOK — Phase 4 messaging + stories UI. Talks to Supabase only through SC.dm (see adapter). */
(function () {
  "use strict";
  const SC = window.SC, Api = SC.Api;
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const L = {
    en: { title: "Messages", search: "Search conversations", empty: "No conversations yet. Open a profile and press Message.", type: "Write a message…", send: "Send", deleted: "Message deleted", group: "New group", gname: "Group name", create: "Create", cancel: "Cancel", recipe: "Share a recipe", open: "Open recipe", gone: "Recipe unavailable", reply: "Reply", del: "Delete", report: "Report", block: "Block", typing: "typing…", story: "Your story", storyreply: "Replied to a story", rec: "Record", stop: "Stop", mic: "Microphone access was denied. Allow it in your browser settings.", fail: "Could not send. Tap to retry.", login: "Log in to use messages.", older: "Load older", read: "Read", sendvoice: "Send voice message", members: "Pick at least 2 members", pub: "Public", fol: "Followers", views: "views", login2: "Log in", nobk: "Messages and stories need the live server. This copy is running in local demo mode, where nobody else can receive your messages. Deploy the Railway server (see docs/RAILWAY.md) and open the site from there." },
    fr: { title: "Messages", search: "Rechercher", empty: "Aucune conversation. Ouvrez un profil et cliquez sur Message.", type: "Écrire un message…", send: "Envoyer", deleted: "Message supprimé", group: "Nouveau groupe", gname: "Nom du groupe", create: "Créer", cancel: "Annuler", recipe: "Partager une recette", open: "Ouvrir la recette", gone: "Recette indisponible", reply: "Répondre", del: "Supprimer", report: "Signaler", block: "Bloquer", typing: "écrit…", story: "Votre story", storyreply: "A répondu à une story", rec: "Enregistrer", stop: "Arrêter", mic: "Accès au micro refusé. Autorisez-le dans les réglages du navigateur.", fail: "Échec de l'envoi. Touchez pour réessayer.", login: "Connectez-vous pour utiliser les messages.", older: "Messages plus anciens", read: "Lu", sendvoice: "Envoyer le message vocal", members: "Choisissez au moins 2 membres", pub: "Public", fol: "Abonnés", views: "vues", login2: "Connexion", nobk: "Les messages et les stories nécessitent le serveur en ligne. Cette copie tourne en mode démo local : personne d'autre ne peut recevoir vos messages. Déployez le serveur Railway (voir docs/RAILWAY.md)." },
    ar: { title: "الرسائل", search: "بحث في المحادثات", empty: "لا توجد محادثات. افتح ملفًا شخصيًا واضغط رسالة.", type: "اكتب رسالة…", send: "إرسال", deleted: "تم حذف الرسالة", group: "مجموعة جديدة", gname: "اسم المجموعة", create: "إنشاء", cancel: "إلغاء", recipe: "مشاركة وصفة", open: "فتح الوصفة", gone: "الوصفة غير متاحة", reply: "رد", del: "حذف", report: "إبلاغ", block: "حظر", typing: "يكتب…", story: "قصتك", storyreply: "ردّ على قصة", rec: "تسجيل", stop: "إيقاف", mic: "تم رفض الوصول إلى الميكروفون. اسمح به من إعدادات المتصفح.", fail: "تعذر الإرسال. اضغط للمحاولة مجددًا.", login: "سجّل الدخول لاستخدام الرسائل.", older: "رسائل أقدم", read: "مقروءة", sendvoice: "إرسال الرسالة الصوتية", members: "اختر عضوين على الأقل", pub: "عام", fol: "المتابعون", views: "مشاهدات", login2: "تسجيل الدخول", nobk: "تحتاج الرسائل والقصص إلى الخادم المباشر. هذه النسخة تعمل بالوضع التجريبي المحلي ولا يستطيع أحد آخر استلام رسائلك. انشر خادم Railway (راجع docs/RAILWAY.md)." },
  };
  const t = (k) => (L[(document.documentElement.lang || "en").slice(0, 2)] || L.en)[k] || L.en[k] || k;
  const EMO = ["❤️", "😂", "😍", "👍", "😮", "😢", "🔥"], SEMO = ["❤️", "😍", "😂", "🔥", "👏", "😮"];
  const st = { convs: [], cid: null, msgs: [], members: [], reply: null, ch: null, tch: null, tt: 0, rec: null, stories: [] };
  const dm = () => SC.dm;
  const me = () => (dm() && dm().me()) || null;
  const users = () => Api.users();
  const user = (id) => users().find((u) => u.uuid === id) || { username: "user", name: "User" };
  const av = (u) => `<span class="dm-av">${u.avatar ? `<img src="${esc(u.avatar)}" alt="" loading="lazy">` : esc(String(u.name || u.username || "?")[0])}</span>`;
  const items = () => [].concat(Api.recipes(), Api.reels(), Api.videos());
  const postItem = (pid) => items().find((i) => i._pid === pid);
  const itemHref = (i) => "#/" + (i.type === "recipe" ? "recipe" : i.type === "reel" ? "reels" : "video") + "/" + encodeURIComponent(i.id);
  const toast = (m) => { const e = document.createElement("div"); e.className = "dm-toast"; e.textContent = m; document.body.appendChild(e); setTimeout(() => e.remove(), 3500); };
  const errMsg = (e) => (e && e.message) || "Error";
  let root = null;

  function title(c) { if (c.group) return c.title || "Group"; const o = c.members.find((x) => x !== me()); return user(o).name || user(o).username; }
  function otherUser(c) { return user(c.members.find((x) => x !== me())); }
  function preview(c) { const l = c.last; if (!l) return ""; if (l.deleted_at) return t("deleted"); return l.kind === "text" || l.kind === "story_reply" ? l.body || "" : "[" + l.kind + "]"; }

  async function loadConvs() {
    const d = dm(), id = me();
    const r = await d.from("conversation_members").select("conversation_id,last_read_at,conversations(id,is_group,title,last_message_at)").eq("profile_id", id);
    if (r.error) throw r.error;
    const ids = r.data.map((m) => m.conversation_id);
    if (!ids.length) { st.convs = []; return; }
    const [mem, last] = await Promise.all([
      d.from("conversation_members").select("conversation_id,profile_id").in("conversation_id", ids),
      d.from("messages").select("conversation_id,sender_id,body,kind,created_at,deleted_at").in("conversation_id", ids).order("created_at", { ascending: false }).limit(300)]);
    st.convs = r.data.map((m) => {
      const c = m.conversations, ms = (last.data || []).filter((x) => x.conversation_id === c.id);
      return { id: c.id, group: c.is_group, title: c.title, at: c.last_message_at, members: (mem.data || []).filter((x) => x.conversation_id === c.id).map((x) => x.profile_id), last: ms[0],
        unread: ms.filter((x) => x.sender_id !== id && (!m.last_read_at || x.created_at > m.last_read_at)).length };
    }).sort((a, b) => new Date(b.at) - new Date(a.at));
  }

  function shell() {
    root.dir = (document.documentElement.lang || "").startsWith("ar") ? "rtl" : "ltr";
    root.innerHTML = `<div class="dm ${st.cid ? "dm-open" : ""}"><aside class="dm-side"><div class="dm-head"><h1>${t("title")}</h1><button class="btn btn-sm" id="dm-newg">${t("group")}</button></div>
      <div class="dm-stories" id="dm-stories"></div><input class="dm-search" id="dm-q" placeholder="${t("search")}" aria-label="${t("search")}"><div id="dm-list" class="dm-list"></div></aside>
      <section class="dm-main" id="dm-main"></section></div>`;
    $("#dm-q").oninput = renderList; $("#dm-newg").onclick = groupPanel; renderList(); renderThread(); renderStories();
  }
  function renderList() {
    const q = ($("#dm-q") || {}).value ? $("#dm-q").value.toLowerCase() : "", el = $("#dm-list"); if (!el) return;
    const rows = st.convs.filter((c) => title(c).toLowerCase().includes(q));
    el.innerHTML = rows.length ? rows.map((c) => `<button class="dm-row ${c.id === st.cid ? "on" : ""}" data-c="${c.id}">${c.group ? `<span class="dm-av">👥</span>` : av(otherUser(c))}<span class="dm-rt"><b>${esc(title(c))}</b><small>${esc(preview(c)).slice(0, 60)}</small></span>${c.unread ? `<span class="dm-n" aria-label="${c.unread}">${c.unread}</span>` : ""}</button>`).join("") : `<p class="dm-empty">${t("empty")}</p>`;
    el.querySelectorAll("[data-c]").forEach((b) => (b.onclick = () => { location.hash = "#/messages/" + b.dataset.c; }));
  }

  async function open(cid) {
    st.cid = cid; st.reply = null; st.msgs = []; unsub(); shell();
    const d = dm(), main = $("#dm-main"); main.innerHTML = `<div class="dm-load">…</div>`;
    try {
      const [m, mem] = await Promise.all([fetchMsgs(), d.from("conversation_members").select("profile_id,role,last_read_at").eq("conversation_id", cid)]);
      st.msgs = m; st.members = mem.data || [];
      await d.rpc("mark_conversation_read", { p_cid: cid }); const c = st.convs.find((x) => x.id === cid); if (c) c.unread = 0;
      renderThread(); renderList(); badge(); sub(cid);
    } catch (e) { main.innerHTML = `<p class="dm-empty">${esc(errMsg(e))}</p>`; }
  }
  async function fetchMsgs(before) {
    let q = dm().from("messages").select("*,message_attachments(*),message_reactions(emoji,profile_id)").eq("conversation_id", st.cid).order("created_at", { ascending: false }).limit(40);
    if (before) q = q.lt("created_at", before);
    const r = await q; if (r.error) throw r.error; return r.data.reverse();
  }
  function status(m) {
    const others = st.members.filter((x) => x.profile_id !== me()), n = others.filter((x) => x.last_read_at && x.last_read_at >= m.created_at).length;
    return n ? (others.length > 1 ? `${t("read")} ${n}` : "✓✓") : "✓";
  }
  function bubble(m, prev) {
    const mine = m.sender_id === me(), u = user(m.sender_id), grp = (st.convs.find((c) => c.id === st.cid) || {}).group;
    let h = "";
    if (m.deleted_at) h = `<i>${t("deleted")}</i>`;
    else {
      if (m.reply_to_id) { const o = st.msgs.find((x) => x.id === m.reply_to_id); h += `<a class="dm-rp" data-go="${esc(m.reply_to_id)}">${o ? esc(user(o.sender_id).username) + ": " + esc(String(o.deleted_at ? t("deleted") : o.body || "[" + o.kind + "]").slice(0, 60)) : t("deleted")}</a>`; }
      if (m.kind === "story_reply") h += `<small>↩ ${t("storyreply")}</small>`;
      (m.message_attachments || []).forEach((a) => {
        const p = `data-path="${esc(a.storage_path)}"`;
        h += a.kind === "image" ? `<img class="dm-media" ${p} alt="" loading="lazy">` : a.kind === "video" ? `<video class="dm-media" ${p} controls preload="none" playsinline></video>`
          : `<div class="dm-voice"><audio ${p} controls preload="none"></audio><button class="dm-spd" data-spd>1x</button></div>`;
      });
      if (m.kind === "recipe" || m.kind === "post") { const it = postItem(m.shared_post_id); h += it ? `<div class="dm-card"><b>${esc(it.title)}</b><a class="btn btn-sm btn-primary" href="${itemHref(it)}">${t("open")}</a></div>` : `<div class="dm-card"><i>${t("gone")}</i></div>`; }
      if (m.body) h += `<p>${esc(m.body)}</p>`;
    }
    const rx = {}; (m.message_reactions || []).forEach((r) => { rx[r.emoji] = (rx[r.emoji] || 0) + 1; });
    const rxh = Object.keys(rx).map((e) => `<button class="dm-rx" data-rx="${e}" data-m="${m.id}">${e} ${rx[e]}</button>`).join("");
    const time = new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `<div class="dm-msg ${mine ? "me" : "them"}" id="m-${m.id}">${grp && !mine && (!prev || prev.sender_id !== m.sender_id) ? `<small class="dm-who">${esc(u.username)}</small>` : ""}<div class="dm-b">${h}</div><div class="dm-meta">${rxh}<span>${time}${mine ? " " + status(m) : ""}</span>${m.deleted_at ? "" : `<button class="dm-act" data-act="${m.id}" aria-label="…">⋯</button>`}</div></div>`;
  }
  function renderThread() {
    const main = $("#dm-main"); if (!main) return;
    const c = st.convs.find((x) => x.id === st.cid);
    if (!st.cid || !c) { main.innerHTML = `<p class="dm-empty">${t("empty")}</p>`; return; }
    const near = main.querySelector(".dm-thread") ? (() => { const e = main.querySelector(".dm-thread"); return e.scrollHeight - e.scrollTop - e.clientHeight < 120; })() : true;
    const oldIn = main.querySelector("#dm-in"), draft = oldIn ? oldIn.value : "", hadFocus = !!oldIn && document.activeElement === oldIn, oldPos = oldIn ? oldIn.selectionStart : 0;
    main.innerHTML = `<header class="dm-ch"><a class="dm-back" href="#/messages" aria-label="Back">←</a>${c.group ? `<span class="dm-av">👥</span>` : av(otherUser(c))}<b>${esc(title(c))}</b><small id="dm-typ"></small>${c.group ? `<button class="btn btn-sm" id="dm-leave">Leave</button>` : `<button class="btn btn-sm" id="dm-block">${t("block")}</button>`}</header>
      <div class="dm-thread" id="dm-thread"><button class="btn btn-sm" id="dm-older">${t("older")}</button>${st.msgs.map((m, i) => bubble(m, st.msgs[i - 1])).join("")}</div>
      ${st.reply ? `<div class="dm-replying">${t("reply")}: ${esc(String(st.reply.body || "[" + st.reply.kind + "]").slice(0, 60))} <button id="dm-x">✕</button></div>` : ""}
      <div id="dm-panel"></div>
      <form class="dm-comp" id="dm-form"><button type="button" id="dm-att" aria-label="Attach">📎</button><button type="button" id="dm-rcp" aria-label="${t("recipe")}">🍲</button><input id="dm-in" maxlength="4000" placeholder="${t("type")}" autocomplete="off"><button type="button" id="dm-mic" aria-label="${t("rec")}">🎙️</button><button class="btn btn-primary btn-sm" id="dm-send">${t("send")}</button><input type="file" id="dm-file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" hidden></form>`;
    const th = $("#dm-thread"); if (near) th.scrollTop = th.scrollHeight;
    if (draft) { $("#dm-in").value = draft; if (hadFocus) { $("#dm-in").focus(); try { $("#dm-in").setSelectionRange(oldPos, oldPos); } catch (e) { /* ignore */ } } } else if (hadFocus) $("#dm-in").focus();
    $("#dm-form").onsubmit = (e) => { e.preventDefault(); sendText(); };
    $("#dm-in").oninput = typing; $("#dm-att").onclick = () => $("#dm-file").click(); $("#dm-file").onchange = (e) => sendFile(e.target.files[0]);
    $("#dm-rcp").onclick = recipePanel; $("#dm-mic").onclick = voice; $("#dm-older").onclick = older;
    const x = $("#dm-x"); if (x) x.onclick = () => { st.reply = null; renderThread(); };
    const lv = $("#dm-leave"); if (lv) lv.onclick = async () => { if (!confirm("Leave this group?")) return; const r = await dm().rpc("leave_conversation", { p_cid: st.cid }); if (r.error) return toast(errMsg(r.error)); location.hash = "#/messages"; };
    const bl = $("#dm-block"); if (bl) bl.onclick = async () => { if (!confirm(t("block") + "?")) return; const r = await dm().from("blocks").insert({ blocker_id: me(), blocked_id: otherUser(c).uuid }); toast(r.error ? errMsg(r.error) : "OK"); };
    th.onclick = (e) => {
      const g = e.target.closest("[data-go]"); if (g) { const n = document.getElementById("m-" + g.dataset.go); if (n) n.scrollIntoView({ block: "center" }); return; }
      const rx = e.target.closest("[data-rx]"); if (rx) return react(rx.dataset.m, rx.dataset.rx);
      const sp = e.target.closest("[data-spd]"); if (sp) { const a = sp.previousElementSibling, n = a.playbackRate >= 2 ? 1 : a.playbackRate >= 1.5 ? 2 : 1.5; a.playbackRate = n; sp.textContent = n + "x"; return; }
      const ac = e.target.closest("[data-act]"); if (ac) menu(ac.dataset.act, ac);
    };
    th.querySelectorAll("[data-path]").forEach(async (el) => { const r = await dm().bucket("chat-media").createSignedUrl(el.dataset.path, 600); if (r.data) el.src = r.data.signedUrl; else el.alt = "unavailable"; });
  }
  function menu(id, anchor) {
    const m = st.msgs.find((x) => x.id === id); if (!m) return;
    const old = $(".dm-menu"); if (old) old.remove();
    const d = document.createElement("div"); d.className = "dm-menu";
    d.innerHTML = EMO.map((e) => `<button data-e="${e}">${e}</button>`).join("") + `<button data-a="reply">${t("reply")}</button>${m.body ? `<button data-a="copy">Copy</button>` : ""}${m.sender_id === me() ? `<button data-a="del">${t("del")}</button>` : `<button data-a="rep">${t("report")}</button>`}`;
    anchor.parentElement.appendChild(d);
    d.onclick = async (e) => {
      const b = e.target.closest("button"); if (!b) return; d.remove();
      if (b.dataset.e) return react(id, b.dataset.e);
      if (b.dataset.a === "reply") { st.reply = m; renderThread(); }
      if (b.dataset.a === "copy") navigator.clipboard && navigator.clipboard.writeText(m.body);
      if (b.dataset.a === "del" && confirm(t("del") + "?")) { const r = await dm().rpc("delete_message", { p_mid: id }); if (r.error) toast(errMsg(r.error)); else refreshMsg(id); }
      if (b.dataset.a === "rep") { const r = await dm().from("reports").insert({ reporter_id: me(), target_type: "message", target_id: id, reason: "harassment" }); toast(r.error ? errMsg(r.error) : "OK"); }
    };
  }
  async function react(id, e) { const r = await dm().rpc("toggle_message_reaction", { p_mid: id, p_emoji: e }); if (r.error) toast(errMsg(r.error)); else refreshMsg(id); }
  async function refreshMsg(id) {
    const r = await dm().from("messages").select("*,message_attachments(*),message_reactions(emoji,profile_id)").eq("id", id).maybeSingle();
    if (!r.data || r.data.conversation_id !== st.cid) return;
    const i = st.msgs.findIndex((x) => x.id === id); if (i < 0) st.msgs.push(r.data); else st.msgs[i] = r.data; renderThread();
  }
  async function older() { const b = await fetchMsgs(st.msgs[0] && st.msgs[0].created_at); st.msgs = b.concat(st.msgs); renderThread(); }

  async function deliver(args, input) {
    const r = await dm().rpc("send_message", Object.assign({ p_cid: st.cid, p_reply_to: st.reply ? st.reply.id : null }, args));
    if (r.error) { toast(t("fail") + " " + errMsg(r.error)); if (input) input.value = args.p_body || ""; return false; }
    st.reply = null; await refreshMsg(r.data.id); return true;
  }
  async function sendText() {
    const i = $("#dm-in"), body = i.value.trim(); if (!body) return;
    const btn = $("#dm-send"); btn.disabled = true; i.value = "";
    await deliver({ p_body: body, p_kind: "text" }, i); const b2 = $("#dm-send"); if (b2) b2.disabled = false;
  }
  async function upload(file, kind, dur) {
    const ext = (file.name || "voice.webm").split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
    const path = me() + "/" + (crypto.randomUUID ? crypto.randomUUID() : Date.now()) + "." + ext;
    const up = await dm().bucket("chat-media").upload(path, file, { contentType: file.type, upsert: false });
    if (up.error) throw up.error;
    return { kind, storage_path: path, mime_type: file.type, size_bytes: file.size, duration_s: dur || null };
  }
  async function sendFile(f) {
    if (!f) return;
    const ok = /^(image\/(jpeg|png|webp)|video\/(mp4|webm))$/.test(f.type);
    if (!ok || f.size > 25 * 1024 * 1024) return toast("JPEG, PNG, WebP, MP4 or WebM — max 25 MB");
    try { const kind = f.type.startsWith("image") ? "image" : "video"; await deliver({ p_kind: kind, p_attachment: await upload(f, kind) }); } catch (e) { toast(errMsg(e)); }
  }
  function recipePanel() {
    const p = $("#dm-panel"); p.innerHTML = `<div class="dm-pick"><input id="dm-rq" placeholder="${t("recipe")}"><div id="dm-rl"></div></div>`;
    const draw = () => { const q = $("#dm-rq").value; const l = Api.recipes().filter((r) => !q || Api.matches(r, q)).slice(0, 20); $("#dm-rl").innerHTML = l.map((r) => `<button data-p="${esc(r._pid)}">${esc(r.title)}</button>`).join(""); };
    $("#dm-rq").oninput = draw; draw();
    $("#dm-rl").onclick = async (e) => { const b = e.target.closest("[data-p]"); if (!b) return; p.innerHTML = ""; await deliver({ p_kind: "recipe", p_post: b.dataset.p }); };
  }
  function voice() {
    const p = $("#dm-panel");
    if (st.rec) { st.rec.mr.stop(); return; }
    if (!navigator.mediaDevices || !window.MediaRecorder) return toast("Voice recording is not supported in this browser.");
    navigator.mediaDevices.getUserMedia({ audio: true }).then((s) => {
      const mime = ["audio/webm", "audio/mp4", "audio/ogg"].find((m) => MediaRecorder.isTypeSupported(m)) || "";
      const mr = new MediaRecorder(s, mime ? { mimeType: mime } : {}), chunks = [], t0 = Date.now();
      st.rec = { mr }; $("#dm-mic").textContent = "⏹";
      const tick = setInterval(() => { p.innerHTML = `<div class="dm-pick">🔴 ${Math.round((Date.now() - t0) / 1000)}s <button id="dm-rs">${t("stop")}</button></div>`; const b = $("#dm-rs"); if (b) b.onclick = () => mr.stop(); if (Date.now() - t0 > 180000) mr.stop(); }, 500);
      mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      mr.onstop = () => {
        clearInterval(tick); s.getTracks().forEach((x) => x.stop()); st.rec = null; const mic = $("#dm-mic"); if (mic) mic.textContent = "🎙️";
        const blob = new Blob(chunks, { type: (mr.mimeType || "audio/webm").split(";")[0] }), secs = Math.round((Date.now() - t0) / 1000);
        p.innerHTML = `<div class="dm-pick"><audio controls src="${URL.createObjectURL(blob)}"></audio><button class="btn btn-primary btn-sm" id="dm-vs">${t("sendvoice")}</button><button class="btn btn-sm" id="dm-vc">${t("cancel")}</button></div>`;
        $("#dm-vc").onclick = () => { p.innerHTML = ""; };
        $("#dm-vs").onclick = async () => { p.innerHTML = ""; try { await deliver({ p_kind: "voice", p_attachment: await upload(new File([blob], "voice." + (blob.type.split("/")[1] || "webm"), { type: blob.type }), "voice", secs) }); } catch (e) { toast(errMsg(e)); } };
      };
      mr.start();
    }).catch(() => toast(t("mic")));
  }
  function groupPanel() {
    const sel = new Set(), main = $("#dm-main"); st.cid = null;
    main.innerHTML = `<div class="dm-grp"><h2>${t("group")}</h2><input id="dm-gn" maxlength="80" placeholder="${t("gname")}"><input id="dm-gs" placeholder="${t("search")}"><div id="dm-gl" class="dm-gl"></div><button class="btn btn-primary" id="dm-gc">${t("create")}</button></div>`;
    document.querySelector(".dm").classList.add("dm-open");
    const draw = () => { const q = $("#dm-gs").value.toLowerCase(); $("#dm-gl").innerHTML = users().filter((u) => u.uuid && u.uuid !== me() && (u.username + " " + (u.name || "")).toLowerCase().includes(q)).slice(0, 30).map((u) => `<label><input type="checkbox" data-u="${u.uuid}" ${sel.has(u.uuid) ? "checked" : ""}> ${esc(u.name || u.username)} <small>@${esc(u.username)}</small></label>`).join(""); };
    $("#dm-gs").oninput = draw; draw();
    $("#dm-gl").onchange = (e) => { const u = e.target.dataset.u; e.target.checked ? sel.add(u) : sel.delete(u); };
    $("#dm-gc").onclick = async () => { if (sel.size < 2) return toast(t("members")); const r = await dm().rpc("create_group", { p_title: $("#dm-gn").value, p_members: [...sel] }); if (r.error) return toast(errMsg(r.error)); await loadConvs(); location.hash = "#/messages/" + r.data; };
  }

  // ---- realtime: new/changed messages (RLS-filtered) + typing broadcast -------------------------
  function sub(cid) {
    const d = dm();
    st.ch = d.channel("dm-" + me()).on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (p) => {
      const row = p.new && p.new.id ? p.new : null; if (!row) return;
      const reading = row.conversation_id === st.cid && row.sender_id !== me() && document.visibilityState === "visible";
      if (row.conversation_id === st.cid) refreshMsg(row.id); else if (p.eventType === "INSERT") { loadConvs().then(renderList); }
      if (reading) d.rpc("mark_conversation_read", { p_cid: st.cid }).then(() => badge()); else badge();   // count again only AFTER the server marked it read
    }).on("postgres_changes", { event: "*", schema: "public", table: "message_reactions" }, (p) => { const r = p.new && p.new.message_id ? p.new : p.old; if (r && r.message_id && st.msgs.some((x) => x.id === r.message_id)) refreshMsg(r.message_id); })
      .on("postgres_changes", { event: "*", schema: "public", table: "conversation_members" }, (p) => { const r = p.new; if (!r || r.conversation_id !== st.cid) return; const m = st.members.find((x) => x.profile_id === r.profile_id); if (m) { m.last_read_at = r.last_read_at; renderThread(); } }).subscribe();
    if (cid) st.tch = d.channel("typing-" + cid, { config: { broadcast: { self: false } } }).on("broadcast", { event: "typing" }, (p) => {
      const el = $("#dm-typ"); if (!el) return; el.textContent = (user(p.payload.u).username || "") + " " + t("typing"); clearTimeout(st.tt); st.tt = setTimeout(() => { const e2 = $("#dm-typ"); if (e2) e2.textContent = ""; }, 3000);
    }).subscribe();
  }
  document.addEventListener("sc:reconnect", () => { if (!root || !document.body.contains(root) || !me()) return; loadConvs().then(() => { renderList(); if (st.cid) return fetchMsgs().then((m) => { st.msgs = m; renderThread(); }); }).catch(() => {}); });
  function unsub() { const d = dm(); if (st.ch) d.drop(st.ch); if (st.tch) d.drop(st.tch); st.ch = st.tch = null; }
  let lastTyp = 0;
  function typing() { if (st.tch && Date.now() - lastTyp > 2000) { lastTyp = Date.now(); st.tch.send({ type: "broadcast", event: "typing", payload: { u: me() } }); } }
  async function badge() {
    const els = document.querySelectorAll(".dm-badge"); if (!els.length || !me()) return;
    const r = await dm().from("notifications").select("id", { count: "exact", head: true }).eq("recipient_id", me()).is("read_at", null).in("type", ["message", "story_reaction", "story_reply"]);
    const n = r.count || 0; els.forEach((el) => { el.textContent = n > 99 ? "99+" : n; el.hidden = !n; });
  }

  // ---- stories -----------------------------------------------------------------------------------
  async function renderStories() {
    const el = $("#dm-stories"); if (!el) return;
    const r = await dm().from("stories").select("id,author_id,media_path,media_kind,caption,created_at,story_views(viewer_id)").gt("expires_at", new Date().toISOString()).order("created_at");
    if (!el.isConnected) return;   // the page was redrawn while the stories were loading
    const by = {}; (r.data || []).forEach((s) => { (by[s.author_id] = by[s.author_id] || []).push(s); });
    st.stories = Object.keys(by).map((a) => ({ author: a, items: by[a], seen: by[a].every((s) => (s.story_views || []).some((v) => v.viewer_id === me())) }));
    el.innerHTML = `<label class="dm-st add"><span class="dm-ring">+</span><small>${t("story")}</small><input type="file" id="dm-sf" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" hidden></label>` +
      st.stories.map((g, i) => `<button class="dm-st" data-i="${i}"><span class="dm-ring ${g.seen ? "seen" : ""}">${av(user(g.author))}</span><small>${esc(user(g.author).username)}</small></button>`).join("");
    el.onclick = (e) => { const b = e.target.closest("[data-i]"); if (b) viewStory(+b.dataset.i); };
    const sf = el.querySelector("#dm-sf"); if (sf) sf.onchange = (e) => createStory(e.target.files[0]);
  }
  async function createStory(f) {
    if (!f) return;
    if (!/^(image\/(jpeg|png|webp)|video\/(mp4|webm))$/.test(f.type) || f.size > 50 * 1024 * 1024) return toast("JPEG, PNG, WebP, MP4 or WebM — max 50 MB");
    const caption = (prompt(t("story") + " – caption (optional)") || "").slice(0, 200), pub = confirm(t("pub") + "? OK = " + t("pub") + " / " + t("cancel") + " = " + t("fol"));
    const path = me() + "/stories/" + (crypto.randomUUID ? crypto.randomUUID() : Date.now()) + "." + (f.type.split("/")[1] === "quicktime" ? "mp4" : f.type.split("/")[1]);
    const up = await dm().bucket("post-media").upload(path, f, { contentType: f.type });
    if (up.error) return toast(errMsg(up.error));
    const r = await dm().from("stories").insert({ author_id: me(), media_path: path, media_kind: f.type.startsWith("video") ? "video" : "image", caption: caption || null, visibility: pub ? "public" : "followers" });
    if (r.error) toast(errMsg(r.error)); else renderStories();
  }
  function viewStory(gi) {
    const g = st.stories[gi]; if (!g) return; let i = 0, timer = null, paused = false;
    const o = document.createElement("div"); o.className = "dm-sv"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true"); document.body.appendChild(o);
    const close = () => { clearTimeout(timer); o.remove(); renderStories(); };
    const next = () => { if (i + 1 < g.items.length) { i++; show(); } else if (gi + 1 < st.stories.length) { close(); viewStory(gi + 1); } else close(); };
    const prev = () => { if (i > 0) i--; show(); };
    function show() {
      clearTimeout(timer); const s = g.items[i], u = user(g.author), mine = g.author === me();
      const url = dm().bucket("post-media").getPublicUrl(s.media_path).data.publicUrl;
      o.innerHTML = `<div class="dm-bars">${g.items.map((_, k) => `<span class="${k < i ? "done" : k === i ? "cur" : ""}"><i style="animation-duration:${s.media_kind === "video" ? 0 : 5}s"></i></span>`).join("")}</div>
        <div class="dm-sh">${av(u)}<b>${esc(u.username)}</b><small>${new Date(s.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small><button id="sv-x" aria-label="Close">✕</button></div>
        <div class="dm-sm" id="sv-m">${s.media_kind === "video" ? `<video src="${esc(url)}" autoplay playsinline></video>` : `<img src="${esc(url)}" alt="">`}</div>
        ${s.caption ? `<p class="dm-sc">${esc(s.caption)}</p>` : ""}
        <div class="dm-sf">${mine ? `<span id="sv-v">👁 …</span>` : `<div class="dm-sr">${SEMO.map((e) => `<button data-e="${e}">${e}</button>`).join("")}</div><form id="sv-f"><input id="sv-i" maxlength="500" placeholder="${t("reply")}"><button class="btn btn-sm btn-primary">${t("send")}</button></form>`}</div>`;
      $("#sv-x").onclick = close;
      const m = $("#sv-m"), media = m.firstElementChild; media.onerror = () => { m.innerHTML = `<p class="dm-empty">⚠</p>`; };
      m.onclick = (e) => { const r = m.getBoundingClientRect(); (e.clientX - r.left) < r.width / 3 ? prev() : next(); };
      m.onpointerdown = () => { paused = true; clearTimeout(timer); if (media.pause) media.pause(); }; m.onpointerup = () => { if (!paused) return; paused = false; if (media.play) media.play(); if (s.media_kind !== "video") timer = setTimeout(next, 3000); };
      if (s.media_kind === "video") media.onended = next; else timer = setTimeout(next, 5000);
      if (!mine) { dm().rpc("view_story", { p_sid: s.id }); o.querySelectorAll("[data-e]").forEach((b) => (b.onclick = async () => { const r = await dm().rpc("set_story_reaction", { p_sid: s.id, p_emoji: b.dataset.e }); toast(r.error ? errMsg(r.error) : b.dataset.e); }));
        $("#sv-f").onsubmit = async (e) => { e.preventDefault(); const tx = $("#sv-i").value.trim(); if (!tx) return; const r = await dm().rpc("reply_to_story", { p_sid: s.id, p_text: tx }); if (r.error) toast(errMsg(r.error)); else { close(); location.hash = "#/messages/" + r.data; } };
      } else dm().from("story_views").select("viewer_id").eq("story_id", s.id).then((r) => { const v = $("#sv-v"); if (v) v.textContent = "👁 " + (r.data || []).length + " " + t("views") + " " + (r.data || []).slice(0, 5).map((x) => "@" + user(x.viewer_id).username).join(" "); });
    }
    show();
  }

  // ---- mounting / routing ------------------------------------------------------------------------
  async function mount() {
    root = $("#dm-root"); if (!root || root.dataset.on) return; root.dataset.on = "1";
    if (!dm()) { root.innerHTML = `<p class="dm-empty">${t("nobk")}</p>`; return; }
    if (!me()) { root.innerHTML = `<p class="dm-empty">${t("login")} <a class="btn btn-primary btn-sm" href="#/login">${t("login2")}</a></p>`; return; }
    SC.cleanups.push(unsub);
    try {
      const a = root.dataset.arg || "";
      if (a.indexOf("u/") === 0) { const u = Api.user(decodeURIComponent(a.slice(2))); if (!u || !u.uuid) throw new Error("User not found"); const r = await dm().rpc("get_or_create_direct", { p_other: u.uuid }); if (r.error) throw r.error; location.replace("#/messages/" + r.data); return; }
      await loadConvs(); st.cid = a || null; shell(); if (a) await open(a); else sub(null); badge();
    } catch (e) { root.innerHTML = `<p class="dm-empty">${esc(errMsg(e))}</p>`; }
  }
  function addProfileButton() {
    const m = location.hash.match(/^#\/profile\/([^/?]+)/); if (!m || !me() || $(".dm-msg-btn")) return;
    const row = $("#app .profile-actions"); if (!row || decodeURIComponent(m[1]) === (Api.me() || {}).username) return;
    const target = Api.user(decodeURIComponent(m[1])); if (!target || !target.uuid) return;
    const a = document.createElement("a"); a.className = "btn btn-primary btn-lg dm-msg-btn"; a.href = "#/messages/u/" + m[1];
    a.innerHTML = '<svg class="i" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';
    a.appendChild(document.createTextNode(" " + t("title"))); a.style.display = "inline-flex"; a.style.alignItems = "center"; a.style.gap = "6px";
    const fb = row.querySelector(".btn-follow"); if (fb) fb.insertAdjacentElement("afterend", a); else row.prepend(a);
  }
  new MutationObserver(() => { mount(); addProfileButton(); }).observe(document.getElementById("app"), { childList: true, subtree: true });
  window.addEventListener("hashchange", () => { if (root && !document.body.contains(root)) root = null; });
  const t0 = setInterval(() => { if (me()) { badge(); clearInterval(t0); } }, 1500);
  mount();
})();
