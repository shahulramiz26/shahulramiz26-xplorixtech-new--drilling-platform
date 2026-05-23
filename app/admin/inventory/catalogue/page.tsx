'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  Plus, Trash2, Edit2, Check, X, Upload, Download,
  Search, ChevronDown, Package, AlertCircle, FileSpreadsheet
} from 'lucide-react'
import { useCurrency } from '../../../components/currency-context'

// ── TYPES ──────────────────────────────────────────────────────────────────
interface Part {
  id: string
  partNumber: string
  name: string
  category: string
  manufacturer: string
  unit: string
  unitCost: number
  reorderLevel: number
  notes: string
  editing?: boolean
}

// ── 13 UNIVERSAL CATEGORIES ────────────────────────────────────────────────
const defaultCategories = [
  'Core Bits',
  'Core Barrel Assembly',
  'Reaming Shells',
  'Drilling Fluids & Chemicals',
  'Filtration',
  'Seals & Packings',
  'Bearings & Seals',
  'Hoses & Hydraulics',
  'Lubricants & Greases',
  'Drive & Transmission',
  'Rods, Casings & Subs',
  'Safety & PPE',
  'Workshop & Repair Tools',
  'Hardware & Consumables',
  'Electrical & Instrumentation',
  'Other / Custom',
]

const defaultManufacturers = [
  'ROCKTEK','IDP (Ideal Diamond Products)','WESTFIELDS SERVICES','AB EMULTECH',
  'EZYDRILL','DRILLMAN','AMOGH ENTERPRISES','M.S. ENTERPRISES (MSE)','SKF',
  'SANDVIK','DHANBAD ENGINEERING','SPECIALITY LUBRICANTS','MOULI ENTERPRISES',
  'VPM (VIDARBHA PNU)','MINAR-HYDRO','YASH GEAR','AMKO','K. VADILAL',
  'ANK SEALS','UNIVERSAL ENTERPRISES','CORNIER PVT. LTD.','BENAZ ENTERPRISES',
  'JAIN FILTER SOLUTION','SR INFO','KHEMKA MOTORS','Custom / Other',
]

const defaultUnits = ['Each', 'Kg', 'Litre', 'Set', 'Metre', 'Box', 'Barrel', 'Gallon', 'Bucket', 'Roll', 'Pair', 'MTR']

// ── REAL CUSTOMER DATA (RS-01 Chhindwara · CMPDI · April 2026) ─────────────
const seedParts: Part[] = [
  // CORE BITS
  { id:'1',  partNumber:'NQ-CB-SR06',   name:'NQ Core Bit SR-06',              category:'Core Bits',               manufacturer:'IDP (Ideal Diamond Products)', unit:'Each',   unitCost:11500,  reorderLevel:10, notes:'Serial nos tracked individually' },
  { id:'2',  partNumber:'NQ-CB-SR08',   name:'NQ Core Bit SR-08',              category:'Core Bits',               manufacturer:'IDP (Ideal Diamond Products)', unit:'Each',   unitCost:11500,  reorderLevel:10, notes:'' },
  { id:'3',  partNumber:'HQ-CB-SR06',   name:'HQ Core Bit SR-06',              category:'Core Bits',               manufacturer:'IDP (Ideal Diamond Products)', unit:'Each',   unitCost:19000,  reorderLevel:8,  notes:'' },
  { id:'4',  partNumber:'HQ-CB-SR08',   name:'HQ Core Bit SR-08',              category:'Core Bits',               manufacturer:'IDP (Ideal Diamond Products)', unit:'Each',   unitCost:22000,  reorderLevel:8,  notes:'Used at KEM-1,5,8,9' },
  { id:'5',  partNumber:'HQ-CB-SR10',   name:'HQ Core Bit SR-10',              category:'Core Bits',               manufacturer:'IDP (Ideal Diamond Products)', unit:'Each',   unitCost:19000,  reorderLevel:6,  notes:'' },
  { id:'6',  partNumber:'HQ-CB-SR12',   name:'HQ Core Bit SR-12 IMP',          category:'Core Bits',               manufacturer:'IDP (Ideal Diamond Products)', unit:'Each',   unitCost:19000,  reorderLevel:4,  notes:'Diamond impregnated' },
  { id:'7',  partNumber:'BQ-CB-SR06',   name:'BQ Core Bit SR-06',              category:'Core Bits',               manufacturer:'IDP (Ideal Diamond Products)', unit:'Each',   unitCost:10000,  reorderLevel:6,  notes:'' },
  { id:'8',  partNumber:'BQ-CB-SR08',   name:'BQ Core Bit SR-08',              category:'Core Bits',               manufacturer:'IDP (Ideal Diamond Products)', unit:'Each',   unitCost:10000,  reorderLevel:6,  notes:'' },
  { id:'9',  partNumber:'HW-CSB-001',   name:'HW Casing Shoe Bit',             category:'Core Bits',               manufacturer:'IDP (Ideal Diamond Products)', unit:'Each',   unitCost:11200,  reorderLevel:4,  notes:'' },
  { id:'10', partNumber:'HW-CSB-IMP',   name:'HW Casing Shoe Impregnated 58CTS',category:'Core Bits',              manufacturer:'IDP (Ideal Diamond Products)', unit:'Each',   unitCost:11200,  reorderLevel:4,  notes:'58 carats' },
  { id:'11', partNumber:'BQ-SS-CB',     name:'BQ S/S Core Bit',                category:'Core Bits',               manufacturer:'IDP (Ideal Diamond Products)', unit:'Each',   unitCost:5668,   reorderLevel:4,  notes:'' },
  { id:'12', partNumber:'HQ-RSB-001',   name:'HQ Rod Shoe Bit',                category:'Core Bits',               manufacturer:'IDP (Ideal Diamond Products)', unit:'Each',   unitCost:7650,   reorderLevel:4,  notes:'' },

  // CORE BARREL ASSEMBLY
  { id:'13', partNumber:'NQ-CL-001',    name:'NQ Core Lifter',                 category:'Core Barrel Assembly',    manufacturer:'IDP (Ideal Diamond Products)', unit:'Each',   unitCost:400,    reorderLevel:20, notes:'High usage — check daily' },
  { id:'14', partNumber:'HQ-CL-001',    name:'HQ Core Lifter',                 category:'Core Barrel Assembly',    manufacturer:'IDP (Ideal Diamond Products)', unit:'Each',   unitCost:646,    reorderLevel:15, notes:'' },
  { id:'15', partNumber:'BQ-CL-001',    name:'BQ Core Lifter',                 category:'Core Barrel Assembly',    manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:399,    reorderLevel:10, notes:'' },
  { id:'16', partNumber:'NQ-CLC-001',   name:'NQ Core Lifter Case',            category:'Core Barrel Assembly',    manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:600,    reorderLevel:10, notes:'' },
  { id:'17', partNumber:'HQ-CLC-001',   name:'HQ Core Lifter Case',            category:'Core Barrel Assembly',    manufacturer:'IDP (Ideal Diamond Products)', unit:'Each',   unitCost:878,    reorderLevel:8,  notes:'' },
  { id:'18', partNumber:'BQ-CLC-001',   name:'BQ Core Lifter Case',            category:'Core Barrel Assembly',    manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:511,    reorderLevel:6,  notes:'' },
  { id:'19', partNumber:'NQ-LC-001',    name:'NQ Locking Coupling',            category:'Core Barrel Assembly',    manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:6195,   reorderLevel:6,  notes:'Part No: 3545405RT' },
  { id:'20', partNumber:'HQ-LC-001',    name:'HQ Locking Coupling',            category:'Core Barrel Assembly',    manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:7364,   reorderLevel:4,  notes:'' },
  { id:'21', partNumber:'NQ-LR-001',    name:'NQ Landing Ring',                category:'Core Barrel Assembly',    manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:1100,   reorderLevel:6,  notes:'Part No: 2489RT' },
  { id:'22', partNumber:'NQ-LS-001',    name:'NQ Landing Shoulder',            category:'Core Barrel Assembly',    manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:1036,   reorderLevel:6,  notes:'' },
  { id:'23', partNumber:'NQ-STB-001',   name:'NQ Stabilizer',                  category:'Core Barrel Assembly',    manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:1260,   reorderLevel:6,  notes:'Part No: 44407RT' },
  { id:'24', partNumber:'HQ-STB-001',   name:'HQ Stabilizer',                  category:'Core Barrel Assembly',    manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:2270,   reorderLevel:4,  notes:'' },
  { id:'25', partNumber:'NQ-LCH-001',   name:'NQ Latch',                       category:'Core Barrel Assembly',    manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:990,    reorderLevel:4,  notes:'Part No: 104816RT' },
  { id:'26', partNumber:'HQ-LCH-001',   name:'HQ Latch',                       category:'Core Barrel Assembly',    manufacturer:'SANDVIK',                     unit:'Each',   unitCost:2000,   reorderLevel:4,  notes:'' },
  { id:'27', partNumber:'NQ-SR-001',    name:'NQ Stop Ring',                   category:'Core Barrel Assembly',    manufacturer:'IDP (Ideal Diamond Products)', unit:'Each',   unitCost:255,    reorderLevel:10, notes:'' },
  { id:'28', partNumber:'HQ-SR-001',    name:'HQ Stop Ring',                   category:'Core Barrel Assembly',    manufacturer:'IDP (Ideal Diamond Products)', unit:'Each',   unitCost:296,    reorderLevel:8,  notes:'' },
  { id:'29', partNumber:'NQ-ITCA-001',  name:'NQ Inner Tube Cap Assembly',     category:'Core Barrel Assembly',    manufacturer:'DRILLMAN',                    unit:'Each',   unitCost:5528,   reorderLevel:4,  notes:'' },
  { id:'30', partNumber:'HQ-ITCA-001',  name:'HQ Inner Tube Cap Assembly',     category:'Core Barrel Assembly',    manufacturer:'AMKO',                        unit:'Each',   unitCost:4170,   reorderLevel:4,  notes:'' },
  { id:'31', partNumber:'NQ-CK-001',    name:'NQ Chuck Jaw Set',               category:'Core Barrel Assembly',    manufacturer:'ROCKTEK',                     unit:'Set',    unitCost:36800,  reorderLevel:2,  notes:'' },
  { id:'32', partNumber:'NQ-FC-001',    name:'NQ Foot Clamp',                  category:'Core Barrel Assembly',    manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:35500,  reorderLevel:2,  notes:'' },
  { id:'33', partNumber:'NQ-IT-3M',     name:'NQ Inner Tube 3.0 MTR',          category:'Core Barrel Assembly',    manufacturer:'AMKO',                        unit:'Each',   unitCost:3470,   reorderLevel:4,  notes:'' },
  { id:'34', partNumber:'BQ-OT-3M',     name:'BQ Outer Tube 3.0 MTR',          category:'Core Barrel Assembly',    manufacturer:'DRILLMAN',                    unit:'Each',   unitCost:3215,   reorderLevel:4,  notes:'' },
  { id:'35', partNumber:'NQ-GCB-001',   name:'NQ GI Core Box',                 category:'Core Barrel Assembly',    manufacturer:'JAYESH ENTERPRISES',          unit:'Each',   unitCost:400,    reorderLevel:20, notes:'Sample storage' },

  // REAMING SHELLS
  { id:'36', partNumber:'NQ-RS-SPR',    name:'NQ Reaming Shell Spiral',        category:'Reaming Shells',          manufacturer:'EZYDRILL',                    unit:'Each',   unitCost:13455,  reorderLevel:4,  notes:'' },
  { id:'37', partNumber:'NQ-FRS-001',   name:'NQ Front Reamer Shell',          category:'Reaming Shells',          manufacturer:'IDP (Ideal Diamond Products)', unit:'Each',   unitCost:10000,  reorderLevel:4,  notes:'' },
  { id:'38', partNumber:'NA-BRS-001',   name:'NA Back/E Reamer Shell',         category:'Reaming Shells',          manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:12900,  reorderLevel:4,  notes:'Part No: 7200103RT' },
  { id:'39', partNumber:'HQ-FRS-001',   name:'HQ Front Reamer Shell',          category:'Reaming Shells',          manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:14753,  reorderLevel:4,  notes:'' },
  { id:'40', partNumber:'HQ-BRS-001',   name:'HQ Back/E Reamer Shell',         category:'Reaming Shells',          manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:15459,  reorderLevel:4,  notes:'' },
  { id:'41', partNumber:'BQ-BRS-001',   name:'BQ B/E Reamer Shell',            category:'Reaming Shells',          manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:15400,  reorderLevel:4,  notes:'Part No: 7200182RT' },
  { id:'42', partNumber:'NQ-BCS-001',   name:'NQ/BW Casing Cutter Blade Set',  category:'Reaming Shells',          manufacturer:'SR INFO',                     unit:'Set',    unitCost:6300,   reorderLevel:4,  notes:'' },
  { id:'43', partNumber:'NQ-LHT-001',   name:'NQ L/H Recover Tape',            category:'Reaming Shells',          manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:10500,  reorderLevel:2,  notes:'' },

  // DRILLING FLUIDS & CHEMICALS
  { id:'44', partNumber:'MTX-DD955',    name:'MATEX DD955 Liquid Poly Pail',   category:'Drilling Fluids & Chemicals', manufacturer:'WESTFIELDS SERVICES',   unit:'Bucket', unitCost:12151,  reorderLevel:15, notes:'Primary drilling fluid' },
  { id:'45', partNumber:'MTX-SD-PPL',   name:'MATEX Sand Drill Poly Pail',     category:'Drilling Fluids & Chemicals', manufacturer:'WESTFIELDS SERVICES',   unit:'Bucket', unitCost:16886,  reorderLevel:15, notes:'' },
  { id:'46', partNumber:'MTX-TQL',      name:'MATEX Torqueless',               category:'Drilling Fluids & Chemicals', manufacturer:'WESTFIELDS SERVICES',   unit:'Bucket', unitCost:9547,   reorderLevel:8,  notes:'' },
  { id:'47', partNumber:'ADD-EA-20',    name:'ADDRILL EA-20 KG',               category:'Drilling Fluids & Chemicals', manufacturer:'AB EMULTECH',           unit:'Kg',     unitCost:3200,   reorderLevel:20, notes:'' },
  { id:'48', partNumber:'ADD-EA-25',    name:'ADDRILL EA-25 KG',               category:'Drilling Fluids & Chemicals', manufacturer:'AB EMULTECH',           unit:'Kg',     unitCost:4000,   reorderLevel:10, notes:'' },
  { id:'49', partNumber:'ADD-PAB-25',   name:'ADDRILL PAB 25 KG',              category:'Drilling Fluids & Chemicals', manufacturer:'AB EMULTECH',           unit:'Kg',     unitCost:4375,   reorderLevel:20, notes:'' },
  { id:'50', partNumber:'ADD-CF100',    name:'ADDRILL CF-100 25 KG',           category:'Drilling Fluids & Chemicals', manufacturer:'AB EMULTECH',           unit:'Kg',     unitCost:5250,   reorderLevel:8,  notes:'' },
  { id:'51', partNumber:'BNT-50',       name:'Bentonite 50 KG',                category:'Drilling Fluids & Chemicals', manufacturer:'VIDYA ENTERPRISES',     unit:'Kg',     unitCost:210,    reorderLevel:10, notes:'' },
  { id:'52', partNumber:'FUL-MAX-01',   name:'Fuel Maxx',                      category:'Drilling Fluids & Chemicals', manufacturer:'KIPL',                  unit:'Each',   unitCost:700,    reorderLevel:10, notes:'' },

  // FILTRATION
  { id:'53', partNumber:'FLT-AIR-P',    name:'Air Filter Primary (Fleetguard)',category:'Filtration',              manufacturer:'MOULI ENTERPRISES',           unit:'Each',   unitCost:5000,   reorderLevel:6,  notes:'Make: Fleetguard' },
  { id:'54', partNumber:'FLT-AIR-DON',  name:'Air Filter Donaldson P181035',   category:'Filtration',              manufacturer:'JAIN FILTER SOLUTION',        unit:'Each',   unitCost:3006,   reorderLevel:6,  notes:'Part No: P181035' },
  { id:'55', partNumber:'FLT-FWS-01',   name:'Fuel Water Separator BF7675/HD', category:'Filtration',              manufacturer:'M.S. ENTERPRISES (MSE)',      unit:'Each',   unitCost:2374,   reorderLevel:12, notes:'Spin-on type' },
  { id:'56', partNumber:'FLT-LB-B71',   name:'Lube Filter B7125 Spin-On',      category:'Filtration',              manufacturer:'M.S. ENTERPRISES (MSE)',      unit:'Each',   unitCost:1990,   reorderLevel:8,  notes:'Part No: B7125' },
  { id:'57', partNumber:'FLT-RC-PI2',   name:'Racor Filter PI2020PM-OR',       category:'Filtration',              manufacturer:'M.S. ENTERPRISES (MSE)',      unit:'Each',   unitCost:1155,   reorderLevel:8,  notes:'Part No: PI2020PM-OR' },
  { id:'58', partNumber:'FLT-HYD-01',   name:'HYD Return Tank Filter',         category:'Filtration',              manufacturer:'M.S. ENTERPRISES (MSE)',      unit:'Each',   unitCost:8423,   reorderLevel:4,  notes:'' },
  { id:'59', partNumber:'FLT-GR-PLT',   name:'Gear Oil Filter (Pilot)',        category:'Filtration',              manufacturer:'M.S. ENTERPRISES (MSE)',      unit:'Each',   unitCost:2357,   reorderLevel:4,  notes:'' },

  // SEALS & PACKINGS
  { id:'60', partNumber:'SEL-VP-25K',   name:'V-Packing W/S 25K',             category:'Seals & Packings',        manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:780,    reorderLevel:10, notes:'Part No: 39171RT' },
  { id:'61', partNumber:'SEL-SP-25K',   name:'Spindle Extension W/S 25K',     category:'Seals & Packings',        manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:2450,   reorderLevel:6,  notes:'Part No: 39170RT' },
  { id:'62', partNumber:'SEL-PH-25K',   name:'Packing Housing W/S 25K',       category:'Seals & Packings',        manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:7350,   reorderLevel:4,  notes:'' },
  { id:'63', partNumber:'SEL-WS-RK',    name:'Water Swivel Repair Kit 25K',   category:'Seals & Packings',        manufacturer:'ROCKTEK',                     unit:'Set',    unitCost:7100,   reorderLevel:4,  notes:'Part No: 67628RT' },
  { id:'64', partNumber:'SEL-CP-001',   name:'Cylinder Packing',              category:'Seals & Packings',        manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:1100,   reorderLevel:15, notes:'W11 pump' },
  { id:'65', partNumber:'SEL-PS-218',   name:'Piston Seal Repair Kit 218.3mm',category:'Seals & Packings',        manufacturer:'ANK SEALS',                   unit:'Set',    unitCost:5200,   reorderLevel:4,  notes:'' },
  { id:'66', partNumber:'SEL-TCS-001',  name:'Traverse Cyl. Seal Kit Set',    category:'Seals & Packings',        manufacturer:'ANK SEALS',                   unit:'Set',    unitCost:4275,   reorderLevel:2,  notes:'' },
  { id:'67', partNumber:'SEL-CUP-001',  name:'Cup Plunger',                   category:'Seals & Packings',        manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:6918,   reorderLevel:4,  notes:'' },
  { id:'68', partNumber:'SEL-LP-W11',   name:'Liner Packing for W11 Pump',    category:'Seals & Packings',        manufacturer:'DHANBAD ENGINEERING',         unit:'Each',   unitCost:175,    reorderLevel:10, notes:'' },
  { id:'69', partNumber:'SEL-DP-001',   name:'Delivery Packing (VPM)',        category:'Seals & Packings',        manufacturer:'VPM (VIDARBHA PNU)',           unit:'Each',   unitCost:120,    reorderLevel:12, notes:'' },
  { id:'70', partNumber:'SEL-BVK-001',  name:'Ball Valve Pump Kit',           category:'Seals & Packings',        manufacturer:'ROCKTEK',                     unit:'Set',    unitCost:21950,  reorderLevel:2,  notes:'' },

  // BEARINGS & SEALS
  { id:'71', partNumber:'BRG-SKF-61830',name:'Bearing 61830 MA SKF',          category:'Bearings & Seals',        manufacturer:'AMOGH ENTERPRISES',           unit:'Each',   unitCost:41074,  reorderLevel:2,  notes:'SKF brand' },
  { id:'72', partNumber:'BRG-SKF-29330',name:'Bearing 29330E SKF',            category:'Bearings & Seals',        manufacturer:'AMOGH ENTERPRISES',           unit:'Each',   unitCost:102325, reorderLevel:1,  notes:'SKF brand' },
  { id:'73', partNumber:'BRG-SKF-3206', name:'Bearing 3206 SKF',              category:'Bearings & Seals',        manufacturer:'UNIVERSAL ENTERPRISES',       unit:'Each',   unitCost:3684,   reorderLevel:2,  notes:'' },
  { id:'74', partNumber:'BRG-SKF-NU2306',name:'Bearing NU2306 SKF',           category:'Bearings & Seals',        manufacturer:'AMOGH ENTERPRISES',           unit:'Each',   unitCost:4449,   reorderLevel:2,  notes:'' },
  { id:'75', partNumber:'BRG-SKF-6212', name:'Bearing 6212 SKF',              category:'Bearings & Seals',        manufacturer:'AMOGH ENTERPRISES',           unit:'Each',   unitCost:837,    reorderLevel:2,  notes:'' },
  { id:'76', partNumber:'BRG-NAS5010',  name:'Bearing NAS 5010 UUNR',         category:'Bearings & Seals',        manufacturer:'AMOGH ENTERPRISES',           unit:'Each',   unitCost:4950,   reorderLevel:2,  notes:'' },
  { id:'77', partNumber:'SEL-OS-58709', name:'Top Cover Oil Seal 58709 SKF',  category:'Bearings & Seals',        manufacturer:'UNIVERSAL ENTERPRISES',       unit:'Each',   unitCost:7946,   reorderLevel:4,  notes:'' },
  { id:'78', partNumber:'SEL-SS-99587', name:'Speedi Sleeve 99587 SKF',       category:'Bearings & Seals',        manufacturer:'UNIVERSAL ENTERPRISES',       unit:'Each',   unitCost:9367,   reorderLevel:2,  notes:'' },
  { id:'79', partNumber:'BRG-SHL-001',  name:'Bearing Insert / Shell Bearing',category:'Bearings & Seals',        manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:9650,   reorderLevel:2,  notes:'Part No: 1280910/514965' },
  { id:'80', partNumber:'BRG-BAL-RT',   name:'Ball Bearing (Rocktek)',        category:'Bearings & Seals',        manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:6690,   reorderLevel:2,  notes:'' },

  // HOSES & HYDRAULICS
  { id:'81', partNumber:'HSE-1IN-34FT', name:'Hose Pipe 1" x 34 Feet',       category:'Hoses & Hydraulics',      manufacturer:'M.S. ENTERPRISES (MSE)',      unit:'Each',   unitCost:14385,  reorderLevel:4,  notes:'' },
  { id:'82', partNumber:'HSE-QIN-20FT', name:'Hose Pipe 1/4" x 20 Feet',     category:'Hoses & Hydraulics',      manufacturer:'M.S. ENTERPRISES (MSE)',      unit:'Each',   unitCost:1800,   reorderLevel:4,  notes:'' },
  { id:'83', partNumber:'HSE-HIN-18FT', name:'Hose 1/2" MH174 x 18.5 Ft',   category:'Hoses & Hydraulics',      manufacturer:'M.S. ENTERPRISES (MSE)',      unit:'Each',   unitCost:4907,   reorderLevel:4,  notes:'' },
  { id:'84', partNumber:'HSE-TIN-20FT', name:'Hose 3/4" x 20 Ft',            category:'Hoses & Hydraulics',      manufacturer:'M.S. ENTERPRISES (MSE)',      unit:'Each',   unitCost:5880,   reorderLevel:4,  notes:'' },
  { id:'85', partNumber:'BLV-1IN-001',  name:'Ball Valve 1"',                 category:'Hoses & Hydraulics',      manufacturer:'BOMBAY PIPE',                 unit:'Each',   unitCost:1844,   reorderLevel:6,  notes:'' },
  { id:'86', partNumber:'BLV-HIN-001',  name:'Ball Valve Flowcon 1/2" Scrd', category:'Hoses & Hydraulics',      manufacturer:'BOMBAY PIPE',                 unit:'Each',   unitCost:852,    reorderLevel:6,  notes:'' },
  { id:'87', partNumber:'HMP-HYD-001',  name:'Hydraulic Main Pump (Repaired)',category:'Hoses & Hydraulics',      manufacturer:'Custom / Other',              unit:'Each',   unitCost:0,      reorderLevel:1,  notes:'Repair/rebuild item' },
  { id:'88', partNumber:'HSE-HMP-3IN',  name:'Hump Hose 3" x 18"',           category:'Hoses & Hydraulics',      manufacturer:'M.S. ENTERPRISES (MSE)',      unit:'Each',   unitCost:2090,   reorderLevel:2,  notes:'' },

  // LUBRICANTS & GREASES
  { id:'89', partNumber:'LUB-TCZ50',    name:'TCZ-50 Grease 25 KG',           category:'Lubricants & Greases',    manufacturer:'SPECIALITY LUBRICANTS',       unit:'Kg',     unitCost:12500,  reorderLevel:4,  notes:'High-temp grease' },
  { id:'90', partNumber:'LUB-MDE-4W',   name:'Mach Drive Nanoenergiser 4W',   category:'Lubricants & Greases',    manufacturer:'KARTIKAY INNOVISION',         unit:'Each',   unitCost:700,    reorderLevel:6,  notes:'' },

  // DRIVE & TRANSMISSION
  { id:'91', partNumber:'DRV-DSH-001',  name:'Drive Shaft',                   category:'Drive & Transmission',    manufacturer:'YASH GEAR',                   unit:'Each',   unitCost:19063,  reorderLevel:2,  notes:'' },
  { id:'92', partNumber:'DRV-CGR-001',  name:'Cluster Gear 20/32 Teeth',      category:'Drive & Transmission',    manufacturer:'YASH GEAR',                   unit:'Each',   unitCost:18547,  reorderLevel:2,  notes:'' },
  { id:'93', partNumber:'DRV-DTI-001',  name:'Drive Tip',                     category:'Drive & Transmission',    manufacturer:'MINAR-HYDRO',                 unit:'Each',   unitCost:1101,   reorderLevel:4,  notes:'' },
  { id:'94', partNumber:'DRV-SPA-001',  name:'Spline Adaptor Key Way',        category:'Drive & Transmission',    manufacturer:'MINAR-HYDRO',                 unit:'Each',   unitCost:11200,  reorderLevel:2,  notes:'Part No: M-141/25-26' },
  { id:'95', partNumber:'DRV-SPA-BN',   name:'Spline Adaptor for Bean Pump',  category:'Drive & Transmission',    manufacturer:'MINAR-HYDRO',                 unit:'Each',   unitCost:10850,  reorderLevel:2,  notes:'' },
  { id:'96', partNumber:'DRV-VBT-001',  name:'V-Belt',                        category:'Drive & Transmission',    manufacturer:'AMOGH ENTERPRISES',           unit:'Each',   unitCost:990,    reorderLevel:4,  notes:'' },
  { id:'97', partNumber:'DRV-FAN-JD',   name:'Fan JD (RE500538)',              category:'Drive & Transmission',    manufacturer:'CORNIER PVT. LTD.',           unit:'Each',   unitCost:48151,  reorderLevel:1,  notes:'Part No: RE500538' },
  { id:'98', partNumber:'DRV-ENG-GKT',  name:'Engine Cylinder Head Gasket',   category:'Drive & Transmission',    manufacturer:'KHEMKA MOTORS',               unit:'Each',   unitCost:5976,   reorderLevel:2,  notes:'Part No: R116516' },
  { id:'99', partNumber:'DRV-CER-LNR',  name:'Ceramic Cylinder Liner 2¾"',   category:'Drive & Transmission',    manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:20900,  reorderLevel:4,  notes:'W11 pump' },

  // RODS, CASINGS & SUBS
  { id:'100',partNumber:'HQ-ROD-3M',    name:'HQ Drill Rod 3.0 MTR',          category:'Rods, Casings & Subs',    manufacturer:'VPM (VIDARBHA PNU)',           unit:'MTR',    unitCost:0,      reorderLevel:10, notes:'Tracked as old stock' },
  { id:'101',partNumber:'HQ-ROD-1M',    name:'HQ Rod 1.0 MTR Long',           category:'Rods, Casings & Subs',    manufacturer:'VPM (VIDARBHA PNU)',           unit:'Each',   unitCost:2494,   reorderLevel:6,  notes:'' },
  { id:'102',partNumber:'HQ-ROD-60CM',  name:'HQ Rod 0.60 MTR Long',          category:'Rods, Casings & Subs',    manufacturer:'VPM (VIDARBHA PNU)',           unit:'Each',   unitCost:1850,   reorderLevel:4,  notes:'' },
  { id:'103',partNumber:'HW-CAS-1M',    name:'HW Casing 1.0 MTR Long',        category:'Rods, Casings & Subs',    manufacturer:'VPM (VIDARBHA PNU)',           unit:'Each',   unitCost:5250,   reorderLevel:6,  notes:'' },
  { id:'104',partNumber:'HW-CAS-60CM',  name:'HW Casing 0.60 MTR Long',       category:'Rods, Casings & Subs',    manufacturer:'VPM (VIDARBHA PNU)',           unit:'Each',   unitCost:3650,   reorderLevel:6,  notes:'' },
  { id:'105',partNumber:'NQ-SP-130CM',  name:'NQ Short Piece 1.30 MTR',       category:'Rods, Casings & Subs',    manufacturer:'VPM (VIDARBHA PNU)',           unit:'Each',   unitCost:3200,   reorderLevel:2,  notes:'' },
  { id:'106',partNumber:'SUB-BW-HQ',    name:'Sub BW R/P to HQ R/P',          category:'Rods, Casings & Subs',    manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:5800,   reorderLevel:2,  notes:'' },
  { id:'107',partNumber:'SUB-NQ-BW',    name:'Sub NQ R/P to BW R/P',          category:'Rods, Casings & Subs',    manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:4950,   reorderLevel:2,  notes:'' },
  { id:'108',partNumber:'SUB-HQ-HW',    name:'Sub HQ R/B to HW R/P',          category:'Rods, Casings & Subs',    manufacturer:'K. VADILAL',                  unit:'Each',   unitCost:5700,   reorderLevel:2,  notes:'' },
  { id:'109',partNumber:'ADP-AW-NQ',    name:'Adaptor Sub AW Pin to NQ W/L Pin',category:'Rods, Casings & Subs',  manufacturer:'VPM (VIDARBHA PNU)',           unit:'Each',   unitCost:1572,   reorderLevel:2,  notes:'' },
  { id:'110',partNumber:'WRP-6MM',      name:'Wire Rope 6MM x 1000 MTR',      category:'Rods, Casings & Subs',    manufacturer:'SR INFO',                     unit:'Each',   unitCost:64000,  reorderLevel:1,  notes:'' },
  { id:'111',partNumber:'WRP-16MM',     name:'Wire Rope 16MM x 24 MTR',       category:'Rods, Casings & Subs',    manufacturer:'SR INFO',                     unit:'Each',   unitCost:11424,  reorderLevel:2,  notes:'' },
  { id:'112',partNumber:'REC-TAP-HQ',   name:'Rec Tap HQ L/H to NW L/H Box',  category:'Rods, Casings & Subs',    manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:13100,  reorderLevel:2,  notes:'' },

  // HARDWARE & CONSUMABLES
  { id:'113',partNumber:'HW-ABT-H05',   name:'Allen Bolt CSK 1/2 x 1.5" BSW', category:'Hardware & Consumables',  manufacturer:'VISHAL ENGG & MILL STORES',   unit:'Each',   unitCost:68,     reorderLevel:20, notes:'' },
  { id:'114',partNumber:'HW-NLN-H05',   name:'Nylock Nut BSW 1/2',            category:'Hardware & Consumables',  manufacturer:'VISHAL ENGG & MILL STORES',   unit:'Each',   unitCost:17,     reorderLevel:20, notes:'' },
  { id:'115',partNumber:'HW-HBT-3X1',   name:'Hex Bolt UNC 3/8" x 1"',        category:'Hardware & Consumables',  manufacturer:'VISHAL ENGG & MILL STORES',   unit:'Each',   unitCost:10,     reorderLevel:20, notes:'' },
  { id:'116',partNumber:'HW-HBT-7X5',   name:'Hex Bolt UNC 7/16 x 5"',        category:'Hardware & Consumables',  manufacturer:'VISHAL ENGG & MILL STORES',   unit:'Each',   unitCost:47,     reorderLevel:20, notes:'' },
  { id:'117',partNumber:'HW-DWP-H2',    name:'Solid Dowel Pin 1/2" x 2"',     category:'Hardware & Consumables',  manufacturer:'AMKO',                        unit:'Each',   unitCost:117,    reorderLevel:20, notes:'' },
  { id:'118',partNumber:'HW-SPR-H2',    name:'Spring Pin 1/2" x 2"',          category:'Hardware & Consumables',  manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:260,    reorderLevel:10, notes:'' },
  { id:'119',partNumber:'HW-SPI-37',    name:'Spiral Pin (37394RT)',           category:'Hardware & Consumables',  manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:320,    reorderLevel:10, notes:'' },
  { id:'120',partNumber:'HW-DTE-001',   name:'Duct Tape',                      category:'Hardware & Consumables',  manufacturer:'BENAZ ENTERPRISES',           unit:'Each',   unitCost:425,    reorderLevel:10, notes:'High usage' },
  { id:'121',partNumber:'HW-BFC-SM',    name:'Bolt PIC Foot Clamp Jaw Small', category:'Hardware & Consumables',  manufacturer:'VISHAL ENGG & MILL STORES',   unit:'Each',   unitCost:72,     reorderLevel:10, notes:'' },
  { id:'122',partNumber:'HW-NUT-8309',  name:'Nut 8309',                       category:'Hardware & Consumables',  manufacturer:'ROCKTEK',                     unit:'Each',   unitCost:650,    reorderLevel:6,  notes:'' },
  { id:'123',partNumber:'HW-MLT-001',   name:'Mallet Hammer',                  category:'Hardware & Consumables',  manufacturer:'BENAZ ENTERPRISES',           unit:'Each',   unitCost:499,    reorderLevel:2,  notes:'' },

  // WORKSHOP & REPAIR TOOLS
  { id:'124',partNumber:'TL-HQ-ITW',    name:'HQ Inner Tube Spanner',         category:'Workshop & Repair Tools', manufacturer:'DHANBAD ENGINEERING',         unit:'Each',   unitCost:6250,   reorderLevel:2,  notes:'' },
  { id:'125',partNumber:'TL-NQ-ITW',    name:'NQ Inner Tube Wrench',          category:'Workshop & Repair Tools', manufacturer:'DHANBAD ENGINEERING',         unit:'Each',   unitCost:5950,   reorderLevel:2,  notes:'' },
  { id:'126',partNumber:'TL-PWR-24',    name:'Pipe Wrench 24"',               category:'Workshop & Repair Tools', manufacturer:'SR INFO',                     unit:'Each',   unitCost:6016,   reorderLevel:1,  notes:'' },

  // ELECTRICAL & INSTRUMENTATION
  { id:'127',partNumber:'ELC-SS-001',   name:'Self Starter',                   category:'Electrical & Instrumentation', manufacturer:'Custom / Other',         unit:'Each',   unitCost:0,      reorderLevel:1,  notes:'Old stock tracked' },
]

// ── EXCEL TEMPLATE COLUMNS ─────────────────────────────────────────────────
const TEMPLATE_HEADERS = ['Part Number', 'Part Name', 'Category', 'Manufacturer', 'Unit', 'Unit Cost', 'Reorder Level', 'Notes']

// ── SUB-NAV ────────────────────────────────────────────────────────────────
const subNav = [
  { href: '/admin/inventory',                 label: 'Dashboard'        },
  { href: '/admin/inventory/catalogue',       label: 'Parts Catalogue'  },
  { href: '/admin/inventory/stock',           label: 'Stock Management' },
  { href: '/admin/inventory/purchase-orders', label: 'Purchase Orders'  },
]

function SubNav({ active }: { active: string }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: '#080B10', border: '1px solid #1E293B', borderRadius: 12, padding: 4 }}>
      {subNav.map(n => (
        <Link key={n.href} href={n.href} style={{ padding: '7px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s', background: active === n.label ? '#F97316' : 'transparent', color: active === n.label ? '#fff' : '#94A3B8' }}>{n.label}</Link>
      ))}
    </div>
  )
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', background: '#080B10', border: '1px solid #3B82F6', borderRadius: 8, color: '#F8FAFC', fontSize: 12, outline: 'none', fontFamily: 'inherit' }
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer', appearance: 'none' as any }
const S = {
  card: { background: '#0D1117', border: '1px solid #1E293B', borderRadius: 16 },
  label: { fontSize: 10, fontWeight: 700, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase' as const },
}

// ── PAGE ───────────────────────────────────────────────────────────────────
export default function PartsCataloguePage() {
  const { format, currency } = useCurrency()
  const [parts, setParts] = useState<Part[]>(seedParts)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [categories, setCategories] = useState(defaultCategories)
  const [manufacturers, setManufacturers] = useState(defaultManufacturers)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importPreview, setImportPreview] = useState<Part[]>([])
  const [importStatus, setImportStatus] = useState<'idle' | 'preview' | 'success'>('idle')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Filtered parts ──
  const filtered = parts.filter(p =>
    (filterCat === 'All' || p.category === filterCat) &&
    (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.partNumber.toLowerCase().includes(search.toLowerCase()) || p.manufacturer.toLowerCase().includes(search.toLowerCase()))
  )

  // ── CRUD ──
  const addPart = () => {
    const newPart: Part = { id: Date.now().toString(), partNumber: '', name: '', category: categories[0], manufacturer: manufacturers[0], unit: 'Each', unitCost: 0, reorderLevel: 5, notes: '', editing: true }
    setParts(p => [newPart, ...p])
  }
  const savePart = (id: string) => setParts(p => p.map(x => x.id === id ? { ...x, editing: false } : x))
  const editPart = (id: string) => setParts(p => p.map(x => ({ ...x, editing: x.id === id })))
  const deletePart = (id: string) => setParts(p => p.filter(x => x.id !== id))
  const updatePart = (id: string, field: keyof Part, value: any) => setParts(p => p.map(x => x.id === id ? { ...x, [field]: value } : x))

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(c => [...c, newCategory.trim()])
      setNewCategory('')
      setShowAddCategory(false)
    }
  }

  // ── Download Template ──
  const downloadTemplate = () => {
    const csvRows = [
      TEMPLATE_HEADERS.join(','),
      'NQ-CB-SR06,NQ Core Bit SR-06,Core Bits,IDP (Ideal Diamond Products),Each,11500,10,',
      'MTX-DD955,MATEX DD955 Liquid,Drilling Fluids & Chemicals,WESTFIELDS SERVICES,Bucket,12151,15,Drilling fluid',
    ].join('\n')
    const blob = new Blob([csvRows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'xplorix_parts_template.csv'; a.click()
  }

  // ── Export ──
  const exportCatalogue = () => {
    const rows = [TEMPLATE_HEADERS.join(','), ...parts.map(p => [p.partNumber, `"${p.name}"`, p.category, p.manufacturer, p.unit, p.unitCost, p.reorderLevel, `"${p.notes}"`].join(','))]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'xplorix_parts_catalogue.csv'; a.click()
  }

  // ── Parse Uploaded CSV ──
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      const lines = text.trim().split('\n').slice(1)
      const parsed: Part[] = lines.filter(l => l.trim()).map((line, i) => {
        const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim())
        return { id: `import_${i}_${Date.now()}`, partNumber: cols[0] || '', name: cols[1] || '', category: cols[2] || categories[0], manufacturer: cols[3] || '', unit: cols[4] || 'Each', unitCost: parseFloat(cols[5]) || 0, reorderLevel: parseInt(cols[6]) || 5, notes: cols[7] || '' }
      })
      setImportPreview(parsed)
      setImportStatus('preview')
    }
    reader.readAsText(file)
  }

  const confirmImport = (mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      setParts(importPreview)
    } else {
      const existing = new Set(parts.map(p => p.partNumber))
      const newOnes = importPreview.filter(p => !existing.has(p.partNumber))
      setParts(prev => [...prev, ...newOnes])
    }
    setImportStatus('success')
    setTimeout(() => { setShowImportModal(false); setImportStatus('idle'); setImportPreview([]) }, 1500)
  }

  // Category color map
  const catColor: Record<string, string> = {
    'Core Bits': '#F97316', 'Core Barrel Assembly': '#10B981', 'Reaming Shells': '#3B82F6',
    'Drilling Fluids & Chemicals': '#8B5CF6', 'Filtration': '#F59E0B', 'Seals & Packings': '#EF4444',
    'Bearings & Seals': '#06B6D4', 'Hoses & Hydraulics': '#84CC16', 'Lubricants & Greases': '#EC4899',
    'Drive & Transmission': '#F97316', 'Rods, Casings & Subs': '#94A3B8', 'Safety & PPE': '#10B981',
    'Workshop & Repair Tools': '#F59E0B', 'Hardware & Consumables': '#64748B', 'Electrical & Instrumentation': '#60A5FA',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: '#F8FAFC' }}>Parts Catalogue</h1>
          <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Universal master parts list — 15 standard categories covering all drilling operations</p>
        </div>
        <SubNav active="Parts Catalogue" />
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', ...S.card, padding: '14px 20px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parts, part numbers, manufacturers..."
            style={{ width: '100%', padding: '8px 12px 8px 30px', background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', borderRadius: 8, color: '#F8FAFC', fontSize: 13, outline: 'none' }} />
        </div>
        <div style={{ position: 'relative' }}>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            style={{ appearance: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#F8FAFC', fontSize: 13, padding: '8px 28px 8px 12px', borderRadius: 8, cursor: 'pointer', outline: 'none' }}>
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button onClick={() => setShowImportModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60A5FA', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Upload size={14} /> Import Excel/CSV
          </button>
          <button onClick={exportCatalogue}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Download size={14} /> Export
          </button>
          <button onClick={() => setShowAddCategory(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#8B5CF6', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={14} /> Add Category
          </button>
          <button onClick={addPart}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 9, background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', boxShadow: '0 4px 20px rgba(249,115,22,0.25)' }}>
            <Plus size={14} /> Add Part
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button onClick={() => setFilterCat('All')}
          style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: filterCat === 'All' ? '#F97316' : 'rgba(255,255,255,0.04)', color: filterCat === 'All' ? '#fff' : '#94A3B8', transition: 'all 0.2s' }}>
          All ({parts.length})
        </button>
        {categories.map(c => {
          const count = parts.filter(p => p.category === c).length
          if (count === 0) return null
          const color = catColor[c] || '#64748B'
          return (
            <button key={c} onClick={() => setFilterCat(c)}
              style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                background: filterCat === c ? `${color}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${filterCat === c ? color + '40' : '#1E293B'}`,
                color: filterCat === c ? color : '#64748B',
              }}>
              {c} ({count})
            </button>
          )
        })}
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Total Parts',    value: parts.length,                                           color: '#60A5FA' },
          { label: 'Categories',     value: new Set(parts.map(p => p.category)).size,               color: '#F97316' },
          { label: 'Manufacturers',  value: new Set(parts.map(p => p.manufacturer)).size,           color: '#10B981' },
          { label: 'Catalogue Value',value: `${currency.symbol}${parts.reduce((s, p) => s + p.unitCost, 0).toLocaleString()}`, color: '#8B5CF6' },
        ].map((s, i) => (
          <div key={i} style={{ ...S.card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ ...S.card, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1E293B', background: 'rgba(255,255,255,0.02)' }}>
              {['Part Number', 'Name', 'Category', 'Manufacturer', 'Unit', 'Unit Cost', 'Reorder Lvl', 'Notes', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B', fontSize: 14 }}>No parts found. Add a part or import from Excel.</td></tr>
            )}
            {filtered.map(p => {
              const color = catColor[p.category] || '#64748B'
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(30,41,59,0.5)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.015)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '10px 16px' }}>
                    {p.editing ? <input style={inputStyle} value={p.partNumber} placeholder="Part No" onChange={e => updatePart(p.id, 'partNumber', e.target.value)} />
                      : <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#94A3B8', background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: 5 }}>{p.partNumber}</span>}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    {p.editing ? <input style={{ ...inputStyle, minWidth: 180 }} value={p.name} placeholder="Part name" onChange={e => updatePart(p.id, 'name', e.target.value)} />
                      : <span style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC' }}>{p.name}</span>}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    {p.editing ? (
                      <select style={{ ...selectStyle, minWidth: 160 }} value={p.category} onChange={e => updatePart(p.id, 'category', e.target.value)}>
                        {categories.map(c => <option key={c}>{c}</option>)}
                      </select>
                    ) : <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: `${color}18`, color, border: `1px solid ${color}30`, whiteSpace: 'nowrap' }}>{p.category}</span>}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    {p.editing ? (
                      <select style={{ ...selectStyle, minWidth: 130 }} value={p.manufacturer} onChange={e => updatePart(p.id, 'manufacturer', e.target.value)}>
                        {manufacturers.map(m => <option key={m}>{m}</option>)}
                      </select>
                    ) : <span style={{ fontSize: 12, color: '#94A3B8' }}>{p.manufacturer}</span>}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    {p.editing ? (
                      <select style={{ ...selectStyle, width: 80 }} value={p.unit} onChange={e => updatePart(p.id, 'unit', e.target.value)}>
                        {defaultUnits.map(u => <option key={u}>{u}</option>)}
                      </select>
                    ) : <span style={{ fontSize: 12, color: '#94A3B8' }}>{p.unit}</span>}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    {p.editing ? <input style={{ ...inputStyle, width: 100 }} type="number" value={p.unitCost} onChange={e => updatePart(p.id, 'unitCost', parseFloat(e.target.value) || 0)} />
                      : <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>{p.unitCost > 0 ? format(p.unitCost) : '—'}</span>}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    {p.editing ? <input style={{ ...inputStyle, width: 70 }} type="number" value={p.reorderLevel} onChange={e => updatePart(p.id, 'reorderLevel', parseInt(e.target.value) || 0)} />
                      : <span style={{ fontSize: 12, color: '#94A3B8' }}>{p.reorderLevel}</span>}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    {p.editing ? <input style={{ ...inputStyle, minWidth: 120 }} value={p.notes} placeholder="Notes..." onChange={e => updatePart(p.id, 'notes', e.target.value)} />
                      : <span style={{ fontSize: 11, color: '#64748B' }}>{p.notes || '—'}</span>}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {p.editing ? (
                        <>
                          <button onClick={() => savePart(p.id)} style={{ padding: 6, borderRadius: 7, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', cursor: 'pointer' }}><Check size={13} /></button>
                          <button onClick={() => savePart(p.id)} style={{ padding: 6, borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#64748B', cursor: 'pointer' }}><X size={13} /></button>
                        </>
                      ) : (
                        <button onClick={() => editPart(p.id)} style={{ padding: 6, borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#64748B', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F8FAFC'; (e.currentTarget as HTMLElement).style.borderColor = '#334155' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748B'; (e.currentTarget as HTMLElement).style.borderColor = '#1E293B' }}
                        ><Edit2 size={13} /></button>
                      )}
                      <button onClick={() => deletePart(p.id)} style={{ padding: 6, borderRadius: 7, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', color: 'rgba(239,68,68,0.5)', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EF4444'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(239,68,68,0.5)'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.05)' }}
                      ><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid #1E293B', background: 'rgba(255,255,255,0.02)' }}>
              <td colSpan={5} style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>{filtered.length} parts shown</td>
              <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 800, color: '#10B981' }}>
                {format(filtered.reduce((s, p) => s + p.unitCost, 0))} avg
              </td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Add Category Modal */}
      {showAddCategory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#0D1117', border: '1px solid #1E293B', borderRadius: 16, padding: 28, width: 400 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', marginBottom: 16 }}>Add Custom Category</div>
            <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="e.g. Explosives, Water Well Equipment..." onKeyDown={e => e.key === 'Enter' && addCategory()}
              style={{ width: '100%', padding: '10px 12px', background: '#080B10', border: '1px solid #1E293B', borderRadius: 8, color: '#F8FAFC', fontSize: 13, outline: 'none', marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowAddCategory(false)} style={{ flex: 1, padding: '10px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#94A3B8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={addCategory} style={{ flex: 1, padding: '10px', borderRadius: 9, background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none' }}>Add Category</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0D1117', border: '1px solid #1E293B', borderRadius: 20, padding: 32, maxWidth: 680, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            {importStatus === 'success' ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#10B981' }}>Import Successful!</div>
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 8 }}>Parts catalogue has been updated.</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC', fontFamily: "'Space Grotesk',sans-serif" }}>Import Parts Catalogue</div>
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Upload CSV or Excel · or paste opening balance data</div>
                  </div>
                  <button onClick={() => { setShowImportModal(false); setImportStatus('idle'); setImportPreview([]) }} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid #1E293B', color: '#64748B', cursor: 'pointer' }}><X size={16} /></button>
                </div>
                {importStatus === 'idle' && (
                  <>
                    <div style={{ padding: 16, borderRadius: 12, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FileSpreadsheet size={20} style={{ color: '#60A5FA' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC' }}>First time? Download the template</div>
                          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Fill in your parts data and upload below</div>
                        </div>
                        <button onClick={downloadTemplate}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', color: '#60A5FA', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          <Download size={13} /> Download Template
                        </button>
                      </div>
                    </div>
                    <div
                      onClick={() => fileRef.current?.click()}
                      style={{ border: '2px dashed #1E293B', borderRadius: 12, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,115,22,0.4)'; (e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,0.02)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1E293B'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    >
                      <Upload size={28} style={{ color: '#64748B', margin: '0 auto 12px' }} />
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#F8FAFC' }}>Click to upload CSV or Excel</div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Supported: .csv, .xlsx, .xls</div>
                      <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleFileUpload} />
                    </div>
                  </>
                )}
                {importStatus === 'preview' && importPreview.length > 0 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', marginBottom: 16 }}>
                      <Check size={14} style={{ color: '#10B981' }} />
                      <span style={{ fontSize: 13, color: '#10B981', fontWeight: 600 }}>{importPreview.length} parts found. Preview below.</span>
                    </div>
                    <div style={{ overflowX: 'auto', maxHeight: 300, overflowY: 'auto', border: '1px solid #1E293B', borderRadius: 10, marginBottom: 20 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#111827' }}>
                          <tr>{['Part No', 'Name', 'Category', 'Manufacturer', 'Unit', 'Cost', 'Reorder'].map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, color: '#64748B', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid #1E293B', whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {importPreview.slice(0, 20).map((p, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(30,41,59,0.5)' }}>
                              <td style={{ padding: '7px 12px', color: '#94A3B8', fontFamily: 'monospace' }}>{p.partNumber}</td>
                              <td style={{ padding: '7px 12px', color: '#F8FAFC', fontWeight: 600 }}>{p.name}</td>
                              <td style={{ padding: '7px 12px', color: '#60A5FA' }}>{p.category}</td>
                              <td style={{ padding: '7px 12px', color: '#94A3B8' }}>{p.manufacturer}</td>
                              <td style={{ padding: '7px 12px', color: '#64748B' }}>{p.unit}</td>
                              <td style={{ padding: '7px 12px', color: '#10B981' }}>{p.unitCost.toLocaleString()}</td>
                              <td style={{ padding: '7px 12px', color: '#64748B' }}>{p.reorderLevel}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <button onClick={() => confirmImport('merge')}
                        style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        ➕ Merge with Existing<br /><span style={{ fontSize: 11, fontWeight: 400, opacity: 0.7 }}>Adds new parts, skips duplicates</span>
                      </button>
                      <button onClick={() => confirmImport('replace')}
                        style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: '#F97316', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        🔄 Replace All<br /><span style={{ fontSize: 11, fontWeight: 400, opacity: 0.7 }}>Replaces entire catalogue</span>
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

