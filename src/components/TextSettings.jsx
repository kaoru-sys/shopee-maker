import { useState } from 'react';

const POSITION_PRESETS = [
  { label: '左上', x: 10, y: 8 },
  { label: '中央上', x: 50, y: 8 },
  { label: '右上', x: 90, y: 8 },
  { label: '左中', x: 10, y: 45 },
  { label: '中央', x: 50, y: 45 },
  { label: '右中', x: 90, y: 45 },
  { label: '左下', x: 10, y: 85 },
  { label: '中央下', x: 50, y: 85 },
  { label: '右下', x: 90, y: 85 },
];

// Dot positions within the 36x36 button
const DOT_POSITIONS = [
  { cx: 8, cy: 8 },
  { cx: 18, cy: 8 },
  { cx: 28, cy: 8 },
  { cx: 8, cy: 18 },
  { cx: 18, cy: 18 },
  { cx: 28, cy: 18 },
  { cx: 8, cy: 28 },
  { cx: 18, cy: 28 },
  { cx: 28, cy: 28 },
];

export default function TextSettings({ settings, setSettings }) {
  const [open, setOpen] = useState(false);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const applyPositionPreset = (preset) => {
    setSettings(prev => ({
      ...prev,
      textPositionX: preset.x,
      textPositionY: preset.y,
    }));
  };

  const isPresetActive = (preset) => {
    return settings.textPositionX === preset.x && settings.textPositionY === preset.y;
  };

  return (
    <div className="card">
      <button className="btn btn-outline" onClick={() => setOpen(!open)} style={{ width: '100%' }}>
        {open ? '▲' : '▼'} 📝 テキスト設定
      </button>

      {open && (
        <div className="settings-content">
          {/* Position Presets */}
          <div className="setting-section">
            <h4>配置位置</h4>
            <div className="position-grid">
              {POSITION_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  className={`position-btn ${isPresetActive(preset) ? 'active' : ''}`}
                  onClick={() => applyPositionPreset(preset)}
                  title={preset.label}
                >
                  <svg width="36" height="36" viewBox="0 0 36 36">
                    {DOT_POSITIONS.map((dot, j) => (
                      <circle
                        key={j}
                        cx={dot.cx}
                        cy={dot.cy}
                        r={j === i ? 5 : 2}
                        fill={j === i ? (isPresetActive(preset) ? '#fff' : '#d23c3c') : '#ccc'}
                      />
                    ))}
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Position Sliders */}
          <div className="setting-section">
            <h4>位置の微調整</h4>
            <div className="slider-row">
              <label>X位置: {settings.textPositionX}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.textPositionX}
                onChange={e => updateSetting('textPositionX', Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div className="slider-row">
              <label>Y位置: {settings.textPositionY}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.textPositionY}
                onChange={e => updateSetting('textPositionY', Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Font Size */}
          <div className="setting-section">
            <h4>フォントサイズ</h4>
            <div className="slider-row">
              <label>サイズ: {settings.fontSize}px</label>
              <input
                type="range"
                min="24"
                max="150"
                value={settings.fontSize}
                onChange={e => updateSetting('fontSize', Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Text Style */}
          <div className="setting-section">
            <h4>テキストスタイル</h4>
            <div className="toggle-row">
              <button
                className={`toggle-btn ${settings.textBold ? 'active' : ''}`}
                onClick={() => updateSetting('textBold', !settings.textBold)}
              >
                <strong>B</strong> 太字
              </button>
              <button
                className={`toggle-btn ${settings.textStroke ? 'active' : ''}`}
                onClick={() => updateSetting('textStroke', !settings.textStroke)}
              >
                ◯ 縁取り
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
