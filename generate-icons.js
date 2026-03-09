const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [16, 48, 128];
const color = '#1A6EF5';

sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#060D1A';
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, size * 0.2);
    ctx.fill();

    // Primary shape (message bubble + spark)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Inner text or icon
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${size * 0.4}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('C', size / 2, size / 2);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`./extension/icons/icon${size}.png`, buffer);
    console.log(`Created icon${size}.png`);
});
