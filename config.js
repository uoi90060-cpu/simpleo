/* Simple Cook — PUBLIC runtime configuration (safe to commit and to ship to browsers).
   Leave supabaseUrl / supabasePublishableKey empty to run in LOCAL DEMO MODE (localStorage only).
   NEVER put a service_role / secret key here: anything in this file is visible to every visitor.
   In production this file is generated from environment variables:  node tools/write-config.js */
window.SC_CONFIG = {
  env: "development",                 // development | staging | production
  supabaseUrl: "",                    // e.g. https://abcdxyz.supabase.co
  supabasePublishableKey: "",         // the PUBLISHABLE (formerly "anon") key; protected by Row Level Security
  // Chat bot (Zapier Chatbots). No API key is needed on this site: the hosted bot keeps its own instructions and knowledge.
  mapStyleUrl: "",                    // Phase 5: MapLibre style URL from a keyed provider (MapTiler/Stadia/Protomaps). Empty = demo OSM tiles (dev only)
  geocoderUrl: "",                    // Phase 5: Photon-compatible search endpoint. Empty = public Photon (fair use, dev only)
  chatbotUrl: "https://simple-cook-bot.zapier.app",   // the bot's public page (also used for "Open in a new tab")
  chatbotEmbedUrl: "",                // PASTE HERE the address inside src="..." from Zapier > Share > Embed > Inline > iframe (a whole snippet also works if wrapped in backticks). Empty = the chat button opens the bot in a new tab.
};
