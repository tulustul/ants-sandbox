import { createApp } from "vue";
import { settings, ENV } from "pixi.js";

import App from "@/ui/App.vue";

// This reenables webgl2 in mobile devices which is distable by default.
settings.PREFER_ENV = ENV.WEBGL2;

createApp(App).mount("#app");
