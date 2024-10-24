import sharp from "sharp";
import * as fs from "fs";

export default async function convertImage(
    fileName: string,
    filePath: string,
    outputPath: string,
    mimetype: string
) {
    try {
        await sharp(filePath).toFile(outputPath);

        const fileData = fs.readFileSync(outputPath);
        const base64Data = `data:${mimetype};base64,` + fileData.toString("base64");

        if (fs.existsSync(filePath) && fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
            fs.unlinkSync(filePath);

            return {
                error: false,
                data: base64Data
            };
        } else {
            return {
                error: true,
                message: `File ${fileName} not found.`
            };
        }
    } catch (err) {
        return {
            error: true,
            message: "Error compressing image."
        };
    }
}