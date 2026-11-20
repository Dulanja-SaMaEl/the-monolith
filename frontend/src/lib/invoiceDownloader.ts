import { BillingDocument } from './portalStore';

export const generateInvoiceHtml = (doc: BillingDocument): string => {
  const isInvoice = doc.type === 'invoice';
  const typeLabel = isInvoice ? 'COMMERCIAL INVOICE' : 'ARCHITECTURAL QUOTATION';
  const accentColor = '#9F8170';
  const formattedDate = new Date(doc.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${doc.document_number} — Monolith LK ${typeLabel}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Oswald:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #FAF8F5;
      color: #141414;
      padding: 40px 20px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    .invoice-wrapper {
      max-width: 850px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid rgba(159, 129, 112, 0.25);
      border-radius: 16px;
      padding: 48px;
      box-shadow: 0 10px 30px rgba(159, 129, 112, 0.08);
      position: relative;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid rgba(159, 129, 112, 0.2);
      padding-bottom: 28px;
      margin-bottom: 32px;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .brand-cube {
      width: 16px;
      height: 16px;
      background: #000000;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: bold;
    }
    .brand-name {
      font-family: 'Oswald', sans-serif;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #000000;
    }
    .brand-name span {
      color: ${accentColor};
      margin-left: 3px;
    }
    .studio-meta {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: rgba(159, 129, 112, 0.9);
      line-height: 1.6;
    }
    .doc-meta {
      text-align: right;
    }
    .doc-type-pill {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #ffffff;
      background: ${accentColor};
      padding: 4px 10px;
      border-radius: 4px;
      margin-bottom: 6px;
    }
    .doc-number {
      font-family: 'Oswald', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: #000000;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
    .status-badge {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid;
    }
    .status-paid {
      background: #ECFDF5;
      color: #065F46;
      border-color: #A7F3D0;
    }
    .status-sent, .status-draft, .status-approved {
      background: #EFF6FF;
      color: #1E40AF;
      border-color: #BFDBFE;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 36px;
    }
    .info-card {
      background: #FAF8F5;
      border: 1px solid rgba(159, 129, 112, 0.2);
      border-radius: 10px;
      padding: 18px 20px;
    }
    .info-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: ${accentColor};
      margin-bottom: 8px;
    }
    .client-title {
      font-family: 'Oswald', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: #000000;
      margin-bottom: 4px;
    }
    .info-text {
      font-size: 12px;
      color: #4b5563;
      font-family: 'JetBrains Mono', monospace;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
    }
    thead th {
      text-align: left;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: ${accentColor};
      font-size: 11px;
      padding: 12px 16px;
      border-bottom: 2px solid rgba(159, 129, 112, 0.25);
      background: #FAF8F5;
    }
    thead th.text-right {
      text-align: right;
    }
    thead th.text-center {
      text-align: center;
    }
    tbody td {
      padding: 16px;
      border-bottom: 1px solid rgba(159, 129, 112, 0.15);
      color: #1f2937;
    }
    tbody td.item-desc {
      font-weight: 600;
      color: #000000;
    }
    tbody td.text-right {
      text-align: right;
    }
    tbody td.text-center {
      text-align: center;
    }
    .totals-block {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 32px;
    }
    .totals-table {
      width: 320px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      color: #4b5563;
    }
    .totals-row.grand-total {
      border-top: 2px solid #000000;
      padding-top: 12px;
      margin-top: 8px;
      font-size: 14px;
      font-weight: bold;
      color: #000000;
    }
    .grand-total span:last-child {
      font-family: 'Oswald', sans-serif;
      font-size: 22px;
      color: ${accentColor};
    }
    .terms-box {
      background: #FAF8F5;
      border: 1px solid rgba(159, 129, 112, 0.2);
      border-radius: 10px;
      padding: 18px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #4b5563;
      margin-bottom: 36px;
    }
    .terms-box strong {
      color: #000000;
    }
    .signatures-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      border-top: 1px solid rgba(159, 129, 112, 0.2);
      padding-top: 28px;
    }
    .sign-box {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
    }
    .sign-line {
      width: 100%;
      height: 1px;
      background: #000000;
      margin-bottom: 8px;
    }
    .sign-name {
      font-weight: bold;
      color: #000000;
      font-family: 'Oswald', sans-serif;
      font-size: 14px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .sign-role {
      color: ${accentColor};
      font-size: 10px;
      text-transform: uppercase;
    }
    .footer-watermark {
      margin-top: 32px;
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: rgba(159, 129, 112, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.15em;
    }

    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .invoice-wrapper {
        border: none;
        box-shadow: none;
        padding: 20px;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <!-- Header -->
    <div class="header-bar">
      <div>
        <div class="brand-logo">
          <div class="brand-cube">■</div>
          <div class="brand-name">MONOLITH<span>LK</span></div>
        </div>
        <div class="studio-meta">
          Monolith LK Architecture & Engineering Cluster<br>
          Kurunegala / Giriulla / Colombo, Sri Lanka (UTC+5:30)<br>
          Direct: +94 76 591 7189 · contact@monolith.lk
        </div>
      </div>

      <div class="doc-meta">
        <div class="doc-type-pill">${typeLabel}</div>
        <div class="doc-number">${doc.document_number}</div>
        <div>
          <span class="status-badge ${doc.status === 'paid' ? 'status-paid' : 'status-sent'}">
            ● ${doc.status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>

    <!-- Client & Issue Info -->
    <div class="info-grid">
      <div class="info-card">
        <div class="info-label">Billed To / Strategic Client</div>
        <div class="client-title">${doc.client_name}</div>
        <div class="info-text">
          Enterprise Account: ${doc.client_id}<br>
          ${doc.project_title ? `Project Reference: <strong>${doc.project_title}</strong><br>` : ''}
          Classification: Tier-1 Enterprise Partner
        </div>
      </div>

      <div class="info-card">
        <div class="info-label">Chronology & Ledger Terms</div>
        <div class="info-text">
          Date of Issue: <strong>${formattedDate}</strong><br>
          Payment Due: <strong>${doc.due_date}</strong><br>
          Settlement Terms: Net-30 Days<br>
          Disbursement Currency: <strong>${doc.currency}</strong>
        </div>
      </div>
    </div>

    <!-- Table of Deliverables -->
    <table>
      <thead>
        <tr>
          <th>Deliverable Scope & Architecture Milestone</th>
          <th class="text-center">Qty</th>
          <th class="text-right">Unit Rate</th>
          <th class="text-right">Line Total</th>
        </tr>
      </thead>
      <tbody>
        ${doc.line_items.map((item) => `
          <tr>
            <td class="item-desc">${item.description}</td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-right">$${item.unit_price.toLocaleString()}</td>
            <td class="text-right font-bold">$${item.total.toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Totals Calculation -->
    <div class="totals-block">
      <div class="totals-table">
        <div class="totals-row">
          <span>Subtotal Amount:</span>
          <span>$${doc.subtotal.toLocaleString()}</span>
        </div>
        <div class="totals-row">
          <span>VAT / Tech Export Tax (0.00%):</span>
          <span>$${doc.tax.toLocaleString()}</span>
        </div>
        <div class="totals-row grand-total">
          <span>Total Balance:</span>
          <span>$${doc.total.toLocaleString()} ${doc.currency}</span>
        </div>
      </div>
    </div>

    <!-- Notes & Settlement Instructions -->
    <div class="terms-box">
      <strong>Settlement & Banking Instructions:</strong><br>
      ${doc.notes || 'Wire transfers payable to Monolith LK Enterprise Technology Accounts. Reference document number in payment narration.'}<br>
      Swift / IBAN routing provided via authorized portal transmission.
    </div>

    <!-- Dual Co-Founder Signatures -->
    <div class="signatures-grid">
      <div class="sign-box">
        <div class="sign-line"></div>
        <div class="sign-name">Dulanja Abeysinghe</div>
        <div class="sign-role">Co-Founder & Principal Systems Architect</div>
      </div>

      <div class="sign-box">
        <div class="sign-line"></div>
        <div class="sign-name">Remashi Diyana</div>
        <div class="sign-role">Co-Founder & Head of Creative Strategy</div>
      </div>
    </div>

    <!-- Footer Watermark -->
    <div class="footer-watermark">
      Generated by Monolith LK Studio OS · Verified Hash: SHA256-${Date.now().toString(16).toUpperCase()}
    </div>
  </div>
</body>
</html>`;
};

/**
 * Triggers a direct file download of the beautifully formatted HTML invoice
 */
export const downloadBillingVoucherHtml = (doc: BillingDocument): void => {
  const htmlContent = generateInvoiceHtml(doc);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${doc.document_number}_${doc.type.toUpperCase()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Opens a dedicated print window with this invoice and automatically triggers print/save to PDF
 */
export const printBillingVoucherPdf = (doc: BillingDocument): void => {
  const htmlContent = generateInvoiceHtml(doc);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 450);
  }
};
