export interface InventoryItem {
  code: string;
  name: string;
  category: string;
  unit: string;
  reorderLevel: number;
  // Dynamic computed fields
  totalPurchasedQty: number;
  totalSoldQty: number;
  damagedQty: number;
  availableQty: number;
  avcoUnitCost: number;
  fifoUnitCost: number;
  lastPurchasePrice: number;
  standardSellingPrice: number;
  // Valuation
  avcoValuation: number;
  fifoValuation: number;
}

export interface PurchaseBatch {
  id: string;
  invoiceNo: string;
  date: string; // YYYY-MM-DD
  itemCode: string;
  supplier: string;
  qty: number;
  unitValue: number; // Unit purchase price
  totalValue: number;
  // Landed cost components
  freightCost?: number;
  customsDuty?: number;
  handlingCost?: number;
  totalLandedCost?: number;
  landedUnitCost?: number;
  // FIFO tracking fields
  remainingQty: number;
  status: 'active' | 'depleted';
}

export interface SaleRecord {
  id: string;
  invoiceNo: string;
  date: string; // YYYY-MM-DD
  itemCode: string;
  customer: string;
  qty: number;
  unitValue: number; // Unit selling price
  totalValue: number;
  // Financial analysis
  fifoCogs: number;
  avcoCogs: number;
  grossProfitFifo: number;
  grossProfitAvco: number;
  marginPercentFifo: number;
  marginPercentAvco: number;
  // FIFO Lot depletion traces
  consumedLayers?: Array<{
    batchId: string;
    batchInvoiceNo: string;
    batchDate: string;
    qtyConsumed: number;
    unitCost: number;
  }>;
}

export type DamageReason =
  | 'Transit Defect'
  | 'Handling Damage'
  | 'Water / Moisture'
  | 'Manufacturing Flaw'
  | 'Deterioration / Age'
  | 'Customer Return - Damaged';

export type DamageAction =
  | 'Written Off / Scrapped'
  | 'Quarantined for Review'
  | 'Returned to Vendor'
  | 'Salvage Sale';

export interface DamagedItemRecord {
  id: string;
  itemCode: string;
  date: string;
  qtyDamaged: number;
  reason: DamageReason;
  action: DamageAction;
  batchRef?: string;
  unitCostAtDamage: number;
  salvageValueRecovered: number;
  netLoss: number;
  loggedBy: string;
  notes?: string;
}

export type IDFClassification = 'Fast Moving' | 'Slow Moving' | 'Non Moving';

export interface IDFMetrics {
  itemCode: string;
  classification: IDFClassification;
  turnoverRatio: number;
  daysSalesOfInventory: number;
  salesVelocityPerDay: number;
  salesVelocityPerMonth: number;
  lastSaleDate?: string;
  daysSinceLastSale: number;
  capitalTiedUp: number;
  recommendation: string;
}

export interface LandedCostingParams {
  itemCode: string;
  basePurchaseCost: number;
  freightPerUnit: number;
  customsDutyPercent: number;
  insuranceAndHandling: number;
  targetMarkupPercent: number;
  actualSellingPrice: number;
}

export interface LandedCostBreakdown {
  baseCost: number;
  freightCost: number;
  customsDuty: number;
  insuranceHandling: number;
  totalLandedCost: number;
  targetSellingPrice: number;
  actualSellingPrice: number;
  grossProfitMargin: number;
  markupPercent: number;
  breakEvenUnits: number;
}
