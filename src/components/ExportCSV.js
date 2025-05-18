import React from 'react';
import { saveAs } from 'file-saver';

const ExportCSV = ({ expenses }) => {
  const downloadCSV = () => {
    const headers = ['S.No', 'Amount', 'Category', 'Description', 'Date', 'Time'];

    const rows = expenses.map((exp, index) => {
      let dateStr = '';
      let timeStr = '';

      if (exp.timestamp?.toDate) {
        const dt = exp.timestamp.toDate();
        dateStr = dt.toLocaleDateString('en-GB'); // Format: dd-mm-yyyy
        timeStr = dt.toLocaleTimeString();
      } else if (exp.timestamp) {
        const dt = new Date(exp.timestamp);
        dateStr = dt.toLocaleDateString('en-GB');
        timeStr = dt.toLocaleTimeString();
      }

      return [index + 1, exp.amount, exp.category, exp.description, dateStr, timeStr];
    });

    const csvData = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'expenses.csv');
  };

  return (
    <button onClick={downloadCSV} className="export-button">
      📁 Export to CSV
    </button>
  );
};

export default ExportCSV;
