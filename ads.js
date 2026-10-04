(() => {
  const config = window.COMPARAFACIL || {};
  const client = String(config.adsenseClient || "").trim();
  const slot = String(config.adsenseSlot || "").trim();
  const placement = document.querySelector("#ad-placement");

  // Fail closed until the publisher has configured AdSense and its Google-certified CMP.
  if (!placement || config.adsenseConsentReady !== true || !/^ca-pub-\d+$/.test(client) || !/^\d+$/.test(slot)) return;

  placement.querySelector(".adsbygoogle").dataset.adClient = client;
  placement.querySelector(".adsbygoogle").dataset.adSlot = slot;
  placement.hidden = false;

  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  script.onload = () => {
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); }
    catch { placement.hidden = true; }
  };
  script.onerror = () => { placement.hidden = true; };
  document.head.append(script);
})();
