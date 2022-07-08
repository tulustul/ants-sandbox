export function initTracking() {
  const gtagId = import.meta.env.VITE_TAG_MANAGER_ID;
  if (!gtagId) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`;

  document.body.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];

  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  (gtag as any)("js", new Date());

  (gtag as any)("config", "G-R8QD9VK8D3");
}
