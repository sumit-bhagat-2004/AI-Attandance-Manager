const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#06b6d4');
    gradient.addColorStop(0.5, '#8b5cf6');
    gradient.addColorStop(1, '#ec4899');

    // Fill background with gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Add rounded corners by clipping
    const radius = size * 0.2;
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, radius);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // Add text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${Math.floor(size * 0.3)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EA', size/2, size/2);

    // Save as PNG
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(iconsDir, filename);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);
    console.log(`✅ Created ${filename}`);
}

// Generate all icon sizes
console.log('🎨 Generating PWA icons...');
iconSizes.forEach(size => {
    createIcon(size);
});

console.log('🎉 All PWA icons generated successfully!');
console.log('📁 Icons saved in: public/icons/');
