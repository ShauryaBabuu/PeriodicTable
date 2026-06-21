import { elements } from './elements.js';

// Global State
let currentLayout = 'standard';
let autoRotateActive = false;
let rotationX = -10;
let rotationY = 0;
let currentX = -10;
let currentY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
let animationSpeed = 1.0; // seconds
let activeCategoryFilter = 'all';
let activeBlockFilter = 'all';
let activeSearchQuery = '';
let activeSelectedElement = null;

// DOM Elements
const viewportStage = document.getElementById('viewport-stage');
const tableContainer = document.getElementById('table-container');
const layoutButtons = document.querySelectorAll('.btn-layout');
const searchInput = document.getElementById('search-input');
const searchClear = document.getElementById('search-clear');
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
const btnAutoRotate = document.getElementById('btn-auto-rotate');
const btnReset = document.getElementById('btn-reset');
const categoryFilterGroup = document.getElementById('category-filter-group');
const blockFilterGroup = document.getElementById('block-filter-group');
const statActive = document.getElementById('stat-active');
const dragStatus = document.getElementById('drag-status');
const statusVisibleCount = document.getElementById('status-visible-count');

// Sidebar DOM Elements
const detailSidebar = document.getElementById('detail-sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar');
const sidebarEmpty = document.getElementById('sidebar-empty');
const sidebarContent = document.getElementById('sidebar-content');
const sidebarBadge = document.getElementById('sidebar-badge');
const sidebarNum = document.getElementById('sidebar-num');
const sidebarSym = document.getElementById('sidebar-sym');
const sidebarMass = document.getElementById('sidebar-mass');
const sidebarName = document.getElementById('sidebar-name');
const sidebarCategory = document.getElementById('sidebar-category');
const sidebarState = document.getElementById('sidebar-state');
const sidebarConfig = document.getElementById('sidebar-config');
const sidebarMelt = document.getElementById('sidebar-melt');
const sidebarBoil = document.getElementById('sidebar-boil');
const sidebarDensity = document.getElementById('sidebar-density');
const sidebarDiscovered = document.getElementById('sidebar-discovered');
const sidebarHistoryDesc = document.getElementById('sidebar-history-desc');
const bohrSvg = document.getElementById('bohr-svg');
const bohrShellText = document.getElementById('bohr-shell-text');

// New Core Specs Elements
const sidebarNumVal = document.getElementById('sidebar-num-val');
const sidebarMassVal = document.getElementById('sidebar-mass-val');
const sidebarValency = document.getElementById('sidebar-valency');
const sidebarUses = document.getElementById('sidebar-uses');

// Init application
function init() {
  generateElementCards();
  applyLayout(currentLayout);
  setupEvents();
  setupDragRotation();
  startRenderLoop();
  handleResize();

  // Custom indian/bilingual and AI Bonding submodules
  setupGlobalTabs();
  setupBilingualSpeech();
  setupAIChatbot();
  setupBondingSimulator();
}

// Generate all 118 Element Cards in the DOM
function generateElementCards() {
  elements.forEach((element, index) => {
    const card = document.createElement('div');
    card.className = `element-card ${element.category}`;
    card.id = `element-${element.number}`;
    card.dataset.number = element.number;
    card.dataset.symbol = element.symbol.toLowerCase();
    card.dataset.name = element.name.toLowerCase();
    card.dataset.category = element.category;

    card.innerHTML = `
      <div class="element-num">${element.number}</div>
      <div class="element-sym">${element.symbol}</div>
      <div class="element-name">${element.name}</div>
      <div class="element-mass">${element.mass}</div>
    `;

    // Click handler
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      selectElement(element);
    });

    tableContainer.appendChild(card);
  });
}

// Layout coordinate calculators
const layoutCalculators = {
  standard: (elem, idx) => {
    let row, col;

    // Direct assignment matching standard system
    if (elem.number >= 57 && elem.number <= 71) {
      // Lanthanides
      row = 9;
      col = (elem.number - 57) + 4;
    } else if (elem.number >= 89 && elem.number <= 103) {
      // Actinides
      row = 10;
      col = (elem.number - 89) + 4;
    } else {
      row = elem.period;
      col = elem.group;
    }

    // Standard width of cell is 62px, height 72px, gap 5px.
    // cellWidth + gap = 67px. cellHeight + gap = 77px.
    const gapX = 67;
    const gapY = 77;
    const left = (col - 1) * gapX;
    const top = (row - 1) * gapY;

    // Shift coordinates slightly to center beautifully in the 1188px container
    return {
      x: left,
      y: top,
      z: 0,
      rx: 0,
      ry: 0,
      rz: 0,
      hidden: false
    };
  },

  circular: (elem, idx) => {
    // Concentric rings arranged by period
    const radius = elem.period * 48 + 70;
    
    // Distribute angles based on chemical groups
    let theta;
    if (elem.number >= 57 && elem.number <= 71) {
      // Lanthanides distributed in third group sector
      const offset = (elem.number - 57) / 15;
      theta = ((3 + offset) / 19) * 2 * Math.PI;
    } else if (elem.number >= 89 && elem.number <= 103) {
      // Actinides distributed in third group sector
      const offset = (elem.number - 89) / 15;
      theta = ((3.2 + offset) / 19) * 2 * Math.PI;
    } else {
      theta = (elem.group / 18.5) * 2 * Math.PI;
    }

    // Center offset coordinates
    const x = radius * Math.cos(theta) + 594 - 31; // center offset
    const y = radius * Math.sin(theta) + 380 - 36;
    
    // Angles for elements to face outwards like a circular crest
    const angleRad = theta + Math.PI / 2;
    const ry = (angleRad * 180) / Math.PI;

    return {
      x,
      y,
      z: 0,
      rx: 0,
      ry: ry,
      rz: 0,
      hidden: false
    };
  },

  spiral: (elem, idx) => {
    // Archimedian Spiral winding outwards
    const theta = idx * 0.17;
    const radius = Math.sqrt(idx) * 36 + 25;
    
    // Coordinates
    const x = radius * Math.cos(theta) + 594 - 31;
    const y = radius * Math.sin(theta) + 380 - 36;
    
    const angleRad = theta + Math.PI / 2;
    const ry = (angleRad * 180) / Math.PI;

    return {
      x,
      y,
      z: 0,
      rx: 0,
      ry: ry,
      rz: 0,
      hidden: false
    };
  },

  wave: (elem, idx) => {
    // Wavy ribbon stretching left to right
    const horizontalSpread = 10;
    const x = (idx - 59) * horizontalSpread + 594 - 31;
    
    // Nice sinusoidal double undulations
    const y = Math.sin(idx * 0.18) * 160 + 380 - 36;
    
    // 3D Depth rotation
    const z = Math.cos(idx * 0.18) * 160;
    
    // Twist angles
    const ry = (idx * 10) % 360;

    return {
      x,
      y,
      z,
      rx: 0,
      ry,
      rz: 0,
      hidden: false
    };
  },

  sphere: (elem, idx) => {
    // Golden spiral / Fibonacci sphere distribution
    const maxN = 118;
    const phi = Math.acos(-1 + (2 * idx) / (maxN - 1));
    const theta = Math.sqrt(maxN * Math.PI) * phi;
    
    const radius = 280;
    const sx = radius * Math.sin(phi) * Math.cos(theta) + 594 - 31;
    const sy = radius * Math.sin(phi) * Math.sin(theta) + 380 - 36;
    const sz = radius * Math.cos(phi);
    
    // Outer facing rotation angles
    const ry = (theta * 180) / Math.PI;
    const rx = ((phi - Math.PI / 2) * 180) / Math.PI;

    return {
      x: sx,
      y: sy,
      z: sz,
      rx,
      ry,
      rz: 0,
      hidden: false
    };
  }
};

// Render layouts changes and trigger CSS transitions
function applyLayout(layoutType) {
  currentLayout = layoutType;
  statActive.textContent = layoutType.charAt(0).toUpperCase() + layoutType.slice(1);

  // Toggle placeholder cards (only visible in standard layout)
  const lPlaceholder = document.getElementById('lanthanide-placeholder');
  const aPlaceholder = document.getElementById('actinide-placeholder');
  const placeholders = document.querySelectorAll('.placeholder-card');
  placeholders.forEach(p => {
    if (layoutType === 'standard') {
      p.style.opacity = '1';
      p.style.pointerEvents = 'auto';
      p.style.transform = 'translate3d(134px, 385px, 0px)'; // custom manual position for 57-71 placeholder
      if (p.id === 'actinide-placeholder') {
        p.style.transform = 'translate3d(134px, 462px, 0px)'; // 89-103 placeholder position
      }
    } else {
      p.style.opacity = '0';
      p.style.pointerEvents = 'none';
      p.style.transform = 'translate3d(594px, 380px, -1000px) scale(0.1)';
    }
  });

  // Automatically reset orientation standard layout
  if (layoutType === 'standard' || layoutType === 'wave') {
    rotationX = -10;
    rotationY = 0;
  } else if (layoutType === 'sphere') {
    rotationX = 15;
    rotationY = 30;
  }

  // Update elements position
  elements.forEach((element, idx) => {
    const card = document.getElementById(`element-${element.number}`);
    if (!card) return;

    const coords = layoutCalculators[layoutType](element, idx);
    
    // Custom variables for hover preserve positions
    card.style.setProperty('--x', `${coords.x}px`);
    card.style.setProperty('--y', `${coords.y}px`);

    // Transform string injection
    card.style.transform = `translate3d(${coords.x}px, ${coords.y}px, ${coords.z}px) rotateX(${coords.rx}deg) rotateY(${coords.ry}deg) rotateZ(${coords.rz}deg)`;
    
    // Set z-index dynamically based on physical 3D depth!
    // Elements facing frontend (z > 0) have higher z-indexing
    const depthZ = Math.round(coords.z + 500);
    card.style.zIndex = depthZ;
  });

  // Sync animation speeds
  document.documentElement.style.setProperty('--transition-speed', `${animationSpeed}s`);
}

// Comprehensive dictionary of common element uses in English and Hindi
const elementUses = {
  1: "Rocket fuel, ammonia production, hydrogenation of oils / रॉकेट ईंधन, अमोनिया औद्योगिक उत्पादन, वनस्पति घी निर्माण",
  2: "Balloons, cooling superconducting magnets, deep-sea diving / गुब्बारे, क्रायोजेनिक्स कूलिंग, गहरे समुद्र में गोताखोरी गैस",
  3: "Rechargeable batteries, ceramic and glass strengthener, mental health medicine / रिचार्जेबल बैटरी, सिरेमिक और कांच मजबूती, औषधियां",
  4: "Aerospace parts, X-ray tubes, non-sparking copper alloys / एयरोस्पेस मोटर्स और पुर्जे, एक्स-ρε खिड़की, तांबे के उपकरण",
  5: "Borosilicate glass, fiberglass insulation, flares and pyrotechnics / बोरोसिलिकेट कांच, शीशा संवर्धन, कृषि उर्वरक, आतिशबाजी",
  6: "Steel manufacturing, organic chemistry molecules, diamonds & graphite / स्टील और लोहे के साथ मिश्र धातु, जैविक यौगिक, हीरा और ग्रेफाइट",
  7: "Liquid nitrogen cooling, food packaging preservation, chemical fertilizers / लिक्विड नाइट्रोजन फ्रीजिंग, भोजन का भंडारण, यूरिया खाद",
  8: "Respiration systems, rocket industrial propellant, steel production melting / श्वसन और फेफड़ों के लिए ऑक्सीजन, औद्योगिक भट्टियां, रॉकेट ईंधन",
  9: "Fluoridated toothpaste, Teflon polymer manufacturing, nuclear fuel processing / टूथपेस्ट में फ्लोराइड, टेफ्लॉन नॉन-स्टिक कोटिंग, परमाणु ईंधन",
  10: "Neon advertising signages, high-voltage indicators, visual laser tubes / नियॉन विज्ञापन लाइट, वोल्टेज इंडिकेटर, विशिष्ट अनुसंधान लेजर",
  11: "Table salt, sodium vapor street lamps, heat transfer in fast reactors / साधारण नमक (NaCl), औद्योगिक रसायन, पीले रोड लाइट लैंप",
  12: "Lightweight alloy (laptops & cars), fireworks flares, medical antacids / लैपटॉप और कारों के हल्के फ्रेम, आतिशबाजी का सफेद प्रकाश, एंटासिड दवा",
  13: "Aircraft fuselages, soda beverage cans, foil wraps, construction work / हवाई जहाज के पंख और बॉडी, पन्नी, विद्युत केबल, पेय पदार्थों के कैन",
  14: "Semiconductor microchips, building glass and cement, silicone polymers / कंप्यूटर माइक्रोचिप, कांच और सीमेंट उद्योग, सौर सेल",
  15: "Agriculture fertilizers, safety matchboxes, steel production alloys / कृषि उर्वरक (एनपीके), माचिस की तीली का सिरा, आतिशबाजी संसाधन",
  16: "Sulfuric acid production, vulcanization of rubber tires, battery acid / सल्फ्यूरिक एसिड, प्राकृतिक रबर की मजबूती (वल्कनीकरण), उर्वरक",
  17: "Drinking water purification, PVC plastics manufacturing, bleach disinfectants / पीने के पानी का शोधन, पीवीसी पाइप और प्लास्टिक, कीटाणुनाशक",
  18: "Fluorescent lighting bulbs, double-pane window isolation, welding shields / चमकीली लाइटें, विलायक, टाइटेनियम उत्पादन में अक्रिय वातावरण",
  19: "Crop fertilizers development, potassium medical soap, premium glass / पौधे के उर्वरक, साबुन निर्माण, विद्युत बैटरी, भोजन में पोटेशियम लवण",
  20: "Cement, plaster of Paris, calcium carbonate supplements / सीमेंट और कंक्रीट, प्लास्टर ऑफ पेरिस, हड्डियों की मजबूत दवाइयां",
  21: "Aerospace metal parts, stadium high-intensity lighting, golf equipment / हॉकी स्टिक और खेल उपकरण, उच्च क्षमता प्रकाश लैंप, एयरोस्पेस एलॉय",
  22: "Aircraft turbine blades, medical joint implants, durable bicycle frames / जेट इंजन टरबाइन ब्लेड, कृत्रिम हड्डियां, बेहद मजबूत साइकिल फ्रेम",
  23: "Industrial tools, superconducting magnets, vanadium redox battery / विशेष स्टील टूल्स, सुपरकंडक्टिंग चुंबक, अत्याधुनिक विद्युत बैटरी",
  24: "Stainless steel (chrome plating), pigments, visual emerald green glasses / जंगरोधी पेंट, वाहनों पर चमकीली क्रोम प्लेटिंग, हरा कांच",
  25: "Railway track steels, alkaline electric batteries, aluminum alloy enhancer / रेल की पटरियां, टिकाऊ बैटरी, एल्युमिनियम मिश्र धातुओं की मजबूती",
  26: "Structural building steel, home magnets, blood cell hemoglobin element / इमारतें, भारी मशीनें, पुल, विद्युत चुंबक, रक्त में हीमोग्लोबिन",
  27: "Samarium-cobalt magnets, jet engines, blue paints & cobalt glass / अत्यधिक चुंबकीय सामर्थ्य वाले चुंबक, जेट टरबाइन, चमकीला नीला रंग",
  28: "Stainless steel kitchenwares, electric guitar strings, coin plating / स्टेनलेस स्टील के बर्तन, रिचार्जेबल कैडमियम बैटरी, सिक्का निर्माण, विद्युत सुरक्षा",
  29: "Electrical copper wiring, home plumbing pipes, cookwares, brass & bronze / बिजली के तार, घरेलू पानी की लाइन, तांबे की मूर्तियां, पीतल और कांसा",
  30: "Anti-rust steel galvanization, die-cast alloys, sun protection oxide / लोहे को सड़ने से बचाने के लिए कोटिंग (गैल्वनाइजेशन), जस्ते की परत",
  47: "Conductive solar panels, jewelry, premium mirrors, photography science / सोलर पैनल के तार, चांदी के आभूषण, विशिष्ट दर्पण, फोटोग्राफी",
  50: "Solder wires for circuit boards, food storage tin-cans plating / इलेक्ट्रॉनिक सोल्डर तार, खाद्य डिब्बाबंदी में सुरक्षात्मक कोटीन",
  74: "Light bulb filaments, military armor weaponry, industrial drill bits / पारंपरिक बल्ब का फिलामेंट, वेल्डिंग इलेक्ट्रोड, भारी ड्रिल मशीन",
  78: "Catalytic converters, gold jewelry, laboratory crucibles, cure therapy / वाहनों के साइलेंसर, कीमती आभूषण, कैंसर रोधी दवा रासायनिक यौगिक",
  79: "Financial reserve backing, high-end microchips, elite wedding jewelry / धन सुरक्षा रिजर्व, मोबाइल प्रोसेसर कांटेक्ट, सोने के आभूषण",
  80: "Scientific thermometers, mercury barometers, fluorescent mercury lights / थर्मामीटर उपकरण, वायुदाबमापक, पारा लाइट्स, दांतों की फिलिंग",
  82: "Car lead-acid batteries, medical radiation shield, weights / कारों की बैटरी, एक्स-रे विकिरण सुरक्षा कवच, मछली पकड़ने के सिंकर",
  92: "Nuclear reactor fuel rods, Navy ships nuclear power plants / परमाणु ऊर्जा केंद्र का बिजली ईंधन, बड़े जहाज संचालन, पुराने हथियार"
};

// Return standard uses for each element based on custom DB or group category fallback
function getElementUses(element) {
  if (elementUses[element.number]) {
    return elementUses[element.number];
  }
  
  const lookup = {
    "alkali-metal": "Battery research, chemical synthesis catalyst / बैटरी अनुसंधान, रासायनिक संश्लेषण उत्प्रेरक",
    "alkaline-earth-metal": "Light alloys manufacturing, pyrotechnics coloring / मिश्र धातु निर्माण, आतिशबाजी रंग संवर्धन",
    "transition-metal": "Industrial catalyst, machinery alloys, structural tools / औद्योगिक उत्प्रेरक, मशीनरी एलॉय, कठोर और टिकाऊ उपकरण",
    "lanthanide": "Supermagnets, laser crystal optics, advanced electronics / शक्तिशाली चुंबक, लेजर ग्लास, अत्याधुनिक इलेक्ट्रॉनिक्स",
    "actinide": "Scientific research, nuclear medicine science, thermoelectric generators / परमाणु अनुसंधान, रेडियो-थेरेपी कैंसर इलाज, ऊर्जा",
    "post-transition-metal": "Solder, alloys plating, semiconductors, flat-screen coatings / इलेक्ट्रॉनिक सोल्डर, सेमीकंडक्टर धातु, कोटिंग",
    "metalloid": "Microelectronics, semiconductor doping, optical lenses / कंप्यूटर इलेक्ट्रॉनिक्स, सौर सेल, ट्रांजिस्टर",
    "reactive-nonmetal": "Chemical compounds synthesis, biological life support / जैविक जीवन अणु निर्माण, रासायनिक यौगिक क्रियाएं",
    "noble-gas": "Specialized inert lighting, cooling gas, laser tools / अक्रिय वातावरण विकास, लेजर टूल्स, नियॉन लाइट्स",
    "unknown": "Advanced laboratories nucleosynthesis scientific research / प्रयोगशाला अनुसंधान, नवीन परमाणु भौतिकी एवं अध्ययन"
  };
  return lookup[element.category] || "Scientific research and experimental industries / वैज्ञानिक अनुसंधान और प्रयोगात्मक उद्योग";
}

// Calculate the element's chemistry valency (संयोजकता)
function getValency(element) {
  const num = element.number;
  const group = element.group;
  const category = element.category;

  // Noble gases are inert
  if (category === 'noble-gas') {
    return '0 (Inert / निष्क्रिय)';
  }

  // Groups 1 & 2
  if (group === 1) {
    return num === 1 ? '1' : '1 (Monovalent / एकसंयोजी)';
  }
  if (group === 2) {
    return '2 (Divalent / द्विसंयोजी)';
  }
  
  // Boron family (Group 13)
  if (group === 13) {
    return '3 (Trivalent / त्रिसंयोजी)';
  }
  // Carbon family (Group 14)
  if (group === 14) {
    return '4 (Tetravalent / चतुर्थसंयोजी)';
  }
  // Nitrogen family (Group 15)
  if (group === 15) {
    return '3, 5 (Penta / Tri)';
  }
  // Oxygen family (Group 16)
  if (group === 16) {
    return '2 (Divalent / द्विसंयोजी)';
  }
  // Halogen family (Group 17)
  if (group === 17) {
    return '1 (Monovalent / एकसंयोजी)';
  }

  // Heavy transition/rare metals have variable oxidation states
  if (category === 'transition-metal' || category === 'lanthanide' || category === 'actinide') {
    if (num === 26) return '2, 3 (Variable / परिवर्तनशील)'; // Iron
    if (num === 29) return '1, 2 (Variable / परिवर्तनशील)'; // Copper
    if (num === 30) return '2 (Fixed)'; // Zinc
    if (num === 47) return '1 (Fixed)'; // Silver
    if (num === 79) return '1, 3 (Variable / परिवर्तनशील)'; // Gold
    return 'Variable (परिवर्तनशील)';
  }

  // Generic shell-valence calculations
  const shells = [];
  let remaining = num;
  const maxCapacities = [2, 8, 18, 32, 32, 18, 8];
  for (let i = 0; i < maxCapacities.length; i++) {
    if (remaining <= 0) break;
    const taken = Math.min(remaining, maxCapacities[i]);
    shells.push(taken);
    remaining -= taken;
  }
  const outerSec = shells[shells.length - 1] || 0;
  if (outerSec <= 4) {
    return `${outerSec}`;
  } else {
    return `${8 - outerSec}`;
  }
}

// Select element and display full analytical description
function selectElement(element) {
  activeSelectedElement = element;

  // Visual highlights on card list
  document.querySelectorAll('.element-card').forEach(c => {
    c.classList.remove('active-selection');
  });
  const card = document.getElementById(`element-${element.number}`);
  if (card) {
    card.classList.add('active-selection');
  }

  // Transition UI details panel
  detailSidebar.classList.add('open');
  sidebarEmpty.classList.add('hidden');
  sidebarContent.classList.remove('hidden');

  // Load physical metadata
  sidebarBadge.className = `element-badge-large ${element.category}`;
  sidebarBadge.style.setProperty('--theme-color', `var(--cat-${element.category})`);
  sidebarNum.textContent = element.number;
  sidebarSym.textContent = element.symbol;
  sidebarMass.textContent = element.mass;
  sidebarName.textContent = element.name;

  // Set Devanagari name & support references
  const sidebarHindiName = document.getElementById('sidebar-name-hindi');
  if (sidebarHindiName) {
    sidebarHindiName.textContent = getHindiName(element.symbol, element.name);
  }

  // Update AI Chatbox reference & initial greet bubble
  const aiElementRef = document.getElementById('ai-element-ref');
  if (aiElementRef) aiElementRef.textContent = element.name;
  const aiMessages = document.getElementById('ai-messages');
  if (aiMessages) {
    const elHindi = getHindiName(element.symbol, element.name);
    aiMessages.innerHTML = `
      <div class="ai-msg bot" style="background: rgba(129, 140, 248, 0.1); padding: 0.4rem 0.5rem; border-radius: 4px; border-left: 2px solid #818cf8;">
        पूछें मुझसे <strong>${element.name} (${elHindi})</strong> के बारे में! Ask me anything about this element.
      </div>
    `;
  }

  // Populate new bilingual atomic specs fields
  if (sidebarNumVal) sidebarNumVal.textContent = element.number;
  if (sidebarMassVal) sidebarMassVal.textContent = `${element.mass} u`;
  if (sidebarValency) sidebarValency.textContent = getValency(element);
  if (sidebarUses) sidebarUses.textContent = getElementUses(element);

  // Parse state text
  const stateLabels = {
    solid: '&#x2744; Solid',
    liquid: '&#x1F4A7; Liquid',
    gas: '&#x1F4A8; Gas',
    synthetic: '&#x2697; Synthetic'
  };
  const stateIcon = stateLabels[element.state] || '&#x269B; Unknown';
  sidebarState.innerHTML = stateIcon;

  // Clean format category label
  const formattedCat = element.category.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
  sidebarCategory.textContent = formattedCat;
  sidebarCategory.style.borderColor = `var(--cat-${element.category})`;
  sidebarCategory.style.color = `var(--cat-${element.category})`;

  sidebarConfig.textContent = element.config;
  sidebarMelt.textContent = element.melt === 'N/A' ? 'N/A' : `${element.melt} K`;
  sidebarBoil.textContent = element.boil === 'N/A' ? 'N/A' : `${element.boil} K`;
  sidebarDensity.textContent = typeof element.density === 'number' ? `${element.density} g/cm³` : 'N/A';
  sidebarDiscovered.textContent = element.discovered;

  // Set narrative BIO
  const historyText = `Discovered in <strong>${element.discovered}</strong> by <strong>${element.discoverer || 'Unknown'}</strong>. ${element.name} is a chemical element classified as a <strong>${formattedCat}</strong>. It resides in <strong>Period ${element.period}</strong> and <strong>Group ${element.group || 'N/A'}</strong> of the periodic table, representing an atomic mass of <strong>${element.mass}</strong>.`;
  sidebarHistoryDesc.innerHTML = historyText;

  // Render 3D animated Bohr Orbit simulation
  renderBohrModel(element);
}

// Dynamic Bohr atomic visualization SVG engine
function renderBohrModel(element) {
  bohrSvg.innerHTML = '';
  
  // Calculate shell counts
  const atomicNum = element.number;
  const shells = [];
  let remaining = atomicNum;
  const maxCapacities = [2, 8, 18, 32, 32, 18, 8];

  for (let i = 0; i < maxCapacities.length; i++) {
    if (remaining <= 0) break;
    const taken = Math.min(remaining, maxCapacities[i]);
    shells.push(taken);
    remaining -= taken;
  }

  bohrShellText.textContent = `Shells: [${shells.join(', ')}]`;

  // Draw Nucleus
  const center = 100;
  const nucleusRadius = 15;
  const nucleus = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  nucleus.setAttribute('cx', center);
  nucleus.setAttribute('cy', center);
  nucleus.setAttribute('r', nucleusRadius);
  nucleus.setAttribute('fill', `var(--cat-${element.category})`);
  nucleus.setAttribute('filter', 'url(#glow)');
  nucleus.style.animation = 'pulse-slow 2s ease-in-out infinite';
  
  // Add Nucleus Text
  const nucleusText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  nucleusText.setAttribute('x', center);
  nucleusText.setAttribute('y', center + 4);
  nucleusText.setAttribute('text-anchor', 'middle');
  nucleusText.setAttribute('font-size', '10px');
  nucleusText.setAttribute('font-weight', 'bold');
  nucleusText.setAttribute('fill', '#ffffff');
  nucleusText.textContent = element.symbol;

  // Glow filter definition
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  `;
  bohrSvg.appendChild(defs);

  // Render Concentric shell lines and Electron particles
  shells.forEach((electronsCount, shellIdx) => {
    const ringRadius = nucleusRadius + 18 + (shellIdx * 10.5);

    // Shell ring line
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('cx', center);
    ring.setAttribute('cy', center);
    ring.setAttribute('r', ringRadius);
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', 'rgba(255, 255, 255, 0.12)');
    ring.setAttribute('stroke-width', '1');
    bohrSvg.appendChild(ring);

    // Place and animate electron points
    for (let elIdx = 0; elIdx < electronsCount; elIdx++) {
      const angleOffset = (elIdx / electronsCount) * 2 * Math.PI;
      const electron = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      electron.setAttribute('r', '2.8');
      electron.setAttribute('fill', '#ffffff');
      electron.setAttribute('stroke', `var(--cat-${element.category})`);
      electron.setAttribute('stroke-width', '1');

      // Create animated orbital paths using SVG transformation attributes
      const animGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      // Calculate start position
      const ex = center + ringRadius * Math.cos(angleOffset);
      const ey = center + ringRadius * Math.sin(angleOffset);
      electron.setAttribute('cx', ex);
      electron.setAttribute('cy', ey);

      // Unique rotation speeds based on shell (outer shells travel slower)
      const speed = 4 + (shellIdx * 3);
      const animateTransform = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
      animateTransform.setAttribute('attributeName', 'transform');
      animateTransform.setAttribute('type', 'rotate');
      animateTransform.setAttribute('from', `0 ${center} ${center}`);
      animateTransform.setAttribute('to', `360 ${center} ${center}`);
      animateTransform.setAttribute('dur', `${speed}s`);
      animateTransform.setAttribute('repeatCount', 'indefinite');

      animGroup.appendChild(electron);
      animGroup.appendChild(animateTransform);
      bohrSvg.appendChild(animGroup);
    }
  });

  bohrSvg.appendChild(ringRadiusLineFixForErrors()); // add custom def safety
  bohrSvg.appendChild(nucleus);
  bohrSvg.appendChild(nucleusText);
}

// Svg fix helper
function ringRadiusLineFixForErrors() {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  return g;
}

// Setup full event actions (Search, Filters, Speed, Custom Resets)
function setupEvents() {
  // Search actions
  searchInput.addEventListener('input', (e) => {
    activeSearchQuery = e.target.value.toLowerCase().trim();
    if (activeSearchQuery.length > 0) {
      searchClear.style.display = 'block';
    } else {
      searchClear.style.display = 'none';
    }
    filterElements();
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    activeSearchQuery = '';
    searchClear.style.display = 'none';
    filterElements();
    searchInput.focus();
  });

  // Switch layout modes
  layoutButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      layoutButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyLayout(btn.dataset.layout);
    });
  });

  // Speed adjustments
  speedSlider.addEventListener('input', (e) => {
    animationSpeed = parseFloat(e.target.value);
    speedValue.textContent = `${animationSpeed.toFixed(1)}s`;
    document.documentElement.style.setProperty('--transition-speed', `${animationSpeed}s`);
  });

  // Auto rotate trigger
  btnAutoRotate.addEventListener('click', () => {
    autoRotateActive = !autoRotateActive;
    btnAutoRotate.classList.toggle('active', autoRotateActive);
  });

  // Full master Reset
  btnReset.addEventListener('click', () => {
    searchInput.value = '';
    activeSearchQuery = '';
    searchClear.style.display = 'none';
    
    activeCategoryFilter = 'all';
    activeBlockFilter = 'all';
    
    // Reset category filter active state
    document.querySelectorAll('#category-filter-group .filter-pill').forEach(pill => {
      pill.classList.remove('active');
    });
    document.querySelector('#category-filter-group .filter-pill[data-category="all"]').classList.add('active');

    // Reset block filter active state
    document.querySelectorAll('#block-filter-group .filter-pill').forEach(pill => {
      pill.classList.remove('active');
    });
    document.querySelector('#block-filter-group .filter-pill[data-block="all"]').classList.add('active');

    // Reset layouts
    layoutButtons.forEach(b => b.classList.remove('active'));
    document.querySelector('.btn-layout[data-layout="standard"]').classList.add('active');
    applyLayout('standard');

    // Deselect element
    closeSidebar();
    filterElements();
  });

  // Category filters toggles (properly scoped to #category-filter-group)
  categoryFilterGroup.addEventListener('click', (e) => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;

    document.querySelectorAll('#category-filter-group .filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    activeCategoryFilter = pill.dataset.category;
    filterElements();
  });

  // Block filters toggles (properly scoped to #block-filter-group)
  blockFilterGroup.addEventListener('click', (e) => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;

    document.querySelectorAll('#block-filter-group .filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    activeBlockFilter = pill.dataset.block;
    filterElements();
  });

  // Handle sidebar closures
  closeSidebarBtn.addEventListener('click', closeSidebar);
  document.addEventListener('click', (e) => {
    // Closer outside sidebar bounds
    if (detailSidebar.classList.contains('open') && 
        !detailSidebar.contains(e.target) && 
        !e.target.closest('.element-card') &&
        !e.target.closest('.control-section')) {
      closeSidebar();
    }
  });

  // Resize boundaries adjustment
  window.addEventListener('resize', handleResize);
}

// Side pane closer
function closeSidebar() {
  detailSidebar.classList.remove('open');
  document.querySelectorAll('.element-card').forEach(c => {
    c.classList.remove('active-selection');
  });
  activeSelectedElement = null;
}

// Helper to determine element block (s, p, d, f)
function getElementBlock(element) {
  const num = element.number;
  const group = element.group;
  if (num === 1 || num === 2) return 's';
  if ((num >= 57 && num <= 71) || (num >= 89 && num <= 103)) return 'f';
  if (group === 1 || group === 2) return 's';
  if (group >= 3 && group <= 12) return 'd';
  if (group >= 13 && group <= 18) return 'p';
  return 'unknown';
}

// Compound Filter Mechanism (Combines Category Filter, Block Filter & Live searches)
function filterElements() {
  let countVisible = 0;

  elements.forEach(element => {
    const card = document.getElementById(`element-${element.number}`);
    if (!card) return;

    const matchesSearch = 
      activeSearchQuery === '' ||
      element.number.toString() === activeSearchQuery ||
      element.symbol.toLowerCase() === activeSearchQuery ||
      element.symbol.toLowerCase().includes(activeSearchQuery) ||
      element.name.toLowerCase().includes(activeSearchQuery);

    const matchesCategory = 
      activeCategoryFilter === 'all' || 
      element.category === activeCategoryFilter;

    const matchesBlock = 
      activeBlockFilter === 'all' || 
      getElementBlock(element) === activeBlockFilter;

    // Apply Filter state classes
    if (matchesSearch && matchesCategory && matchesBlock) {
      card.classList.remove('filtered-out');
      card.classList.remove('search-miss');
      if (activeSearchQuery !== '') {
        card.classList.add('search-match');
      } else {
        card.classList.remove('search-match');
      }
      countVisible++;
    } else {
      if (activeSearchQuery !== '' && !matchesSearch) {
        card.classList.add('search-miss');
        card.classList.remove('search-match');
      }
      card.classList.add('filtered-out');
    }
  });

  // Filter placeholder cards
  const lPlaceholder = document.getElementById('lanthanide-placeholder');
  const aPlaceholder = document.getElementById('actinide-placeholder');
  if (lPlaceholder && aPlaceholder) {
    const showL = (activeCategoryFilter === 'all' || activeCategoryFilter === 'lanthanide') &&
                  (activeBlockFilter === 'all' || activeBlockFilter === 'f') &&
                  activeSearchQuery === '';
    const showA = (activeCategoryFilter === 'all' || activeCategoryFilter === 'actinide') &&
                  (activeBlockFilter === 'all' || activeBlockFilter === 'f') &&
                  activeSearchQuery === '';

    lPlaceholder.style.display = showL ? '' : 'none';
    aPlaceholder.style.display = showA ? '' : 'none';
  }

  statusVisibleCount.textContent = countVisible;
  
  // Highlight stats board
  const statCount = document.getElementById('stat-count');
  statCount.textContent = countVisible;
  statCount.style.color = countVisible === 118 ? '#818cf8' : '#ffa43a';
}

// Interactive 3D Sphere/Wave viewport mouse drags rotation
function setupDragRotation() {
  let lastMouseX = 0;
  let lastMouseY = 0;

  viewportStage.addEventListener('pointerdown', (e) => {
    if (currentLayout === 'standard') return; // Static grid
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    dragStatus.textContent = 'Dragging';
    dragStatus.classList.add('text-green');
    viewportStage.setPointerCapture(e.pointerId);
  });

  viewportStage.addEventListener('pointermove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;

    // Direct degree increments proportional to drags speed
    rotationY += deltaX * 0.28;
    rotationX -= deltaY * 0.28;

    // Cap vertical rotation to avoid tumbling upside down
    rotationX = Math.max(-80, Math.min(80, rotationX));

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  viewportStage.addEventListener('pointerup', (e) => {
    isDragging = false;
    dragStatus.textContent = autoRotateActive ? 'Auto Rotating' : 'Static';
    dragStatus.classList.remove('text-green');
    try {
      viewportStage.releasePointerCapture(e.pointerId);
    } catch (err) {}
  });

  viewportStage.addEventListener('pointercancel', () => {
    isDragging = false;
    dragStatus.textContent = autoRotateActive ? 'Auto Rotating' : 'Static';
    dragStatus.classList.remove('text-green');
  });

  // Touch gesture preventions default scrolling over stage
  viewportStage.addEventListener('touchmove', (e) => {
    if (currentLayout !== 'standard') {
      e.preventDefault();
    }
  }, { passive: false });
}

// Fluid damping render loop (LERP rotation for ultimate feeling)
function startRenderLoop() {
  function update() {
    if (autoRotateActive && !isDragging && currentLayout !== 'standard') {
      rotationY += 0.35; // Incremental auto rotation velocity
    }

    // Linear Interpolation (Damping)
    currentX += (rotationX - currentX) * 0.08;
    currentY += (rotationY - currentY) * 0.08;

    // Apply 3D rotate
    if (currentLayout !== 'standard') {
      tableContainer.style.transform = `rotateX(${currentX}deg) rotateY(${currentY}deg)`;
    } else {
      tableContainer.style.transform = `rotateX(0deg) rotateY(0deg) translateZ(0px)`;
    }

    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Automatically scale the periodic table responsive container
function handleResize() {
  const stageWidth = viewportStage.clientWidth;
  const stageHeight = viewportStage.clientHeight;
  const containerWidth = 1188;
  const containerHeight = 760;

  // Find optimal scaling ratio
  const scaleX = stageWidth / containerWidth;
  const scaleY = stageHeight / containerHeight;
  
  // Use a slightly smaller padding scale for high elegance
  let finalScale = Math.min(scaleX, scaleY) * 0.94;
  
  // Enforce boundary safety
  if (finalScale > 1.1) finalScale = 1.1;
  if (finalScale < 0.25) finalScale = 0.25;

  tableContainer.style.scale = finalScale.toString();
}

// ==========================================
// BILINGUAL & ATOMIC AI EXTENSION SUBCELLS
// ==========================================

// Complete Devanagari Translation Map for all 118 Elements
const hindiNamesMap = {
  "H": "हाइड्रोजन", "He": "हीलियम", "Li": "लिथियम", "Be": "बेरिलियम", "B": "बोरॉन", "C": "कार्बन", "N": "नाइट्रोजन", "O": "ऑक्सीजन",
  "F": "फ्लोरीन", "Ne": "नियॉन", "Na": "सोडियम", "Mg": "मैग्नीशियम", "Al": "एल्युमिनियम", "Si": "सिलिकॉन", "P": "फास्फोरस", "S": "सल्फर (गंधक)",
  "Cl": "क्लोरीन", "Ar": "आर्गन", "K": "पोटैशियम", "Ca": "कैल्शियम", "Sc": "स्कैंडियम", "Ti": "टाइटेनियम", "V": "वेनेडियम", "Cr": "क्रोमियम",
  "Mn": "मैंगनीज", "Fe": "लोहा (आयरन)", "Co": "कोबाल्ट", "Ni": "निकेल", "Cu": "तांबा (कॉपर)", "Zn": "जस्ता (जिंक)", "Ga": "गैलियम", "Ge": "जर्मेनियम",
  "As": "आर्सेनिक", "Se": "सेलेनियम", "Br": "ब्रोमीन", "Kr": "क्रिप्टॉन", "Rb": "रुबिडियम", "Sr": "स्ट्रोंशियम", "Y": "इट्रियम", "Zr": "ज़िरकोनियम",
  "Nb": "नियोबियम", "Mo": "मोलिब्डेनम", "Tc": "टेक्नेटियम", "Ru": "रुथेनियम", "Rh": "रोडियम", "Pd": "पैलेडियम", "Ag": "चांदी (सिल्वर)", "Cd": "कैडमियम",
  "In": "इंडियम", "Sn": "टिन", "Sb": "एंटीमनी", "Te": "टेल्यूरियम", "I": "आयोडीन", "Xe": "जेनॉन", "Cs": "सीज़ियम", "Ba": "बेरियम",
  "La": "लैंथेनम", "Ce": "सेरियम", "Pr": "प्रासीओडीमियम", "Nd": "नियोडीमियम", "Pm": "प्रोमेथियम", "Sm": "समेरियम", "Eu": "यूरोपियम", "Gd": "गैडोलीनियम",
  "Tb": "टर्बियम", "Dy": "डिस्प्रोसियम", "Ho": "होल्मियम", "Er": "अर्बियम", "Tm": "थुलियम", "Yb": "इटरबियम", "Lu": "लुटेटियम", "Hf": "हाफनियम",
  "Ta": "टैंटलम", "W": "टंगस्टन", "Re": "रेनियम", "Os": "ऑस्मियम", "Ir": "इरिडियम", "Pt": "प्लेटिनम", "Au": "सोना (गोल्ड)", "Hg": "पारा (मरकरी)",
  "Tl": "थैलियम", "Pb": "सीसा (लेड)", "Bi": "बिस्मथ", "Po": "पोलोनियम", "At": "एस्टैटिन", "Rn": "रेडॉन", "Fr": "फ्रांसियम", "Ra": "रेडियम",
  "Ac": "एक्टिनियम", "Th": "थोरियम", "Pa": "प्रोटैक्टीनियम", "U": "यूरेनियम", "Np": "नेप्ट्यूनियम", "Pu": "प्लूटोनियम", "Am": "अमेरीशियम", "Cm": "क्यूरियम",
  "Bk": "बर्केलियम", "Cf": "कैलिफ़ोर्नियम", "Es": "आइंस्टीनियम", "Fm": "फर्मियम", "Md": "मेंडेलेवियम", "No": "नोबेलियम", "Lr": "लॉरेंसियम",
  "Rf": "रदरफोर्डियम", "Db": "डब्नियम", "Sg": "सीबोर्गियम", "Bh": "बोरियम", "Hs": "हैसियम", "Mt": "माइटनेरियम", "Ds": "डार्मस्टेडियम", "Rg": "रॉन्टजेनियम",
  "Cn": "कॉपरनिकियम", "Nh": "निहोनियम", "Fl": "फ्लेरोवियम", "Mc": "मॉस्कोवियम", "Lv": "लिवरमोरियम", "Ts": "टेनेसीन", "Og": "ओगानेसन"
};

function getHindiName(symbol, englishName) {
  return hindiNamesMap[symbol] || englishName;
}

// 1. Voice Speech Pronunciation Module
function speakElement(text, lang) {
  if (!('speechSynthesis' in window)) {
    console.warn("Speech Synthesis is not supported in this browser.");
    return;
  }
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  let selectedVoice = null;
  
  if (lang === 'hi') {
    utterance.lang = 'hi-IN';
    selectedVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
  } else {
    utterance.lang = 'en-US';
    selectedVoice = voices.find(v => v.lang.includes('en') || v.lang.includes('US') || v.lang.includes('GB'));
  }
  
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
  
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}

function setupBilingualSpeech() {
  const btnSpeakEn = document.getElementById('btn-speak-en');
  const btnSpeakHi = document.getElementById('btn-speak-hi');
  
  if (btnSpeakEn) {
    btnSpeakEn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeSelectedElement) {
        speakElement(activeSelectedElement.name, 'en');
      }
    });
  }
  
  if (btnSpeakHi) {
    btnSpeakHi.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeSelectedElement) {
        const hiName = getHindiName(activeSelectedElement.symbol, activeSelectedElement.name);
        speakElement(hiName, 'hi');
      }
    });
  }
}

// 2. Global switcher tabs
function setupGlobalTabs() {
  const tabPeriodic = document.getElementById('tab-periodic-view');
  const tabBonding = document.getElementById('tab-bonding-view');
  
  const bondingSection = document.getElementById('bonding-section');
  const controlSection = document.querySelector('.control-section');
  const viewportStage = document.getElementById('viewport-stage');
  const quickBar = document.querySelector('.quick-status-bar');
  
  if (!tabPeriodic || !tabBonding) return;
  
  tabPeriodic.addEventListener('click', () => {
    tabPeriodic.classList.add('active');
    tabBonding.classList.remove('active');
    tabPeriodic.style.borderBottom = '2px solid #818cf8';
    tabPeriodic.style.color = '#fafafa';
    tabBonding.style.borderBottom = '2px solid transparent';
    tabBonding.style.color = 'var(--text-secondary)';
    
    if (bondingSection) bondingSection.classList.add('hidden');
    if (controlSection) controlSection.classList.remove('hidden');
    if (viewportStage) viewportStage.style.display = 'block';
    if (quickBar) quickBar.classList.remove('hidden');
    
    handleResize();
  });
  
  tabBonding.addEventListener('click', () => {
    tabBonding.classList.add('active');
    tabPeriodic.classList.remove('active');
    tabBonding.style.borderBottom = '2px solid #818cf8';
    tabBonding.style.color = '#fafafa';
    tabPeriodic.style.borderBottom = '2px solid transparent';
    tabPeriodic.style.color = 'var(--text-secondary)';
    
    if (bondingSection) bondingSection.classList.remove('hidden');
    if (controlSection) controlSection.classList.add('hidden');
    if (viewportStage) viewportStage.style.display = 'none';
    if (quickBar) quickBar.classList.add('hidden');
    
    closeSidebar();
  });
}

// 3. AI Assistant Chat Box Module
function setupAIChatbot() {
  const aiMessages = document.getElementById('ai-messages');
  const aiInput = document.getElementById('ai-input');
  const aiSendBtn = document.getElementById('ai-send-btn');

  if (!aiMessages || !aiInput || !aiSendBtn) return;

  function askAI() {
    const query = aiInput.value.trim();
    if (!query) return;

    if (!activeSelectedElement) {
      alert("Please select an element first! / कृपया पहले किसी तत्व का चयन करें।");
      return;
    }

    const currentElemName = activeSelectedElement.name;
    const currentElemHindi = getHindiName(activeSelectedElement.symbol, activeSelectedElement.name);

    // Append user query bubble
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-msg user';
    userMsg.style.cssText = "background: rgba(255,255,255,0.06); padding: 0.4rem 0.55rem; border-radius: 4px; align-self: flex-end; max-width: 90%; word-break: break-word; font-size: 0.75rem; border: 1px solid rgba(255,255,255,0.06);";
    userMsg.innerHTML = `<strong>You:</strong> ${query}`;
    aiMessages.appendChild(userMsg);
    aiMessages.scrollTop = aiMessages.scrollHeight;

    // Clear input field
    aiInput.value = '';

    // Create thinking indicator
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'ai-msg bot loading';
    loadingMsg.style.cssText = "background: rgba(129, 140, 248, 0.05); padding: 0.4rem 0.55rem; border-radius: 4px; border-left: 2px solid #818cf8; font-style: italic; font-size: 0.72rem;";
    loadingMsg.innerHTML = `Thinking... / एआई सोच रहा है ✨`;
    aiMessages.appendChild(loadingMsg);
    aiMessages.scrollTop = aiMessages.scrollHeight;

    // Query server secure endpoint
    fetch("/api/gemini/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        element: `${currentElemName} (${currentElemHindi})`,
        question: query
      })
    })
    .then(res => res.json())
    .then(data => {
      loadingMsg.remove();

      const responseText = data.response || "No response received. / कोई उत्तर नहीं मिला।";
      
      const botMsg = document.createElement('div');
      botMsg.className = 'ai-msg bot';
      botMsg.style.cssText = "background: rgba(129, 140, 248, 0.08); padding: 0.45rem 0.6rem; border-radius: 4px; border-left: 2px solid #818cf8; word-break: break-word; font-size: 0.74rem; line-height: 1.45;";
      botMsg.innerHTML = `<strong>AI:</strong> ${responseText}`;
      aiMessages.appendChild(botMsg);
      aiMessages.scrollTop = aiMessages.scrollHeight;
    })
    .catch(err => {
      loadingMsg.remove();
      console.error("AI chat fail:", err);
      const errorMsg = document.createElement('div');
      errorMsg.className = 'ai-msg bot error';
      errorMsg.style.cssText = "background: rgba(239, 68, 68, 0.1); padding: 0.4rem 0.5rem; border-radius: 4px; border-left: 2px solid #ef4444; font-size: 0.72rem;";
      errorMsg.innerHTML = `⚠️ Connection error. Please make sure the backend is active. / कनेक्शन त्रुटि।`;
      aiMessages.appendChild(errorMsg);
      aiMessages.scrollTop = aiMessages.scrollHeight;
    });
  }

  aiSendBtn.addEventListener('click', askAI);
  aiInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      askAI();
    }
  });
}

// 4. Chemical Bonding Simulator module
let vesselElements = [];

const knownReactions = [
  {
    formula: "H₂O",
    name: "Water (पानी / जल)",
    bondType: "Polar Covalent Bond / ध्रुवीय सहसंयोजी बंध",
    explanation: "Two Hydrogen atoms share a pair of covalent electrons with the central Oxygen, completing their outer electron rings into a classic H₂O bent molecule. / प्रत्येक हाइड्रोजन ऑक्सीजन के साथ एक-एक इलेक्ट्रॉन साझा करता है, जिससे पानी का मजबूत तथा ध्रुवीय सहसंयोजी अणु बनता है।",
    match: (counts) => counts['H'] === 2 && counts['O'] === 1,
    svg: `<svg viewBox="0 0 200 120" style="width: 100%; height: 100%;"><circle cx="100" cy="40" r="18" fill="var(--cat-reactive-nonmetal)" stroke="#10b981" stroke-width="2.5" filter="drop-shadow(0 0 5px #10b981)"/><text x="100" y="45" text-anchor="middle" fill="#fff" font-weight="900" font-size="13">O</text><line x1="100" y1="40" x2="60" y2="85" stroke="#fff" stroke-width="3" stroke-dasharray="2"/><circle cx="60" cy="85" r="13" fill="var(--cat-reactive-nonmetal)" stroke="#3b82f6" stroke-width="2" filter="drop-shadow(0 0 4px #3b82f6)"/><text x="60" y="89" text-anchor="middle" fill="#fff" font-weight="900" font-size="10">H</text><line x1="100" y1="40" x2="140" y2="85" stroke="#fff" stroke-width="3" stroke-dasharray="2"/><circle cx="140" cy="85" r="13" fill="var(--cat-reactive-nonmetal)" stroke="#3b82f6" stroke-width="2" filter="drop-shadow(0 0 4px #3b82f6)"/><text x="140" y="89" text-anchor="middle" fill="#fff" font-weight="900" font-size="10">H</text></svg>`
  },
  {
    formula: "CO₂",
    name: "Carbon Dioxide (कार्बन डाइऑक्साइड गैस)",
    bondType: "Double Covalent Bond / द्वि-सहसंयोजी बंध",
    explanation: "Carbon shares 4 outer valence electrons with two separate Oxygen atoms, forming twin double covalent bonds in a perfect 180° linear structure. / कार्बन ऑक्सीजन के साथ दोहरे सहसंयोजी बंध बनाते हुए रैखिक अणु CO₂ बनाता है। यह सांस छोड़ने में बाहर निकलती है।",
    match: (counts) => counts['C'] === 1 && counts['O'] === 2,
    svg: `<svg viewBox="0 0 200 120" style="width: 100%; height: 100%;"><line x1="50" y1="56" x2="100" y2="56" stroke="#ef4444" stroke-width="4"/><line x1="50" y1="64" x2="100" y2="64" stroke="#ef4444" stroke-width="4"/><line x1="100" y1="56" x2="150" y2="56" stroke="#ef4444" stroke-width="4"/><line x1="100" y1="64" x2="150" y2="64" stroke="#ef4444" stroke-width="4"/><circle cx="50" cy="60" r="16" fill="var(--cat-reactive-nonmetal)" stroke="#ef4444" stroke-width="2.5" filter="drop-shadow(0 0 5px #ef4444)"/><text x="50" y="64" text-anchor="middle" fill="#fff" font-weight="900" font-size="11">O</text><circle cx="100" cy="60" r="18" fill="var(--cat-reactive-nonmetal)" stroke="#a855f7" stroke-width="2.5" filter="drop-shadow(0 0 6px #a855f7)"/><text x="100" y="64" text-anchor="middle" fill="#fff" font-weight="900" font-size="12">C</text><circle cx="150" cy="60" r="16" fill="var(--cat-reactive-nonmetal)" stroke="#ef4444" stroke-width="2.5" filter="drop-shadow(0 0 5px #ef4444)"/><text x="150" y="64" text-anchor="middle" fill="#fff" font-weight="900" font-size="11">O</text></svg>`
  },
  {
    formula: "NaCl",
    name: "Sodium Chloride (साधारण नमक)",
    bondType: "Strong Ionic Bond / मजबूत आयनिक बंध",
    explanation: "Sodium completely transfers its lone valence s-electron to highly electronegative Chlorine, forming strong Coulombic electrostatic bonds as Na⁺ & Cl⁻. / सोडियम अपना इलेक्ट्रॉन क्लोरीन को सौंप देता है, जिससे भोजन में काम आने वाले खाने के नमक (NaCl) का मजबूत आयनिक क्रिस्टल बनता है।",
    match: (counts) => counts['Na'] === 1 && counts['Cl'] === 1,
    svg: `<svg viewBox="0 0 200 120" style="width: 100%; height: 100%;"><circle cx="65" cy="60" r="16" fill="var(--cat-alkali-metal)" stroke="#f59e0b" stroke-width="2.5" filter="drop-shadow(0 0 4px #f59e0b)"/><text x="65" y="64" text-anchor="middle" fill="#fff" font-weight="900" font-size="11">Na⁺</text><circle cx="135" cy="60" r="20" fill="var(--cat-reactive-nonmetal)" stroke="#10b981" stroke-width="2.5" filter="drop-shadow(0 0 5px #10b981)"/><text x="135" y="64" text-anchor="middle" fill="#fff" font-weight="900" font-size="12">Cl⁻</text><path d="M 81 60 Q 100 45 119 60" stroke="#f59e0b" stroke-width="2" fill="none" stroke-dasharray="3"/><text x="100" y="40" text-anchor="middle" fill="#10b981" font-weight="bold" font-size="8">e⁻ Transferred</text></svg>`
  },
  {
    formula: "CH₄",
    name: "Methane Gas (मार्श गैस / मीथेन)",
    bondType: "Tetrahedral Covalent Bond / चतुर्थ-सहसंयोजी बंध",
    explanation: "One central Carbon links with four separate Hydrogen atoms at 109.5° tetrahedral spacing, creating highly stable combustible natural methane gas. / कार्बन 4 अलग-अलग हाइड्रोजन परमाणुओं के साथ सहसंयोजी साझा श्रृंखला बनाकर अत्यंत ज्वलनशील कार्बनिक मीथेन गैस CH₄ बनाता है।",
    match: (counts) => counts['C'] === 1 && counts['H'] === 4,
    svg: `<svg viewBox="0 0 200 130" style="width: 100%; height: 100%;"><circle cx="100" cy="65" r="18" fill="var(--cat-reactive-nonmetal)" stroke="#a855f7" stroke-width="2.5"/><text x="100" y="69" text-anchor="middle" fill="#fff" font-weight="900" font-size="12">C</text><line x1="100" y1="65" x2="100" y2="28" stroke="#fff" stroke-width="2" stroke-dasharray="2"/><circle cx="100" cy="28" r="11" fill="var(--cat-reactive-nonmetal)" stroke="#3b82f6" stroke-width="2"/><text x="100" y="32" text-anchor="middle" fill="#fff" font-weight="900" font-size="9">H</text><line x1="100" y1="65" x2="60" y2="100" stroke="#fff" stroke-width="2" stroke-dasharray="2"/><circle cx="60" cy="100" r="11" fill="var(--cat-reactive-nonmetal)" stroke="#3b82f6" stroke-width="2"/><text x="60" y="104" text-anchor="middle" fill="#fff" font-weight="900" font-size="9">H</text><line x1="100" y1="65" x2="140" y2="100" stroke="#fff" stroke-width="2" stroke-dasharray="2"/><circle cx="140" cy="100" r="11" fill="var(--cat-reactive-nonmetal)" stroke="#3b82f6" stroke-width="2"/><text x="140" y="104" text-anchor="middle" fill="#fff" font-weight="900" font-size="9">H</text><line x1="100" y1="65" x2="100" y2="110" stroke="#fff" stroke-width="2" stroke-dasharray="2"/><circle cx="100" cy="110" r="11" fill="var(--cat-reactive-nonmetal)" stroke="#3b82f6" stroke-width="2"/><text x="100" y="114" text-anchor="middle" fill="#fff" font-weight="900" font-size="9">H</text></svg>`
  },
  {
    formula: "NH₃",
    name: "Ammonia (अमोनिया गैस)",
    bondType: "Pyramidal Covalent Bond / पिरामिडीय सहसंयोजी बंध",
    explanation: "Nitrogen pairs with three Hydrogen atoms, leaving one lone pair on top. Essential for creating modern fertilizers worldwide. / एक नाइट्रोजन तीन हाइड्रोजन परमाणुओं के साथ पिरामिड के रूप में जुड़कर अमोनिया का उत्पादन करता है।",
    match: (counts) => counts['N'] === 1 && counts['H'] === 3,
    svg: `<svg viewBox="0 0 200 120" style="width: 100%; height: 100%;"><circle cx="100" cy="45" r="18" fill="var(--cat-reactive-nonmetal)" stroke="#ec4899" stroke-width="2.5"/><text x="100" y="49" text-anchor="middle" fill="#fff" font-weight="900" font-size="12">N</text><line x1="100" y1="45" x2="60" y2="90" stroke="#fff" stroke-width="2" stroke-dasharray="2"/><circle cx="60" cy="90" r="11" fill="var(--cat-reactive-nonmetal)" stroke="#3b82f6" stroke-width="1.5"/><text x="60" y="94" text-anchor="middle" fill="#fff" font-weight="900" font-size="9">H</text><line x1="100" y1="45" x2="140" y2="90" stroke="#fff" stroke-width="2" stroke-dasharray="2"/><circle cx="140" cy="90" r="11" fill="var(--cat-reactive-nonmetal)" stroke="#3b82f6" stroke-width="1.5"/><text x="140" y="94" text-anchor="middle" fill="#fff" font-weight="900" font-size="9">H</text><line x1="100" y1="45" x2="100" y2="95" stroke="#fff" stroke-width="2" stroke-dasharray="2"/><circle cx="100" cy="95" r="11" fill="var(--cat-reactive-nonmetal)" stroke="#3b82f6" stroke-width="1.5"/><text x="100" y="99" text-anchor="middle" fill="#fff" font-weight="900" font-size="9">H</text></svg>`
  },
  {
    formula: "HCl",
    name: "Hydrochloric Acid (हाइड्रोक्लोरिक अम्ल)",
    bondType: "Polar Covalent Bond / ध्रुवीय सहसंयोजी बंध",
    explanation: "Hydrogen pairs single valence orbital with Chlorine, generating the extremely active digestive gastric acid present inside mammalian stomachs. / हाइड्रोजन क्लोरीन के साथ एक इलेक्ट्रॉन साझा कर शक्तिशाली हाइड्रोक्लोरिक अम्ल (गाढ़ा तेजाब) बनाता है।",
    match: (counts) => counts['H'] === 1 && counts['Cl'] === 1,
    svg: `<svg viewBox="0 0 200 120" style="width: 100%; height: 100%;"><line x1="75" y1="60" x2="125" y2="60" stroke="#fff" stroke-width="3" stroke-dasharray="2"/><circle cx="65" cy="60" r="14" fill="var(--cat-reactive-nonmetal)" stroke="#3b82f6" stroke-width="2" filter="drop-shadow(0 0 3px #3b82f6)"/><text x="65" y="64" text-anchor="middle" fill="#fff" font-weight="900" font-size="10">H</text><circle cx="135" cy="60" r="19" fill="var(--cat-reactive-nonmetal)" stroke="#10b981" stroke-width="2.5" filter="drop-shadow(0 0 5px #10b981)"/><text x="135" y="64" text-anchor="middle" fill="#fff" font-weight="900" font-size="12">Cl</text></svg>`
  }
];

function addElementToVessel(symbol) {
  const el = elements.find(item => item.symbol.toLowerCase() === symbol.toLowerCase());
  if (!el) return;
  
  if (vesselElements.length >= 10) {
    alert("Vessel limit reached! Max 10 elements in the reaction jar. / पात्र की क्षमता सीमा समाप्त!");
    return;
  }
  
  vesselElements.push(el);
  renderVesselAtoms();
}

function removeElementFromVessel(index) {
  vesselElements.splice(index, 1);
  renderVesselAtoms();
}

function renderVesselAtoms() {
  const vesselBox = document.getElementById('vessel-atoms');
  const vesselCount = document.getElementById('vessel-count');
  const emptyTxt = document.getElementById('vessel-empty-txt');
  
  if (!vesselBox) return;
  
  // Clear but keep empty template
  vesselBox.innerHTML = '';
  
  if (vesselElements.length === 0) {
    if (emptyTxt) emptyTxt.style.display = 'block';
    vesselBox.appendChild(emptyTxt);
    if (vesselCount) vesselCount.textContent = '0 Elements';
    return;
  }
  
  if (emptyTxt) emptyTxt.style.display = 'none';
  if (vesselCount) vesselCount.textContent = `${vesselElements.length} Atom${vesselElements.length > 1 ? 's' : ''}`;
  
  vesselElements.forEach((el, index) => {
    const atomNode = document.createElement('div');
    atomNode.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--cat-${el.category});
      color: #fff;
      padding: 0.35rem 0.65rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 800;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      position: relative;
      border: 1px solid rgba(255,255,255,0.2);
    `;
    atomNode.innerHTML = `
      <span>${el.symbol}</span>
      <button style="background: rgba(0,0,0,0.3); border: none; border-radius: 50%; width: 14px; height: 14px; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.65rem; font-weight: bold; padding: 0;">×</button>
    `;
    
    // Wire delete button
    atomNode.querySelector('button').addEventListener('click', (e) => {
      e.stopPropagation();
      removeElementFromVessel(index);
    });
    
    vesselBox.appendChild(atomNode);
  });
}

function triggerReaction() {
  const placeholder = document.getElementById('bonding-result-placeholder');
  const details = document.getElementById('bonding-result-details');
  const badge = document.getElementById('molecule-badge');
  const name = document.getElementById('molecule-name');
  const bondType = document.getElementById('molecule-bond-type');
  const svgContainer = document.getElementById('molecule-svg-container');
  const exp = document.getElementById('molecule-explanation-card');
  
  if (vesselElements.length === 0) {
    alert("Reaction vessel is empty! Add elements first. / पात्र खाली है, तत्वों को जोड़ें!");
    return;
  }
  
  // Tabulate counts of each symbol
  const counts = {};
  vesselElements.forEach(el => {
    counts[el.symbol] = (counts[el.symbol] || 0) + 1;
  });
  
  // Search stoichiometry reactions
  const reaction = knownReactions.find(rx => {
    // Exact structural matches
    return rx.match(counts) && Object.keys(counts).length === Object.keys(counts).filter(k => counts[k] > 0).length;
  });
  
  if (placeholder) placeholder.style.display = 'none';
  if (details) details.style.display = 'flex';
  
  if (reaction) {
    if (badge) badge.textContent = reaction.formula;
    if (name) name.textContent = reaction.name;
    if (bondType) {
      bondType.textContent = reaction.bondType;
      bondType.style.background = "rgba(16, 185, 129, 0.15)";
      bondType.style.color = "#10b981";
      bondType.style.borderColor = "rgba(16, 185, 129, 0.4)";
    }
    if (svgContainer) svgContainer.innerHTML = reaction.svg;
    if (exp) {
      exp.textContent = reaction.explanation;
      exp.style.borderLeftColor = "#10b981";
      exp.style.background = "rgba(16, 185, 129, 0.04)";
    }
    
    // Add audio confirmation trigger
    speakElement(`Reaction complete! Synthesized ${reaction.formula} - ${reaction.name.split(' (')[0]}`, 'en');
  } else {
    // Unstable fallback summary
    const keys = Object.keys(counts);
    const formulaStr = keys.map(k => `${k}${counts[k] > 1 ? counts[k] : ''}`).join('');
    
    if (badge) badge.textContent = formulaStr;
    if (name) name.textContent = "Unstable Mix / अस्थिर मिश्रण";
    if (bondType) {
      bondType.textContent = "Fluctuating Mixture / अस्थिर रासायनिक अवस्था";
      bondType.style.background = "rgba(239, 68, 68, 0.15)";
      bondType.style.color = "#ef4444";
      bondType.style.borderColor = "rgba(239, 68, 68, 0.4)";
    }
    
    // Floating fallback representation
    if (svgContainer) {
      let tempSvg = `<svg viewBox="0 0 200 120" style="width: 100%; height: 100%;"><g style="animation: spin 8s linear infinite;">`;
      keys.forEach((k, idx) => {
        const angle = (idx / keys.length) * 2 * Math.PI;
        const cx = 100 + Math.cos(angle) * 35;
        const cy = 60 + Math.sin(angle) * 30;
        tempSvg += `<circle cx="${cx}" cy="${cy}" r="13" fill="rgba(255,255,255,0.06)" stroke="#818cf8" stroke-width="1.5"/><text x="${cx}" y="${cy+3}" text-anchor="middle" fill="#cbd5e1" font-weight="bold" font-size="9">${k}</text>`;
      });
      tempSvg += `</g></svg>`;
      svgContainer.innerHTML = tempSvg;
    }
    
    const elementsListHindi = keys.map(k => {
      const el = elements.find(item => item.symbol === k);
      return el ? getHindiName(el.symbol, el.name) : k;
    }).join(' + ');
    
    if (exp) {
      exp.innerHTML = `यह परमाणु योग (<strong>${elementsListHindi}</strong>) मानक तापमान और दाब पर स्थिर बंध नहीं बना पाता। कृपया निम्नलिखित संयोजन आजमाएं: <br>• <strong>H + H + O</strong> = Water (पानी / जल)<br>• <strong>C + O + O</strong> = Carbon Dioxide (कार्बन डाइऑक्साइड)<br>• <strong>Na + Cl</strong> = Salt (खाने का नमक)`;
      exp.style.borderLeftColor = "#ef4444";
      exp.style.background = "rgba(239, 68, 68, 0.04)";
    }
    
    speakElement(`These elements do not readily bond with this stoichiometry.`, 'en');
  }
}

function setupBondingSimulator() {
  const quickItems = document.querySelectorAll('.quick-add-item');
  const dropAdd = document.getElementById('bonding-dropdown-add');
  const reactBtn = document.getElementById('bonding-react-btn');
  const resetBtn = document.getElementById('bonding-reset-btn');
  
  quickItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const symbol = btn.dataset.sym;
      if (symbol) {
        addElementToVessel(symbol);
      }
    });
  });
  
  if (dropAdd) {
    dropAdd.innerHTML = '<option value="">-- Choose Element --</option>';
    const sorted = [...elements].sort((a,b) => a.number - b.number);
    sorted.forEach(el => {
      const opt = document.createElement('option');
      opt.value = el.symbol;
      opt.textContent = `${el.number}. ${el.symbol} - ${el.name} (${getHindiName(el.symbol, el.name)})`;
      dropAdd.appendChild(opt);
    });
    
    dropAdd.addEventListener('change', (e) => {
      const symbol = e.target.value;
      if (symbol) {
        addElementToVessel(symbol);
        dropAdd.value = ''; // Reset select state
      }
    });
  }
  
  if (reactBtn) {
    reactBtn.addEventListener('click', triggerReaction);
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      vesselElements = [];
      renderVesselAtoms();
      
      const placeholder = document.getElementById('bonding-result-placeholder');
      const details = document.getElementById('bonding-result-details');
      if (placeholder) placeholder.style.display = 'flex';
      if (details) details.style.display = 'none';
      
      window.speechSynthesis.cancel();
    });
  }
}

// Run loader safely handling cases where DOM might already be loaded/interactive
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  init();
} else {
  window.addEventListener('DOMContentLoaded', init);
}
