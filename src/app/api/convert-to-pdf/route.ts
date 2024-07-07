import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";


export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const images = formData.getAll("images") as File[];

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

  return new NextResponse(new Blob([pdfBytes]), {
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}
