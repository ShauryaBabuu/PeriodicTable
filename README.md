# Interactive Periodic Table of Elements 🚀

A highly immersive, interactive, 3D Periodic Table of Elements built with premium glassmorphism aesthetics and pure vanilla HTML, CSS, and modern JavaScript (ES Modules).

## ✨ Features

- **Standard Grid Form**: Interactive alignment following standard IUPAC periodic table visual groupings, complete with bridging placeholder markers for the Lanthanide and Actinide series.
- **Advanced 3D/2D Visualizations**: Fully animated transitions between 5 representation structures:
  - **Standard Grid**: Traditional table layout optimized for density and readability.
  - **Circular**: Arranged in concentric chemical orbits grouping by periods.
  - **Spiral**: A Fibonacci spiral staircase winding elements outwards based on atomic number.
  - **Wave**: An undulating 3D sine strand flowing in space.
  - **3D Sphere**: A holographic spherical matrix.
- **Interactive Drag Rotation**: Drag or swipe anywhere inside the 3D visual viewport (Circular, Spiral, Wave, Sphere) to spin and tumble the elements smoothly. Includes an **Auto-Rotate** option for hands-off presentation.
- **Global Search Engine**: Live-filter elements by full name, atomic symbol (case-insensitive), or precise atomic number.
- **Category Filter Deck**: Toggle visual focus on specific elements categorized by family (Alkali Metals, Noble Gases, Lanthanides, etc.) with real-time stats count updates.
- **Thermodynamic & Physical Metadata**: Detailed analytical sidebar profiles featuring discovered-by history, melting, boiling, configuration, density, and state of matter indicators.
- **Active Bohr Atom model**: Interactive vector-drawn animated orbital shell system which displays shell levels of chosen elements and animates electrons revolving dynamically in space.
- **Adaptive Sizing**: Dynamic window resizing calculations scaling the table container so that the periodic grid maintains responsive layout on tablet and mobile viewports.

---

## 📂 Project Structure

```bash
├── index.html        # Main app entry, holds structural stages and glass filters
├── style.css         # Custom animations, responsive scalings, glass theme, and colors
├── script.js         # Mathematical layouts engines, pointer drags, SVG Bohr renderer
├── elements.js       # Complete metadata schema for all 118 elements
├── metadata.json     # App manifest descriptors
├── package.json      # Node scripts and development configurations
└── tsconfig.json     # Typescript structural overrides
```

---

## 🛠️ How to Run the Project

The project is built on top of the ultra-fast development server **Vite**.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development environment:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser to view the application.

3. Build for production:
   ```bash
   npm run build
   ```
   This compiles, bundles, and minifies the assets into the `/dist` directory for static serving.

---

## 🎨 Customization Instructions

### 1. Adding/Modifying Element Properties
The data of all 118 elements is managed in `/elements.js`. Each entry uses the following schema:
```javascript
{
  number: 1,
  symbol: "H",
  name: "Hydrogen",
  mass: 1.008,
  category: "reactive-nonmetal",
  period: 1,
  group: 1,
  state: "gas",
  discovered: "1766",
  config: "1s1",
  melt: 14.01,
  boil: 20.28,
  density: 0.00008988,
  discoverer: "Henry Cavendish"
}
```
You can expand this dataset easily by adding keys like `electronegativity` or `half_life` and mapping them dynamically inside the sidebar template in `script.js`.

### 2. Adjusting Category Color Themes
The CSS color values for each category are represented as standard custom variables in `/style.css`. Adjusting these changes the color branding globally across cards, filters, and orbital models:
```css
:root {
  --cat-reactive-nonmetal: #3bf13b;
  --cat-noble-gas: #c94eff;
  --cat-alkali-metal: #ff3c41;
  ...
}
```

### 3. Adjusting Layout Coordinate Mathematics
The layouts are computed inside `layoutCalculators` in `/script.js`. To alter spacing or shape dimensions, tweak the formulas. For instance, to increase the sphere radius, modify:
```javascript
sphere: (elem, idx) => {
  ...
  const radius = 280; // Increase this value to spread elements out further on the sphere
  ...
}
```

---

## 🛡️ License

This project is licensed under standard open-source parameters. Enjoy learning!
