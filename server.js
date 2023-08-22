const express = require('express');
const axios = require('axios');
const fs = require('fs');
const parseString = require('xml2js').parseString;

const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/analyze', async (req, res) => {
    const url = req.query.url;

    try {
        const sitemapUrl = await getRobotsTxt(url);

        if (!sitemapUrl) {
            res.json({ error: 'Nenhum sitemap encontrado no arquivo robots.txt.' });
            return;
        }

        const sitemapUrls = await getSitemapUrls(sitemapUrl);

        if (sitemapUrls.length === 0) {
            res.json({ error: 'Nenhuma URL encontrada no sitemap.' });
            return;
        }

        fs.writeFileSync('public/sitemap.json', JSON.stringify(sitemapUrls, null, 2));
        res.json({ urls: sitemapUrls });
    } catch (error) {
        res.json({ error: 'Ocorreu um erro ao processar a solicitação.' });
    }
});

app.get('/download', (req, res) => {
    const filePath = __dirname + '/public/sitemap.json';
    res.download(filePath, 'sitemap.json', err => {
        if (err) {
            console.error('Erro ao fazer o download do arquivo:', err);
        }
    });
});

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
