/*
 * Cliente WFS oficial do GeoSampa (Prefeitura de São Paulo / PRODAM).
 * Endpoint público OGC WFS 1.0.0, saída GeoJSON.
 *
 * NÃO existe fallback sintético. Se a fonte oficial falhar, o pipeline aborta
 * e a base publicada permanece como está (nada é inventado).
 */

const WFS_BASE = 'http://wfs.geosampa.prefeitura.sp.gov.br/geoserver/geoportal/ows';

async function wfsGetFeature({ typeName, cqlFilter, propertyName, maxFeatures, srs = 'EPSG:4326', startIndex }) {
  const params = new URLSearchParams({
    service: 'WFS',
    version: '1.0.0',
    request: 'GetFeature',
    typeName,
    outputFormat: 'application/json',
    srsName: srs,
  });
  if (cqlFilter) params.set('CQL_FILTER', cqlFilter);
  if (propertyName) params.set('propertyName', propertyName);
  if (maxFeatures) params.set('maxFeatures', String(maxFeatures));
  if (startIndex) params.set('startIndex', String(startIndex));

  const url = `${WFS_BASE}?${params.toString()}`;
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'RadarRetrofitSP-ETL/1.0' } });
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status} :: ${text.slice(0, 300)}`);
      if (text.trim().startsWith('<')) throw new Error(`Resposta XML/erro do WFS :: ${text.slice(0, 300)}`);
      const json = JSON.parse(text);
      return { json, url };
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  throw new Error(`Falha WFS (${typeName}): ${lastErr && lastErr.message}`);
}

function sourceUrl({ typeName, cqlFilter }) {
  const params = new URLSearchParams({
    service: 'WFS', version: '1.0.0', request: 'GetFeature', typeName,
    outputFormat: 'application/json', srsName: 'EPSG:4326',
  });
  if (cqlFilter) params.set('CQL_FILTER', cqlFilter);
  return `${WFS_BASE}?${params.toString()}`;
}

module.exports = { wfsGetFeature, sourceUrl, WFS_BASE };
