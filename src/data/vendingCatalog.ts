import type { ProductCategoryOption } from '../utils/validation';

export type MachineCategoryId = 'medical' | 'pizza' | 'snacks' | 'return';

export interface MachineSpecItem {
  label: string;
  value: string;
}

export interface VendingSolution {
  id: MachineCategoryId;
  categoryLabel: string;
  contactOption: ProductCategoryOption;
  headline: string;
  description: string;
  image: string;
  fallbackGradient: string;
  accentHex: string;
  environmentTag: string;
  features: string[];
  specifications: MachineSpecItem[];
  installationNotes: string[];
  idealEnvironments: string[];
}

export const LD_INTERTECH_BRAND = {
  companyName: 'LD InterTech Innovation',
  shortName: 'LD Intertech',
  logoPath: '/assets/logo/ld-intertech-logo.png',
  email: 'info@ldintertech.com',
  phone: '+91 9392031593',
  address:
    'M/S Proactive Plug and Play, 40-1/1-30 A, Laxmi Nagar, Mogalrajpuram, Vijayawada, Andhra Pradesh, Pin: 520010',
  website: 'https://ldintertech.com',
} as const;

export const VENDING_SOLUTIONS: VendingSolution[] = [
  {
    id: 'medical',
    categoryLabel: 'Medical Vending',
    contactOption: 'Medical Vending Machine',
    headline: 'Healthcare Essentials. Available Around the Clock.',
    description:
      'Smart medical vending solutions providing convenient access to approved healthcare essentials in hospitals, clinics, pharmacies, workplaces and public spaces.',
    image: '/assets/vending-machines/medical/medical-kiosk-studio.jpg',
    fallbackGradient: 'from-[#161B24] via-[#12161E] to-[#10100F]',
    accentHex: '#9ECFFA',
    environmentTag: 'Hospitals · Clinics · Pharmacies · Campuses',
    features: [
      'Secure product dispensing with controlled access bays',
      'Cashless payment options (NFC, cards, mobile wallets, QR)',
      'Real-time inventory monitoring and expiry batch tracking',
      'Remote management and automated restock alerts',
      'Configurable product categories for OTC & first-aid kits',
    ],
    specifications: [
      { label: 'Chassis Architecture', value: 'Antimicrobial powder-coated steel' },
      { label: 'Display Interface', value: '18-inch HD capacitive touchscreen' },
      { label: 'Temperature Control', value: 'Configurable climate-controlled zones' },
      { label: 'Payment Support', value: 'NFC contactless, EMV card, QR' },
      { label: 'Connectivity', value: 'Wi-Fi, 4G LTE, Ethernet telemetry' },
      { label: 'Compliance Note', value: 'Dispenses approved essentials only' },
    ],
    installationNotes: [
      'Standard commercial AC power outlet with grounded circuit',
      'Indoor hospital corridor, clinic lobby, or workplace placement',
      'Network connection for real-time inventory telemetry',
    ],
    idealEnvironments: ['Hospitals', 'Outpatient Clinics', 'Pharmacies', 'Transit Hubs'],
  },
  {
    id: 'pizza',
    categoryLabel: 'Pizza Vending',
    contactOption: 'Pizza Vending Machine',
    headline: 'Hot Pizza. Freshly Served. Anytime.',
    description:
      'Automated pizza vending solutions designed to deliver convenient food access in high-traffic locations, combining chilled storage with rapid on-demand heating.',
    image: '/assets/vending-machines/pizza/pizza-kiosk-studio.jpg',
    fallbackGradient: 'from-[#241A16] via-[#191412] to-[#10100F]',
    accentHex: '#E6CF80',
    environmentTag: 'Transit Stations · Campuses · Hospitality · Night Shifts',
    features: [
      'Automated touchscreen ordering with clear visual menu selection',
      'Integrated digital payment (NFC, mobile pay, QR, card)',
      'Automated chilled-to-oven transfer and heated dispensing',
      '24/7 unattended food-service convenience for peak and off-hours',
      'Remote machine monitoring for oven temperature and stock levels',
    ],
    specifications: [
      { label: 'Reference Dimensions', value: '~1800 × 1120 × 2400 mm' },
      { label: 'Reference Weight', value: '~600 kg' },
      { label: 'Cold Storage Zone', value: '+2°C to +6°C refrigerated vault' },
      { label: 'Storage Capacity', value: '60 pizza units' },
      { label: 'Power Supply', value: '110–240V · 50/60 Hz' },
      { label: 'Connectivity', value: 'Wi-Fi, 4G, Ethernet' },
    ],
    installationNotes: [
      'Dedicated power circuit per commercial thermal load specification',
      'Level floor surface rated for minimum 500 kg/m² load capacity',
      'Minimum 2.5 m ceiling clearance for service and ventilation',
    ],
    idealEnvironments: ['Railway Stations', 'University Campuses', 'Hotels & Resorts', 'Industrial Plants'],
  },
  {
    id: 'snacks',
    categoryLabel: 'Snack Vending',
    contactOption: 'Snack Vending Machine',
    headline: 'Everyday Convenience. Smarter Than Ever.',
    description:
      'Modern vending machines designed to provide convenient access to snacks, beverages and everyday products with flexible shelving and cashless checkout.',
    image: '/assets/vending-machines/snacks/snack-kiosk-studio.jpg',
    fallbackGradient: 'from-[#1C1A26] via-[#15141C] to-[#10100F]',
    accentHex: '#A374FF',
    environmentTag: 'Corporate Offices · Malls · Universities · Factories',
    features: [
      'Multiple product configurations across spirals, belts, or elevator trays',
      'Fast cashless transactions via contactless card, wallet, and QR',
      'Live inventory management and low-stock notifications',
      'Remote temperature and power telemetry monitoring',
      'Flexible modular installation options for single or multi-bay walls',
    ],
    specifications: [
      { label: 'Reference Dimensions', value: '1830 × 1050 × 850 mm' },
      { label: 'Reference Weight', value: '~450 kg' },
      { label: 'Storage Capacity', value: 'Up to 120+ configurable slots' },
      { label: 'Display Interface', value: '15-inch HD interactive touchscreen' },
      { label: 'Power Supply', value: '230V / 50 Hz / 16A' },
      { label: 'Connectivity', value: 'Wi-Fi, 4G, Ethernet' },
    ],
    installationNotes: [
      'Standard 230V power outlet (16A circuit recommended)',
      'Ambient indoor temperature +5°C to +35°C',
      'Minimum 2 m height clearance with front service door swing',
    ],
    idealEnvironments: ['Corporate Offices', 'Shopping Malls', 'Universities', 'Manufacturing Floors'],
  },
  {
    id: 'return',
    categoryLabel: 'Return Vending',
    contactOption: 'Return Vending Machine',
    headline: 'Turn Returns Into a Smarter Future.',
    description:
      'Intelligent return machines designed to support automated collection, return processing and sustainable reuse or recycling systems.',
    image: '/assets/vending-machines/return/return-kiosk-studio.jpg',
    fallbackGradient: 'from-[#15201D] via-[#121816] to-[#10100F]',
    accentHex: '#7CE3B4',
    environmentTag: 'City Centres · Food Courts · Malls · Zero-Waste Campuses',
    features: [
      'Automated return processing without on-site staff supervision',
      'Container identification and weight/optical validation where supported',
      'Dual-stream collection management for bottles, cups, and reusable bowls',
      'Digital monitoring of bin fill levels and return logs',
      'Sustainability-focused operations supporting circular deposit programs',
    ],
    specifications: [
      { label: 'Reference Dimensions', value: '1850 × 1370 × 970 mm' },
      { label: 'Reference Weight', value: '~320 kg' },
      { label: 'Display Interface', value: '18-inch LCD · IR Touch' },
      { label: 'Power Draw', value: '220–240V · 100W peak / ~88W avg' },
      { label: 'Collection Architecture', value: 'Dual internal sorting bins' },
      { label: 'Connectivity', value: 'Ethernet & cloud API telemetry' },
    ],
    installationNotes: [
      'No water or wastewater connection required',
      '220–240V Schuko/standard commercial sockets & Ethernet drop',
      'Minimum 2 × 1 m access doorway for delivery positioning',
    ],
    idealEnvironments: ['Shopping Malls', 'Airports & Stations', 'Food Courts', 'University Campuses'],
  },
];

export interface WorkflowStep {
  step: string;
  title: string;
  summary: string;
  detail: string;
  screenState: string;
  telemetryTag: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: '01',
    title: 'Discover',
    summary: 'Customer approaches the vending machine.',
    detail:
      'High-contrast architectural lighting and illuminated product bays draw immediate visibility in busy concourses, clinics, and offices.',
    screenState: 'Welcome Screen · Ready for Interaction',
    telemetryTag: 'Proximity Wake Active',
  },
  {
    step: '02',
    title: 'Select',
    summary: 'Customer browses the touchscreen interface.',
    detail:
      'Responsive HD capacitive display presents clear categories, ingredient or product details, and availability status before purchase.',
    screenState: 'Catalog Grid · Item Selected & Confirmed',
    telemetryTag: 'Slot Reservation Locked',
  },
  {
    step: '03',
    title: 'Pay',
    summary: 'Customer completes a supported digital payment.',
    detail:
      'Integrated contactless NFC card readers, mobile wallets, and QR flows settle transactions rapidly with clear on-screen confirmation.',
    screenState: 'Payment Terminal · Contactless Approved',
    telemetryTag: 'Encrypted Transaction Logged',
  },
  {
    step: '04',
    title: 'Dispense',
    summary: 'The machine automatically delivers the selected product.',
    detail:
      'Precision elevator retrieval, heated oven-to-chute transfer, or return bin actuation delivers items cleanly into the illuminated bay.',
    screenState: 'Delivery Bay Open · Collect Item',
    telemetryTag: 'Optical Drop Sensor Verified',
  },
  {
    step: '05',
    title: 'Manage',
    summary: 'Operators monitor inventory and machine performance remotely where supported.',
    detail:
      'Cloud telemetry tracks compartment stock levels, thermal stability, and sales reports across every connected location.',
    screenState: 'Operator Cloud · Inventory & Status Synced',
    telemetryTag: 'Telemetry Batch Synchronized',
  },
];

export interface PlatformCapability {
  id: string;
  title: string;
  description: string;
  metricLabel: string;
}

export const PLATFORM_CAPABILITIES: PlatformCapability[] = [
  {
    id: 'iot',
    title: 'IoT Connectivity',
    description: 'Continuous encrypted machine communication over Ethernet, Wi-Fi, or 4G cellular uplinks.',
    metricLabel: 'Multi-link uplink',
  },
  {
    id: 'monitoring',
    title: 'Remote Machine Monitoring',
    description: 'Live thermal zone verification, door sensor alerts, and hardware health diagnostics.',
    metricLabel: '24/7 health check',
  },
  {
    id: 'inventory',
    title: 'Inventory Tracking',
    description: 'Real-time slot-level depletion tracking to plan route restocking before stockouts occur.',
    metricLabel: 'Slot-level counts',
  },
  {
    id: 'payments',
    title: 'Digital Payments',
    description: 'Unified support for contactless tap-to-pay, EMV cards, QR wallets, and campus badges.',
    metricLabel: 'NFC · EMV · QR',
  },
  {
    id: 'analytics',
    title: 'Sales Analytics',
    description: 'Category velocity curves and peak-hour demand visibility by location and unit.',
    metricLabel: 'Location trends',
  },
  {
    id: 'cloud',
    title: 'Cloud-Based Management',
    description: 'Centralized pricing, catalog imagery, and touchscreen promotions pushed remotely.',
    metricLabel: 'Central fleet control',
  },
  {
    id: 'reporting',
    title: 'Operational Reporting',
    description: 'Exportable settlement summaries, thermal logs, and maintenance histories.',
    metricLabel: 'Audit-ready exports',
  },
  {
    id: 'status',
    title: 'Machine Status Monitoring',
    description: 'Automated fault detection and remote reset workflows where supported by hardware.',
    metricLabel: 'Proactive alerts',
  },
];

export interface IndustryApplication {
  id: string;
  name: string;
  recommendedCategory: MachineCategoryId;
  recommendedLabel: string;
  summary: string;
  deploymentNote: string;
}

export const INDUSTRY_APPLICATIONS: IndustryApplication[] = [
  {
    id: 'hospitals',
    name: 'Hospitals & Healthcare Facilities',
    recommendedCategory: 'medical',
    recommendedLabel: 'Medical & Snack Vending',
    summary: '24/7 access to approved healthcare essentials, masks, first-aid items, and nourishing meals for night staff and visitors.',
    deploymentNote: 'Corridors, emergency waiting lobbies, and staff lounges',
  },
  {
    id: 'offices',
    name: 'Corporate Offices',
    recommendedCategory: 'snacks',
    recommendedLabel: 'Snack & Return Vending',
    summary: 'Modern micro-markets providing healthy snacks, chilled beverages, and reusable cup collection in workplace hubs.',
    deploymentNote: 'Break rooms, innovation floors, and multi-tenant atriums',
  },
  {
    id: 'malls',
    name: 'Shopping Malls',
    recommendedCategory: 'return',
    recommendedLabel: 'Pizza, Snack & Return Vending',
    summary: 'High-footfall automated food kiosks and reverse vending collection stations near food courts and parking lobbies.',
    deploymentNote: 'Concourses, food court exits, and entertainment wings',
  },
  {
    id: 'universities',
    name: 'Universities & Colleges',
    recommendedCategory: 'pizza',
    recommendedLabel: 'Pizza, Snack & Medical Vending',
    summary: 'Round-the-clock study fuel, hot pizza after dining hours, and essential campus health supplies.',
    deploymentNote: 'Libraries, student unions, and residence halls',
  },
  {
    id: 'transit',
    name: 'Airports & Railway Stations',
    recommendedCategory: 'pizza',
    recommendedLabel: 'Pizza, Medical & Return Vending',
    summary: 'Fast contactless meals, travel healthcare essentials, and bottle/cup returns for passengers in motion.',
    deploymentNote: 'Departure gates, concourses, and rail platforms',
  },
  {
    id: 'hotels',
    name: 'Hotels & Resorts',
    recommendedCategory: 'snacks',
    recommendedLabel: 'Snack, Pizza & Medical Vending',
    summary: 'Late-arrival dining and 24-hour guest essentials without requiring overnight kitchen or front-desk staffing.',
    deploymentNote: 'Guest floor alcoves, pool decks, and lobby lounges',
  },
  {
    id: 'factories',
    name: 'Factories & Industrial Facilities',
    recommendedCategory: 'snacks',
    recommendedLabel: 'Snack & Pizza Vending',
    summary: 'Reliable meal and refreshment access across rotating three-shift industrial schedules.',
    deploymentNote: 'Shift changeover halls and worker canteens',
  },
  {
    id: 'public',
    name: 'Public Spaces',
    recommendedCategory: 'return',
    recommendedLabel: 'Return & Snack Vending',
    summary: 'Smart urban kiosks supporting sustainable container return programs and everyday public convenience.',
    deploymentNote: 'Civic plazas, cultural venues, and municipal hubs',
  },
];

export interface SignatureStat {
  id: string;
  target: number;
  suffix: string;
  label: string;
  context: string;
  isPlaceholder?: boolean;
}

/**
 * Uses verified architectural specifications where available, and clearly marks
 * editable deployment benchmarks where company-wide telemetry figures are configurable.
 */
export const SIGNATURE_STATS: SignatureStat[] = [
  {
    id: 'categories',
    target: 4,
    suffix: '',
    label: 'Core Vending Architectures',
    context: 'Medical, Pizza, Snack & Return hardware platforms',
  },
  {
    id: 'capacity',
    target: 120,
    suffix: '+',
    label: 'Configurable Slots Per Unit',
    context: 'Modular tray and compartment density on Snack systems',
  },
  {
    id: 'availability',
    target: 24,
    suffix: '/7',
    label: 'Autonomous Operating Hours',
    context: 'Unattended cashless operation with remote telemetry',
  },
  {
    id: 'uptime-target',
    target: 99,
    suffix: '.5%',
    label: 'Target Uptime SLA',
    context: 'Editable deployment benchmark · Subject to site SLA',
    isPlaceholder: true,
  },
];

export interface GlobeHub {
  id: string;
  region: string;
  city: string;
  lat: number;
  lon: number;
  focusMachine: string;
  summary: string;
}

export const GLOBE_HUBS: GlobeHub[] = [
  {
    id: 'india',
    region: 'South Asia HQ',
    city: 'Vijayawada, India',
    lat: 16.5062,
    lon: 80.648,
    focusMachine: 'LD InterTech Engineering & IoT Hub',
    summary: 'Embedded systems, full-stack cloud engineering, and mechanical design headquarters.',
  },
  {
    id: 'europe',
    region: 'Central Europe',
    city: 'DACH & EU Corridors',
    lat: 50.9,
    lon: 13.3,
    focusMachine: 'Automated Pizza & Reverse Vending',
    summary: 'High-density rail concourses, reusable packaging networks, and hospitality automats.',
  },
  {
    id: 'mena',
    region: 'Middle East',
    city: 'Dubai & Riyadh Hubs',
    lat: 25.2048,
    lon: 55.2708,
    focusMachine: 'Climate-Controlled Medical & Snack',
    summary: '24/7 airport terminals, healthcare campuses, and corporate towers.',
  },
  {
    id: 'apac',
    region: 'Asia-Pacific',
    city: 'Singapore & Tokyo',
    lat: 1.3521,
    lon: 103.8198,
    focusMachine: 'Cashless Smart Micro-Retail',
    summary: 'High-throughput commuter transit and automated campus retail deployments.',
  },
];
