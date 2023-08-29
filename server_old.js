const express = require('express');
const axios = require('axios');
const fs = require('fs');
const parseString = require('xml2js').parseString;

const app = express();
const port = 3000;

let sitemapUrls = []; // Armazenar as URLs do sitemap

app.use(express.static('public'));

app.get('/analyze', async (req, res) => {
    const url = req.query.url;

    // Verifica se a URL está no formato esperado
    const urlPattern = /^(https?:\/\/)?(www\.)?[a-z0-9\-\.]+\.[a-z]{2,}(\.[a-z]{2,})?$/i;
    if (!urlPattern.test(url)) {
        res.json({ error: 'Por favor, digite uma URL válida no formato correto.' });
        return;
    }

    try {
        if (!(await isUrlAccessible(url))) {
            res.json({ error: 'A URL fornecida não é acessível. Verifique a URL e tente novamente.' });
            return;
        }

        let sitemapUrl = await getRobotsTxt(url);

        if (!sitemapUrl) {
            // Se não encontrou o sitemap no robots.txt, tenta diretamente o sitemap.xml
            sitemapUrl = `${url}/sitemap.xml`;
            const sitemapExists = await checkSitemapExists(sitemapUrl);

            if (!sitemapExists) {
                res.json({ error: 'Nenhum sitemap encontrado.' });
                return;
            }
        }

        sitemapUrls = await getSitemapUrls(sitemapUrl);

        if (sitemapUrls.length === 0) {
            res.json({ error: 'Nenhuma URL encontrada no sitemap.' });
            return;
        }

        res.json({ urls: sitemapUrls });
    } catch (error) {
        res.json({ error: 'Ocorreu um erro ao processar a solicitação.' });
    }
});

app.get('/download', (req, res) => {
    if (sitemapUrls.length > 0) {
        const filePath = __dirname + '/public/sitemap.json';
        fs.writeFileSync(filePath, JSON.stringify(sitemapUrls, null, 2));

        res.download(filePath, 'sitemap.json', err => {
            if (err) {
                console.error('Erro ao fazer o download do arquivo:', err);
            }
        });
    } else {
        res.send('Nenhum arquivo disponível para download.');
    }
});

async function isUrlAccessible(url) {
    try {
        const response = await axios.get(url);
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

async function getRobotsTxt(url) {
    const response = await axios.get(`${url}/robots.txt`);
    const lines = response.data.split('\n');
    let sitemapUrl;

    lines.forEach(line => {
        if (line.startsWith('Sitemap:')) {
            sitemapUrl = line.substring(8).trim();
        }
    });

    return sitemapUrl;
}

async function checkSitemapExists(sitemapUrl) {
    try {
        const response = await axios.head(sitemapUrl);
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

async function getSitemapUrls(sitemapUrl) {
    const response = await axios.get(sitemapUrl);
    let urls = [];

    parseString(response.data, (err, result) => {
        if (!err && result.urlset && result.urlset.url) {
            urls = result.urlset.url.map(url => url.loc[0]);
        }
    });

    return urls;
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
