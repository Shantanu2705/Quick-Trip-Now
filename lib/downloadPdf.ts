import html2pdf from "html2pdf.js";

export const downloadPdf = async (
  containerRef: React.RefObject<HTMLElement | null | any>, 
  filename: string, 
  setGeneratingPdf: (val: boolean) => void
) => {
  if (!containerRef.current) return;
  setGeneratingPdf(true);
  
  try {
    const element = containerRef.current;
    
    // Configure html2pdf to use smart page breaks (avoiding slicing elements in half)
    const opt = {
      margin:       10, // 10mm margin around the page
      filename:     filename,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    // Generate and save the PDF
    await html2pdf().set(opt).from(element).save();
    
  } catch (err: any) {
    console.error("PDF generation error:", err);
    alert(`Failed to generate PDF: ${err?.message || err}. Please try again.`);
  } finally {
    setGeneratingPdf(false);
  }
};
