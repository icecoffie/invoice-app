import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function App() {
  const invoiceRef = useRef(null);

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  const [currentView, setCurrentView] = useState('form');

  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [senderInfo, setSenderInfo] = useState({
    name: 'Matrix Sync',
    address: 'Kota Baru, Bekasi Barat',
    city: 'Kota Bekasi',
    country: 'Indonesia',
    phone: '+27 810 759 861',
    email: 'tech@msync.my.id',
    website: 'https://tech.msync.my.id',
  });

  const [recipientInfo, setRecipientInfo] = useState({
    name: 'Your Client Name',
    address: 'Jl. Client Example No. 456',
    city: 'Client City, 54321',
    country: 'Indonesia',
    phone: '+62 987 6543 210',
    email: 'client@email.com',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    bankName: 'BCA Digital (Blu)',
    accountName: 'Malika Shakila',
    accountNumber: '001812559954',
    msyncCode: 'MSYNC ID',
    dueDate: new Date().toISOString().slice(0, 10),
    notes: 'Thank you for your business!',
  });

  const [items, setItems] = useState([
    { id: 1, description: 'Web Design Service', quantity: 1, price: 10000000 },
    { id: 2, description: 'Mobile App Development', quantity: 1, price: 15000000 },
  ]);

  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNumber: 'INV-MSYNC-001',
    invoiceDate: new Date().toISOString().slice(0, 10),
  });

  const [taxRate, setTaxRate] = useState(10);

  // State untuk pilihan mata uang
  const [selectedCurrency, setSelectedCurrency] = useState('IDR'); // Default Rupiah

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), description: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value } : item
      )
    );
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoDataUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoDataUrl('');
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  // Fungsi format mata uang yang menggunakan selectedCurrency
  const formatCurrency = (amount) => {
    let locale = 'en-US';
    let currencySymbol = 'USD';

    switch (selectedCurrency) {
      case 'IDR':
        locale = 'id-ID';
        currencySymbol = 'IDR';
        break;
      case 'USD':
        locale = 'en-US';
        currencySymbol = 'USD';
        break;
      case 'EUR':
        locale = 'de-DE';
        currencySymbol = 'EUR';
        break;
      case 'JPY':
        locale = 'ja-JP';
        currencySymbol = 'JPY';
        break;
      case 'CNY':
        locale = 'zh-CN';
        currencySymbol = 'CNY';
        break;
      case 'SAR': // Saudi Riyal
        locale = 'ar-SA';
        currencySymbol = 'SAR';
        break;
      default:
        locale = 'id-ID';
        currencySymbol = 'IDR';
    }
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currencySymbol }).format(amount);
  };

  // Fungsi untuk mencetak (menggunakan dialog cetak browser)
  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Invoice ${invoiceDetails.invoiceNumber}`;

    const originalDisplay = [];
    const elementsToHide = document.querySelectorAll('.hide-on-print');
    elementsToHide.forEach(el => {
      originalDisplay.push({ el, display: el.style.display });
      el.style.display = 'none';
    });

    window.print();

    elementsToHide.forEach(({ el, display }) => {
      el.style.display = display;
    });
    document.title = originalTitle;
  };

  // Fungsi untuk mengunduh sebagai PDF
  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) {
      console.error("Elemen invoice tidak ditemukan!");
      return;
    }

    const elementsToHide = document.querySelectorAll('.hide-on-print');
    elementsToHide.forEach(el => el.style.display = 'none');

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      useCORS: true,
    });

    elementsToHide.forEach(el => el.style.display = '');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 297;

    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`Invoice_${invoiceDetails.invoiceNumber}.pdf`);
  };

  // SVG Icons for social media
  const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-instagram">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"></line>
    </svg>
  );

  const XIcon = () => ( // Formerly Twitter
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-twitter">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
    </svg>
  );

  const GithubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-github">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 3S18.5 2 12 2 4.09 3 4.09 3a5.07 5.07 0 0 0-.01 1.77A5.44 5.44 0 0 0 2 10.77c0 5.46 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 19.13V22"></path>
    </svg>
  );

  // Kelas CSS untuk tombol gradient biru
  const gradientBlueButtonClasses = "px-6 py-3 font-semibold rounded-lg shadow-lg transition-colors duration-300 flex items-center justify-center " +
                                     "bg-gradient-to-r from-blue-500 to-blue-700 text-white " +
                                     "hover:from-blue-600 hover:to-blue-800 dark:from-blue-700 dark:to-blue-900 dark:hover:from-blue-800 dark:hover:to-blue-950";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-inter transition-colors duration-300 p-4 sm:p-6 md:p-8 flex flex-col">
      {/* Tombol toggle dark mode */}
      <div className="flex justify-end mb-6 hide-on-print">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-full shadow-lg ${gradientBlueButtonClasses}`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25c0 5.385 4.365 9.75 9.75 9.75 2.757 0 5.247-1.131 7.048-2.928Z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12H5.25m-.386-6.364l1.591 1.591M12 2.25c-5.022 0-9 3.978-9 9s3.978 9 9 9 9-3.978 9-9-3.978-9-9-9Z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Conditional Rendering: Tampilkan Form atau Preview */}
      {currentView === 'form' ? (
        // === Tampilan Form Input Invoice ===
        <div className="flex-grow max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Invoice Details</h2>

          {/* Bagian Input Logo - File Upload */}
          <div className="mb-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Company Logo:</h3>
            <div className="mb-3">
              <label htmlFor="logoUpload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload Logo (image, max 1MB):
              </label>
              <input
                type="file"
                id="logoUpload"
                accept="image/*"
                onChange={handleLogoUpload}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
            {logoDataUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo Preview:</p>
                <img
                  src={logoDataUrl}
                  alt="Logo Preview"
                  className="max-h-24 w-auto rounded-md shadow-sm object-contain border border-gray-200 dark:border-gray-600 p-1"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/100x50/cccccc/333333?text=Logo+Error";
                  }}
                />
              </div>
            )}
          </div>

          {/* Bagian Info Pengirim */}
          <div className="mb-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">From:</h3>
            {Object.keys(senderInfo).map((key) => (
              <div key={key} className="mb-3">
                <label htmlFor={`sender-${key}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}:
                </label>
                <input
                  type={key === 'email' || key === 'website' ? 'url' : 'text'}
                  id={`sender-${key}`}
                  value={senderInfo[key]}
                  onChange={(e) => setSenderInfo({ ...senderInfo, [key]: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
            ))}
          </div>

          {/* Bagian Info Penerima */}
          <div className="mb-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">To:</h3>
            {Object.keys(recipientInfo).map((key) => (
              <div key={key} className="mb-3">
                <label htmlFor={`recipient-${key}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}:
                </label>
                <input
                  type={key === 'email' ? 'email' : 'text'}
                  id={`recipient-${key}`}
                  value={recipientInfo[key]}
                  onChange={(e) => setRecipientInfo({ ...recipientInfo, [key]: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
            ))}
          </div>

          {/* Bagian Detail Invoice (Nomor, Tanggal & Mata Uang) */}
          <div className="mb-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Invoice Details:</h3>
            <div className="mb-3">
              <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Invoice Number:
              </label>
              <input
                type="text"
                id="invoiceNumber"
                value={invoiceDetails.invoiceNumber}
                onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceNumber: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Invoice Date:
              </label>
              <input
                type="date"
                id="invoiceDate"
                value={invoiceDetails.invoiceDate}
                onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceDate: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
            {/* Dropdown Mata Uang */}
            <div className="mb-3">
              <label htmlFor="currencySelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Currency:
              </label>
              <select
                id="currencySelect"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                <option value="IDR">Rupiah (IDR)</option>
                <option value="USD">Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="JPY">Yen (JPY)</option>
                <option value="CNY">Yuan (CNY)</option>
                <option value="SAR">Riyal (SAR)</option>
              </select>
            </div>
          </div>

          {/* Bagian Item Invoice */}
          <div className="mb-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Items:</h3>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-600">
                  <div className="col-span-full md:col-span-2">
                    <label htmlFor={`description-${item.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description:
                    </label>
                    <input
                      type="text"
                      id={`description-${item.id}`}
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor={`quantity-${item.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Qty:
                    </label>
                    <input
                      type="number"
                      id={`quantity-${item.id}`}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      min="0"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label htmlFor={`price-${item.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Price:
                    </label>
                    <input
                      type="number"
                      id={`price-${item.id}`}
                      value={item.price}
                      onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                      min="0"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex items-center justify-between col-span-full md:col-span-4 lg:col-span-4 gap-2">
                    <p className="text-gray-700 dark:text-gray-300 font-semibold flex-grow">
                      Total: {formatCurrency(item.quantity * item.price)}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300 shadow-md" // Tetap merah untuk fungsi hapus
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddItem}
              className={`${gradientBlueButtonClasses} px-4 py-2 mt-4`} // Kelas ukuran lebih kecil untuk tombol Add Item
            >
              Add Item
            </button>
          </div>

          <div className="mb-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Tax:</h3>
            <div className="flex items-center gap-2">
              <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tax Rate (%):
              </label>
              <input
                type="number"
                id="taxRate"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                className="mt-1 block w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Payment Details:</h3>
            {Object.keys(paymentInfo).map((key) => (
              <div key={key} className="mb-3">
                <label htmlFor={`payment-${key}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}:
                </label>
                {key === 'notes' ? (
                  <textarea
                    id={`payment-${key}`}
                    value={paymentInfo[key]}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, [key]: e.target.value })}
                    rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  ></textarea>
                ) : (
                  <input
                    type={key === 'dueDate' ? 'date' : 'text'}
                    id={`payment-${key}`}
                    value={paymentInfo[key]}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, [key]: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Tombol Preview Invoice */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setCurrentView('preview')}
              className={gradientBlueButtonClasses}
            >
              Preview Invoice
            </button>
          </div>
        </div>
      ) : (
        // === Tampilan Preview Invoice ===
        // Tambahkan ref ke div ini agar html2canvas bisa menangkapnya
        <div ref={invoiceRef} className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 print-area">
          {/* Logo Perusahaan */}
          {logoDataUrl && (
            <div className="flex justify-center mb-6">
              <img
                src={logoDataUrl}
                alt="Company Logo"
                className="max-h-32 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/150x80/cccccc/333333?text=Logo+Error";
                }}
              />
            </div>
          )}

          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">INVOICE</h1>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                # {invoiceDetails.invoiceNumber}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Date: {new Date(invoiceDetails.invoiceDate).toLocaleDateString('id-ID')}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{senderInfo.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{senderInfo.address}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{senderInfo.city}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{senderInfo.country}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {senderInfo.phone}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email: {senderInfo.email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Web: {senderInfo.website}</p>
            </div>
          </div>

          <div className="mb-8 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">To:</h3>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{recipientInfo.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{recipientInfo.address}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{recipientInfo.city}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{recipientInfo.country}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {recipientInfo.phone}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Email: {recipientInfo.email}</p>
          </div>

          <div className="overflow-x-auto mb-8">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Description</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold">Qty</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold">Unit Price</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{item.description}</td>
                    <td className="px-4 py-2 text-center text-gray-800 dark:text-gray-200">{item.quantity}</td>
                    <td className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-2 text-right text-gray-800 dark:text-gray-200">{formatCurrency(item.quantity * item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-8">
            <div className="w-full sm:w-1/2 lg:w-2/3 xl:w-1/2 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 dark:text-gray-300">Subtotal:</span>
                <span className="text-gray-800 dark:text-gray-200">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 dark:text-gray-300">Tax ({taxRate}%):</span>
                <span className="text-gray-800 dark:text-gray-200">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-300 dark:border-gray-600 pt-2">
                <span className="text-gray-800 dark:text-gray-200">TOTAL:</span>
                <span className="text-blue-600 dark:text-blue-400">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Payment Details:</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Bank: <span className="font-medium text-gray-800 dark:text-gray-200">{paymentInfo.bankName}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Account Name: <span className="font-medium text-gray-800 dark:text-gray-200">{paymentInfo.accountName}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Account Number: <span className="font-medium text-gray-800 dark:text-gray-200">{paymentInfo.accountNumber}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              MSYNC Code: <span className="font-medium text-gray-800 dark:text-gray-200">{paymentInfo.msyncCode}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Due Date: <span className="font-medium text-gray-800 dark:text-gray-200">{new Date(paymentInfo.dueDate).toLocaleDateString('id-ID')}</span>
            </p>
            {paymentInfo.notes && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 italic">
                Notes: {paymentInfo.notes}
              </p>
            )}
            <p className="text-sm text-center mt-6 text-gray-700 dark:text-gray-300">
              Thank you for your business!
            </p>
          </div>

          {/* Tombol Kembali, Cetak, dan Unduh */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 hide-on-print">
            <button
              onClick={() => setCurrentView('form')}
              className={gradientBlueButtonClasses}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 0 1 0 12h-3" />
              </svg>
              Back to Form
            </button>
            <button
              onClick={handlePrint}
              className={gradientBlueButtonClasses}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18H18V10H6v8Zm0-12h12V4H6v2Zm0 0V4H6V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2h2v6H6V6Zm2-2h8V2H8v2Z" />
              </svg>
              Print
            </button>
            <button
              onClick={handleDownloadPdf}
              className={gradientBlueButtonClasses}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              Download (PDF)
            </button>
          </div>
        </div>
      )}
      {/* Footer */}
      <footer className="mt-8 py-6 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-center rounded-lg shadow-inner hide-on-print">
        <p className="mb-4">&copy; {new Date().getFullYear()} Invoice Generator. Made by Matrix Sync.</p>
        <div className="flex justify-center space-x-6">
          <a href="https://instagram.com/msync.matrix" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200" aria-label="Instagram">
            <InstagramIcon />
          </a>
          <a href="https://x.com/msyncq" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200" aria-label="X (Twitter)">
            <XIcon />
          </a>
          <a href="https://github.com/icecoffie" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200" aria-label="GitHub">
            <GithubIcon />
          </a>
        </div>
        <p className="mt-4 text-sm">Visit our website: <a href="https://msync.univer.se" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">msync.univer.se</a></p>
      </footer>
    </div>
  );
}

export default App;
