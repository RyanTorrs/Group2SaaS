const path = require('path');
const express = require('express');
const multer = require('multer');
const vision = require('@google-cloud/vision');

const app = express();
const port = process.env.PORT || 8080;
const visionClient = new vision.ImageAnnotatorClient();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 8 * 1024 * 1024,
        files: 1
    },
    fileFilter: (_request, file, callback) => {
        callback(null, Boolean(file.mimetype && file.mimetype.startsWith('image/')));
    }
});

app.use(express.static(path.join(__dirname, 'public')));

function escapeHtml(value) {
    const entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };

    return String(value).replace(/[&<>"']/g, character => entities[character]);
}

function errorHtml(message) {
    return `<section class="notice">
    <h2>Could not analyze the image</h2>
    <p>${escapeHtml(message)}</p>
  </section>`;
}

app.post('/analyze', upload.single('pic'), async (request, response) => {
    if (!request.file) {
        return response
            .status(400)
            .type('html')
            .send(errorHtml('Choose one valid image file, then try again.'));
    }

    try {
        // Send the uploaded image bytes directly to Vision.
        const [result] = await visionClient.labelDetection(request.file.buffer);
        const labels = result.labelAnnotations || [];

        if (labels.length === 0) {
            return response
                .type('html')
                .send('<section><h2>No labels detected</h2><p>Try another image.</p></section>');
        }

        const rows = labels.map(label => {
            const description = escapeHtml(label.description || 'Unknown');
            const confidence = (Number(label.score || 0) * 100).toFixed(1);

            return `<li>${description}<span class="score">${confidence}% confidence</span></li>`;
        }).join('');

        const html = `<section>
      <h2>Detected labels</h2>
      <p>Image: ${escapeHtml(request.file.originalname)}</p>
      <ul class="result-list">${rows}</ul>
    </section>`;

        return response.type('html').send(html);
    } catch (error) {
        console.error('Vision API request failed:', error.message);
        return response
            .status(502)
            .type('html')
            .send(errorHtml('Vision could not analyze the image. Check the API, billing, and server logs.'));
    }
});

app.use((error, _request, response, _next) => {
    const tooLarge =
        error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE';

    console.error('Upload failed:', error.message);

    return response
        .status(tooLarge ? 413 : 400)
        .type('html')
        .send(errorHtml(
            tooLarge
                ? 'The image must be 8 MB or smaller.'
                : 'Upload one image file and try again.'
        ));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
});