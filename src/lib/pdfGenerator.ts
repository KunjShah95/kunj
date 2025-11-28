
import { jsPDF } from 'jspdf';

export const generatePDF = async (imageUrls: string[], fileName: string = 'download.pdf') => {
    const doc = new jsPDF();

    for (let i = 0; i < imageUrls.length; i++) {
        const imgUrl = imageUrls[i];

        // Load image
        const img = new Image();
        img.src = imgUrl;
        img.crossOrigin = 'Anonymous'; // Handle CORS if needed

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        const imgProps = doc.getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (i > 0) {
            doc.addPage();
        }

        doc.addImage(img, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    doc.save(fileName);
};
