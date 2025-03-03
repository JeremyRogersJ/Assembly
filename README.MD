# 3D Engineering Markup Tool

A React-based 3D tool for engineering markup and annotations using React Three Fiber and Vite.

## Features

- 3D model rendering with conditional edge display
- Annotation system with leader lines
- Color themes and customization
- Model exploded view

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/engineering-markup-tool.git
   cd engineering-markup-tool
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Project Structure

```
engineering-markup-tool/
├── public/                  # Static assets
│   ├── models/              # 3D model files
│   └── images/              # Image assets
├── src/
│   ├── components/          # React components
│   │   ├── Scene.jsx        # Main 3D scene
│   │   ├── Models.jsx       # Model management
│   │   ├── Annotations.jsx  # Annotation system
│   │   ├── Controls.jsx     # Camera controls
│   │   └── Helpers.jsx      # Helpers (grid, axes)
│   ├── materials/           # Custom Three.js materials
│   ├── geometries/          # Custom Three.js geometries
│   ├── shaders/             # GLSL shaders
│   ├── hooks/               # React hooks
│   ├── contexts/            # React contexts
│   ├── App.jsx              # Main App component
│   ├── index.jsx            # Entry point
│   └── styles.css           # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Development

### Command Reference

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Adding New Models

Place your 3D model files in the `public/models/` directory, then update the `useModels.js` hook to load and process them.

## License

MIT