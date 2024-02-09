import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  root: "src",
  plugins: [glsl(), tsconfigPaths()],
  build: {
    outDir: "../dist",
    sourcemap: true,
    target: "esnext",
  },
});
