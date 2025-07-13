# Ajax - NSE Stock Data Manager

A modular, dark-themed React web application designed to manage and filter Indian NSE stock data through CSV upload, persistent local storage, and interactive table filtering.

![Ajax Screenshot](https://via.placeholder.com/800x400/0f0f0f/4f94cd?text=Ajax+Stock+Manager)

## 🚀 Features

- **🌙 Dark Theme**: Professional dark UI optimized for extended use
- **📊 CSV Upload**: Drag & drop or click to upload NSE stock data files
- **📈 Interactive Table**: Sorting, pagination, and global search functionality
- **🔍 Advanced Filtering**: Multi-criteria filter panel with AND logic
- **💾 Local Storage**: Persistent data storage until page refresh
- **📱 Responsive Design**: Mobile-friendly interface
- **⚡ Performance**: Optimized for up to 1000 records per upload

## 🛠️ Tech Stack

- **Frontend**: React 18 with Vite
- **CSV Parsing**: PapaParse library
- **Icons**: Lucide React
- **Styling**: Pure CSS with custom dark theme
- **Storage**: Browser Local Storage

## 📋 Required CSV Format

Your CSV file must contain these exact column headers:
- `SYMBOL` - Stock symbol (e.g., RELIANCE, TCS)
- `LTP` - Last Traded Price
- `%CHNG` - Percentage change
- `VOLUME (shares)` - Volume in shares

The application automatically adds:
- `Upload Date & Time` - IST timestamp when data was uploaded

## 🚦 Getting Started

### Prerequisites
- Node.js 16 or higher
- npm or yarn package manager

### Installation

1. **Clone or download the project**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser to:** http://localhost:5173

### Building for Production
```bash
npm run build
npm run preview
```

## 📖 Usage Guide

1. **Upload CSV Data**: 
   - Click "Upload CSV" in the navigation
   - Drag and drop your CSV file or click to browse
   - Ensure your CSV has the required columns

2. **View Stock Data**:
   - Navigate to "Stock Scanner" to view uploaded data
   - Use global search to find specific stocks
   - Click column headers to sort data

3. **Filter Data**:
   - Use the filter panel on the left to refine your view
   - Apply multiple filters (they work with AND logic)
   - See real-time count of filtered results

4. **Data Persistence**:
   - Data is automatically saved to local storage
   - Refresh the page to clear all data
   - New uploads merge with existing data (no duplicates)

## 🎯 Key Features Explained

### Smart Data Handling
- **Duplicate Prevention**: Prevents duplicate SYMBOL entries
- **Data Validation**: Automatically skips invalid rows
- **IST Timestamps**: All upload times in Indian Standard Time
- **Memory Efficient**: Optimized for large datasets

### Advanced Filtering
- **Symbol Search**: Find stocks by symbol
- **Price Range**: Filter by LTP min/max values
- **Change Filters**: Positive/negative/custom percentage ranges
- **Volume Filters**: Above/below threshold filtering
- **Date Range**: Filter by upload date range

### Interactive Table
- **Smart Sorting**: Numeric-aware sorting for financial data
- **Pagination**: 50 records per page for optimal performance
- **Global Search**: Search across all columns
- **Mobile Responsive**: Horizontal scroll on smaller screens

## 📁 Project Structure

```
src/
├── components/
│   ├── Navigation.jsx      # Top navigation bar
│   ├── CSVUpload.jsx      # File upload component
│   ├── StockTable.jsx     # Data table with sorting/pagination
│   └── FilterPanel.jsx    # Multi-criteria filter panel
├── utils/
│   ├── csvParser.js       # CSV parsing and validation
│   ├── localStorage.js    # Local storage management
│   └── dateUtils.js       # IST date/time utilities
├── App.jsx                # Main application component
├── App.css                # Application styles
└── index.css              # Global styles
```

## 🔧 Configuration

### Customizable Limits
- **MAX_ROWS**: 1000 (in `csvParser.js`)
- **ITEMS_PER_PAGE**: 50 (in `StockTable.jsx`)
- **STORAGE_KEY**: 'ajax_stock_data' (in `localStorage.js`)

## 🌐 Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Modern mobile browsers

## 📚 Documentation

Detailed feature documentation available in the `/docs` directory:
- [CSV Upload System](docs/feature-1-csv-upload.md)
- [Stock Data Table](docs/feature-2-stock-table.md)
- [Filter Panel](docs/feature-3-filter-panel.md)
- [Local Storage](docs/feature-4-local-storage.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review the console for error messages
3. Ensure your CSV format matches requirements
4. Verify browser compatibility

---

**Built with ❤️ for Indian Stock Market Analysis**
