// Only the six ogl classes the sea uses. Imported dynamically by
// particleSea.ts; a dynamic import("ogl") with destructuring cannot be
// tree-shaken and shipped the whole library (131 KB).
export { Renderer, Camera, Geometry, Program, Mesh, Transform } from "ogl";
