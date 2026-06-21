function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageCard({ item, onRemove, onDownload, onCompare }) {
  const { id, file, status, previewUrl, compressedBlob, error } = item;

  const originalSize = file.size;
  const compressedSize = compressedBlob ? compressedBlob.size : null;
  const savings =
    compressedSize !== null
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
      : 0;

  const animationDelay = `${(id % 8) * 0.05}s`;

  return (
    <div className="image-card" style={{ animationDelay }}>
      {/* Preview */}
      <div className="card-preview">
        <img src={previewUrl} alt={file.name} loading="lazy" />
        <div className="card-preview-overlay" />
        <button
          className="card-remove-btn"
          onClick={() => onRemove(id)}
          title="Remove image"
          aria-label="Remove image"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="card-body">
        <div className="card-filename" title={file.name}>
          {file.name}
        </div>

        {/* Status */}
        {status === 'pending' && (
          <div className="card-status status-pending">
            <span>⏳</span> Ready to compress
          </div>
        )}
        {status === 'compressing' && (
          <div className="card-status status-compressing">
            <span className="spinner" /> Compressing…
          </div>
        )}
        {status === 'done' && (
          <div className="card-status status-done">
            <span>✅</span> Compressed successfully
          </div>
        )}
        {status === 'error' && (
          <div className="card-status status-error">
            <span>❌</span> {error || 'Compression failed'}
          </div>
        )}

        {/* Sizes */}
        <div className="card-sizes">
          <span className="size-original">{formatBytes(originalSize)}</span>
          {compressedSize !== null && (
            <>
              <span className="size-arrow">→</span>
              <span className="size-compressed">{formatBytes(compressedSize)}</span>
            </>
          )}
        </div>

        {/* Savings Bar */}
        {status === 'done' && compressedSize !== null && (
          <div className="card-savings-bar">
            <div className="savings-bar-track">
              <div className="savings-bar-fill" style={{ width: `${savings}%` }} />
            </div>
            <div className="savings-label">
              <span>Space saved</span>
              <span className="savings-percent">{savings}% smaller</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="card-actions">
          {status === 'done' && (
            <>
              <button
                className="btn btn-success btn-sm"
                onClick={() => onDownload(id)}
                id={`download-btn-${id}`}
              >
                ⬇ Download
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onCompare(id)}
                id={`compare-btn-${id}`}
              >
                👁 Compare
              </button>
            </>
          )}
          {status === 'pending' && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onRemove(id)}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
