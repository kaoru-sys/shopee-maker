import { useState, useRef, useEffect } from 'react';
import { COLOR_PRESETS, loadTemplates, saveTemplate, deleteTemplate } from '../utils/templates';

export default function TemplateSettings({ settings, setSettings }) {
  const [open, setOpen] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const bgInputRef = useRef(null);
  const iconInputRef = useRef(null);

  useEffect(() => {
    setSavedTemplates(loadTemplates());
  }, []);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset) => {
    setSettings(prev => ({
      ...prev,
      bgColor: preset.bgColor,
      borderColor: preset.borderColor,
      textColor: preset.textColor,
      borderWidth: preset.borderWidth,
    }));
  };

  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateSetting('backgroundImage', ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateSetting('customIcon', ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveTemplate = () => {
    const name = prompt('テンプレート名を入力してください');
    if (!name) return;

    const template = {
      name,
      bgColor: settings.bgColor,
      borderColor: settings.borderColor,
      textColor: settings.textColor,
      borderWidth: settings.borderWidth,
      showBorder: settings.showBorder,
      backgroundImage: settings.backgroundImage || null,
      customIcon: settings.customIcon || null,
      textPositionX: settings.textPositionX,
      textPositionY: settings.textPositionY,
      fontSize: settings.fontSize,
      textBold: settings.textBold,
      textStroke: settings.textStroke,
    };

    // Check size limits
    if (template.backgroundImage && template.backgroundImage.length > 5 * 1024 * 1024 * 1.37) {
      alert('背景画像は5MB以下にしてください');
      return;
    }
    if (template.customIcon && template.customIcon.length > 1 * 1024 * 1024 * 1.37) {
      alert('アイコン画像は1MB以下にしてください');
      return;
    }

    const result = saveTemplate(template);
    if (!result.success) {
      alert(result.message);
    } else {
      setSavedTemplates(loadTemplates());
      alert('テンプレートを保存しました');
    }
  };

  const handleDeleteTemplate = (index) => {
    if (!confirm('このテンプレートを削除しますか？')) return;
    const updated = deleteTemplate(index);
    setSavedTemplates(updated);
  };

  const handleApplyTemplate = (template) => {
    setSettings(prev => ({
      ...prev,
      bgColor: template.bgColor,
      borderColor: template.borderColor,
      textColor: template.textColor,
      borderWidth: template.borderWidth,
      showBorder: template.showBorder,
      backgroundImage: template.backgroundImage || null,
      customIcon: template.customIcon || null,
      textPositionX: template.textPositionX ?? prev.textPositionX,
      textPositionY: template.textPositionY ?? prev.textPositionY,
      fontSize: template.fontSize ?? prev.fontSize,
      textBold: template.textBold ?? prev.textBold,
      textStroke: template.textStroke ?? prev.textStroke,
    }));
  };

  return (
    <div className="card">
      <button className="btn btn-outline" onClick={() => setOpen(!open)} style={{ width: '100%' }}>
        {open ? '▲' : '▼'} ⚙️ テンプレート設定
      </button>

      {open && (
        <div className="settings-content">
          {/* Color Presets */}
          <div className="setting-section">
            <h4>カラーテーマ</h4>
            <div className="preset-grid">
              {COLOR_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  className="preset-btn"
                  onClick={() => applyPreset(preset)}
                  title={preset.name}
                >
                  <span
                    className="preset-preview"
                    style={{
                      background: preset.bgColor,
                      border: `3px solid ${preset.borderColor}`,
                    }}
                  />
                  <span className="preset-label">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="setting-section">
            <h4>カスタムカラー</h4>
            <div className="color-row">
              <label>背景色</label>
              <input type="color" value={settings.bgColor} onChange={e => updateSetting('bgColor', e.target.value)} />
              <span className="hex-value">{settings.bgColor}</span>
            </div>
            <div className="color-row">
              <label>枠の色</label>
              <input type="color" value={settings.borderColor} onChange={e => updateSetting('borderColor', e.target.value)} />
              <span className="hex-value">{settings.borderColor}</span>
            </div>
            <div className="color-row">
              <label>文字色</label>
              <input type="color" value={settings.textColor} onChange={e => updateSetting('textColor', e.target.value)} />
              <span className="hex-value">{settings.textColor}</span>
            </div>
          </div>

          {/* Border Settings */}
          <div className="setting-section">
            <h4>枠の設定</h4>
            <div className="border-setting">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showBorder}
                  onChange={e => updateSetting('showBorder', e.target.checked)}
                />
                枠を表示
              </label>
            </div>
            <div className="border-setting">
              <label>枠の太さ: {settings.borderWidth}px</label>
              <input
                type="range"
                min="0"
                max="20"
                value={settings.borderWidth}
                onChange={e => updateSetting('borderWidth', Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Background Image */}
          <div className="setting-section">
            <h4>背景画像</h4>
            {settings.backgroundImage ? (
              <>
                <p className="status-text">✅ 背景画像セット済み</p>
                <button className="btn btn-danger btn-small-block" onClick={() => updateSetting('backgroundImage', null)}>
                  ✕ 背景を削除
                </button>
              </>
            ) : (
              <button className="btn btn-outline" onClick={() => bgInputRef.current?.click()}>
                🖼 背景画像をアップ
              </button>
            )}
            <input ref={bgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBgUpload} />
          </div>

          {/* Icon */}
          <div className="setting-section">
            <h4>右下アイコン</h4>
            {settings.customIcon ? (
              <>
                <p className="status-text">✅ カスタムアイコンセット済み</p>
                <button className="btn btn-danger btn-small-block" onClick={() => updateSetting('customIcon', null)}>
                  ✕ デフォルトに戻す
                </button>
              </>
            ) : (
              <button className="btn btn-outline" onClick={() => iconInputRef.current?.click()}>
                🏷 アイコンを変更
              </button>
            )}
            <input ref={iconInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleIconUpload} />
          </div>

          {/* Save Template */}
          <div className="setting-section">
            <button className="btn btn-secondary" onClick={handleSaveTemplate} style={{ width: '100%' }}>
              💾 テンプレを保存
            </button>
          </div>

          {/* Saved Templates */}
          {savedTemplates.length > 0 && (
            <div className="setting-section">
              <h4>📂 保存したテンプレ</h4>
              <div className="saved-templates">
                {savedTemplates.map((t, i) => (
                  <div key={i} className="template-card">
                    <span
                      className="template-preview"
                      style={{
                        background: t.bgColor,
                        border: `3px solid ${t.borderColor}`,
                      }}
                    />
                    <span className="template-name">{t.name}</span>
                    <button className="btn-tiny" onClick={() => handleApplyTemplate(t)}>適用</button>
                    <button className="btn-tiny btn-tiny-danger" onClick={() => handleDeleteTemplate(i)}>🗑</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
