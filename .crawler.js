const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const fs = require('fs');
const bodyParser = require('body-parser');
const archiver = require('archiver');
const path = require('path');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
  
    fs.readFile(indexPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Erro ao ler o arquivo index.html:', err);
        res.status(500).send('Erro ao processar a solicitação.');
        return;
      }
  
      res.send(data);
    });
  });

app.post('/', async (req, res) => {
  const urls = req.body.url;
  console.log('URLs digitadas:', urls);

  const fileNames = [];

  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();

  try {
    for (let i = 1; i <= 10; i++) {
      const url = urls[i - 1];
      if (!url) {
        console.log(`URL ${i} está vazia. Ignorando...`);
        continue;
      }

      await page.goto(url);
      let datalayer = await page.evaluate(() => window.dataLayer);
      // obtém o datalayer através da variável global window.dataLayer

      const fileName = `datalayer${i}.json`;
      fileNames.push(fileName);

      await writeFile(fileName, datalayer);
    }

    const zipFileName = 'datalayer.zip';
    await createZip(fileNames, zipFileName);

    res.download(zipFileName, err => {
      if (err) {
        console.error('Erro ao fazer o download do arquivo zip:', err);
        res.status(500).send('Erro ao fazer o download do arquivo zip.');
      }

      // Exclui os arquivos gerados após o download
      fileNames.forEach(fileName => fs.unlinkSync(fileName));
      fs.unlinkSync(zipFileName);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao processar as URLs.');
  } finally {
    await browser.close();
  }
});

  // Função para escrever os dados em um arquivo local JSON
  function writeFile(fileName, datalayer) {
    return new Promise((resolve, reject) => {
      fs.writeFile(fileName, JSON.stringify(datalayer, null, 2), err => {
        if (err) {
          console.error('Algo deu errado ao escrever o arquivo:', err);
          reject(err);
        } else {
          console.log(`Arquivo ${fileName} gravado com sucesso!`);
          resolve();
        }
      });
    });
  }

  // Função para criar um arquivo zip contendo os arquivos gerados
  function createZip(fileNames, zipFileName) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipFileName);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Nível de compressão máximo
      });

      output.on('close', () => {
        console.log('Arquivos compactados com sucesso!');
        resolve();
      });

      archive.on('error', err => {
        console.error('Erro ao compactar os arquivos:', err);
        reject(err);
      });

      archive.pipe(output);

      fileNames.forEach(fileName => {
        archive.append(fs.createReadStream(fileName), { name: fileName });
      });

      archive.finalize();
    });
  }

  const PORT = 3333;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
