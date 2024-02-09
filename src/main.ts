import type { vec3 } from "gl-matrix";
import { quat } from "gl-matrix";
import { createMouseControl, createWorld } from "world.ts";

import { loadObj } from "./obj";

/**
 * TODO:
 * billboard
 * labels
 * mercator elevation
 * smooth transition
 * subdivide const
 */

export const imageryUrl =
  "http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}";
export const terrainUrl =
  "https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZ3JhaGFtZ2liYm9ucyIsImEiOiJja3Qxb3Q5bXQwMHB2MnBwZzVyNzgyMnZ6In0.4qLjlbLm6ASuJ5v5gN6FHQ";

let position: vec3 = [-121, 38, 10000];

const model = await loadObj(new URL("./cow.obj", import.meta.url).toString());

const canvas = document.querySelector("canvas") as HTMLCanvasElement;

const world = createWorld(canvas);
const control = createMouseControl(canvas, world);

world.view = {
  ...world.view,
  distance: 100000,
  target: position,
};

const n = 100;
world.addLine({
  points: new Array(n + 1).fill(0).map<vec3>((_, i) => {
    const a = ((i / n) * Math.PI * 2) / 10;
    return [-121 + 1 * Math.cos(a * 5), 38 + 1 * Math.sin(a), 400];
  }),
  color: [0.1, 0.1, 1, 0.5],
  width: 100,
  minWidthPixels: 4,
});

let dragging = false;
world.addTerrain({
  terrainUrl,
  imageryUrl,
});

const mesh = world.addMesh({
  vertices: model.vertices,
  indices: model.indices,
  position,
  orientation: quat.setAxisAngle(quat.create(), [1, 0, 0], Math.PI / 2),
  size: 100,
  minSizePixels: 10,
});

world.onMouseDown(({ layer }) => {
  if (layer === mesh) {
    control.enabled = false;
    mesh.pickable = false;
    dragging = true;
  }
});

world.onMouseMove(({ position }) => {
  if (dragging) mesh.position = position;
});

world.onMouseUp(() => {
  control.enabled = true;
  mesh.pickable = true;
  dragging = false;
});

const stem = world.addLine({
  color: [1, 0, 0, 0.5],
  width: 3,
  minWidthPixels: 1,
  maxWidthPixels: 3,
});

let lastTime = 0;
const frame = (time: number) => {
  const delta = time - lastTime;
  lastTime = time;

  const [lng = 0, lat = 0, alt = 0] = position;
  const newLat = lat + 0.00000001 * delta;
  position = [lng, newLat, alt];
  stem.points = [
    [lng, newLat, 0],
    [lng, newLat, alt],
  ];
  requestAnimationFrame(frame);
};

requestAnimationFrame(frame);
