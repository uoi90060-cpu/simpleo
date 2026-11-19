/* ==========================================================================
   SIMPLE COOK — chat bot widget (chatbot.js)
   Embeds the hosted Zapier chatbot in a floating panel for every visitor (no login, no API key).
   The bot keeps its own instructions/knowledge on Zapier, so nothing about its behaviour is re-implemented here.
   Security: only https URLs on *.zapier.app are framed (also enforced by the CSP frame-src); the iframe is
   sandboxed (cannot navigate or replace this page) and is created lazily on first open; no site data is sent to it.
   ========================================================================== */
(function () {
  "use strict";
  const cfg = window.SC_CONFIG || {};
  const allowed = (u) => { try { const x = new URL(u); return x.protocol === "https:" && (/(^|\.)zapier\.app$/.test(x.hostname) || x.hostname === "interfaces.zapier.com"); } catch (e) { return false; } };
  // chatbotEmbedUrl may be the bare iframe address OR the whole <iframe ...> snippet copied from Zapier (Share > Embed > Inline > iframe).
  const fromSnippet = (v) => { const m = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(String(v || "")); return (m ? m[1] : String(v || "")).trim(); };
  // Zapier's standalone page (…zapier.app) refuses to be shown inside other sites, so it is only ever framed via the embed address.
  const frameUrl = allowed(fromSnippet(cfg.chatbotEmbedUrl)) ? fromSnippet(cfg.chatbotEmbedUrl) : "";
  const pageUrl = allowed(cfg.chatbotUrl) ? cfg.chatbotUrl : frameUrl;
  const links = document.querySelectorAll("[data-open-chat]");
  if (!pageUrl) { links.forEach((l) => l.remove()); return; }       // no bot configured: no widget at all

  const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; };
  const fab = el(`<button type="button" class="chat-fab" aria-label="Chat with the Simple Cook bot" aria-haspopup="dialog" aria-expanded="false" aria-controls="chat-panel">
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg><span class="chat-fab-label">Ask the bot</span></button>`);
  const panel = el(`<section class="chat-panel" id="chat-panel" role="dialog" aria-label="Chat with the Simple Cook bot" hidden>
    <header><div><b>Simple Cook bot</b><small>Ask about recipes, ingredients and cooking</small></div>
      ${frameUrl ? `<a class="chat-ext" href="${pageUrl}" target="_blank" rel="noopener noreferrer">Open in a new tab</a>` : ""}
      <button type="button" class="chat-close" aria-label="Close chat">&times;</button></header>
    <div class="chat-body"><p class="chat-loading" role="status">Loading the bot…</p></div>
    <footer>Chats are handled by an external service (Zapier). Please don’t share personal or private information. AI answers can be wrong: double-check food-safety and allergy advice.</footer></section>`);
  document.body.append(fab, panel);

  let frame = null, hintTimer = null;
  const body = panel.querySelector(".chat-body");
  function ensureFrame() {
    if (frame) return;
    if (!frameUrl) {   // no embeddable address configured: offer the bot in its own tab instead of a blocked frame
      body.innerHTML = `<div class="chat-linkcard"><p><b>Chat with the Simple Cook bot</b></p><p>Ask about recipes, ingredients, substitutions and cooking techniques. The bot opens in its own tab.</p><a class="btn btn-primary" href="${pageUrl}" target="_blank" rel="noopener noreferrer">Open the bot</a></div>`;
      frame = body; return;
    }
    frame = document.createElement("iframe");
    frame.title = "Simple Cook chat bot"; frame.src = frameUrl; frame.loading = "lazy";
    frame.setAttribute("allow", "clipboard-write");
    frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    frame.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox");   // no top-navigation: the bot cannot redirect this page
    frame.addEventListener("load", () => { clearTimeout(hintTimer); const p = body.querySelector(".chat-loading"); if (p) p.remove(); });
    body.appendChild(frame);
    hintTimer = setTimeout(() => { const p = body.querySelector(".chat-loading"); if (p) p.innerHTML = `Taking a while? <a href="${pageUrl}" target="_blank" rel="noopener noreferrer">Open the bot in a new tab</a>.`; }, 8000);
  }
  function setOpen(open) {
    panel.hidden = !open; fab.setAttribute("aria-expanded", String(open)); fab.classList.toggle("is-open", open);
    if (open) { ensureFrame(); panel.querySelector(".chat-close").focus(); document.addEventListener("keydown", onKey); } else { document.removeEventListener("keydown", onKey); fab.focus({ preventScroll: true }); }
  }
  const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
  fab.addEventListener("click", () => setOpen(panel.hidden));
  panel.querySelector(".chat-close").addEventListener("click", () => setOpen(false));
  links.forEach((l) => { l.hidden = false; l.addEventListener("click", () => setOpen(true)); });
  window.SC = window.SC || {}; window.SC.chat = { open: () => setOpen(true), close: () => setOpen(false) };
})();
