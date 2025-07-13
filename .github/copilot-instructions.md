# Ajax - NSE Stock Data Manager

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

Ajax is a modular, dark-themed React-based web application for managing and filtering Indian NSE stock data through CSV upload, persistent local storage, and interactive table filtering.

## Core Technologies

- React with Vite
- PapaParse for CSV parsing
- Lucide React for icons
- Local Storage for data persistence

## Key Requirements

- Dark theme by default
- Mobile-friendly responsive design
- CSV upload with specific column extraction: SYMBOL, LTP, %CHNG, VOLUME (shares)
- Auto-append Date & Time (IST) column on upload
- Maximum 1000 rows per CSV
- Interactive data table with sorting, pagination, and global search
- Multi-criteria filter panel with AND logic
- Persistent local storage until page refresh
- Unique SYMBOL handling for duplicate prevention

## File Structure

- Components in `/src/components/`
- Utilities in `/src/utils/`
- Documentation in `/docs/`
- Dark theme CSS styling throughout
