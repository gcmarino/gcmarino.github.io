// Entry: checks WebGL, then hands the scene mounters to the React side via window.scenesReady.
import { mountHero } from "./hero.js";
import { mountStack } from "./stack.js";
import { mountProjects } from "./projects.js";
import { mountExperience } from "./experience.js";

const hooks = window.__scenes;
try {
  const ok = !!document.createElement("canvas").getContext("webgl2");
  if (!ok) throw new Error("WebGL2 no disponible");
  hooks.resolve({ mountHero, mountStack, mountProjects, mountExperience });
} catch (e) {
  hooks.reject(e);
}
