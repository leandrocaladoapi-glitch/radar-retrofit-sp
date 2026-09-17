/*
 * Utilitários geométricos mínimos (sem dependências externas).
 * Todas as geometrias são tratadas em EPSG:4326 (lon, lat), tal como
 * retornadas pelo WFS oficial do GeoSampa com srsName=EPSG:4326.
 */

function ringsOf(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

function pointInRing(pt, ring) {
  const [x, y] = pt;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygon(pt, geometry) {
  for (const poly of ringsOf(geometry)) {
    if (!poly.length) continue;
    if (pointInRing(pt, poly[0])) {
      let inHole = false;
      for (let h = 1; h < poly.length; h++) {
        if (pointInRing(pt, poly[h])) { inHole = true; break; }
      }
      if (!inHole) return true;
    }
  }
  return false;
}

function outerVertices(geometry) {
  const out = [];
  for (const poly of ringsOf(geometry)) {
    if (poly[0]) out.push(...poly[0]);
  }
  return out;
}

function bboxOf(geometry) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of outerVertices(geometry)) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}

function bboxOverlap(a, b) {
  return !(a[2] < b[0] || b[2] < a[0] || a[3] < b[1] || b[3] < a[1]);
}

function centroid(geometry) {
  // Centroide por área do anel externo (fórmula do polígono simples).
  let bestArea = 0;
  let best = null;
  for (const poly of ringsOf(geometry)) {
    const ring = poly[0];
    if (!ring || ring.length < 4) continue;
    let a = 0, cx = 0, cy = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const f = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
      a += f;
      cx += (ring[j][0] + ring[i][0]) * f;
      cy += (ring[j][1] + ring[i][1]) * f;
    }
    a = a / 2;
    if (Math.abs(a) > Math.abs(bestArea) && a !== 0) {
      bestArea = a;
      best = [cx / (6 * a), cy / (6 * a)];
    }
  }
  if (best) return best;
  const v = outerVertices(geometry);
  if (!v.length) return null;
  return [
    v.reduce((s, p) => s + p[0], 0) / v.length,
    v.reduce((s, p) => s + p[1], 0) / v.length,
  ];
}

/**
 * Relação espacial verificável entre a geometria do lote e um polígono oficial.
 * Retorna 'dentro' | 'intersecta' | 'fora'.
 */
function spatialRelation(lotGeom, areaGeom) {
  const lb = bboxOf(lotGeom);
  const ab = bboxOf(areaGeom);
  if (!bboxOverlap(lb, ab)) return 'fora';
  const verts = outerVertices(lotGeom);
  if (!verts.length) return 'fora';
  let inside = 0;
  for (const v of verts) if (pointInPolygon(v, areaGeom)) inside++;
  if (inside === verts.length) return 'dentro';
  if (inside > 0) return 'intersecta';
  const c = centroid(lotGeom);
  if (c && pointInPolygon(c, areaGeom)) return 'intersecta';
  return 'fora';
}

module.exports = { pointInPolygon, spatialRelation, centroid, bboxOf, bboxOverlap, outerVertices };
