const express = require('express');
const axios = require('axios');
const parseString = require('xml2js').parseString;
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3333;

const isValidURL = (url) => {
  const regex = /^https?:\/\/\w+(\.\w+)*\/([\w-]+\/)+$/;
  return regex.test(url);
};

const processURLs = async (urls) => {
  const processedUrls = new Set();

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];

    if (!processedUrls.has(url)) {
      processedUrls.add(url);

      try {
        const response = await axios.get(url);
        const xml = response.data;

        parseString(xml, (err, result) => {
          if (err) {
            console.error('Ocorreu um erro ao analisar o XML:', err);
            return;
          }

          const locs = result.urlset.url.map((url) => url.loc[0]);

          const validUrls = locs.filter(isValidURL);
          processURLs(validUrls);

          const data = JSON.stringify(locs, null, 2);
          const filePath = path.join(__dirname, 'jsonFiles.json');
          fs.writeFileSync(filePath, data);
        });
      } catch (error) {
        console.error('Ocorreu um erro ao buscar o sitemap:', error);
      }
    }
  }
};

app.use(express.static(__dirname));

app.get('/processURLs', async (req, res) => {
  const url = req.query.url;

  try {
    await processURLs([`${url}/sitemap-pt.xml`]);
    const filePath = path.join(__dirname, 'jsonFiles.json');
    const fileName = 'jsonFiles.json';

    // Remover os underscores antes e depois do nome do arquivo
    const sanitizedFileName = fileName.replace(/^_|_$/g, '');

    res.setHeader('Content-Disposition', `attachment; filename=${sanitizedFileName}`);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Ocorreu um erro ao enviar o arquivo:', err);
        res.status(500).send('Erro ao baixar o arquivo');
      }
      fs.unlinkSync(filePath); // Remover o arquivo após o download
    });
  } catch (error) {
    console.error('Ocorreu um erro ao processar as URLs:', error);
    res.status(500).send('Erro ao processar as URLs');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'mapeador.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`);
});
