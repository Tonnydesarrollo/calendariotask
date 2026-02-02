import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicIconsDir = path.join(process.cwd(), 'public', 'icons');

// Ensure directory exists
if (!fs.existsSync(publicIconsDir)) {
  fs.mkdirSync(publicIconsDir, { recursive: true });
}

// SVG template for maskable icons (centered content, no transparency in corners)
const createSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#0f172a"/>
  
  <!-- Gradient defs -->
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Grid icon (4x4 squares) centered with gradient -->
  <g transform="translate(${size * 0.2}, ${size * 0.2})">
    <!-- Background circle for extra safety (maskable) -->
    <circle cx="${size * 0.3}" cy="${size * 0.3}" r="${size * 0.3}" fill="url(#grad1)" opacity="0.9"/>
    
    <!-- Grid pattern -->
    <g fill="url(#grad1)">
      <rect x="${size * 0.05}" y="${size * 0.05}" width="${size * 0.1}" height="${size * 0.1}" rx="${size * 0.01}"/>
      <rect x="${size * 0.2}" y="${size * 0.05}" width="${size * 0.1}" height="${size * 0.1}" rx="${size * 0.01}"/>
      <rect x="${size * 0.35}" y="${size * 0.05}" width="${size * 0.1}" height="${size * 0.1}" rx="${size * 0.01}"/>
      <rect x="${size * 0.5}" y="${size * 0.05}" width="${size * 0.1}" height="${size * 0.1}" rx="${size * 0.01}"/>
      
      <rect x="${size * 0.05}" y="${size * 0.2}" width="${size * 0.1}" height="${size * 0.1}" rx="${size * 0.01}"/>
      <rect x="${size * 0.2}" y="${size * 0.2}" width="${size * 0.1}" height="${size * 0.1}" rx="${size * 0.01}"/>
      <rect x="${size * 0.35}" y="${size * 0.2}" width="${size * 0.1}" height="${size * 0.1}" rx="${size * 0.01}"/>
      <rect x="${size * 0.5}" y="${size * 0.2}" width="${size * 0.1}" height="${size * 0.1}" rx="${size * 0.01}"/>
      
      <rect x="${size * 0.05}" y="${size * 0.35}" width="${size * 0.1}" height="${size * 0.1}" rx="${size * 0.01}"/>
      <rect x="${size * 0.2}" y="${size * 0.35}" width="${size * 0.1}" height="${size * 0.1}" rx="${size * 0.01}"/>
      <rect x="${size * 0.35}" y="${size * 0.35}" width="${size * 0.1}" height="${size * 0.1}" rx="${size * 0.01}"/>
      <rect x="${size * 0.5}" y="${size * 0.35}" width="${size * 0.1}" height="${size * 0.1}" rx="${size * 0.01}"/>
      
      <rect x="${size * 0.05}" y="${size * 0.5}" width="${size * 0.1}" height="${size * 0.1}" rx="${size * 0.01}"/>
      <rect x="${size * 0.2}" y="${size * 0.5}" width="${size * 0.1}" height="${size * 0.1}" rx="${size * 0.01}"/>
      <rect x="${size * 0.35}" y="${size * 0.5}" width="${size * 0.1}" height="${size * 0.1}" rx="${size * 0.01}"/>
      <rect x="${size * 0.5}" y="${size * 0.5}" width="${size * 0.1}" height="${size * 0.1}" rx="${size * 0.01}"/>
    </g>
  </g>
</svg>
`;

async function generateIcons() {
  try {
    console.log('Generating icons...');
    
    // Generate 192x192
    const svg192 = Buffer.from(createSvg(192));
    await sharp(svg192)
      .png()
      .toFile(path.join(publicIconsDir, 'icon-192.png'));
    console.log('✓ Generated icon-192.png');
    
    // Generate 512x512
    const svg512 = Buffer.from(createSvg(512));
    await sharp(svg512)
      .png()
      .toFile(path.join(publicIconsDir, 'icon-512.png'));
    console.log('✓ Generated icon-512.png');
    
    console.log('Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
