'use strict';

var jsxRuntime = require('react/jsx-runtime');
var reports = require('@jogi/reports');

// src/contrast.ts
var HEX_RE = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
function parseHex(hex) {
  if (!hex) return null;
  const m = hex.match(HEX_RE);
  if (!m) return null;
  let body = m[1];
  if (body.length === 3) body = body.split("").map((c) => c + c).join("");
  const num = parseInt(body, 16);
  return { r: num >> 16 & 255, g: num >> 8 & 255, b: num & 255 };
}
function channel(v) {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function relativeLuminance(hex) {
  const rgb = parseHex(hex);
  if (!rgb) return 1;
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}
function pickForeground(hex) {
  const lum = relativeLuminance(hex);
  if (lum > 0.5) return "#000000";
  return "#ffffff";
}
function isAccentOnly(hex) {
  const lum = relativeLuminance(hex);
  return lum >= 0.2 && lum <= 0.55;
}
function analyzeColor(hex) {
  const fallback = "#1a4d5c";
  const safeHex = parseHex(hex) ? hex : fallback;
  return {
    hex: safeHex,
    foreground: pickForeground(safeHex),
    accentOnly: isAccentOnly(safeHex)
  };
}
function formatChileDateShort(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(d);
}
function formatUFDate(value) {
  if (!value) return null;
  const d = /* @__PURE__ */ new Date(value + "T12:00:00");
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(d);
}
function formatUF(uf) {
  if (uf == null) return "\u2014";
  return uf.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function HeaderBand({ meta, brand, cliente }) {
  const generated = formatChileDateShort(meta.generatedAt);
  const ufDateStr = formatUFDate(meta.ufDate);
  return /* @__PURE__ */ jsxRuntime.jsxs("header", { className: "informe-header", "data-title": meta.requestLabel, children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "informe-header__top", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "informe-header__brand", children: brand.logoUrl ? /* @__PURE__ */ jsxRuntime.jsx("img", { src: brand.logoUrl, alt: brand.companyName || "Logo", className: "informe-header__logo" }) : /* @__PURE__ */ jsxRuntime.jsx("span", { className: "informe-header__company", children: brand.companyName ?? "Jogi" }) }),
      /* @__PURE__ */ jsxRuntime.jsxs("dl", { className: "informe-header__meta", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "informe-header__metaitem", children: [
          /* @__PURE__ */ jsxRuntime.jsx("dt", { children: "Generado" }),
          /* @__PURE__ */ jsxRuntime.jsx("dd", { children: generated })
        ] }),
        meta.ufValue != null && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "informe-header__metaitem", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("dt", { children: [
            "UF",
            ufDateStr ? ` \xB7 ${ufDateStr}` : ""
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("dd", { children: formatUF(meta.ufValue) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "informe-header__title", children: meta.requestLabel }),
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "informe-header__cliente", "data-cliente": cliente?.nombre ?? "", children: cliente && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "informe-header__cliente-name", children: cliente.nombre }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "informe-header__cliente-sep", "aria-hidden": true, children: " \xB7 " }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "informe-header__cliente-rut", children: cliente.rut })
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "informe-header__rule", "aria-hidden": true })
  ] });
}
function RosterChips({ applicants }) {
  if (applicants.length <= 1) return null;
  return /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "informe-roster", children: applicants.map((a, i) => /* @__PURE__ */ jsxRuntime.jsxs("li", { className: `informe-roster__chip informe-roster__chip--${a.role}`, children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "informe-roster__role", children: a.role === "titular" ? "Titular" : `Codeudor ${i}` }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "informe-roster__name", children: a.label })
  ] }, `${a.role}-${i}`)) });
}
function formatCallout(callout) {
  const v = callout.value;
  if (v == null) return "\u2014";
  switch (callout.format) {
    case "percent":
      return `${(v * 100).toFixed(1)}%`;
    case "uf":
      return `UF ${v.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "currency":
    default:
      return reports.displayCurrencyCompact(v);
  }
}
function Callouts({ callouts }) {
  if (!callouts.length) return null;
  return /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "informe-callouts", children: callouts.map((c, i) => /* @__PURE__ */ jsxRuntime.jsxs("li", { className: "informe-callouts__item", children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "informe-callouts__rule", "aria-hidden": true }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "informe-callouts__label", children: c.label }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "informe-callouts__value", children: formatCallout(c) })
  ] }, `${c.label}-${i}`)) });
}
function PerfilStacked({ applicants }) {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "informe-perfil informe-perfil--stacked", children: applicants.map((applicant, ai) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "informe-perfil__personblock", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("h3", { className: "informe-perfil__personlabel", children: [
      applicant.role === "titular" ? "Titular" : `Codeudor ${ai}`,
      " \u2014 ",
      applicant.label
    ] }),
    applicant.perfil.map((sub, si) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "informe-perfil__subsection", children: [
      sub.subsection && /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "informe-perfil__subtitle", children: [
        sub.section,
        " \u2014 ",
        sub.subsection
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("dl", { className: "informe-perfil__stackedlist", children: sub.fields.map((f, fi) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "informe-perfil__stackeditem", children: [
        /* @__PURE__ */ jsxRuntime.jsx("dt", { className: "informe-perfil__stackedlabel", children: f.label }),
        /* @__PURE__ */ jsxRuntime.jsx("dd", { className: "informe-perfil__stackedvalue", children: f.value || "\u2014" })
      ] }, fi)) })
    ] }, si))
  ] }, ai)) });
}
var MATRIX_COL_CAP = 3;
function buildSubsectionGroups(applicants) {
  const groups = /* @__PURE__ */ new Map();
  const order = [];
  applicants.forEach((applicant, ai) => {
    for (const sub of applicant.perfil) {
      const key = `${sub.section}|||${sub.subsection ?? ""}`;
      let group = groups.get(key);
      if (!group) {
        group = { section: sub.section, subsection: sub.subsection, rows: [] };
        groups.set(key, group);
        order.push(key);
      }
      for (const field of sub.fields) {
        let row = group.rows.find((r) => r.field.label === field.label);
        if (!row) {
          row = {
            field,
            values: applicants.map(() => ({ value: "", longText: false })),
            anyLongText: false
          };
          group.rows.push(row);
        }
        row.values[ai] = { value: field.value, longText: !!field.longText };
        if (field.longText) row.anyLongText = true;
      }
    }
  });
  return order.map((k) => groups.get(k));
}
function PerfilMatrixTable({
  applicants,
  group
}) {
  const matrixRows = group.rows.filter((r) => !r.anyLongText);
  if (matrixRows.length === 0) return null;
  const showPersonHeaders = applicants.length > 1;
  return /* @__PURE__ */ jsxRuntime.jsxs("table", { className: "informe-perfilmatrix", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("colgroup", { children: [
      /* @__PURE__ */ jsxRuntime.jsx("col", { className: "informe-perfilmatrix__col--label" }),
      applicants.map((_, i) => /* @__PURE__ */ jsxRuntime.jsx("col", { className: "informe-perfilmatrix__col--value" }, i))
    ] }),
    showPersonHeaders && /* @__PURE__ */ jsxRuntime.jsx("thead", { children: /* @__PURE__ */ jsxRuntime.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntime.jsx("th", { scope: "col", className: "informe-perfilmatrix__th informe-perfilmatrix__th--label", children: "Campo" }),
      applicants.map((a, i) => /* @__PURE__ */ jsxRuntime.jsx("th", { scope: "col", className: "informe-perfilmatrix__th", children: a.role === "titular" ? "Titular" : `Cod. ${i}` }, i))
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsx("tbody", { children: matrixRows.map((row, ri) => /* @__PURE__ */ jsxRuntime.jsxs("tr", { className: "informe-perfilmatrix__row", children: [
      /* @__PURE__ */ jsxRuntime.jsx("th", { scope: "row", className: "informe-perfilmatrix__rowlabel", children: row.field.label }),
      row.values.map((v, vi) => /* @__PURE__ */ jsxRuntime.jsx("td", { className: "informe-perfilmatrix__cell", children: v.value && v.value !== "" ? v.value : "\u2014" }, vi))
    ] }, ri)) })
  ] });
}
function LongTextList({
  applicants,
  group
}) {
  const longRows = group.rows.filter((r) => r.anyLongText);
  if (longRows.length === 0) return null;
  const showPersonHeaders = applicants.length > 1;
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "informe-perfilmatrix__longtext", children: longRows.map((row, ri) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "informe-perfilmatrix__longitem", children: [
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "informe-perfilmatrix__longlabel", children: row.field.label }),
    /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "informe-perfilmatrix__longvalues", children: row.values.map((v, vi) => /* @__PURE__ */ jsxRuntime.jsxs("li", { className: "informe-perfilmatrix__longvalue", children: [
      showPersonHeaders && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "informe-perfilmatrix__longperson", children: [
        applicants[vi].role === "titular" ? "Titular" : `Cod. ${vi}`,
        ":"
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "informe-perfilmatrix__longtxt", children: v.value && v.value !== "" ? v.value : "\u2014" })
    ] }, vi)) })
  ] }, ri)) });
}
function PerfilMatrix({ applicants }) {
  if (applicants.length > MATRIX_COL_CAP) {
    return /* @__PURE__ */ jsxRuntime.jsx(PerfilStacked, { applicants });
  }
  const groups = buildSubsectionGroups(applicants);
  const sectionOrder = [];
  const bySection = /* @__PURE__ */ new Map();
  for (const g of groups) {
    if (!bySection.has(g.section)) {
      bySection.set(g.section, []);
      sectionOrder.push(g.section);
    }
    bySection.get(g.section).push(g);
  }
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "informe-perfil", children: sectionOrder.map((sectionTitle) => {
    const subs = bySection.get(sectionTitle);
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "informe-perfil__section", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "informe-perfil__sectiontitle", children: sectionTitle }),
      subs.map((sub, si) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "informe-perfil__subsection", children: [
        sub.subsection && sub.subsection !== sectionTitle && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "informe-perfil__subtitle", children: sub.subsection }),
        /* @__PURE__ */ jsxRuntime.jsx(PerfilMatrixTable, { applicants, group: sub }),
        /* @__PURE__ */ jsxRuntime.jsx(LongTextList, { applicants, group: sub })
      ] }, si))
    ] }, sectionTitle);
  }) });
}
var PERSONA_KEY = "__persona__";
var ABSENCE_KEY = "__absence__";
var CATEGORIES = [
  { key: "deudas", title: "Deudas", emptyLabel: "Sin deudas registradas." },
  { key: "propiedades", title: "Propiedades", emptyLabel: "Sin propiedades registradas." },
  { key: "vehiculos", title: "Veh\xEDculos", emptyLabel: "Sin veh\xEDculos registrados." },
  { key: "inversiones", title: "Inversiones", emptyLabel: "Sin inversiones registradas." }
];
function formatCell(value, format) {
  if (value == null || value === "") return "\u2014";
  if (format === "currency") {
    return typeof value === "number" ? reports.displayCurrencyCompact(value) : String(value);
  }
  if (format === "integer") {
    return typeof value === "number" ? value.toLocaleString("es-CL") : String(value);
  }
  return String(value);
}
function mergeRowsForCategory(applicants, category, emptyLabel) {
  const baseColumns = applicants[0]?.situacion[category].columns ?? [];
  const showPersona = applicants.length > 1;
  const mergedRows = [];
  applicants.forEach((a) => {
    const rows = a.situacion[category].rows;
    if (rows.length === 0) {
      if (showPersona) {
        mergedRows.push({
          row: { [PERSONA_KEY]: a.label, [ABSENCE_KEY]: emptyLabel },
          absent: true
        });
      }
      return;
    }
    for (const row of rows) {
      mergedRows.push({ row: { ...row, [PERSONA_KEY]: a.label } });
    }
  });
  const columns = showPersona ? [{ key: PERSONA_KEY, label: "Persona", align: "left", format: "text" }, ...baseColumns] : baseColumns;
  return { rows: mergedRows, columns };
}
function CategoryTable({
  title,
  emptyLabel,
  rows,
  columns
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "informe-sitcat", children: [
    /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "informe-sitcat__title", children: title }),
    /* @__PURE__ */ jsxRuntime.jsxs("table", { className: "informe-table", children: [
      /* @__PURE__ */ jsxRuntime.jsx("colgroup", { children: columns.map((c) => /* @__PURE__ */ jsxRuntime.jsx(
        "col",
        {
          style: c.width ? { width: c.width } : void 0
        },
        c.key
      )) }),
      /* @__PURE__ */ jsxRuntime.jsx("thead", { children: /* @__PURE__ */ jsxRuntime.jsx("tr", { children: columns.map((c) => {
        const align = c.align ?? (c.format === "currency" || c.format === "integer" ? "right" : "left");
        const numeric = c.format === "currency" || c.format === "integer";
        return /* @__PURE__ */ jsxRuntime.jsx(
          "th",
          {
            className: `informe-table__th informe-table__th--${align}${numeric ? " informe-table__th--num" : ""}`,
            children: c.label
          },
          c.key
        );
      }) }) }),
      /* @__PURE__ */ jsxRuntime.jsx("tbody", { children: rows.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("tr", { className: "informe-table__emptyrow", children: /* @__PURE__ */ jsxRuntime.jsx("td", { colSpan: columns.length, className: "informe-table__emptycell", children: emptyLabel }) }) : rows.map((merged, ri) => {
        if (merged.absent) {
          const dataColSpan = Math.max(columns.length - 1, 1);
          return /* @__PURE__ */ jsxRuntime.jsxs("tr", { className: "informe-table__row informe-table__emptyrow", children: [
            /* @__PURE__ */ jsxRuntime.jsx("td", { className: "informe-table__td informe-table__td--left", children: String(merged.row[PERSONA_KEY] ?? "") }),
            /* @__PURE__ */ jsxRuntime.jsx("td", { colSpan: dataColSpan, className: "informe-table__emptycell", children: String(merged.row[ABSENCE_KEY] ?? "") })
          ] }, ri);
        }
        return /* @__PURE__ */ jsxRuntime.jsx("tr", { className: "informe-table__row", children: columns.map((c) => {
          const align = c.align ?? (c.format === "currency" || c.format === "integer" ? "right" : "left");
          const numeric = c.format === "currency" || c.format === "integer";
          return /* @__PURE__ */ jsxRuntime.jsx(
            "td",
            {
              className: `informe-table__td informe-table__td--${align}${numeric ? " informe-table__td--num" : ""}`,
              children: formatCell(merged.row[c.key], c.format)
            },
            c.key
          );
        }) }, ri);
      }) })
    ] })
  ] });
}
function SituacionTables({ applicants }) {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "informe-situacion", children: CATEGORIES.map((cat) => {
    const merged = mergeRowsForCategory(applicants, cat.key, cat.emptyLabel);
    return /* @__PURE__ */ jsxRuntime.jsx(
      CategoryTable,
      {
        title: cat.title,
        emptyLabel: cat.emptyLabel,
        rows: merged.rows,
        columns: merged.columns
      },
      cat.key
    );
  }) });
}
function formatResumenCell(v, row) {
  if (v == null || v === "") return "\u2014";
  if (typeof v === "number") {
    if (row.format === "percent") return `${(v * 100).toFixed(1)}%`;
    if (row.format === "integer") return v.toLocaleString("es-CL");
    return reports.displayCurrencyCompact(v);
  }
  return String(v);
}
function ResumenRow({ row, colCount }) {
  if (row.type === "subheader") {
    return /* @__PURE__ */ jsxRuntime.jsx("tr", { className: "informe-resumen__row informe-resumen__row--subheader", children: /* @__PURE__ */ jsxRuntime.jsx("td", { colSpan: colCount + 1, children: row.label }) });
  }
  const typeClass = row.type === "grandtotal" ? "informe-resumen__row--grandtotal" : row.type === "total" ? "informe-resumen__row--total" : "";
  return /* @__PURE__ */ jsxRuntime.jsxs("tr", { className: `informe-resumen__row ${typeClass}`, children: [
    /* @__PURE__ */ jsxRuntime.jsx("td", { className: "informe-resumen__cell informe-resumen__cell--label", children: row.label }),
    Array.from({ length: colCount }).map((_, i) => /* @__PURE__ */ jsxRuntime.jsx("td", { className: "informe-resumen__cell informe-resumen__cell--num", children: formatResumenCell(row.values?.[i], row) }, i))
  ] });
}
function ResumenTable({ table }) {
  const colCount = table.headers.length - 1;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "informe-resumen__block", children: [
    /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "informe-resumen__title", children: table.title }),
    /* @__PURE__ */ jsxRuntime.jsxs("table", { className: "informe-resumen", children: [
      /* @__PURE__ */ jsxRuntime.jsx("thead", { children: /* @__PURE__ */ jsxRuntime.jsx("tr", { children: table.headers.map((h, i) => /* @__PURE__ */ jsxRuntime.jsx(
        "th",
        {
          className: `informe-resumen__th${i === 0 ? " informe-resumen__th--label" : " informe-resumen__th--num"}`,
          children: h
        },
        `${h}-${i}`
      )) }) }),
      /* @__PURE__ */ jsxRuntime.jsx("tbody", { children: table.rows.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("tr", { className: "informe-resumen__row", children: /* @__PURE__ */ jsxRuntime.jsx("td", { colSpan: table.headers.length, className: "informe-resumen__emptycell", children: "Sin datos." }) }) : table.rows.map((row, i) => /* @__PURE__ */ jsxRuntime.jsx(ResumenRow, { row, colCount }, i)) })
    ] })
  ] });
}
function ResumenSection({ tables }) {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "informe-resumen-section", children: tables.map((table, i) => /* @__PURE__ */ jsxRuntime.jsx(ResumenTable, { table }, `${table.title}-${i}`)) });
}
function fmtCell(v, ratio) {
  if (v == null) return "\u2014";
  if (ratio === "edad_plazo") return String(Math.round(v));
  return `${(v * 100).toFixed(1)}%`;
}
var STATE_LABEL = {
  pass: "Cumple",
  fail: "No cumple",
  "missing-cap": "Sin tope",
  "missing-value": "Sin dato"
};
function PoliticasPill({ cell }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "span",
    {
      className: `informe-politicas__pill informe-politicas__pill--${cell.state}`,
      "aria-label": STATE_LABEL[cell.state],
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "informe-politicas__pill-num", children: fmtCell(cell.clientValue, cell.ratio) }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "informe-politicas__pill-cmp", children: "\u2264" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "informe-politicas__pill-num", children: fmtCell(cell.cap, cell.ratio) })
      ]
    }
  );
}
function PoliticasSection({ block }) {
  const colKeys = block.rows[0]?.cells.map((c) => c.ratio) ?? [];
  const colLabels = block.rows[0]?.cells.map((c) => c.ratioLabel) ?? [];
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "informe-politicas", children: [
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "informe-politicas__summary", children: block.summary }),
    block.rows.length === 0 ? null : /* @__PURE__ */ jsxRuntime.jsxs("table", { className: "informe-politicas__table", children: [
      /* @__PURE__ */ jsxRuntime.jsx("thead", { children: /* @__PURE__ */ jsxRuntime.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntime.jsx("th", { className: "informe-politicas__th informe-politicas__th--label", children: "Inversionista" }),
        colLabels.map((label, i) => /* @__PURE__ */ jsxRuntime.jsx("th", { className: "informe-politicas__th informe-politicas__th--num", children: label }, `${colKeys[i]}-${i}`))
      ] }) }),
      /* @__PURE__ */ jsxRuntime.jsx("tbody", { children: block.rows.map((row, ri) => /* @__PURE__ */ jsxRuntime.jsxs(
        "tr",
        {
          className: `informe-politicas__row informe-politicas__row--${row.status}`,
          children: [
            /* @__PURE__ */ jsxRuntime.jsx("td", { className: "informe-politicas__cell informe-politicas__cell--label", children: row.investorName }),
            row.cells.map((cell, ci) => /* @__PURE__ */ jsxRuntime.jsx("td", { className: "informe-politicas__cell informe-politicas__cell--num", children: /* @__PURE__ */ jsxRuntime.jsx(PoliticasPill, { cell }) }, `${cell.ratio}-${ci}`))
          ]
        },
        `${row.investorName}-${ri}`
      )) })
    ] })
  ] });
}
function SectionTitle({
  children,
  eyebrow,
  subtitle
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs("header", { className: "informe-section-title", children: [
    eyebrow && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "informe-section-title__eyebrow", children: eyebrow }),
    /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "informe-section-title__title", children }),
    subtitle && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "informe-section-title__subtitle", children: subtitle }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "informe-section-title__rule", "aria-hidden": true })
  ] });
}
function Footer({ companyName }) {
  return /* @__PURE__ */ jsxRuntime.jsx("footer", { className: "informe-footer", children: /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
    companyName ? `${companyName} \xB7 ` : "",
    "Powered by Jogi"
  ] }) });
}
function brandStyle(brand) {
  const primary = analyzeColor(brand.primary);
  const secondary = analyzeColor(brand.secondary);
  const accent = analyzeColor(brand.accent);
  const effectivePrimary = primary.accentOnly ? secondary : primary;
  return {
    ["--informe-primary"]: effectivePrimary.hex,
    ["--informe-secondary"]: secondary.hex,
    ["--informe-accent"]: accent.hex,
    ["--informe-on-primary"]: effectivePrimary.foreground,
    ["--informe-on-accent"]: accent.foreground
  };
}
function Informe({ input }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("article", { className: "informe-root", style: brandStyle(input.brand), children: [
    /* @__PURE__ */ jsxRuntime.jsxs("section", { className: "informe-page informe-page--first informe-group informe-group--resumen", children: [
      /* @__PURE__ */ jsxRuntime.jsx(HeaderBand, { meta: input.meta, brand: input.brand, cliente: input.cliente }),
      /* @__PURE__ */ jsxRuntime.jsx(Callouts, { callouts: input.resumen.callouts }),
      /* @__PURE__ */ jsxRuntime.jsx(RosterChips, { applicants: input.applicants }),
      /* @__PURE__ */ jsxRuntime.jsx(SectionTitle, { eyebrow: "Resumen", subtitle: "S\xEDntesis financiera de la solicitud", children: "Resumen Financiero" }),
      /* @__PURE__ */ jsxRuntime.jsx(ResumenSection, { tables: input.resumen.tables })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("section", { className: "informe-page informe-group informe-group--perfil", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        SectionTitle,
        {
          eyebrow: "Perfil",
          subtitle: input.applicants.length === 1 ? "Antecedentes personales, laborales y comerciales" : `Antecedentes comparados \u2014 ${input.applicants.length} solicitantes`,
          children: "Perfil"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(PerfilMatrix, { applicants: input.applicants })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("section", { className: "informe-page informe-group informe-group--situacion", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        SectionTitle,
        {
          eyebrow: "Situaci\xF3n",
          subtitle: input.applicants.length === 1 ? "Deudas, propiedades, veh\xEDculos e inversiones" : "Por categor\xEDa, agrupando a todos los solicitantes",
          children: "Situaci\xF3n Patrimonial"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(SituacionTables, { applicants: input.applicants })
    ] }),
    input.politicasCredito && /* @__PURE__ */ jsxRuntime.jsxs("section", { className: "informe-page informe-group informe-group--politicas", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        SectionTitle,
        {
          eyebrow: "Pol\xEDticas de Cr\xE9dito",
          subtitle: "Topes por inversionista vs. indicadores del cliente",
          children: input.politicasCredito.title
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(PoliticasSection, { block: input.politicasCredito })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(Footer, { companyName: input.brand.companyName ?? null })
  ] });
}

exports.Informe = Informe;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map