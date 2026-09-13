import { supabase } from './supabase';
import {
  InventoryItem,
  PurchaseBatch,
  SaleRecord,
  DamagedItemRecord,
  LandedCostingParams,
} from '@/types/inventory';

export interface SupabaseSyncData {
  items: Array<Omit<InventoryItem, 'totalPurchasedQty' | 'totalSoldQty' | 'damagedQty' | 'availableQty' | 'avcoUnitCost' | 'fifoUnitCost' | 'lastPurchasePrice' | 'avcoValuation' | 'fifoValuation'>>;
  purchases: PurchaseBatch[];
  sales: SaleRecord[];
  damagedItems: DamagedItemRecord[];
  costingParams: Record<string, LandedCostingParams>;
}

/**
 * Fetch all inventory datasets from Supabase tables
 */
export async function fetchFromSupabase(): Promise<SupabaseSyncData | null> {
  if (!supabase) return null;

  try {
    const [itemsRes, purchasesRes, salesRes, damagedRes, costingRes] = await Promise.all([
      supabase.from('inventory_items').select('*'),
      supabase.from('purchase_batches').select('*').order('date', { ascending: false }),
      supabase.from('sales_records').select('*').order('date', { ascending: false }),
      supabase.from('damaged_items').select('*').order('date', { ascending: false }),
      supabase.from('landed_costing_params').select('*'),
    ]);

    if (itemsRes.error || purchasesRes.error || salesRes.error || damagedRes.error || costingRes.error) {
      console.warn('Supabase fetch returned partial errors:', {
        itemsError: itemsRes.error,
        purchasesError: purchasesRes.error,
        salesError: salesRes.error,
        damagedError: damagedRes.error,
        costingError: costingRes.error,
      });
    }

    const items = (itemsRes.data || []).map((row: any) => ({
      code: row.code,
      name: row.name,
      category: row.category || 'General',
      unit: row.unit || 'Units',
      reorderLevel: Number(row.reorder_level) || 10,
      standardSellingPrice: Number(row.standard_selling_price) || 0,
    }));

    const purchases: PurchaseBatch[] = (purchasesRes.data || []).map((row: any) => ({
      id: row.id,
      invoiceNo: row.invoice_no,
      date: row.date,
      itemCode: row.item_code,
      supplier: row.supplier,
      qty: Number(row.qty),
      unitValue: Number(row.unit_value),
      totalValue: Number(row.total_value),
      freightCost: Number(row.freight_cost) || 0,
      customsDuty: Number(row.customs_duty) || 0,
      handlingCost: Number(row.handling_cost) || 0,
      totalLandedCost: Number(row.total_landed_cost) || Number(row.total_value),
      landedUnitCost: Number(row.landed_unit_cost) || Number(row.unit_value),
      remainingQty:
        row.remaining_qty !== null && row.remaining_qty !== undefined
          ? Number(row.remaining_qty)
          : Number(row.qty),
      status: (row.status ||
        (Number(row.remaining_qty) === 0 ? 'depleted' : 'active')) as 'active' | 'depleted',
    }));

    const sales: SaleRecord[] = (salesRes.data || []).map((row: any) => ({
      id: row.id,
      invoiceNo: row.invoice_no,
      date: row.date,
      itemCode: row.item_code,
      customer: row.customer,
      qty: Number(row.qty),
      unitValue: Number(row.unit_value),
      totalValue: Number(row.total_value),
      fifoCogs: Number(row.fifo_cogs) || 0,
      avcoCogs: Number(row.avco_cogs) || 0,
      grossProfitFifo: Number(row.gross_profit_fifo) || 0,
      grossProfitAvco: Number(row.gross_profit_avco) || 0,
      marginPercentFifo: Number(row.margin_percent_fifo) || 0,
      marginPercentAvco: Number(row.margin_percent_avco) || 0,
      consumedLayers: row.consumed_layers || [],
    }));

    const damagedItems: DamagedItemRecord[] = (damagedRes.data || []).map((row: any) => ({
      id: row.id,
      date: row.date,
      itemCode: row.item_code,
      qtyDamaged: Number(row.qty_damaged),
      reason: row.reason,
      action: row.action,
      batchRef: row.batch_ref || undefined,
      unitCostAtDamage: Number(row.unit_cost_at_damage),
      salvageValueRecovered: Number(row.salvage_value_recovered) || 0,
      netLoss: Number(row.net_loss),
      loggedBy: row.logged_by,
      notes: row.notes || undefined,
    }));

    const costingParams: Record<string, LandedCostingParams> = {};
    (costingRes.data || []).forEach((row: any) => {
      costingParams[row.item_code] = {
        itemCode: row.item_code,
        basePurchaseCost: Number(row.base_purchase_cost),
        freightPerUnit: Number(row.freight_per_unit) || 0,
        customsDutyPercent: Number(row.customs_duty_percent) || 0,
        insuranceAndHandling: Number(row.insurance_and_handling) || 0,
        targetMarkupPercent: Number(row.target_markup_percent) || 0,
        actualSellingPrice: Number(row.actual_selling_price) || 0,
      };
    });

    return {
      items,
      purchases,
      sales,
      damagedItems,
      costingParams,
    };
  } catch (err) {
    console.error('Failed to query Supabase tables:', err);
    return null;
  }
}

/**
 * Upsert single master catalog item
 */
export async function syncItemToSupabase(item: {
  code: string;
  name: string;
  category?: string;
  unit?: string;
  reorderLevel?: number;
  standardSellingPrice?: number;
}) {
  if (!supabase) return;
  try {
    await supabase.from('inventory_items').upsert({
      code: item.code.trim(),
      name: item.name.trim(),
      category: item.category || 'General',
      unit: item.unit || 'Units',
      reorder_level: item.reorderLevel ?? 10,
      standard_selling_price: item.standardSellingPrice ?? 0,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Error syncing item to Supabase:', e);
  }
}

/**
 * Persist new purchase batch and make sure parent SKU exists in inventory_items
 */
export async function syncPurchaseToSupabase(batch: PurchaseBatch) {
  if (!supabase) return;
  try {
    // 1. Ensure master SKU exists in inventory_items first to avoid foreign key violation
    await supabase.from('inventory_items').upsert(
      {
        code: batch.itemCode.trim(),
        name: `Product (${batch.itemCode.trim()})`,
        category: 'General',
        unit: 'Units',
        reorder_level: 10,
        standard_selling_price: Math.round((batch.landedUnitCost || batch.unitValue) * 1.3),
      },
      { onConflict: 'code', ignoreDuplicates: true }
    );

    // 2. Insert or update purchase batch
    await supabase.from('purchase_batches').upsert({
      id: batch.id,
      invoice_no: batch.invoiceNo,
      date: batch.date,
      item_code: batch.itemCode.trim(),
      supplier: batch.supplier,
      qty: batch.qty,
      unit_value: batch.unitValue,
      total_value: batch.totalValue,
      freight_cost: batch.freightCost ?? 0,
      customs_duty: batch.customsDuty ?? 0,
      handling_cost: batch.handlingCost ?? 0,
      total_landed_cost: batch.totalLandedCost ?? batch.totalValue,
      landed_unit_cost: batch.landedUnitCost ?? batch.unitValue,
      remaining_qty: batch.remainingQty,
      status: batch.status,
    });
  } catch (e) {
    console.error('Error syncing purchase batch to Supabase:', e);
  }
}

/**
 * Persist sales record and updated FIFO remaining quantities of depleted batches
 */
export async function syncSaleToSupabase(sale: SaleRecord, updatedBatches?: PurchaseBatch[]) {
  if (!supabase) return;
  try {
    // 1. Insert sales record
    await supabase.from('sales_records').upsert({
      id: sale.id,
      invoice_no: sale.invoiceNo,
      date: sale.date,
      item_code: sale.itemCode.trim(),
      customer: sale.customer,
      qty: sale.qty,
      unit_value: sale.unitValue,
      total_value: sale.totalValue,
      fifo_cogs: sale.fifoCogs,
      avco_cogs: sale.avcoCogs,
      gross_profit_fifo: sale.grossProfitFifo,
      gross_profit_avco: sale.grossProfitAvco,
      margin_percent_fifo: sale.marginPercentFifo,
      margin_percent_avco: sale.marginPercentAvco,
      consumed_layers: sale.consumedLayers || [],
    });

    // 2. Update affected batch remaining quantities
    if (updatedBatches && updatedBatches.length > 0) {
      for (const b of updatedBatches) {
        await supabase
          .from('purchase_batches')
          .update({
            remaining_qty: b.remainingQty,
            status: b.status,
          })
          .eq('id', b.id);
      }
    }
  } catch (e) {
    console.error('Error syncing sale to Supabase:', e);
  }
}

/**
 * Persist damaged item record
 */
export async function syncDamageToSupabase(damage: DamagedItemRecord, updatedBatches?: PurchaseBatch[]) {
  if (!supabase) return;
  try {
    await supabase.from('damaged_items').upsert({
      id: damage.id,
      date: damage.date,
      item_code: damage.itemCode.trim(),
      qty_damaged: damage.qtyDamaged,
      reason: damage.reason,
      action: damage.action,
      batch_ref: damage.batchRef || null,
      unit_cost_at_damage: damage.unitCostAtDamage,
      salvage_value_recovered: damage.salvageValueRecovered ?? 0,
      net_loss: damage.netLoss,
      logged_by: damage.loggedBy,
      notes: damage.notes || null,
    });

    if (updatedBatches && updatedBatches.length > 0) {
      for (const b of updatedBatches) {
        await supabase
          .from('purchase_batches')
          .update({
            remaining_qty: b.remainingQty,
            status: b.status,
          })
          .eq('id', b.id);
      }
    }
  } catch (e) {
    console.error('Error syncing damage record to Supabase:', e);
  }
}

/**
 * Persist costing parameters
 */
export async function syncCostingParamsToSupabase(itemCode: string, params: Partial<LandedCostingParams>) {
  if (!supabase) return;
  try {
    await supabase.from('landed_costing_params').upsert({
      item_code: itemCode.trim(),
      base_purchase_cost: params.basePurchaseCost ?? 1000,
      freight_per_unit: params.freightPerUnit ?? 50,
      customs_duty_percent: params.customsDutyPercent ?? 12,
      insurance_and_handling: params.insuranceAndHandling ?? 25,
      target_markup_percent: params.targetMarkupPercent ?? 35,
      actual_selling_price: params.actualSellingPrice ?? 1500,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Error syncing costing params to Supabase:', e);
  }
}
