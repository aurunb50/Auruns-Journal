// Image Compression Script for Portfolio
// This will compress all images in the images/gallery folder

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputDir = path.join(__dirname, 'images', 'gallery');
const outputDir = path.join(__dirname, 'images', 'gallery-optimized');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function compressImage(filename) {
    const inputPath = path.join(inputDir, filename);
    const outputPath = path.join(outputDir, filename);
    
    const ext = path.extname(filename).toLowerCase();
    
    // Skip videos
    if (ext === '.mp4') {
        console.log(`Skipping video: ${filename}`);
        return;
    }
    
    try {
        const stats = fs.statSync(inputPath);
        const originalSize = (stats.size / 1024 / 1024).toFixed(2);
        
        // Compress image
        await sharp(inputPath)
            .resize(1200, 1200, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80, progressive: true })
            .toFile(outputPath);
        
        const newStats = fs.statSync(outputPath);
        const newSize = (newStats.size / 1024 / 1024).toFixed(2);
        const savings = ((1 - newStats.size / stats.size) * 100).toFixed(1);
        
        console.log(`✓ ${filename}: ${originalSize}MB → ${newSize}MB (saved ${savings}%)`);
    } catch (error) {
        console.error(`✗ Error compressing ${filename}:`, error.message);
    }
}

async function compressAllImages() {
    console.log('Starting image compression...\n');
    
    const files = fs.readdirSync(inputDir);
    const imageFiles = files.filter(f => {
        const ext = path.extname(f).toLowerCase();
        return ['.jpg', '.jpeg', '.png'].includes(ext);
    });
    
    console.log(`Found ${imageFiles.length} images to compress\n`);
    
    for (const file of imageFiles) {
        await compressImage(file);
    }
    
    console.log('\n✓ Compression complete!');
    console.log(`\nOptimized images saved to: ${outputDir}`);
    console.log('\nNext steps:');
    console.log('1. Review the optimized images');
    console.log('2. If satisfied, replace the original images with the optimized ones');
    console.log('3. Or update your HTML to use the gallery-optimized folder');
}

compressAllImages().catch(console.error);
