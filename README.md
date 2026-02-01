# Image Scanner Chrome Extension

Chrome extension để quét toàn bộ ảnh trên trang web hiện tại và hiển thị trong side panel.

## Features

- Quét tất cả ảnh (img tags + background images)
- Hiển thị danh sách ảnh với ag-grid
- Tìm kiếm ảnh theo tên, URL, định dạng
- Tải xuống ảnh trực tiếp
- Giao diện đẹp với Ant Design
- Side panel hiện đại

## Stack

- **React 18** - UI framework
- **Ant Design 5** - UI components
- **ag-grid-react** - Data grid
- **Lodash** - Utility functions
- **Vite + @crxjs/vite-plugin** - Build tool
- **TypeScript** - Type safety

## Installation

### 1. Clone & Install

```bash
cd c:\pv
npm install
```

### 2. Build Extension

```bash
npm run build
```

### 3. Load Extension in Chrome

1. Mở Chrome
2. Vào `chrome://extensions/`
3. Bật "Developer mode"
4. Click "Load unpacked"
5. Chọn folder `dist` từ project

### 4. Dev Mode

```bash
npm run dev
```

## Usage

1. Click icon extension trên toolbar
2. Side panel mở ra bên phải
3. Click "Quét lại" để quét ảnh từ trang hiện tại
4. Sử dụng tìm kiếm để lọc ảnh
5. Click icon tải xuống để tải ảnh

## File Structure

```
src/
├── manifest.json           # Extension manifest
├── background.ts           # Service worker
├── content.ts             # Content script
├── components/
│   ├── SidePanel.tsx      # Main panel component
│   └── SidePanel.css      # Styling
├── pages/
│   ├── sidepanel.html     # HTML entry
│   ├── sidepanel.tsx      # React entry
│   └── index.css          # Global styles
public/
└── images/               # Icons
```

## Development

### Modify Content Script

Edit `src/content.ts` để thay đổi logic quét ảnh:

- Thêm các selector tùy chỉnh
- Filter ảnh theo kích thước
- Thêm xử lý lazy-loading

### Customize UI

Edit `src/components/SidePanel.tsx`:

- Thêm cột ag-grid
- Thay đổi filter logic
- Tùy chỉnh colors/theme

### Add Features

- Export CSV ảnh
- Batch download
- Image preview modal
- Copy URL to clipboard

## Troubleshooting

### Ảnh không xuất hiện

- Kiểm tra console (F12) để xem lỗi
- Ensure content script match pattern là correct
- Reload extension sau khi build

### Side panel không mở

- Refresh trang web
- Reinstall extension
- Kiểm tra manifest permissions

## License

MIT
