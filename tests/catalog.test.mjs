import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { productosDe, destacados, categorias } from "../assets/js/catalog.js";

const catalogo = JSON.parse(readFileSync(new URL("../data/productos.json", import.meta.url)));

test("categorias devuelve las tres categorias", () => {
  assert.deepEqual(categorias(catalogo), ["rolados", "prerrolados", "extractos"]);
});

test("productosDe filtra por categoria", () => {
  const rolados = productosDe(catalogo, "rolados");
  assert.ok(rolados.length >= 1);
  assert.ok(rolados.every((p) => p.categoria === "rolados"));
});

test("destacados solo devuelve los marcados", () => {
  const d = destacados(catalogo);
  assert.ok(d.every((p) => p.destacado === true));
});
