import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Users,
  UserX,
} from "lucide-react";

const FileUploadLog = ({ uploadLog }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!uploadLog || uploadLog.length === 0) {
    return null;
  }

  return (
    <div className="file-upload-log">
      <div className="log-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="log-title">
          <FileText size={16} />
          <span>File Upload History ({uploadLog.length} files)</span>
        </div>
        <div className="log-toggle">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {isExpanded && (
        <div className="log-content">
          {uploadLog.map((entry) => (
            <div key={entry.id} className="log-entry">
              <div className="log-entry-header">
                <div className="file-name">
                  <FileText size={14} />
                  <span>{entry.fileName}</span>
                </div>
                <div className="upload-time">
                  <Clock size={12} />
                  <span>{entry.timestamp}</span>
                </div>
              </div>
              <div className="log-entry-stats">
                <div className="stat-item success">
                  <Users size={12} />
                  <span>{entry.addedCount} added</span>
                </div>
                {entry.skippedCount > 0 && (
                  <div className="stat-item warning">
                    <UserX size={12} />
                    <span>{entry.skippedCount} skipped</span>
                  </div>
                )}
                <div className="stat-item info">
                  <span>Total: {entry.totalStocks}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadLog;
