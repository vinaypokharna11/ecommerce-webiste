'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Headphones, ShoppingBag } from 'lucide-react';
import { FEATURE_BENEFITS } from '@/data/constants';

const iconMap = {
  Truck,
  ShieldCheck,
  Headphones,
  ShoppingBag,
};

export const FeatureBenefits = () => {
  return (
    <section className="py-8 sm:py-14 bg-[#FBFBFD]" aria-label="Feature Benefits">
      <div className="w-full max-w-[1440px] mx-auto px-3.5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5 lg:gap-6">
          {FEATURE_BENEFITS.map((feature, idx) => {
            const Icon = iconMap[feature.icon] || ShoppingBag;

            return (
              <motion.div
                key={feature.title || idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="apple-card p-4 sm:p-5 lg:p-6 flex items-center gap-3.5 sm:gap-4.5 rounded-2xl sm:rounded-3xl"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#F5F5F7] border border-black/[0.04] flex items-center justify-center shrink-0 text-[#1D1D1F]">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#0071E3]" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-base font-bold text-[#1D1D1F] tracking-tight mb-0.5 font-sans">
                    {feature.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#6E6E73] leading-relaxed font-normal">
                    {feature.desc || feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureBenefits;
