import { useState, useRef, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import BackgroundRemover from './components/BackgroundRemover';
import TemplateSettings from './components/TemplateSettings';
import BatchMode from './components/BatchMode';
import { renderCanvas } from './utils/canvasRenderer';
import './App.css';

const DEFAULT_SETTINGS = {
  bgColor: '#ffffff',
  borderColor: '#d23c3c',
  textColor: '#141414',
  borderWidth: 8,
  showBorder: true,
  backgroundImage: null,
  customIcon: null,
};

export default function App() {
  const [mode, setMode] = useState('normal');
  const [title, setTitle] = useState('');
  const [images, setImages] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [generated, setGenerated] = useState(false);
  const canvasRef = useRef(null);

  const handleGenerate = useCallback(async () => {
    if (!canvasRef.current) return;
    await renderCanvas(canvasRef.current, {
      title,
      images,
      ...settings,
    });
    setGenerated(true);
  }, [title, images, settings]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    const safeName = title ? title.replace(/[/\\?%*:|"<>]/g, '_') : 'shopee_image';
    a.download = `shopee_${safeName}.png`;
    a.click();
  };

  const handleReset = () => {
    setTitle('');
    setImages([]);
    setGenerated(false);
    setSettings(DEFAULT_SETTINGS);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🛒 Shopee 出品画像メーカー</h1>
        <p className="subtitle">商品画像をかんたん自動生成</p>
      </header>

      {/* Mode Tabs */}
      <div className="tab-container">
        <button
          className={`tab-btn ${mode === 'normal' ? 'active' : ''}`}
          onClick={() => setMode('normal')}
        >
          通常モード
        </button>
        <button
          className={`tab-btn ${mode === 'batch' ? 'active' : ''}`}
          onClick={() => setMode('batch')}
        >
          一括生成モード
        </button>
      </div>

      {/* Template Settings (shared) */}
      <TemplateSettings settings={settings} setSettings={setSettings} />

      {mode === 'normal' ? (
        <>
          {/* Title Input */}
          <div className="card">
            <h3>✏️ 商品タイトル（英語）</h3>
            <input
              type="text"
              className="title-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例: Demon Slayer Figure"
            />
          </div>

          {/* Image Uploader */}
          <ImageUploader images={images} setImages={setImages} />

          {/* Background Remover */}
          <BackgroundRemover images={images} setImages={setImages} />

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={handleGenerate}>
              🎨 生成
            </button>
            <button className="btn btn-download" onClick={handleDownload} disabled={!generated}>
              📥 保存
            </button>
            <button className="btn btn-reset" onClick={handleReset}>
              🔄 リセット
            </button>
          </div>

          {/* Canvas Preview */}
          <div className="card canvas-card">
            <h3>プレビュー</h3>
            <div className="canvas-wrapper">
              <canvas ref={canvasRef} width={1080} height={1080} />
            </div>
          </div>
        </>
      ) : (
        <BatchMode settings={settings} />
      )}

      <footer className="app-footer">
        <p>Shopee 出品画像メーカー © 2026</p>
      </footer>

      <div style={{
        textAlign: "center",
        padding: "20px",
        marginTop: "24px",
        borderTop: "1px solid #eee"
      }}>
        <img
          src="/Liberta_2.jpg"
          alt="Liberta Japan"
          style={{ height: 40, opacity: 0.7 }}
        />
        <div style={{ fontSize: 11, color: "#bbb", marginTop: 6 }}>
          Powered by Liberta Japan
        </div>
      </div>
    </div>
  );
}
