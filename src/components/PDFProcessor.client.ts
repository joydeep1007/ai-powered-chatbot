'use client';

import * as pdfjs from 'pdfjs-dist';

// Set up the PDF worker manually using local file to fix dynamic import error
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

import { extractTextFromPDF } from '@/lib/pdfProcessor';

// Client-safe wrapper
export async function extractTextFromPDFClient(file: File) {
  return extractTextFromPDF(file);
}
