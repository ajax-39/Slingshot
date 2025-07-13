import { X } from 'lucide-react'

const FilterPanel = ({ filters, setFilters, totalRecords, filteredRecords }) => {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      symbol: '',
      ltpMin: '',
      ltpMax: '',
      changeType: 'all',
      changeMin: '',
      changeMax: '',
      volumeType: 'all',
      volumeThreshold: '',
      dateFrom: '',
      dateTo: ''
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'all'
  )

  return (
    <div className="filter-panel">
      <div className="filter-section">
        <div className="filter-summary">
          <p className="filter-summary-title">RECORDS</p>
          <p className="filter-summary-text">
            {filteredRecords} of {totalRecords}
          </p>
        </div>
      </div>

      <div className="filter-section">
        <h3>Symbol</h3>
        <input
          type="text"
          placeholder="Search by symbol..."
          value={filters.symbol}
          onChange={(e) => handleFilterChange('symbol', e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="filter-section">
        <h3>LTP Range</h3>
        <div className="filter-range">
          <input
            type="number"
            placeholder="Min"
            value={filters.ltpMin}
            onChange={(e) => handleFilterChange('ltpMin', e.target.value)}
            className="filter-input"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.ltpMax}
            onChange={(e) => handleFilterChange('ltpMax', e.target.value)}
            className="filter-input"
          />
        </div>
      </div>

      <div className="filter-section">
        <h3>% Change</h3>
        <select
          value={filters.changeType}
          onChange={(e) => handleFilterChange('changeType', e.target.value)}
          className="filter-select"
        >
          <option value="all">All</option>
          <option value="positive">Positive (+)</option>
          <option value="negative">Negative (-)</option>
          <option value="custom">Custom Range</option>
        </select>
        
        {filters.changeType === 'custom' && (
          <div className="filter-range" style={{ marginTop: '8px' }}>
            <input
              type="number"
              step="0.01"
              placeholder="Min %"
              value={filters.changeMin}
              onChange={(e) => handleFilterChange('changeMin', e.target.value)}
              className="filter-input"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Max %"
              value={filters.changeMax}
              onChange={(e) => handleFilterChange('changeMax', e.target.value)}
              className="filter-input"
            />
          </div>
        )}
      </div>

      <div className="filter-section">
        <h3>Volume</h3>
        <select
          value={filters.volumeType}
          onChange={(e) => handleFilterChange('volumeType', e.target.value)}
          className="filter-select"
        >
          <option value="all">All</option>
          <option value="above">Above Threshold</option>
          <option value="below">Below Threshold</option>
        </select>
        
        {(filters.volumeType === 'above' || filters.volumeType === 'below') && (
          <input
            type="number"
            placeholder="Volume threshold"
            value={filters.volumeThreshold}
            onChange={(e) => handleFilterChange('volumeThreshold', e.target.value)}
            className="filter-input"
            style={{ marginTop: '8px' }}
          />
        )}
      </div>

      <div className="filter-section">
        <h3>Upload Date</h3>
        <div className="filter-range">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="filter-input"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="filter-input"
          />
        </div>
        <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
          From - To dates
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="clear-filters-button"
        >
          <X size={16} style={{ marginRight: '6px' }} />
          Clear All Filters
        </button>
      )}
    </div>
  )
}

export default FilterPanel
