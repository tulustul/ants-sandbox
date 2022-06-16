const HANDLER_PROPERTY = "__v-explode";

export default {
  mounted: (el: HTMLElement) => {
    const timeMS = 300;
    el.style.position = "relative";
    (el as any)[HANDLER_PROPERTY] = el.addEventListener("click", () => {
      const drop = document.createElement("div");
      const styles = getComputedStyle(el);
      drop.style.position = "absolute";
      drop.style.zIndex = "-1";
      drop.style.left = "0";
      drop.style.top = "0";
      drop.style.borderRadius = styles.borderRadius;
      drop.style.backgroundColor = styles.backgroundColor;
      drop.style.width = "100%";
      drop.style.height = "100%";
      drop.style.filter = "blur(1px)";
      setTimeout(() => {
        drop.style.transition = `${timeMS}ms linear`;
        drop.style.transform = "scale(2)";
        drop.style.opacity = "0";
        setTimeout(() => {
          drop.remove();
        }, timeMS);
      }, 0);
      el.appendChild(drop);
    });
  },
  unmounted: (el: HTMLElement) => {
    el.removeEventListener("click", (el as any)[HANDLER_PROPERTY]);
  },
};
