'use client';

import React from 'react';
import Image from 'next/image';
import {
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Layers,
} from 'lucide-react';

export const ExploreCardList = ({
  collections,
  categories,
  handleOpenAdd,
  handleOpenEdit,
  handleMove,
  handleToggleActive,
  setDeleteConfirmId,
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-black/10 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-black/5 pb-3">
        <div>
          <h2 className="text-base font-bold text-[#171717]">
            Collection Cards ({collections.length})
          </h2>
          <p className="text-xs text-[#777777]">
            Drag/reorder cards, assign target categories, edit images, and add promotional badges.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F5F5F3] hover:bg-[#EEEEEC] text-[#171717] border border-black/10 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Card
        </button>
      </div>

      {/* Cards Table/List */}
      <div className="divide-y divide-black/5">
        {collections.map((col, index) => {
          const categoryObj = (categories || []).find(
            (c) => c.id === (col.categoryId || col.id)
          );
          const categoryName = categoryObj
            ? categoryObj.name
            : col.categoryId && col.categoryId !== 'all'
            ? col.categoryId
            : 'General / All Products';

          return (
            <div
              key={col.id || index}
              className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                col.isActive === false ? 'opacity-50 bg-[#FBFBFB]' : ''
              }`}
            >
              {/* Left: Drag/Order controls + Thumbnail + Details */}
              <div className="flex items-center gap-3">
                {/* Order Controls */}
                <div className="flex flex-col gap-0.5 text-[#777777]">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1 rounded hover:bg-[#EEEEEC] hover:text-[#171717] disabled:opacity-20 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={index === collections.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1 rounded hover:bg-[#EEEEEC] hover:text-[#171717] disabled:opacity-20 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Card Thumbnail */}
                <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-black/5 border border-black/10 shrink-0">
                  <Image
                    src={col.image || '/assets/images/prod_backpack.jpg'}
                    alt={col.name}
                    fill
                    className="object-cover"
                  />
                  {col.badge && (
                    <div className="absolute top-1 left-1 px-1 rounded bg-black/70 text-white text-[8px] font-bold uppercase">
                      {col.badge}
                    </div>
                  )}
                </div>

                {/* Card Details */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#171717]">{col.name}</h3>
                    {col.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-[#9FD842]/30 text-[#171717] text-[10px] font-semibold uppercase tracking-wider">
                        {col.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-xs text-[#777777]">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-[#9FD842]" />
                      Target: <strong className="text-[#171717]">{categoryName}</strong>
                    </span>
                    <span>•</span>
                    <span>Position: #{index + 1}</span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* Active toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(col.id)}
                  className={`p-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                    col.isActive !== false
                      ? 'bg-[#EBF7D4] border-[#9FD842]/40 text-[#2D5A1E]'
                      : 'bg-[#EEEEEC] border-black/10 text-[#777777]'
                  }`}
                  title={col.isActive !== false ? 'Card is Active' : 'Card is Hidden'}
                >
                  {col.isActive !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Edit button */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(col)}
                  className="p-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#F5F5F3] text-[#171717] border border-black/10 transition-colors cursor-pointer"
                  title="Edit Collection"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(col.id)}
                  className="p-2 rounded-xl text-xs font-semibold bg-white hover:bg-rose-50 text-rose-600 border border-black/10 hover:border-rose-200 transition-colors cursor-pointer"
                  title="Delete Collection"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
