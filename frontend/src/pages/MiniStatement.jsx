import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { FileText, Download, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './MiniStatement.css';

const MiniStatement = () => {
  const { user } = useContext(AuthContext);
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const [accRes, txnRes] = await Promise.all([
          axios.get('http://localhost:5000/api/accounts/my-account', config),
          axios.get('http://localhost:5000/api/transactions', config),
        ]);
        setAccount(accRes.data);
        setTransactions(txnRes.data.slice(0, 10)); // Last 10 transactions
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const formatINR = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v);
  // PDF-safe formatter: jsPDF default font does not support the Rs. symbol, use "Rs." instead
  const pdfINR = (v) => `Rs. ${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const downloadStatement = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(31, 41, 55);
    doc.text('IndiaBank Digital', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('Account Mini Statement', 14, 30);
    
    // Meta data  (use pdfINR — rs. prefix only — to avoid Rs. symbol garbling)
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text(`Account Holder: ${user.name}`, 14, 45);
    doc.text(`Account Number: ${account?.accountNumber}`, 14, 52);
    doc.text(`Account Type: ${account?.accountType?.toUpperCase()}`, 14, 59);
    doc.text(`IFSC Code: ${account?.ifscCode}`, 100, 45);
    doc.text(`Statement Date: ${new Date().toLocaleDateString('en-IN')}`, 100, 52);
    doc.text(`Available Balance: ${pdfINR(account?.balance || 0)}`, 100, 59);
    
    // Table Data
    const tableColumn = ["Date", "Time", "Description", "Type", "Amount", "Ref ID"];
    const tableRows = [];

    transactions.forEach(t => {
      const isCredit = t.type === 'deposit' || (t.type === 'transfer' && t.account?._id !== account?._id);
      
      const row = [
        formatDate(t.createdAt),
        formatTime(t.createdAt),
        t.description || t.type.replace('_', ' '),
        t.type.replace('_', ' '),
        `${isCredit ? '+' : '-'}${t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        t._id?.slice(-8).toUpperCase()
      ];
      tableRows.push(row);
    });

    // AutoTable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 70,
      theme: 'grid',
      styles: { fontSize: 8, textColor: [55, 65, 81] },
      headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        4: { fontStyle: 'bold' } // Amount column
      },
      didParseCell: function (data) {
        // Color amount text green or red
        if (data.section === 'body' && data.column.index === 4) {
          if (data.cell.raw.startsWith('+')) {
            data.cell.styles.textColor = [16, 185, 129]; // Green
          } else {
            data.cell.styles.textColor = [244, 63, 94];  // Red
          }
        }
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text('This is a computer generated statement.', 14, doc.internal.pageSize.height - 15);
        doc.text('© 2026 IndiaBank Digital. All rights reserved.', 14, doc.internal.pageSize.height - 10);
    }
    
    doc.save(`IndiaBank_MiniStatement_${account?.accountNumber}.pdf`);
  };

  const printStatement = () => {
    window.print();
  };

  if (loading) return <div className="text-center mt-4">Loading statement...</div>;

  return (
    <div className="statement-page animate-fade-in">
      <div className="page-header-row">
        <h2 className="page-title">Mini Statement</h2>
        <div className="action-btns">
          <button className="btn btn-outline" onClick={downloadStatement}>
            <Download size={16} /> Download
          </button>
          <button className="btn btn-outline" onClick={printStatement}>
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      {/* Statement Header Card */}
      <div className="glass-panel statement-header-card">
        <div className="bank-logo-row">
          <FileText size={22} style={{ color: 'var(--primary)' }} />
          <div>
            <h3 className="bank-name">IndiaBank Digital</h3>
            <p className="statement-subtitle">Account Mini Statement</p>
          </div>
        </div>
        <div className="statement-meta-grid">
          <div className="meta-item">
            <span className="meta-label">Account Holder</span>
            <span className="meta-value">{user.name}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Account Number</span>
            <span className="meta-value mono">{account?.accountNumber}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Account Type</span>
            <span className="meta-value">{account?.accountType?.toUpperCase()}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">IFSC Code</span>
            <span className="meta-value mono">{account?.ifscCode}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Statement Date</span>
            <span className="meta-value">{new Date().toLocaleDateString('en-IN')}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Available Balance</span>
            <span className="meta-value balance-val">{formatINR(account?.balance || 0)}</span>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'auto' }}>
        <table className="statement-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Description</th>
              <th>Type</th>
              <th>Amount (₹)</th>
              <th>Ref ID</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan="6" className="empty-row">No transactions found</td></tr>
            ) : (
              transactions.map((t) => {
                const isCredit = t.type === 'deposit' || (t.type === 'transfer' && t.account?._id !== account?._id);
                return (
                  <tr key={t._id}>
                    <td>{formatDate(t.createdAt)}</td>
                    <td>{formatTime(t.createdAt)}</td>
                    <td>{t.description || t.type.replace('_', ' ')}</td>
                    <td><span className={`stmt-type ${t.type}`}>{t.type.replace('_', ' ')}</span></td>
                    <td className={isCredit ? 'credit-amt' : 'debit-amt'}>
                      {isCredit ? '+' : '-'}{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="ref-id">{t._id?.slice(-8).toUpperCase()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="statement-footer">
        <p>This is a computer generated statement and does not require signature.</p>
        <p>© 2026 IndiaBank Digital. Licensed by RBI. Member DICGC.</p>
      </div>
    </div>
  );
};

export default MiniStatement;
