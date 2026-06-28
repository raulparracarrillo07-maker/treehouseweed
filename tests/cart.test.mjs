import { test } from "node:test";
import assert from "node:assert/strict";
import { carritoVacio, agregar, cambiarCantidad, quitar, total, contarItems } from "../assets/js/cart.js";

const prod = { id: "rol-01", nombre: "Rolado clásico", precio: 150 };

test("agregar dos veces el mismo producto suma cantidad", () => {
  let c = carritoVacio();
  c = agregar(c, prod);
  c = agregar(c, prod);
  assert.equal(c.items.length, 1);
  assert.equal(c.items[0].cantidad, 2);
  assert.equal(contarItems(c), 2);
});

test("total multiplica precio por cantidad", () => {
  let c = agregar(carritoVacio(), prod);
  c = cambiarCantidad(c, "rol-01", 3);
  assert.equal(total(c), 450);
});

test("cambiar cantidad a 0 quita el item", () => {
  let c = agregar(carritoVacio(), prod);
  c = cambiarCantidad(c, "rol-01", 0);
  assert.equal(c.items.length, 0);
});

test("quitar elimina el item", () => {
  let c = agregar(carritoVacio(), prod);
  c = quitar(c, "rol-01");
  assert.equal(c.items.length, 0);
});
