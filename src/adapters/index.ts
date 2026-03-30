import { registerAdapter } from "@/core/registry";
import { DemoAdapter } from "./demo/DemoAdapter";
import { HomeyAdapter } from "./homey/HomeyAdapter";

registerAdapter({
  id: "demo",
  name: "Demo",
  icon: "play-circle",
  configFields: [],
  create: () => new DemoAdapter(),
});

registerAdapter({
  id: "homey",
  name: "Homey",
  icon: "home",
  configFields: new HomeyAdapter().configFields,
  create: () => new HomeyAdapter(),
});
