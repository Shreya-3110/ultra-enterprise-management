import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

console.log('Report Generator Module Loaded');

/**
 * Professional Report Generator for Ultra Enterprise
 * Handles branding, table formatting, and document structure.
 */

const COLORS = {
  PRIMARY: [37, 99, 235], // Blue 600
  SECONDARY: [71, 85, 105], // Slate 600
  TEXT_DARK: [15, 23, 42], // Slate 900
  TEXT_LIGHT: [100, 116, 139], // Slate 500
  BORDER: [226, 232, 240], // Slate 200
  BACKGROUND_ALT: [248, 250, 252], // Slate 50
};

const BRANDING = {
  SCHOOL_NAME: 'ULTRA ENTERPRISE ACADEMY',
  SYSTEM_NAME: 'Ultra Enterprise Management System',
  CONTACT: 'Support: +91 98765 43210',
  EMAIL: 'admin@ultraenterprise.com'
};

const drawHeader = (doc, title) => {
  const pageWidth = doc.internal.pageSize.width;
  
  // School Name (Branding)
  doc.setFontSize(22); // Slightly smaller to fit better
  doc.setTextColor(...COLORS.PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.text(BRANDING.SCHOOL_NAME, 20, 22);
  
  // System Subtitle
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.TEXT_LIGHT);
  doc.setFont('helvetica', 'normal');
  doc.text(BRANDING.SYSTEM_NAME.toUpperCase(), 20, 28);
  
  // Report Title (Right Aligned, but moved down to avoid any overlap)
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.TEXT_DARK);
  doc.setFont('helvetica', 'bold');
  const titleText = (title || 'Official Document').toUpperCase();
  const titleWidth = doc.getTextWidth(titleText);
  // Position Title on the next line if it's long, or just right-aligned below branding
  doc.text(titleText, pageWidth - titleWidth - 20, 38);
  
  // Separator Line
  doc.setDrawColor(...COLORS.BORDER);
  doc.setLineWidth(0.8);
  doc.line(20, 45, pageWidth - 20, 45); // Moved down from 40
  
  // Timestamp
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.TEXT_LIGHT);
  const date = new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' });
  doc.text(`Official Document - Generated on: ${date}`, 20, 52); // Moved down from 47
};

const drawFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLORS.BORDER);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
    
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.TEXT_LIGHT);
    doc.setFont('helvetica', 'italic');
    doc.text(BRANDING.CONTACT + ' | ' + BRANDING.EMAIL, 20, pageHeight - 12);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 40, pageHeight - 12);
  }
};

/**
 * Generate a comprehensive Dashboard Summary Report
 */
export const generateDashboardSummary = (stats, activity) => {
  console.log('Function generateDashboardSummary called');
  const doc = new jsPDF();
  drawHeader(doc, 'Executive Summary');

  // Key Performance Indicators (KPIs)
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.text('KEY PERFORMANCE INDICATORS', 20, 60);

  const kpiData = [
    ['Metric', 'Value', 'Context'],
    ['Total Student Strength', stats.studentCount?.toString() || '0', 'Active Enrolments'],
    ['Total Revenue Collected', `INR ${stats.totalCollection?.toLocaleString() || '0'}`, 'Current Session'],
    ['Outstanding Receivables', `INR ${stats.outstandingDues?.toLocaleString() || '0'}`, `${stats.collectionRate || 0}% Collection Rate`],
    ['Surplus Wallet Credits', `INR ${stats.walletCredits?.toLocaleString() || '0'}`, 'Advance Payments'],
    ['Late Fee Recovery', `INR ${stats.lateFeesRecovered?.toLocaleString() || '0'}`, 'Administrative Dues']
  ];

  autoTable(doc, {
    startY: 70,
    head: [kpiData[0]],
    body: kpiData.slice(1),
    theme: 'striped',
    headStyles: { fillColor: COLORS.PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold' },
    margin: { left: 20, right: 20 }
  });

  // Recent Activity Section
  const nextY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.PRIMARY);
  doc.setFont('helvetica', 'bold');
  doc.text('RECENT SYSTEM ACTIVITY', 20, nextY);

  const activityRows = activity.slice(0, 10).map(log => [
    new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    log.user?.name || 'SYSTEM',
    log.action.replace('_', ' '),
    log.details
  ]);

  autoTable(doc, {
    startY: nextY + 5,
    head: [['TIME', 'ADMIN', 'ACTION', 'DETAILS']],
    body: activityRows,
    theme: 'grid',
    headStyles: { fillColor: COLORS.SECONDARY, textColor: [255, 255, 255] },
    bodyStyles: { fontSize: 8 },
    margin: { left: 20, right: 20 }
  });

  drawFooter(doc);
  doc.save(`Executive_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
  console.log('PDF Save triggered');
};

/**
 * Generate a professional student directory report
 */
export const generateStudentReport = (students) => {
  console.log('Function generateStudentReport called');
  const doc = new jsPDF();
  drawHeader(doc, 'Student Directory');

  const tableRows = students.map(s => [
    s.admissionNumber || 'N/A',
    `${s.firstName} ${s.lastName}`,
    s.currentClass || 'N/A',
    s.parentDetails?.name || 'N/A',
    s.parentDetails?.phone || 'N/A',
    s.status || 'ACTIVE'
  ]);

  autoTable(doc, {
    startY: 65,
    head: [['ADM. NO', 'STUDENT NAME', 'CLASS', 'GUARDIAN', 'CONTACT', 'STATUS']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.PRIMARY,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLORS.TEXT_DARK
    },
    alternateRowStyles: {
      fillColor: COLORS.BACKGROUND_ALT
    },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 30 },
      2: { cellWidth: 20 },
      5: { cellWidth: 25 }
    }
  });

  drawFooter(doc);
  doc.save(`Student_Directory_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Generate a professional financial transaction history report
 */
export const generateTransactionReport = (transactions, studentName) => {
  const finalStudentName = (studentName && !studentName.includes('undefined')) ? studentName : 'Student Ledger';
  console.log('Function generateTransactionReport called for:', finalStudentName, transactions);
  const doc = new jsPDF();
  drawHeader(doc, finalStudentName === 'Global' ? 'Collection Ledger' : `${finalStudentName} Receipt`);

  const tableRows = transactions.map(t => [
    new Date(t.datePaid || t.createdAt || t.date).toLocaleDateString('en-GB'),
    t.studentId?.firstName ? `${t.studentId.firstName} ${t.studentId.lastName}` : (t.notes || t.description || 'General Collection'),
    t.method || 'N/A',
    `INR ${t.amountPaid?.toLocaleString() || t.amount?.toLocaleString() || '0'}`,
    t.status || 'SUCCESS'
  ]);

  autoTable(doc, {
    startY: 65,
    head: [['DATE', 'ENTITY / DESCRIPTION', 'METHOD', 'AMOUNT', 'STATUS']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.SECONDARY,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLORS.TEXT_DARK
    },
    alternateRowStyles: {
      fillColor: COLORS.BACKGROUND_ALT
    },
    margin: { left: 20, right: 20 }
  });

  // NEW: Installment Breakdown Section (For individual receipts)
  const isIndividualReceipt = transactions.length === 1 && transactions[0].installments?.length > 0;
  
  if (isIndividualReceipt) {
    const payment = transactions[0];
    const breakdownY = doc.lastAutoTable.finalY + 15;
    
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.PRIMARY);
    doc.setFont('helvetica', 'bold');
    doc.text('SETTLEMENT BREAKDOWN', 20, breakdownY);
    
    const breakdownRows = payment.installments.map(inst => [
      inst.name,
      `INR ${inst.amountAllocated.toLocaleString()}`,
      inst.isFullyPaid ? 'FULLY PAID' : 'PARTIAL'
    ]);

    autoTable(doc, {
      startY: breakdownY + 5,
      head: [['INSTALLMENT NAME', 'ALLOCATED AMOUNT', 'PROGRESS']],
      body: breakdownRows,
      theme: 'striped',
      headStyles: { fillColor: COLORS.PRIMARY, textColor: [255, 255, 255] },
      margin: { left: 20, right: 20 }
    });
  }

  // Footer Disclaimer for receipts
  if (studentName !== 'Global') {
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.TEXT_LIGHT);
    doc.setFont('helvetica', 'italic');
    doc.text('This is a computer-generated receipt and does not require a physical signature.', 20, finalY);
  }

  drawFooter(doc);
  doc.save(`${studentName}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Generate a professional audit trail report
 */
export const generateAuditReport = (logs) => {
  console.log('Function generateAuditReport called');
  const doc = new jsPDF();
  drawHeader(doc, 'System Audit Trail');

  const tableRows = logs.map(l => [
    new Date(l.timestamp).toLocaleString(),
    l.user?.name || 'N/A',
    l.action.replace('_', ' ') || 'N/A',
    l.details || 'N/A'
  ]);

  autoTable(doc, {
    startY: 65,
    head: [['TIMESTAMP', 'ADMINISTRATOR', 'ACTION', 'DETAILS']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.SECONDARY,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: COLORS.TEXT_DARK
    },
    alternateRowStyles: {
      fillColor: COLORS.BACKGROUND_ALT
    },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 30 },
      2: { cellWidth: 40 }
    }
  });

  drawFooter(doc);
  doc.save(`Audit_Trail_${new Date().toISOString().split('T')[0]}.pdf`);
};
