import { test } from "node:test";
import assert from "node:assert/strict";
import { esMayorDeEdad, guardarMayoria } from "../assets/js/age-gate.js";

function storageFalso() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) };
}

test("por defecto no es mayor", () => {
  assert.equal(esMayorDeEdad(storageFalso()), false);
});

test("tras guardar la mayoría, es mayor", () => {
  const s = storageFalso();
  guardarMayoria(s);
  assert.equal(esMayorDeEdad(s), true);
});
