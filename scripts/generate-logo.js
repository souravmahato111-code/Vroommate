import fs from 'fs';
import sharp from 'sharp';

// Exact replication of 20261001022633892.jpeg
// ViewBox 0 0 1120 240
// Neon Green: #39ff88
// White: #ffffff
// Background: #000000

const NEON = '#39ff88';
const WHITE = '#ffffff';

export function getExactLogoSvg(withBg = true) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 46 1120 172" width="100%" height="100%">
  <defs>
    <!-- Soft Neon Glow -->
    <filter id="neon-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  ${withBg ? '<rect width="1120" height="240" fill="#000000" />' : ''}

  <!-- SPEED LINES ON LEFT (3 lines, rounded ends) -->
  <g stroke="${NEON}" stroke-linecap="round" stroke-width="14" filter="url(#neon-glow-filter)">
    <!-- Top Speed Line -->
    <line x1="42" y1="122" x2="148" y2="122" />
    <!-- Middle Speed Line (Longest) -->
    <line x1="14" y1="154" x2="172" y2="154" stroke-width="15" />
    <!-- Bottom Speed Line -->
    <line x1="60" y1="186" x2="188" y2="186" stroke-width="14" />
  </g>

  <!-- LETTER 'V' (Bold Italic Neon Green) -->
  <path
    d="M 88 80 
       L 152 80 
       L 194 176 
       L 302 80 
       L 364 80 
       L 224 206 
       C 217 212 206 216 195 216 
       C 183 216 173 210 167 200 
       Z"
    fill="${NEON}"
    filter="url(#neon-glow-filter)"
  />

  <!-- LETTER 'R' (Bold Italic Neon Green) -->
  <path
    d="M 268 80 
       L 344 80 
       C 378 80 398 94 391 122 
       C 385 144 367 156 342 160 
       L 388 212 
       L 338 212 
       L 302 164 
       L 288 164 
       L 276 212 
       L 230 212 
       Z
       M 288 132 
       L 332 132 
       C 347 132 355 126 358 116 
       C 361 106 356 102 342 102 
       L 300 102 
       Z"
    fill="${NEON}"
    filter="url(#neon-glow-filter)"
  />

  <!-- MOTORCYCLE SILHOUETTE (Resting across the top of both wheels) -->
  <g filter="url(#neon-glow-filter)">
    <!-- Aerodynamic Green Bodywork -->
    <path
      d="M 330 98
         C 345 88 375 80 405 80
         C 435 80 452 86 468 92
         C 488 98 506 96 525 82
         C 538 72 554 50 566 44
         C 574 40 582 38 594 38
         C 600 38 608 40 612 44
         L 640 44
         C 636 50 630 54 622 56
         L 608 58
         C 622 62 640 70 654 84
         C 666 96 670 108 666 116
         C 644 118 622 114 606 102
         C 588 90 572 86 554 90
         C 536 94 520 108 502 114
         C 480 120 445 116 420 108
         C 395 100 365 104 346 112
         Z"
      fill="${NEON}"
    />

    <!-- Handlebar/Clip-on Upper Wing -->
    <path
      d="M 540 50 L 604 50 L 596 60 L 546 60 Z"
      fill="${NEON}"
    />

    <!-- Sharp Headlight Visor Slit (Crisp White Accent) -->
    <polygon
      points="612,86 638,80 634,90 608,96"
      fill="${WHITE}"
    />
  </g>

  <!-- TWO WHEELS (Acting as the 'OO' in VROOM) -->

  <!-- REAR WHEEL (Wheel 1) - Center (436, 156) -->
  <g transform="translate(436, 156)">
    <!-- Outer Neon Green Tire -->
    <circle cx="0" cy="0" r="50" fill="none" stroke="${NEON}" stroke-width="13" filter="url(#neon-glow-filter)" />
    <!-- Inner Black Gap / Sidewall -->
    <circle cx="0" cy="0" r="43.5" fill="#000000" />
    <!-- White Rim Ring -->
    <circle cx="0" cy="0" r="36" fill="none" stroke="${WHITE}" stroke-width="4" />
    
    <!-- 5 Spoke Mag Wheel (White) -->
    <g fill="${WHITE}">
      <!-- 5 Spokes radiating at 72 deg intervals -->
      <polygon points="-3,-10 3,-10 5,-36 -5,-36" />
      <g transform="rotate(72)">
        <polygon points="-3,-10 3,-10 5,-36 -5,-36" />
      </g>
      <g transform="rotate(144)">
        <polygon points="-3,-10 3,-10 5,-36 -5,-36" />
      </g>
      <g transform="rotate(216)">
        <polygon points="-3,-10 3,-10 5,-36 -5,-36" />
      </g>
      <g transform="rotate(288)">
        <polygon points="-3,-10 3,-10 5,-36 -5,-36" />
      </g>
    </g>

    <!-- Center Hub -->
    <circle cx="0" cy="0" r="13" fill="${WHITE}" />
    <circle cx="0" cy="0" r="5" fill="#000000" />
  </g>

  <!-- FRONT WHEEL (Wheel 2) - Center (556, 156) -->
  <g transform="translate(556, 156)">
    <!-- Outer Neon Green Tire -->
    <circle cx="0" cy="0" r="50" fill="none" stroke="${NEON}" stroke-width="13" filter="url(#neon-glow-filter)" />
    <!-- Inner Black Gap / Sidewall -->
    <circle cx="0" cy="0" r="43.5" fill="#000000" />
    <!-- White Rim Ring -->
    <circle cx="0" cy="0" r="36" fill="none" stroke="${WHITE}" stroke-width="4" />
    
    <!-- 5 Spoke Mag Wheel (White) -->
    <g fill="${WHITE}">
      <!-- 5 Spokes radiating at 72 deg intervals -->
      <polygon points="-3,-10 3,-10 5,-36 -5,-36" />
      <g transform="rotate(72)">
        <polygon points="-3,-10 3,-10 5,-36 -5,-36" />
      </g>
      <g transform="rotate(144)">
        <polygon points="-3,-10 3,-10 5,-36 -5,-36" />
      </g>
      <g transform="rotate(216)">
        <polygon points="-3,-10 3,-10 5,-36 -5,-36" />
      </g>
      <g transform="rotate(288)">
        <polygon points="-3,-10 3,-10 5,-36 -5,-36" />
      </g>
    </g>

    <!-- Center Hub -->
    <circle cx="0" cy="0" r="13" fill="${WHITE}" />
    <circle cx="0" cy="0" r="5" fill="#000000" />
  </g>

  <!-- LETTER 'M' (First M in Neon Green) -->
  <path
    d="M 632 80 
       L 678 80 
       L 686 156 
       L 720 80 
       L 756 80 
       L 728 212 
       L 692 212 
       L 708 134 
       L 672 212 
       L 644 212 
       L 628 134 
       L 610 212 
       L 570 212 
       Z"
    fill="${NEON}"
    filter="url(#neon-glow-filter)"
  />

  <!-- LETTER 'M' (Second M in Neon Green) -->
  <path
    d="M 736 80 
       L 782 80 
       L 790 156 
       L 824 80 
       L 860 80 
       L 832 212 
       L 796 212 
       L 812 134 
       L 776 212 
       L 748 212 
       L 732 134 
       L 714 212 
       L 674 212 
       Z"
    fill="${NEON}"
    filter="url(#neon-glow-filter)"
  />

  <!-- LETTER 'A' (Solid Crisp White) -->
  <path
    d="M 838 80 
       L 892 80 
       L 916 212 
       L 872 212 
       L 864 176 
       L 826 176 
       L 810 212 
       L 770 212 
       Z
       M 836 142 
       L 860 142 
       L 850 106 
       Z"
    fill="${WHITE}"
  />

  <!-- LETTER 'T' (Solid Crisp White) -->
  <path
    d="M 888 80 
       L 984 80 
       L 976 112 
       L 948 112 
       L 924 212 
       L 882 212 
       L 906 112 
       L 880 112 
       Z"
    fill="${WHITE}"
  />

  <!-- LETTER 'E' (Solid Crisp White) -->
  <path
    d="M 974 80 
       L 1058 80 
       L 1050 112 
       L 1010 112 
       L 1004 134 
       L 1042 134 
       L 1034 164 
       L 996 164 
       L 988 182 
       L 1034 182 
       L 1026 212 
       L 942 212 
       Z"
    fill="${WHITE}"
  />
</svg>`;
}

async function generateAll() {
  const svgTransparent = getExactLogoSvg(false);

  // Write transparent SVGs so they merge 100% seamlessly with any interface background
  fs.writeFileSync('public/vroommate-logo-horizontal.svg', svgTransparent);
  fs.writeFileSync('public/vroommate-logo.svg', svgTransparent);
  fs.writeFileSync('public/logo.svg', svgTransparent);
  fs.writeFileSync('public/favicon.svg', svgTransparent);

  const transparentBuffer = Buffer.from(svgTransparent);

  // Generate transparent PNGs with full alpha channel
  await sharp(transparentBuffer)
    .resize(1120, 172)
    .png()
    .toFile('public/VMlogo.png');

  await sharp(transparentBuffer)
    .resize(1120, 172)
    .png()
    .toFile('public/vmlogo.png');

  await sharp(transparentBuffer)
    .resize(1120, 172)
    .png()
    .toFile('public/vroommate-logo-horizontal.png');

  await sharp(transparentBuffer)
    .resize(1120, 172)
    .png()
    .toFile('vroommate-logo-horizontal.png');

  await sharp(transparentBuffer)
    .resize(800, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile('public/vroommate-logo.png');

  await sharp(transparentBuffer)
    .resize(800, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile('public/logo.png');

  console.log('Successfully generated all new transparent logo files matching 20261001022633892.jpeg!');
}

generateAll().catch(console.error);
