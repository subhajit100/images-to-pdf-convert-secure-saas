import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import fs from "fs";
import { encrypt } from "node-qpdf2";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const images = formData.getAll("images") as File[];
  const password = formData.get("password") as string;

  const pdfDoc = await PDFDocument.create();
  const padding = 10; // Define padding around the image

  for (const image of images) {
    const imageBuffer = await image.arrayBuffer();

    const processedImageBuffer = await sharp(Buffer.from(imageBuffer))
      .png()
      .toBuffer();
    const pdfImage = await pdfDoc.embedPng(processedImageBuffer);

    const { width: imgWidth, height: imgHeight } = pdfImage;

    const page = pdfDoc.addPage();
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    // Calculate scaled dimensions to maintain aspect ratio
    const scale = Math.min(
      (pageWidth - 2 * padding) / imgWidth,
      (pageHeight - 2 * padding) / imgHeight
    );
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    // Calculate coordinates to center the image
    const x = (pageWidth - scaledWidth) / 2;
    const y = (pageHeight - scaledHeight) / 2;

    page.drawImage(pdfImage, {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();
  // Convert pdfBytes (Uint8Array) to Buffer
  const buffer = Buffer.from(pdfBytes);
  const filePath = path.join(process.cwd(), "public", "uploads", "output.pdf");
  // Write the file to the specified path
  fs.writeFileSync(filePath, buffer);

  // Define the path to save the encrypted PDF file
  const encryptedPath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "encrypted.pdf"
  );

  await encrypt({
    input: filePath,
    keyLength: 256,
    output: encryptedPath,
    password: password,
    restrictions: {
      modify: "all",
      extract: "n",
      annotate: "n",
      accessibility: "n",
    },
  });

  // getting the buffer array back from file
  const encryptedBufferArray = fs.readFileSync(encryptedPath);

  // Clean up: Remove temporary files
  fs.unlinkSync(filePath); // Remove output.pdf
  fs.unlinkSync(encryptedPath); // Remove encrypted.pdf

  return new NextResponse(new Blob([encryptedBufferArray]), {
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}
