import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";

export const downloadPdf = async (
  containerRef: React.RefObject<HTMLElement | null | any>, 
  filename: string, 
  setGeneratingPdf: (val: boolean) => void
) => {
  if (!containerRef.current) return;
  setGeneratingPdf(true);
  try {
    const pages = containerRef.current.querySelectorAll('.pdf-page');
    if (pages.length === 0) throw new Error("No PDF pages found.");

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();

    for (let i = 0; i < pages.length; i++) {
      const pageElement = pages[i] as HTMLElement;
      
      let imgData = "";
      // Retry logic for html-to-image blank returns
      for (let attempt = 0; attempt < 3; attempt++) {
        imgData = await htmlToImage.toPng(pageElement, { 
          pixelRatio: 2, 
          backgroundColor: '#ffffff',
          skipFonts: true,
        });
        if (imgData && imgData.length > 50) break;
        await new Promise(r => setTimeout(r, 500));
      }
      
      if (!imgData || imgData.length < 50 || imgData === "data:,") {
         throw new Error("Failed to render PDF page. Image generation timed out.");
      }
      
      // Get actual image dimensions to prevent aspect ratio distortion or NaN errors if DOM element is hidden
      const img = new window.Image();
      img.src = imgData;
      await new Promise((resolve) => { img.onload = resolve; });
      
      const scaledHeight = (img.height * pdfWidth) / img.width;
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      let finalWidth = pdfWidth;
      let finalHeight = scaledHeight;
      
      // If the page content naturally exceeded A4 proportions, gracefully scale it down to fit on one page rather than slicing text in half
      if (scaledHeight > pdfHeight) {
        const ratio = pdfHeight / scaledHeight;
        finalWidth = pdfWidth * ratio;
        finalHeight = pdfHeight;
      }
      
      // Center horizontally if downscaled
      const xOffset = (pdfWidth - finalWidth) / 2;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', xOffset, 0, finalWidth, finalHeight);
    }
    
    pdf.save(filename);
  } catch (err: any) {
    console.error("PDF generation error:", err);
    alert(`Failed to generate PDF: ${err?.message || err}. Please try again.`);
  } finally {
    setGeneratingPdf(false);
  }
};
