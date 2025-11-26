
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../types';

export const generateInvoicePDF = (order: Order): void => {
  const doc = new jsPDF();

  // --- Colors ---
  const primaryColor = [20, 20, 20]; // Black/Dark Grey
  const accentColor = [60, 60, 60]; // Lighter Grey

  // --- Header ---
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 190, 20, { align: 'right' });

  // Brand
  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text('Institutional Trading Blueprint', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('123 Financial District', 20, 26);
  doc.text('London, UK, EC1A 1BB', 20, 31);
  doc.text('vat: GB123456789', 20, 36);
  doc.text('web: tradingblueprint.com', 20, 41);

  // --- Invoice Meta Data ---
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Invoice #: ${order.invoiceNumber}`, 190, 30, { align: 'right' });
  doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 190, 35, { align: 'right' });
  doc.text(`Status: ${order.status.toUpperCase()}`, 190, 40, { align: 'right' });
  if (order.transactionId) {
    doc.text(`Trans ID: ${order.transactionId}`, 190, 45, { align: 'right' });
  }

  // --- Bill To ---
  doc.setDrawColor(200);
  doc.line(20, 50, 190, 50);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 20, 60);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(order.customer.name, 20, 67);
  doc.text(order.customer.email, 20, 72);
  if (order.customer.address) doc.text(order.customer.address, 20, 77);
  if (order.customer.country) doc.text(order.customer.country, 20, 82);
  if (order.customer.vatNumber) doc.text(`VAT/Tax ID: ${order.customer.vatNumber}`, 20, 87);

  // --- Item Table ---
  const tableColumn = ["Item Description", "Type", "Qty", "Price"];
  const tableRows = [
    [
      order.productName,
      "Digital License",
      "1",
      `€${order.price.toFixed(2)}`
    ]
  ];

  autoTable(doc, {
    startY: 95,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    headStyles: { fillColor: primaryColor as any, textColor: [255, 255, 255] },
    styles: { fontSize: 10, cellPadding: 5 },
  });

  // --- Totals ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: €${order.price.toFixed(2)}`, 190, finalY, { align: 'right' });
  
  finalY += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100);
  doc.text('Paid in full. Non-tangible irrevocable digital goods.', 190, finalY, { align: 'right' });

  // --- DIGITAL FULFILLMENT RECORD (Proof of Delivery) ---
  finalY += 20;
  
  // Background block for digital proof
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(20, finalY, 170, 55, 3, 3, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40);
  doc.text('DIGITAL DELIVERY CONFIRMATION (AUDIT TRAIL)', 25, finalY + 10);
  
  doc.setFontSize(9);
  doc.setFont('courier', 'normal'); // Monospace for technical look
  doc.setTextColor(60);
  
  let lineY = finalY + 20;
  const lineHeight = 6;
  
  doc.text(`Delivery Status:   ${order.delivery.status.toUpperCase()}`, 25, lineY);
  lineY += lineHeight;
  doc.text(`Unique Link ID:    ${order.delivery.deliveryId}`, 25, lineY);
  lineY += lineHeight;
  doc.text(`Sent Timestamp:    ${new Date(order.delivery.sentAt).toUTCString()}`, 25, lineY);
  lineY += lineHeight;
  
  if (order.delivery.status === 'downloaded' && order.delivery.accessIp) {
     doc.text(`Access IP Addr:    ${order.delivery.accessIp}`, 25, lineY);
     lineY += lineHeight;
     doc.text(`Access Time:       ${new Date(order.delivery.lastAccessedAt!).toUTCString()}`, 25, lineY);
     lineY += lineHeight;
     // Truncate User Agent if too long
     const ua = order.delivery.userAgent ? order.delivery.userAgent.substring(0, 70) + '...' : 'N/A';
     doc.text(`Device signature:  ${ua}`, 25, lineY);
  } else {
     doc.text(`Access IP Addr:    Waiting for user access...`, 25, lineY);
     lineY += lineHeight;
  }
  
  // --- Footer ---
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.text('This document serves as proof of delivery for digital goods.', 105, 270, { align: 'center' });
  doc.text('Institutional Trading Blueprint™ - London, UK', 105, 275, { align: 'center' });

  // Save
  doc.save(`Invoice-${order.invoiceNumber}.pdf`);
};
