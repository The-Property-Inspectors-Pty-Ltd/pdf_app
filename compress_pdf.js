const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function optimizePdf(inputPath, outputPath) {
  // Load the existing PDF
  const pdfBytes = fs.readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  // Remove unnecessary metadata (for example, if there's any custom author info)
  pdfDoc.setTitle('Optimized PDF');
  pdfDoc.setAuthor('Optimized Author');
  pdfDoc.setCreator('Your Application');
  
  // Optionally, you can add new content, remove pages, or reduce content here
  // Example: Remove the first page (if it’s unnecessary)
  const pages = pdfDoc.getPages();
  if (pages.length > 1) {
    pdfDoc.removePage(0);  // Removes the first page
  }

  // Save the modified PDF and write it to the output file
  const optimizedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, optimizedPdfBytes);

  console.log('PDF optimized and saved to', outputPath);
}

module.exports = optimizePdf;