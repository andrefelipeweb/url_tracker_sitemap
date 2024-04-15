# URL TRACKER SITEMAP

## Descrição
O **URL TRACKER SITEMAP** é uma aplicação web que oferece uma série de funcionalidades para análise de sitemaps de sites. Além disso, permite o download desses sitemaps em formato JSON para uso posterior. Esta ferramenta é valiosa para desenvolvedores que desejam entender a estrutura de um site, identificar páginas específicas ou analisar a organização de links.

## Funcionalidades
1. **Análise de Sitemap:**
   - Insira a URL do site que deseja analisar.
   - A aplicação irá verificar se o sitemap está presente no arquivo `robots.txt` ou diretamente no arquivo `sitemap.xml`.
   - Se encontrado, o sitemap será analisado e as URLs serão listadas.

2. **Download de Sitemap:**
   - Após a análise bem-sucedida, um botão de download será exibido.
   - Clique no botão para baixar o sitemap em formato JSON.
   - O arquivo JSON contém todas as URLs encontradas no sitemap.

## Tecnologias Utilizadas
- **Node.js:** Plataforma de execução de código JavaScript no servidor.
- **Express.js:** Framework web para Node.js que simplifica o desenvolvimento de aplicativos web.
- **Axios:** Biblioteca para fazer requisições HTTP no Node.js e no navegador.
- **xml2js:** Módulo para análise de XML para JavaScript.
- **HTML e JavaScript:** Utilizados para construir o frontend da aplicação.

## Instalação e Execução
1. **Clone o repositório:**
   ```bash
   git clone https://github.com/andrefelipeweb/url_tracker_sitemap.git

## Instale as dependências:
2. **Navegue até o diretório da aplicação e execute o seguinte comando para instalar as dependências necessárias:**
cd sitemap-analyzer
npm install

3. **Inicie o servidor:**
Execute o seguinte comando para iniciar o servidor Node.js:
npm start

3. **Acesse a aplicação no navegador:**
Abra o seu navegador web e acesse o seguinte endereço:
http://localhost:3000

## Como Utilizar a Aplicação

**Análise de Sitemap:**
 - Insira a URL do site que deseja analisar no campo de entrada.
 - Clique no botão "Analisar".
 - Aguarde enquanto a aplicação realiza a análise.
 - O resultado da análise será exibido na página.

**Download de Sitemap:**
 - Se a análise for bem-sucedida, um botão de download será exibido.
 - Clique no botão para baixar o sitemap em formato JSON.

**Contribuindo**
 Contribuições são bem-vindas! Sinta-se à vontade para abrir problemas (issues) e enviar pull requests com melhorias.
