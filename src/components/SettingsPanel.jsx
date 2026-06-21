export default function SettingsPanel({ settings, onChange }) {
  return (
    <div className="settings-panel">
      <div className="settings-header">
        <span style={{ fontSize: '1.1rem' }}>⚙️</span>
        <span className="settings-title">Compression Settings</span>
      </div>
      <div className="settings-grid">
        {/* Quality */}
        <div className="setting-group">
          <div className="setting-label">Quality</div>
          <div className="setting-row">
            <input
              id="quality-slider"
              type="range"
              min={0.05}
              max={1}
              step={0.05}
              value={settings.quality}
              onChange={(e) => onChange({ ...settings, quality: parseFloat(e.target.value) })}
            />
            <span className="setting-value">{Math.round(settings.quality * 100)}%</span>
          </div>
        </div>

        {/* Max Width */}
        <div className="setting-group">
          <div className="setting-label">Max Width (px)</div>
          <div className="setting-row">
            <input
              id="max-width-slider"
              type="range"
              min={400}
              max={4000}
              step={100}
              value={settings.maxWidthOrHeight}
              onChange={(e) =>
                onChange({ ...settings, maxWidthOrHeight: parseInt(e.target.value) })
              }
            />
            <span className="setting-value">{settings.maxWidthOrHeight}</span>
          </div>
        </div>

        {/* Max Size */}
        <div className="setting-group">
          <div className="setting-label">Max Size (KB)</div>
          <div className="setting-row">
            <input
              id="max-size-slider"
              type="range"
              min={50}
              max={5000}
              step={50}
              value={settings.maxSizeMB * 1000}
              onChange={(e) =>
                onChange({ ...settings, maxSizeMB: parseInt(e.target.value) / 1000 })
              }
            />
            <span className="setting-value">{Math.round(settings.maxSizeMB * 1000)}</span>
          </div>
        </div>

        {/* Preserve EXIF */}
        <div className="setting-group">
          <div className="setting-label">Preserve EXIF Data</div>
          <div className="toggle-wrapper">
            <label className="toggle" htmlFor="exif-toggle">
              <input
                id="exif-toggle"
                type="checkbox"
                checked={settings.preserveExif}
                onChange={(e) => onChange({ ...settings, preserveExif: e.target.checked })}
              />
              <span className="toggle-slider" />
            </label>
            <span className="toggle-label">
              {settings.preserveExif ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
