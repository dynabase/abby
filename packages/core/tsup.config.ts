import { defineConfig } from "tsup";

export default defineConfig({
  dts: true,
  // we want to bundle the shared package because it's not published to npm
  // it's hacky :)
  noExternal: ["shared/src/types"],
  clean: true,
  sourcemap: true,
  treeshake: true,
  format: ["cjs", "esm"]
});
