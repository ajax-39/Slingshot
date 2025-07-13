# Ajax - NSE Stock Data Manager

## Project Overview
Ajax is a modern, dark-themed React web application designed to manage and filter Indian NSE stock data through CSV upload functionality, persistent local storage, and interactive table filtering.

## Features
- 🌙 **Dark Theme**: Professional dark UI optimized for extended use
- 📊 **CSV Upload**: Drag & drop or click to upload NSE stock data files
- 📈 **Data Table**: Interactive table with sorting, pagination, and global search
- 🔍 **Advanced Filtering**: Multi-criteria filter panel with AND logic
- 💾 **Local Storage**: Persistent data storage until page refresh
- 📱 **Responsive Design**: Mobile-friendly interface
- ⚡ **Performance**: Optimized for up to 1000 records per upload

## Tech Stack
- **Frontend**: React 18 with Vite
- **CSV Parsing**: PapaParse library
- **Icons**: Lucide React
- **Styling**: Pure CSS with dark theme
- **Storage**: Browser Local Storage

## Required CSV Columns
The application expects CSV files with the following columns:
- `SYMBOL` - Stock symbol
- `LTP` - Last Traded Price
- `%CHNG` - Percentage change
- `VOLUME (shares)` - Volume in shares

## Auto-Generated Columns
- `Upload Date & Time` - IST timestamp when data was uploaded

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open http://localhost:5173

### Usage
1. **Upload Data**: Click "Upload CSV" and select your NSE data file
2. **View Data**: Navigate to "Stock Scanner" to view uploaded data
3. **Filter Data**: Use the filter panel to refine your view
4. **Search**: Use the global search to find specific stocks
5. **Sort**: Click column headers to sort data

## Data Management
- Maximum 1000 rows per CSV upload
- Duplicate symbols are automatically filtered out
- Data persists in local storage until page refresh
- Invalid rows are automatically skipped with console warnings

## Browser Support
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

## License
MIT License
