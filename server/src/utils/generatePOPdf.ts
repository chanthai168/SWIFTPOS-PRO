    // src/utils/generatePOPdf.ts
    import PDFDocument from 'pdfkit';
    import type { Response } from 'express';

    interface POItem {
    product_name: string;
    variant_name: string;
    sku: string;
    quantity: number;
    unit_cost: string | number;
    total_cost: string | number;
    }

    interface POData {
    id: number;
    status: string;
    order_date: string;
    expected_delivery_date: string | null;
    notes: string | null;
    total_cost: string | number;
    supplier_name: string;
    lead_time_days: number;
    items: POItem[];
    shop_name?: string;
    }

    export function generatePOPdf(po: POData, res: Response): void {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="PO-${po.id}.pdf"`);
    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('Purchase Order', { align: 'center' });
    doc.moveDown(0.5);

    // PO Info
    doc.fontSize(12).font('Helvetica');
    doc.text(`PO Number  : #${po.id}`);
    doc.text(`Status     : ${po.status}`);
    doc.text(`Supplier   : ${po.supplier_name}`);
    doc.text(`Order Date : ${new Date(po.order_date).toLocaleDateString()}`);
    doc.text(`Expected   : ${po.expected_delivery_date ? new Date(po.expected_delivery_date).toLocaleDateString() : 'N/A'}`);
    if (po.notes) {
        doc.text(`Notes      : ${po.notes}`);
    }

    doc.moveDown(1);

    // Items table header
    doc.font('Helvetica-Bold').text('Items:', { underline: true });
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('Product',   50,  doc.y, { continued: true, width: 200 });
    doc.text('SKU',      250,  doc.y, { continued: true, width: 100 });
    doc.text('Qty',      350,  doc.y, { continued: true, width: 60 });
    doc.text('Unit Cost',410,  doc.y, { continued: true, width: 80 });
    doc.text('Total',    490,  doc.y, { width: 80 });

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    // Item rows
    doc.font('Helvetica').fontSize(11);
    po.items.forEach((item) => {
        const rowY = doc.y;
        doc.text(`${item.product_name} (${item.variant_name})`, 50,  rowY, { continued: true, width: 200 });
        doc.text(item.sku,                                      250, rowY, { continued: true, width: 100 });
        doc.text(String(item.quantity),                         350, rowY, { continued: true, width: 60 });
        doc.text(`$${Number(item.unit_cost).toFixed(2)}`,       410, rowY, { continued: true, width: 80 });
        doc.text(`$${Number(item.total_cost).toFixed(2)}`,      490, rowY, { width: 80 });
    });

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Total
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Total: $${Number(po.total_cost).toFixed(2)}`, { align: 'right' });

    doc.moveDown(2);

    // Footer
    doc.font('Helvetica').fontSize(10).fillColor('grey');
    doc.text(`Generated on ${new Date().toLocaleDateString()} by SWIFTPOS-PRO`, { align: 'center' });

    doc.end();
    }