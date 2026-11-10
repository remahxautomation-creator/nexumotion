import { test } from "node:test";
import assert from "node:assert/strict";
import { toImportRow, toCsv, leafCategory, unitPrice, type DkProduct } from "../scripts/digikey/map";
import { parseCsv } from "../src/lib/csv";

const opts = { brand: "Turck", category: "Sensors & Switches", stockQty: 25, markup: 1 };

const sensor: DkProduct = {
  ManufacturerProductNumber: "BI5U-M18-AP6X-H1141",
  Manufacturer: { Id: 1, Name: "Turck Inc." },
  UnitPrice: 61.234,
  DatasheetUrl: "//media.digikey.com/pdf/turck.pdf",
  ProductStatus: { Id: 0, Status: "Active" },
  Series: { Name: "Uprox+" },
  Category: { Name: "Sensors, Transducers", ChildCategories: [{ Name: "Proximity Sensors" }] },
  Parameters: [
    { ParameterText: "Sensing Distance", ValueText: "5mm" },
    { ParameterText: "Ingress Protection", ValueText: "IP68" },
    { ParameterText: "Packaging", ValueText: "Bulk" },
    { ParameterText: "Output Type", ValueText: "-" },
  ],
};

test("maps a DigiKey product to an import row without DigiKey's description", () => {
  const row = toImportRow(sensor, opts)!;
  assert.equal(row.sku, "BI5U-M18-AP6X-H1141");
  assert.equal(row.name, "Turck Uprox+ Proximity Sensors BI5U-M18-AP6X-H1141");
  assert.equal(row.price, "61.23");
  assert.equal(row.datasheetUrl, "https://media.digikey.com/pdf/turck.pdf");
  // Renamed to our template names, packaging and empty values dropped.
  assert.deepEqual(JSON.parse(row.specs), { Series: "Uprox+", "Sensing Range": "5mm", "IP Rating": "IP68" });
});

test("skips obsolete parts and rows without a part number", () => {
  assert.equal(toImportRow({ ...sensor, ProductStatus: { Status: "Obsolete" } }, opts), null);
  assert.equal(toImportRow({ ...sensor, ManufacturerProductNumber: " " }, opts), null);
});

test("prefers the quantity-1 price break and applies markup", () => {
  const p = { ...sensor, ProductVariations: [{ StandardPricing: [{ BreakQuantity: 10, UnitPrice: 50 }, { BreakQuantity: 1, UnitPrice: 55.5 }] }] };
  assert.equal(unitPrice(p), 55.5);
  assert.equal(toImportRow(p, { ...opts, markup: 1.2 })!.price, "66.6");
});

test("leaf category walks to the deepest child", () => {
  assert.equal(leafCategory({ Category: { Name: "A", ChildCategories: [{ Name: "B" }] } }), "B");
  assert.equal(leafCategory({}), "");
});

test("CSV round-trips through the importer's parser", () => {
  const row = toImportRow({ ...sensor, Series: { Name: 'Say "hi", ok' } }, opts)!;
  const [header, line] = parseCsv(toCsv([row]));
  const back = Object.fromEntries(header.map((h, i) => [h, line[i]]));
  assert.equal(back.sku, row.sku);
  assert.equal(JSON.parse(back.specs).Series, 'Say "hi", ok');
});
