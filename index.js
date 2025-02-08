const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for handling file uploads

const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const platformSizes = {
    instagram: { width: 1080, height: 1080 },
    facebook: { width: 180, height: 180 },
    twitter: { width: 1500, height: 500 },
    linkedin: { width: 400, heigth: 400 },
    whatsapp: {width: 192, height: 192},
};

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send("Image Resizer API is running");
});

app.post('/api/resize', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const platform = req.body.platform;
        if (!platform || !platformSizes[platform]) {
            return res.status(400).json({ error: 'Invalid platform selected' });
        }

        const { width, height } = platformSizes[platform];
        
        const resizedImageBuffer = await sharp(req.file.buffer)
            .resize(width, height, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .toBuffer();

        res.set('Content-Type', 'image/jpeg');
        res.send(resizedImageBuffer);

    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Error processing image' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});