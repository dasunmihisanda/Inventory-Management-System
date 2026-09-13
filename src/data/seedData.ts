import { InventoryItem, PurchaseBatch, SaleRecord, DamagedItemRecord, LandedCostingParams } from '../types/inventory';

// Clean initial state with no sample data
export const INITIAL_ITEMS: Omit<
  InventoryItem,
  | 'totalPurchasedQty'
  | 'totalSoldQty'
  | 'damagedQty'
  | 'availableQty'
  | 'avcoUnitCost'
  | 'fifoUnitCost'
  | 'lastPurchasePrice'
  | 'avcoValuation'
  | 'fifoValuation'
>[] = [];

export const INITIAL_PURCHASES: PurchaseBatch[] = [];

export const INITIAL_SALES: SaleRecord[] = [];

export const INITIAL_DAMAGED_ITEMS: DamagedItemRecord[] = [];

export const INITIAL_COSTING_PARAMS: Record<string, LandedCostingParams> = {};
