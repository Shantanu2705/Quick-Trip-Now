const { Jimp } = require("jimp");

async function main() {
  const imagePath = "d:\\Projects\\Quick Trip Now\\public\\images\\logo.png";
  
  try {
    const image = await Jimp.read(imagePath);
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // If the pixel is very close to white, make it transparent
      if (red > 240 && green > 240 && blue > 240) {
        this.bitmap.data[idx + 3] = 0; // Alpha channel
      }
    });
    
    await image.write(imagePath);
    console.log("Successfully removed white background.");
  } catch (err) {
    console.error("Error processing image:", err);
  }
}

main();
