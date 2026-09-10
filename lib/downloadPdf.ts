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
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pages.length; i++) {
      const pageElement = pages[i] as HTMLElement;
      
      const imgData = await htmlToImage.toPng(pageElement, { 
        pixelRatio: 2, 
        backgroundColor: '#ffffff'
      });
      
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }
    
    pdf.save(filename);
  } catch (err: any) {
    console.error("PDF generation error:", err);
    alert(`Failed to generate PDF: ${err?.message || err}. Please try again.`);
  } finally {
    setGeneratingPdf(false);
  }
};
