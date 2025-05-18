import axios from "axios";
import { encode } from "blurhash";
import sharp from "sharp";

export const generateBlurhashFromS3Image = async (
  imageUrl: string,
): Promise<string> => {
  const response = await axios.get<ArrayBuffer>(imageUrl, {
    responseType: "arraybuffer",
  });

  const imageBuffer = Buffer.from(response.data);

  const { data, info } = await sharp(imageBuffer, {
    failOnError: false,
    limitInputPixels: false,
  })
    .resize(32, 32, {
      fit: "cover",
      fastShrinkOnLoad: true,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
};
