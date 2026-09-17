const https = require('https');

https.get('https://subvencao.prefeitura.sp.gov.br/api/projetos', (res) => { // Just guessing an endpoint
  console.log('Status code:', res.statusCode);
}).on('error', (err) => console.error(err));
