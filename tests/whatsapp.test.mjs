import { test } from "node:test";
import assert from "node:assert/strict";
import { construirMensaje, construirURL } from "../assets/js/whatsapp.js";

const carrito = { items: [{ id: "rol-01", nombre: "Rolado clásico", precio: 150, cantidad: 2 }] };
const config = { marca: "TreeHouseWeed", entrega: { zona: "Chihuahua capital" } };

test("el mensaje incluye marca, producto, cantidad y total", () => {
  const m = construirMensaje(carrito, config);
  assert.ok(m.includes("TreeHouseWeed"));
  assert.ok(m.includes("Rolado clásico"));
  assert.ok(m.includes("x2"));
  assert.ok(m.includes("300"));
  assert.ok(m.includes("Chihuahua capital"));
});

test("la URL usa wa.me y codifica el texto", () => {
  const url = construirURL("5216141234567", "hola mundo");
  assert.ok(url.startsWith("https://wa.me/5216141234567?text="));
  assert.ok(url.includes("hola%20mundo"));
});
