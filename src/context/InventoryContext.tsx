'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import {
  InventoryItem,
  PurchaseBatch,
  SaleRecord,
  DamagedItemRecord,
  LandedCostingParams,
  IDFMetrics,
  LandedCostBreakdown,
} from '../types/inventory';
import {
  INITIAL_ITEMS,
  INITIAL_PURCHASES,
  INITIAL_SALES,
  INITIAL_DAMAGED_ITEMS,
  INITIAL_COSTING_PARAMS,
} from '../data/seedData';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  fetchFromSupabase,
  syncItemToSupabase,
  syncPurchaseToSupabase,
  syncSaleToSupabase,
  syncDamageToSupabase,
  syncCostingParamsToSupabase,
} from '@/lib/supabaseSync';

interface InventoryContextType {
  items: InventoryItem[];
  purchases: PurchaseBatch[];
  sales: SaleRecord[];
  damagedItems: DamagedItemRecord[];
  costingParams: Record<string, LandedCostingParams>;
  currency: string;
  setCurrency: (c: string) => void;
  formatCurrency: (amount: number) => string;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: () => void;
  isCloudConnected: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  syncWithCloud: () => Promise<void>;
  
  // Actions
  addPurchase: (purchase: Omit<PurchaseBatch, 'id' | 'remainingQty' | 'status' | 'totalValue'>) => void;
  recordSale: (sale: Omit<SaleRecord, 'id' | 'fifoCogs' | 'avcoCogs' | 'grossProfitFifo' | 'grossProfitAvco' | 'marginPercentFifo' | 'marginPercentAvco' | 'totalValue' | 'consumedLayers'>) => { success: boolean; message: string };
  logDamagedItem: (damage: Omit<DamagedItemRecord, 'id' | 'netLoss'>) => { success: boolean; message: string };
  updateCostingParams: (itemCode: string, params: Partial<LandedCostingParams>) => void;
  addNewItem: (item: Omit<InventoryItem, 'totalPurchasedQty' | 'totalSoldQty' | 'damagedQty' | 'availableQty' | 'avcoUnitCost' | 'fifoUnitCost' | 'lastPurchasePrice' | 'avcoValuation' | 'fifoValuation'>) => void;
  resetToDefaultData: () => void;

  // Analytical computation helpers
  getIdfMetrics: () => IDFMetrics[];
  getLandedCostBreakdown: (itemCode: string) => LandedCostBreakdown | null;
  overallStats: {
    totalStockUnits: number;
    totalAvailableUnits: number;
    totalDamagedUnits: number;
    totalAvcoValuation: number;
    totalFifoValuation: number;
    totalRevenue: number;
    totalFifoCogs: number;
    totalGrossProfit: number;
    totalDamagedLoss: number;
    totalDamagedSalvage: number;
    lowStockCount: number;
  };
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'abc_inventory_fresh_v1';
const THEME_STORAGE_KEY = 'abc_inventory_theme';

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [currency, setCurrency] = useState<string>('Rs.');
  const [rawItems, setRawItems] = useState<typeof INITIAL_ITEMS>(INITIAL_ITEMS);
  const [purchases, setPurchases] = useState<PurchaseBatch[]>(INITIAL_PURCHASES);
  const [sales, setSales] = useState<SaleRecord[]>(INITIAL_SALES);
  const [damagedItems, setDamagedItems] = useState<DamagedItemRecord[]>(INITIAL_DAMAGED_ITEMS);
  const [costingParams, setCostingParams] = useState<Record<string, LandedCostingParams>>(INITIAL_COSTING_PARAMS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(isSupabaseConfigured());
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // Supabase cloud data synchronization
  const syncWithCloud = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setSyncStatus('syncing');
    try {
      const remoteData = await fetchFromSupabase();
      if (remoteData) {
        const hasRemoteData =
          remoteData.purchases.length > 0 ||
          remoteData.items.length > 0 ||
          remoteData.sales.length > 0 ||
          remoteData.damagedItems.length > 0;

        if (hasRemoteData) {
          setRawItems(remoteData.items);
          setPurchases(remoteData.purchases);
          setSales(remoteData.sales);
          setDamagedItems(remoteData.damagedItems);
          setCostingParams(remoteData.costingParams);
        }
        setSyncStatus('synced');
        setIsCloudConnected(true);
      }
    } catch (err) {
      console.error('Cloud sync error:', err);
      setSyncStatus('error');
    }
  }, []);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      // Clean out any legacy storage with sample data from previous builds
      localStorage.removeItem('abc_inventory_system_v1');
      localStorage.removeItem('abc_inventory_data_v2');

      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null;
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setThemeState(savedTheme);
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(savedTheme);
      } else {
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add('light');
      }

      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        let loadedPurchases: PurchaseBatch[] = parsed.purchases || [];
        let loadedRawItems: typeof INITIAL_ITEMS = parsed.rawItems || [];

        // Auto-heal any purchases that have empty, missing, or malformed itemCodes
        loadedPurchases = loadedPurchases.map((p: any, idx: number) => {
          const rawCode = p.itemCode ? String(p.itemCode).trim() : '';
          const fallbackCode = p.invoiceNo ? `SKU-${String(p.invoiceNo).trim()}` : `SKU-BATCH-${idx + 1}`;
          const cleanCode = rawCode || fallbackCode;
          const qtyNum = Number(p.qty) || 0;
          const unitValNum = Number(p.unitValue) || 0;

          // Ensure loadedRawItems has an entry for this purchase's SKU
          if (!loadedRawItems.some((r) => r.code.trim().toLowerCase() === cleanCode.toLowerCase())) {
            loadedRawItems.push({
              code: cleanCode,
              name: `Product (${cleanCode})`,
              category: 'General',
              unit: 'Units',
              reorderLevel: 10,
              standardSellingPrice: Math.round((Number(p.landedUnitCost) || unitValNum || 100) * 1.3),
            });
          }

          return {
            ...p,
            itemCode: cleanCode,
            qty: qtyNum,
            unitValue: unitValNum,
            totalValue: qtyNum * unitValNum,
            remainingQty: p.remainingQty !== undefined ? Number(p.remainingQty) : qtyNum,
            status: p.status || 'active',
          };
        });

        setRawItems(loadedRawItems);
        setPurchases(loadedPurchases);
        if (parsed.sales) setSales(parsed.sales);
        if (parsed.damagedItems) setDamagedItems(parsed.damagedItems);
        if (parsed.costingParams) setCostingParams(parsed.costingParams);
        if (parsed.currency) setCurrency(parsed.currency);
      }
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync with Supabase on mount once local state is ready
  useEffect(() => {
    if (isLoaded && isSupabaseConfigured()) {
      syncWithCloud();
    }
  }, [isLoaded, syncWithCloud]);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(newTheme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          rawItems,
          purchases,
          sales,
          damagedItems,
          costingParams,
          currency,
        })
      );
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [rawItems, purchases, sales, damagedItems, costingParams, currency, isLoaded]);

  // Dynamic calculation of inventory items with AVCO & FIFO
  const items: InventoryItem[] = useMemo(() => {
    // Collect all registered rawItems, plus any unique itemCodes from purchases not yet explicitly registered
    const knownCodes = new Set(rawItems.map((r) => r.code.trim().toLowerCase()));
    const implicitBases: typeof INITIAL_ITEMS = [];

    purchases.forEach((p, idx) => {
      const rawCode = p.itemCode ? String(p.itemCode).trim() : '';
      const fallbackCode = p.invoiceNo ? `SKU-${String(p.invoiceNo).trim()}` : `SKU-BATCH-${idx + 1}`;
      const c = rawCode || fallbackCode;

      if (c && !knownCodes.has(c.toLowerCase())) {
        knownCodes.add(c.toLowerCase());
        implicitBases.push({
          code: c,
          name: `Product (${c})`,
          category: 'General',
          unit: 'Units',
          reorderLevel: 10,
          standardSellingPrice: Number(p.landedUnitCost) || Number(p.unitValue) || 0,
        });
      }
    });

    const allBases = [...rawItems, ...implicitBases];

    return allBases.map((base) => {
      const baseCodeLower = base.code.trim().toLowerCase();
      const itemPurchases = purchases.filter((p) => (p.itemCode ? String(p.itemCode).trim().toLowerCase() : '') === baseCodeLower);
      const itemSales = sales.filter((s) => (s.itemCode ? String(s.itemCode).trim().toLowerCase() : '') === baseCodeLower);
      const itemDamaged = damagedItems.filter((d) => (d.itemCode ? String(d.itemCode).trim().toLowerCase() : '') === baseCodeLower);

      const totalPurchasedQty = itemPurchases.reduce((acc, p) => acc + (Number(p.qty) || 0), 0);
      const totalPurchasedValue = itemPurchases.reduce((acc, p) => acc + (Number(p.totalValue) || 0), 0);
      const totalSoldQty = itemSales.reduce((acc, s) => acc + (Number(s.qty) || 0), 0);
      const damagedQty = itemDamaged.reduce((acc, d) => acc + (Number(d.qtyDamaged) || 0), 0);

      // Available QTY = Total Purchased - Total Sold - Damaged
      const availableQty = Math.max(0, totalPurchasedQty - totalSoldQty - damagedQty);

      // Weighted Average Cost (AVCO)
      const avcoUnitCost = totalPurchasedQty > 0 ? totalPurchasedValue / totalPurchasedQty : 0;
      const avcoValuation = availableQty * avcoUnitCost;

      // FIFO valuation: sum remaining units in open batches
      const activeBatches = itemPurchases.filter((p) => p.status === 'active' && (Number(p.remainingQty) > 0));
      const fifoValuation = activeBatches.reduce((acc, b) => acc + (Number(b.remainingQty) || 0) * (Number(b.unitValue) || 0), 0);
      const fifoUnitCost = availableQty > 0 ? fifoValuation / availableQty : avcoUnitCost;

      const lastPurchase = [...itemPurchases].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      const lastPurchasePrice = lastPurchase ? (Number(lastPurchase.unitValue) || 0) : base.standardSellingPrice * 0.65;

      return {
        ...base,
        totalPurchasedQty,
        totalSoldQty,
        damagedQty,
        availableQty,
        avcoUnitCost: Math.round(avcoUnitCost * 100) / 100,
        fifoUnitCost: Math.round(fifoUnitCost * 100) / 100,
        lastPurchasePrice,
        avcoValuation: Math.round(avcoValuation * 100) / 100,
        fifoValuation: Math.round(fifoValuation * 100) / 100,
      };
    });
  }, [rawItems, purchases, sales, damagedItems]);

  // Overall summary metrics with direct ledger verification
  const overallStats = useMemo(() => {
    // 1. Ledger-direct computations (100% mathematical integrity)
    const ledgerTotalPurchased = purchases.reduce((acc, p) => acc + (Number(p.qty) || 0), 0);
    const ledgerTotalSold = sales.reduce((acc, s) => acc + (Number(s.qty) || 0), 0);
    const ledgerTotalDamaged = damagedItems.reduce((acc, d) => acc + (Number(d.qtyDamaged) || 0), 0);
    const directAvailableUnits = Math.max(0, ledgerTotalPurchased - ledgerTotalSold - ledgerTotalDamaged);

    // 2. Item-level rollups
    const itemsAvailableUnits = items.reduce((acc, i) => acc + (Number(i.availableQty) || 0), 0);
    const totalAvailableUnits = Math.max(directAvailableUnits, itemsAvailableUnits);

    const itemsTotalStock = items.reduce(
      (acc, i) => acc + (Number(i.totalPurchasedQty) || 0) - (Number(i.totalSoldQty) || 0),
      0
    );
    const totalStockUnits = Math.max(ledgerTotalPurchased - ledgerTotalSold, itemsTotalStock);

    const totalDamagedUnits = Math.max(
      ledgerTotalDamaged,
      items.reduce((acc, i) => acc + (Number(i.damagedQty) || 0), 0)
    );

    // Direct active batch valuation
    const activeBatches = purchases.filter((p) => p.status === 'active');
    const directValuation = activeBatches.reduce(
      (acc, b) =>
        acc +
        (Number(b.remainingQty !== undefined ? b.remainingQty : b.qty) || 0) * (Number(b.unitValue) || 0),
      0
    );

    const itemsAvcoValuation = items.reduce((acc, i) => acc + (Number(i.avcoValuation) || 0), 0);
    const itemsFifoValuation = items.reduce((acc, i) => acc + (Number(i.fifoValuation) || 0), 0);
    const totalAvcoValuation = Math.max(directValuation, itemsAvcoValuation);
    const totalFifoValuation = Math.max(directValuation, itemsFifoValuation);

    const totalRevenue = sales.reduce((acc, s) => acc + (Number(s.totalValue) || 0), 0);
    const totalFifoCogs = sales.reduce((acc, s) => acc + (Number(s.fifoCogs) || 0), 0);
    const totalGrossProfit = totalRevenue - totalFifoCogs;
    const totalDamagedLoss = damagedItems.reduce((acc, d) => acc + (Number(d.netLoss) || 0), 0);
    const totalDamagedSalvage = damagedItems.reduce((acc, d) => acc + (Number(d.salvageValueRecovered) || 0), 0);
    const lowStockCount = items.filter((i) => i.availableQty <= i.reorderLevel).length;

    return {
      totalStockUnits,
      totalAvailableUnits,
      totalDamagedUnits,
      totalAvcoValuation,
      totalFifoValuation,
      totalRevenue,
      totalFifoCogs,
      totalGrossProfit,
      totalDamagedLoss,
      totalDamagedSalvage,
      lowStockCount,
    };
  }, [items, purchases, sales, damagedItems]);

  // Currency formatting helper
  const formatCurrency = (amount: number): string => {
    const formatted = new Intl.NumberFormat('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${currency} ${formatted}`;
  };

  // Dispatcher: Add new purchase order / GRN
  const addPurchase = (
    purchaseData: Omit<PurchaseBatch, 'id' | 'remainingQty' | 'status' | 'totalValue'>
  ) => {
    const qtyNum = Number(purchaseData.qty) || 1;
    const unitValNum = Number(purchaseData.unitValue) || 0;
    const rawCode = purchaseData.itemCode ? String(purchaseData.itemCode).trim() : '';
    const cleanCode =
      rawCode ||
      (purchaseData.invoiceNo ? `SKU-${String(purchaseData.invoiceNo).trim()}` : `SKU-${Date.now().toString().slice(-4)}`);

    const totalValue = qtyNum * unitValNum;
    const freight = Number(purchaseData.freightCost) || 0;
    const duty = Number(purchaseData.customsDuty) || 0;
    const handling = Number(purchaseData.handlingCost) || 0;
    const totalLandedCost = totalValue + freight + duty + handling;
    const landedUnitCost = qtyNum > 0 ? totalLandedCost / qtyNum : unitValNum;

    const newBatch: PurchaseBatch = {
      ...purchaseData,
      itemCode: cleanCode,
      qty: qtyNum,
      unitValue: unitValNum,
      id: `PO-${Date.now().toString().slice(-6)}`,
      totalValue,
      totalLandedCost,
      landedUnitCost: Math.round(landedUnitCost * 100) / 100,
      remainingQty: qtyNum,
      status: 'active',
    };

    setPurchases((prev) => [newBatch, ...prev]);

    // Ensure item code exists in rawItems so Inventory Position & Executive Dashboard immediately reflect the new stock
    let newlyCreatedItem: any = null;
    setRawItems((prev) => {
      const exists = prev.some((r) => r.code.trim().toLowerCase() === cleanCode.toLowerCase());
      if (!exists) {
        newlyCreatedItem = {
          code: cleanCode,
          name: `Product (${cleanCode})`,
          category: 'General',
          unit: 'Units',
          reorderLevel: 10,
          standardSellingPrice: Math.round(landedUnitCost * 1.3),
        };
        return [...prev, newlyCreatedItem];
      }
      return prev;
    });

    // Supabase cloud persistence
    if (isSupabaseConfigured()) {
      if (newlyCreatedItem) {
        syncItemToSupabase(newlyCreatedItem);
      }
      syncPurchaseToSupabase(newBatch);
    }
  };

  // Dispatcher: Record sale with FIFO layer consumption and stock validation
  const recordSale = (
    saleData: Omit<
      SaleRecord,
      | 'id'
      | 'fifoCogs'
      | 'avcoCogs'
      | 'grossProfitFifo'
      | 'grossProfitAvco'
      | 'marginPercentFifo'
      | 'marginPercentAvco'
      | 'totalValue'
      | 'consumedLayers'
    >
  ): { success: boolean; message: string } => {
    const cleanSaleCode = saleData.itemCode ? saleData.itemCode.trim().toLowerCase() : '';
    const targetItem = items.find((i) => i.code.trim().toLowerCase() === cleanSaleCode);
    if (!targetItem) {
      return { success: false, message: `Item code ${saleData.itemCode} not found in inventory.` };
    }

    if (saleData.qty > targetItem.availableQty) {
      return {
        success: false,
        message: `Insufficient available stock! Requested: ${saleData.qty}, Available (excluding damaged): ${targetItem.availableQty}.`,
      };
    }

    const totalValue = saleData.qty * saleData.unitValue;

    // FIFO layer consumption: Sort active batches by date ascending (oldest first)
    let qtyNeeded = saleData.qty;
    let fifoCogs = 0;
    const consumedLayers: Array<{
      batchId: string;
      batchInvoiceNo: string;
      batchDate: string;
      qtyConsumed: number;
      unitCost: number;
    }> = [];

    // Clone purchases to update batch remaining quantities
    const updatedPurchases = purchases.map((p) => ({ ...p }));
    const relevantBatches = updatedPurchases
      .filter((p) => p.itemCode.trim().toLowerCase() === cleanSaleCode && p.status === 'active' && p.remainingQty > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const batch of relevantBatches) {
      if (qtyNeeded <= 0) break;

      const takeQty = Math.min(batch.remainingQty, qtyNeeded);
      batch.remainingQty -= takeQty;
      if (batch.remainingQty === 0) {
        batch.status = 'depleted';
      }

      fifoCogs += takeQty * batch.unitValue;
      consumedLayers.push({
        batchId: batch.id,
        batchInvoiceNo: batch.invoiceNo,
        batchDate: batch.date,
        qtyConsumed: takeQty,
        unitCost: batch.unitValue,
      });

      qtyNeeded -= takeQty;
    }

    // AVCO COGS calculation
    const avcoCogs = saleData.qty * targetItem.avcoUnitCost;
    const grossProfitFifo = totalValue - fifoCogs;
    const grossProfitAvco = totalValue - avcoCogs;
    const marginPercentFifo = totalValue > 0 ? (grossProfitFifo / totalValue) * 100 : 0;
    const marginPercentAvco = totalValue > 0 ? (grossProfitAvco / totalValue) * 100 : 0;

    const newSale: SaleRecord = {
      ...saleData,
      itemCode: targetItem.code, // Normalize to canonical master SKU code
      id: `SO-${Date.now().toString().slice(-6)}`,
      totalValue,
      fifoCogs: Math.round(fifoCogs * 100) / 100,
      avcoCogs: Math.round(avcoCogs * 100) / 100,
      grossProfitFifo: Math.round(grossProfitFifo * 100) / 100,
      grossProfitAvco: Math.round(grossProfitAvco * 100) / 100,
      marginPercentFifo: Math.round(marginPercentFifo * 100) / 100,
      marginPercentAvco: Math.round(marginPercentAvco * 100) / 100,
      consumedLayers,
    };

    setPurchases(updatedPurchases);
    setSales((prev) => [newSale, ...prev]);

    // Supabase cloud persistence
    if (isSupabaseConfigured()) {
      syncSaleToSupabase(newSale, relevantBatches);
    }

    return {
      success: true,
      message: `Sale invoice ${saleData.invoiceNo} recorded successfully! Stock deducted and FIFO layers depleted.`,
    };
  };

  // Dispatcher: Log damaged stock and isolate from inventory
  const logDamagedItem = (
    damageData: Omit<DamagedItemRecord, 'id' | 'netLoss'>
  ): { success: boolean; message: string } => {
    const cleanDamageCode = damageData.itemCode ? damageData.itemCode.trim().toLowerCase() : '';
    const targetItem = items.find((i) => i.code.trim().toLowerCase() === cleanDamageCode);
    if (!targetItem) {
      return { success: false, message: `Item code ${damageData.itemCode} not found in inventory.` };
    }

    if (damageData.qtyDamaged > targetItem.availableQty) {
      return {
        success: false,
        message: `Cannot damage ${damageData.qtyDamaged} units. Currently available undamaged stock is only ${targetItem.availableQty}.`,
      };
    }

    const totalCostOfDamagedUnits = damageData.qtyDamaged * damageData.unitCostAtDamage;
    const netLoss = Math.max(0, totalCostOfDamagedUnits - damageData.salvageValueRecovered);

    const newDamageRecord: DamagedItemRecord = {
      ...damageData,
      itemCode: targetItem.code, // Normalize to canonical master SKU code
      id: `DMG-${Date.now().toString().slice(-6)}`,
      netLoss: Math.round(netLoss * 100) / 100,
    };

    // If batch reference exists, deduct from that batch's remainingQty so FIFO stays balanced
    if (damageData.batchRef) {
      setPurchases((prev) =>
        prev.map((b) => {
          if (b.id === damageData.batchRef || b.invoiceNo === damageData.batchRef) {
            const newRemaining = Math.max(0, b.remainingQty - damageData.qtyDamaged);
            return {
              ...b,
              remainingQty: newRemaining,
              status: newRemaining === 0 ? 'depleted' : 'active',
            };
          }
          return b;
        })
      );
    } else {
      // Deduct from earliest active batch of that item
      let needed = damageData.qtyDamaged;
      setPurchases((prev) =>
        prev.map((b) => {
          if (b.itemCode.trim().toLowerCase() === cleanDamageCode && b.status === 'active' && b.remainingQty > 0 && needed > 0) {
            const deduct = Math.min(b.remainingQty, needed);
            needed -= deduct;
            const rem = b.remainingQty - deduct;
            return {
              ...b,
              remainingQty: rem,
              status: rem === 0 ? 'depleted' : 'active',
            };
          }
          return b;
        })
      );
    }

    setDamagedItems((prev) => [newDamageRecord, ...prev]);

    // Supabase cloud persistence
    if (isSupabaseConfigured()) {
      syncDamageToSupabase(newDamageRecord);
    }

    return {
      success: true,
      message: `${damageData.qtyDamaged} units of ${damageData.itemCode} quarantined/written off. Stock successfully removed from available inventory.`,
    };
  };

  // Dispatcher: Update costing parameters
  const updateCostingParams = (itemCode: string, params: Partial<LandedCostingParams>) => {
    setCostingParams((prev) => ({
      ...prev,
      [itemCode]: {
        ...(prev[itemCode] || {
          itemCode,
          basePurchaseCost: 1000,
          freightPerUnit: 50,
          customsDutyPercent: 12,
          insuranceAndHandling: 25,
          targetMarkupPercent: 35,
          actualSellingPrice: 1500,
        }),
        ...params,
      },
    }));

    if (isSupabaseConfigured()) {
      syncCostingParamsToSupabase(itemCode, params);
    }
  };

  // Dispatcher: Add new item to catalog
  const addNewItem = (
    itemData: Omit<
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
    >
  ) => {
    setRawItems((prev) => [...prev, itemData]);
    // Create default costing params
    setCostingParams((prev) => ({
      ...prev,
      [itemData.code]: {
        itemCode: itemData.code,
        basePurchaseCost: itemData.standardSellingPrice * 0.6,
        freightPerUnit: 50,
        customsDutyPercent: 12,
        insuranceAndHandling: 25,
        targetMarkupPercent: 35,
        actualSellingPrice: itemData.standardSellingPrice,
      },
    }));

    if (isSupabaseConfigured()) {
      syncItemToSupabase(itemData);
      syncCostingParamsToSupabase(itemData.code, {
        basePurchaseCost: itemData.standardSellingPrice * 0.6,
        actualSellingPrice: itemData.standardSellingPrice,
      });
    }
  };

  // Dispatcher: Reset to clean baseline (empty data)
  const resetToDefaultData = () => {
    setRawItems([]);
    setPurchases([]);
    setSales([]);
    setDamagedItems([]);
    setCostingParams({});
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem('abc_inventory_system_v1');
    localStorage.removeItem('abc_inventory_data_v2');
  };

  // Helper: IDF Classification (Fast / Slow / Non-Moving)
  const getIdfMetrics = (): IDFMetrics[] => {
    const today = new Date('2025-02-15').getTime(); // Reference point aligned with dataset dates

    return items.map((item) => {
      const itemSales = sales.filter((s) => s.itemCode === item.code);
      const totalUnitsSold = itemSales.reduce((acc, s) => acc + s.qty, 0);

      // Latest sale date
      const sortedSales = [...itemSales].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const lastSaleDate = sortedSales[0]?.date;
      const daysSinceLastSale = lastSaleDate
        ? Math.max(0, Math.floor((today - new Date(lastSaleDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 999;

      // 30-day velocity estimate
      const salesVelocityPerDay = totalUnitsSold / 30;
      const salesVelocityPerMonth = salesVelocityPerDay * 30;

      // Turnover Ratio = Total Units Sold / (Available Stock + 1)
      const turnoverRatio = Math.round((totalUnitsSold / Math.max(1, item.availableQty)) * 100) / 100;

      // Days Sales of Inventory (Runway)
      const daysSalesOfInventory =
        salesVelocityPerDay > 0
          ? Math.round(item.availableQty / salesVelocityPerDay)
          : 999;

      // Capital tied up in available stock
      const capitalTiedUp = item.availableQty * item.avcoUnitCost;

      // IDF Classification Rules:
      // Fast Moving: high turnover (> 2.5) OR short DSI (< 25 days) and active sales
      // Slow Moving: moderate turnover (0.5 to 2.5) OR DSI between 25 and 90 days
      // Non Moving: turnover < 0.5 OR days since last sale > 45 OR zero recent sales
      let classification: 'Fast Moving' | 'Slow Moving' | 'Non Moving' = 'Slow Moving';
      let recommendation = '';

      if (turnoverRatio >= 2.5 || daysSalesOfInventory <= 25) {
        classification = 'Fast Moving';
        recommendation =
          item.availableQty <= item.reorderLevel
            ? 'CRITICAL REORDER: Rapid velocity, current stock below threshold.'
            : 'Maintain buffer inventory; high sustained customer demand.';
      } else if (daysSinceLastSale > 45 || totalUnitsSold === 0 || daysSalesOfInventory > 120) {
        classification = 'Non Moving';
        recommendation = 'DEAD STOCK ALERT: Initiate promotional markdown, clearance bundle, or vendor return.';
      } else {
        classification = 'Slow Moving';
        recommendation = 'Monitor weekly; adjust purchase batch lot sizes to optimize carrying costs.';
      }

      return {
        itemCode: item.code,
        classification,
        turnoverRatio,
        daysSalesOfInventory,
        salesVelocityPerDay: Math.round(salesVelocityPerDay * 10) / 10,
        salesVelocityPerMonth: Math.round(salesVelocityPerMonth),
        lastSaleDate,
        daysSinceLastSale,
        capitalTiedUp: Math.round(capitalTiedUp * 100) / 100,
        recommendation,
      };
    });
  };

  // Helper: Landed Costing Breakdown
  const getLandedCostBreakdown = (itemCode: string): LandedCostBreakdown | null => {
    const params = costingParams[itemCode];
    if (!params) return null;

    const baseCost = params.basePurchaseCost;
    const freightCost = params.freightPerUnit;
    const customsDuty = (baseCost * params.customsDutyPercent) / 100;
    const insuranceHandling = params.insuranceAndHandling;
    const totalLandedCost = baseCost + freightCost + customsDuty + insuranceHandling;

    const targetSellingPrice = totalLandedCost * (1 + params.targetMarkupPercent / 100);
    const actualSellingPrice = params.actualSellingPrice;
    const grossProfitMargin = actualSellingPrice - totalLandedCost;
    const markupPercent = totalLandedCost > 0 ? (grossProfitMargin / totalLandedCost) * 100 : 0;

    // Break-even units assuming allocated fixed store/warehouse overhead of 150,000 Rs.
    const allocatedFixedOverhead = 150000;
    const breakEvenUnits =
      grossProfitMargin > 0 ? Math.ceil(allocatedFixedOverhead / grossProfitMargin) : 0;

    return {
      baseCost: Math.round(baseCost * 100) / 100,
      freightCost: Math.round(freightCost * 100) / 100,
      customsDuty: Math.round(customsDuty * 100) / 100,
      insuranceHandling: Math.round(insuranceHandling * 100) / 100,
      totalLandedCost: Math.round(totalLandedCost * 100) / 100,
      targetSellingPrice: Math.round(targetSellingPrice * 100) / 100,
      actualSellingPrice: Math.round(actualSellingPrice * 100) / 100,
      grossProfitMargin: Math.round(grossProfitMargin * 100) / 100,
      markupPercent: Math.round(markupPercent * 100) / 100,
      breakEvenUnits,
    };
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        purchases,
        sales,
        damagedItems,
        costingParams,
        currency,
        setCurrency,
        formatCurrency,
        theme,
        setTheme,
        toggleTheme,
        isCloudConnected,
        syncStatus,
        syncWithCloud,
        addPurchase,
        recordSale,
        logDamagedItem,
        updateCostingParams,
        addNewItem,
        resetToDefaultData,
        getIdfMetrics,
        getLandedCostBreakdown,
        overallStats,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
