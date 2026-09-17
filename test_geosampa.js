const https = require('https');

const options = {
  hostname: 'geosampa.prefeitura.sp.gov.br',
  port: 443,
  path: '/geoserver/wfs?service=WFS&version=1.0.0&request=GetCapabilities',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const regex = /<Name>(.*?)<\/Name>/g;
    let match;
    const layers = [];
    while ((match = regex.exec(data)) !== null) {
      if (match[1].toLowerCase().includes('lote') || match[1].toLowerCase().includes('edif') || match[1].toLowerCase().includes('iptu') || match[1].toLowerCase().includes('sql') || match[1].toLowerCase().includes('zoneamento') || match[1].toLowerCase().includes('patrimonio') || match[1].toLowerCase().includes('requalifica')) {
        layers.push(match[1]);
      }
    }
    console.log(layers.slice(0, 50));
  });
});
req.on('error', error => console.error(error));
req.end();
