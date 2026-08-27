'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { STORE_CONFIG } from '../../data/mockData';

export const AdminInventory = () => {
  const { products, updateProductStock, bulkUpdateStockStatus } = useCatalog();
  const [filter, setFilter] = useState('all'); // 'all', 'out_of_stock', 'low_stock', 'in_stock'
  const [searchQuery, setSearchQuery] = useState('');

  const outOfStockProducts = products.filter((p) => p.stockCount === 0 || p.stockStatus === 'out_of_stock');
  const lowStockProducts = products.filter((p) => p.stockCount > 0 && p.stockCount < 5);
  const inStockProducts = products.filter((p) => p.stockCount >= 5 && p.stockStatus === 'in_stock');

  const filteredList = products.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!p.name?.toLowerCase().includes(q) && !p.id?.toLowerCase().includes(q) && !p.categoryName?.toLowerCase().includes(q)) {
        return false;
      }
    }

    if (filter === 'out_of_stock') return p.stockCount === 0 || p.stockStatus === 'out_of_stock';
    if (filter === 'low_stock') return p.stockCount > 0 && p.stockCount < 5;
    if (filter === 'in_stock') return p.stockCount >= 5;
    return true;
  });

  const handleRestockAllLow = () => {
    const ids = [...outOfStockProducts, ...lowStockProducts].map((p) => p.id);
    if (ids.length === 0) return;
    if (window.confirm(`Restock all ${ids.length} low/out-of-stock products to 15 units?`)) {
      bulkUpdateStockStatus(ids, 'in_stock', 15);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
            Inventory & Stock Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#777777] mt-0.5">
            Monitor real-time inventory levels, out-of-stock alerts, and quick batch restock
          </p>
        </div>

        <button
          onClick={handleRestockAllLow}
          disabled={outOfStockProducts.length + lowStockProducts.length === 0}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#171717] hover:bg-black text-white font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-[#9FD842]" />
          <span>Restock All Low Items (+15)</span>
        </button>
      </div>

      {/* ── Inventory KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* In Stock */}
        <div
          onClick={() => setFilter(filter === 'in_stock' ? 'all' : 'in_stock')}
          className={`p-6 rounded-[28px] border transition-all cursor-pointer ${
            filter === 'in_stock'
              ? 'bg-[#F0FDF4] border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-black/10 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
              Healthy
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#171717]">{inStockProducts.length}</div>
          <div className="text-xs text-[#777777] mt-0.5 font-medium">Products In Stock (5+ units)</div>
        </div>

        {/* Low Stock */}
        <div
          onClick={() => setFilter(filter === 'low_stock' ? 'all' : 'low_stock')}
          className={`p-6 rounded-[28px] border transition-all cursor-pointer ${
            filter === 'low_stock'
              ? 'bg-[#FFFBEB] border-amber-300 ring-2 ring-amber-500/20'
              : 'bg-white border-black/10 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100/60 px-2.5 py-0.5 rounded-full">
              Attention
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#171717]">{lowStockProducts.length}</div>
          <div className="text-xs text-[#777777] mt-0.5 font-medium">Low Stock Items (1 to 4 units)</div>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => setFilter(filter === 'out_of_stock' ? 'all' : 'out_of_stock')}
          className={`p-6 rounded-[28px] border transition-all cursor-pointer ${
            filter === 'out_of_stock'
              ? 'bg-[#FFF1F2] border-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white border-black/10 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-rose-800 bg-rose-100/60 px-2.5 py-0.5 rounded-full">
              Urgent
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#171717]">{outOfStockProducts.length}</div>
          <div className="text-xs text-[#777777] mt-0.5 font-medium">Out of Stock (0 units)</div>
        </div>
      </div>

      {/* ── Table & Search Bar ── */}
      <div className="bg-white rounded-[28px] border border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Controls */}
        <div className="p-4 border-b border-black/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#EEEEEC]/30">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#777777]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-black/10 text-xs text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#9FD842]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                filter === 'all' ? 'bg-[#171717] text-white' : 'bg-[#EEEEEC] text-[#555555]'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setFilter('low_stock')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                filter === 'low_stock' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800'
              }`}
            >
              Low ({lowStockProducts.length})
            </button>
            <button
              onClick={() => setFilter('out_of_stock')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                filter === 'out_of_stock' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800'
              }`}
            >
              Out ({outOfStockProducts.length})
            </button>
          </div>
        </div>

        {/* Stock Adjust Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EEEEEC]/60 border-b border-black/10 text-[#777777] uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-4 px-5">Product Details</th>
                <th className="py-4 px-3">Category</th>
                <th className="py-4 px-3">Price</th>
                <th className="py-4 px-3">Current Stock</th>
                <th className="py-4 px-3 text-center">Status</th>
                <th className="py-4 px-5 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black/5 font-medium text-[#171717]">
              {filteredList.map((product) => {
                const count = product.stockCount ?? 0;
                const isOut = count === 0 || product.stockStatus === 'out_of_stock';
                const isLow = count > 0 && count < 5;

                return (
                  <tr key={product.id} className="hover:bg-[#EEEEEC]/30 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#EEEEEC] p-1 flex items-center justify-center flex-shrink-0 border border-black/5">
                          <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-[#171717] truncate max-w-xs">{product.name}</h4>
                          <span className="text-[10px] text-[#777777] font-mono">SKU: {product.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-xs text-[#555555] font-semibold">{product.categoryName}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-extrabold text-[#171717]">₹{product.price.toLocaleString()}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-extrabold text-sm text-[#171717]">{count} units</span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {isOut ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Low Stock ({count})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          In Stock
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => updateProductStock(product.id, -1, true)}
                          disabled={count <= 0}
                          className="w-7 h-7 rounded-lg bg-[#EEEEEC] hover:bg-[#E2E2DE] text-[#171717] font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                        >
                          -1
                        </button>

                        <button
                          onClick={() => updateProductStock(product.id, 1, true)}
                          className="w-7 h-7 rounded-lg bg-[#EEEEEC] hover:bg-[#E2E2DE] text-[#171717] font-bold flex items-center justify-center cursor-pointer"
                        >
                          +1
                        </button>

                        <button
                          onClick={() => updateProductStock(product.id, 10, true)}
                          className="px-2.5 py-1 rounded-lg bg-[#171717] text-white hover:bg-black text-[11px] font-bold flex items-center justify-center cursor-pointer"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
