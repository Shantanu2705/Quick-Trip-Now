const sharp = require('sharp');

async function removeWhiteBackground() {
  const inputPath = 'd:\\Projects\\Quick Trip Now\\public\\images\\logo.png';
  const outputPath = 'd:\\Projects\\Quick Trip Now\\public\\images\\logo_transparent.png';

  try {
    const { data, info } = await sharp(inputPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Loop through pixels and set alpha to 0 for white/near-white pixels
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // If the pixel is very light (near white)
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0; // Set alpha to 0 (transparent)
      }
    }

    // Save back to PNG
    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: info.channels
      }
    })
    .png()
    .toFile(outputPath);

    console.log('Successfully created transparent logo!');
  } catch (error) {
    console.error('Error:', error);
  }
}

removeWhiteBackground();
