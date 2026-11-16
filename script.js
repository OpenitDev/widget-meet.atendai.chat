(function () {
  "use strict";
  var script = document.currentScript;
  if (!script || document.getElementById("atendai-widget")) return;
  var slug = (script.dataset.slug || "").trim();
  if (!slug || slug === "." || slug === ".." || /[/?#\\]/.test(slug)) {
    console.error("Atendai: informe um data-slug válido no script.");
    return;
  }
  var base = new URL(script.dataset.baseUrl || "https://meet.atendai.chat");
  if (!/^https?:$/.test(base.protocol)) return;
  var url = new URL("/" + encodeURIComponent(slug) + "/nova-conversa", base).href;
  var title = script.dataset.title || "Fale com a gente";
  var color = /^#[0-9a-f]{6}$/i.test(script.dataset.color || "") ? script.dataset.color : "#2563eb";
  var left = script.dataset.position === "left";

  function mount() {
    if (document.getElementById("atendai-widget")) return;
    var host = document.createElement("div");
    host.id = "atendai-widget";
    host.style.cssText = "all:initial!important;position:fixed!important;bottom:0!important;" + (left ? "left" : "right") + ":0!important;z-index:2147483647!important;";
    var root = host.attachShadow({ mode: "open" });
    var style = document.createElement("style");
    style.textContent = ":host{font-family:system-ui,sans-serif;color:#172033}*{box-sizing:border-box}button,a{-webkit-tap-highlight-color:transparent}button{cursor:pointer;font:inherit}button:focus-visible,a:focus-visible{outline:3px solid #60a5fa;outline-offset:3px}.launcher{position:absolute;bottom:max(20px,env(safe-area-inset-bottom));" + (left ? "left" : "right") + ":20px;width:60px;height:60px;border:0;border-radius:50%;background:" + color + ";color:white;box-shadow:0 6px 24px #0003;display:grid;place-items:center}.launcher svg{width:28px;height:28px}.panel{position:absolute;bottom:92px;" + (left ? "left" : "right") + ":20px;width:min(400px,calc(100vw - 40px));height:min(680px,calc(100dvh - 112px));background:white;border-radius:18px;box-shadow:0 12px 48px #0003;overflow:hidden;display:flex;flex-direction:column}.panel[hidden]{display:none}header{display:flex;align-items:center;gap:12px;padding:14px 16px;background:" + color + ";color:white}strong{flex:1;font-size:15px}a{color:inherit;font-size:12px}header button{border:0;background:transparent;color:inherit;font-size:26px;line-height:1;padding:4px}iframe{border:0;width:100%;flex:1;min-height:0;background:#fff}@media(max-width:480px){.panel{width:calc(100vw - 16px);" + (left ? "left" : "right") + ":8px;bottom:88px;height:calc(100dvh - 104px);border-radius:14px}}";
    root.appendChild(style);
    var panel = document.createElement("section");
    panel.id = "chat-panel";
    panel.className = "panel";
    panel.hidden = true;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", title);
    var header = document.createElement("header");
    var heading = document.createElement("strong");
    heading.textContent = title;
    var external = document.createElement("a");
    external.href = url;
    external.target = "_blank";
    external.rel = "noopener noreferrer";
    external.textContent = "Abrir em nova aba";
    var close = document.createElement("button");
    close.type = "button";
    close.textContent = "×";
    close.setAttribute("aria-label", "Fechar chat");
    header.append(heading, external, close);
    panel.appendChild(header);
    var launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "launcher";
    launcher.setAttribute("aria-label", title);
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", panel.id);
    launcher.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></svg>';
    var frame;
    function toggle(open) {
      if (open && !frame) {
        frame = document.createElement("iframe");
        frame.title = title;
        frame.allow = "camera; microphone; fullscreen";
        frame.src = url;
        panel.appendChild(frame);
      }
      panel.hidden = !open;
      launcher.setAttribute("aria-expanded", String(open));
      if (open) close.focus();
      else launcher.focus();
    }
    launcher.addEventListener("click", function () { toggle(panel.hidden); });
    close.addEventListener("click", function () { toggle(false); });
    root.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) toggle(false);
    });
    root.append(panel, launcher);
    document.body.appendChild(host);
  }
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount, { once: true });
})();
