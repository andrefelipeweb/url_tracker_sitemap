document.addEventListener('DOMContentLoaded', () => {
    const analyzeButton = document.getElementById('analyzeButton');
    const urlInput = document.getElementById('urlInput');
    const resultMessage = document.getElementById('resultMessage');
    const downloadLink = document.getElementById('downloadLink');

    analyzeButton.addEventListener('click', async () => {
        const url = urlInput.value;
        resultMessage.textContent = 'Analyzing...';

        try {
            const response = await fetch(`/analyze?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (data.success) {
                resultMessage.textContent = `Analysis successful. ${data.message}`;
                downloadLink.href = '/sitemap.json';
                downloadLink.style.display = 'block';
            } else {
                resultMessage.textContent = `Error: ${data.message}`;
            }
        } catch (error) {
            resultMessage.textContent = 'An error occurred while connecting to the server.';
        }
    });
});
