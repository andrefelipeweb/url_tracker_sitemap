const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const fs = require('fs');
const bodyParser = require('body-parser');
const archiver = require('archiver');
const path = require('path');
const multer = require('multer');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());

// Configuração do multer para lidar com o upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Define o diretório onde os arquivos serão salvos
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Mantém o nome original do arquivo
  }
});

const upload = multer({ storage: storage });

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

// Função auxiliar para extrair a última slug da URL
function extractSlugFromUrl(url) {
  const lastSlashIndex = url.lastIndexOf('/');
  if (lastSlashIndex !== -1) {
    const slug = url.slice(lastSlashIndex + 1);
    const queryStringIndex = slug.indexOf('?');
    if (queryStringIndex !== -1) {
      return slug.slice(0, queryStringIndex);
    }
    return slug;
  }
  return '';
}

app.post('/', upload.single('jsonFile'), async (req, res) => {
  const jsonFile = req.file;

  if (!jsonFile) {
    res.status(400).send('Nenhum arquivo JSON enviado.');
    return;
  }

  const fileData = fs.readFileSync(jsonFile.path, 'utf8');
  const urls = JSON.parse(fileData);

  console.log('URLs encontradas:', urls);

  const fileNames = [];

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Configurando o tempo limite da página para infinito
    await page.setDefaultNavigationTimeout(0);

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      if (!url) {
        console.log(`URL ${i + 1} está vazia. Ignorando...`);
        continue;
      }

      await page.goto(url, { timeout: 0 });
      let datalayer = await page.evaluate(() => window.dataLayer);
      // Obtém o datalayer através da variável global window.dataLayer

      const fileName = extractSlugFromUrl(url) + '.json';
      fileNames.push(fileName);

      await writeFile(fileName, datalayer);
    }

    const zipFileName = 'datalayer.zip';
    await createZip(fileNames, zipFileName);

    res.download(zipFileName, (err) => {
      if (err) {
        console.error('Erro ao fazer o download do arquivo zip:', err);
        res.status(500).send('Erro ao fazer o download do arquivo zip.');
      }

      // Exclui os arquivos gerados após o download
fileNames.forEach((fileName) => {
  fs.unlinkSync(fileName);
});
fs.unlinkSync(zipFileName);

res.download(zipFileName, (err) => {
  if (err) {
    console.error('Erro ao fazer o download do arquivo zip:', err);
    res.status(500).send('Erro ao fazer o download do arquivo zip.');
  }

  // Exclui os arquivos gerados após o download
  fileNames.forEach((fileName) => {
    fs.unlinkSync(fileName);
  });
  fs.unlinkSync(zipFileName);
});
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
    fs.writeFile(fileName, JSON.stringify(datalayer, null, 2), (err) => {
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

    archive.on('error', (err) => {
      console.error('Erro ao compactar os arquivos:', err);
      reject(err);
    });

    archive.pipe(output);

    fileNames.forEach((fileName) => {
      archive.append(fs.createReadStream(fileName), { name: fileName });
    });

    archive.finalize();
  });
}

const PORT = 3334;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
