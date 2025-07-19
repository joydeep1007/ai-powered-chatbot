export interface PDFProcessingResult {
  text: string;
  pageCount: number;
  fileName: string;
}

export async function extractTextFromPDF(file: File): Promise<PDFProcessingResult> {
  try {
    // Only run on client side
    if (typeof window === 'undefined') {
      throw new Error('PDF processing is only available on the client side');
    }

    // Import pdfjs-dist directly - worker should already be configured by client wrapper
    const pdfjsLib = await import('pdfjs-dist');
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      disableAutoFetch: true,
      disableStream: true
    }).promise;
    
    let fullText = '';
    const pageCount = pdf.numPages;
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += `Page ${pageNum}:\n${pageText}\n\n`;
    }
    
    return {
      text: fullText.trim(),
      pageCount,
      fileName: file.name
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        throw new Error('The uploaded file appears to be corrupted or not a valid PDF.');
      } else if (error.message.includes('password')) {
        throw new Error('This PDF is password protected. Please upload an unprotected PDF.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Network error occurred while processing PDF. Please check your connection.');
      }
      throw new Error(`PDF processing failed: ${error.message}`);
    }
    
    throw new Error('Failed to process PDF file. Please try again.');
  }
}

export function formatPDFContext(pdfResult: PDFProcessingResult): string {
  return `PDF Document: ${pdfResult.fileName} (${pdfResult.pageCount} pages)\n\nContent:\n${pdfResult.text}`;
}
