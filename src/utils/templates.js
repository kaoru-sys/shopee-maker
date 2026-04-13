const STORAGE_KEY = 'shopee_maker_templates';
const MAX_TEMPLATES = 10;

export function loadTemplates() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTemplate(template) {
  const templates = loadTemplates();
  if (templates.length >= MAX_TEMPLATES) {
    return { success: false, message: 'テンプレートは最大10個までです' };
  }
  templates.push({ ...template, createdAt: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  return { success: true };
}

export function deleteTemplate(index) {
  const templates = loadTemplates();
  templates.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  return templates;
}

export const COLOR_PRESETS = [
  { name: '🔴 赤枠', bgColor: '#ffffff', borderColor: '#d23c3c', textColor: '#141414', borderWidth: 8 },
  { name: '🩷 パステルピンク', bgColor: '#fff0f5', borderColor: '#ff69b4', textColor: '#8b0051', borderWidth: 8 },
  { name: '💛 パステルイエロー', bgColor: '#fffde0', borderColor: '#ffc107', textColor: '#6d4c00', borderWidth: 8 },
  { name: '💜 パープル', bgColor: '#f3e5f5', borderColor: '#9c27b0', textColor: '#4a148c', borderWidth: 8 },
  { name: '💙 ブルー', bgColor: '#e3f2fd', borderColor: '#1976d2', textColor: '#0d47a1', borderWidth: 8 },
  { name: '🖤 モノクロ', bgColor: '#f5f5f5', borderColor: '#333333', textColor: '#111111', borderWidth: 6 },
  { name: '🌸 サクラ', bgColor: '#fce4ec', borderColor: '#e91e63', textColor: '#880e4f', borderWidth: 10 },
  { name: '🍀 グリーン', bgColor: '#e8f5e9', borderColor: '#388e3c', textColor: '#1b5e20', borderWidth: 8 },
];
