'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { FEATURE_BENEFITS } from '../data/mockData';

const iconMap = {
  ShoppingBag,
  ShieldCheck,
  Clock,
  Sparkles,
};

export const FeatureBenefits = () => {
  return (
    <section className="py-6 sm:py-10" aria-label="Feature Benefits">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {FEATURE_BENEFITS.map((feature, idx) => {
            const Icon = iconMap[feature.icon] || ShoppingBag;

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-white rounded-[26px] p-5 sm:p-6 border border-black/[0.04] shadow-neu-card hover:shadow-neu-card-hover transition-all duration-300 flex items-center gap-4 cursor-default"
              >
                {/* Icon Container in #EEEEEC */}
                <div className="w-12 h-12 rounded-[18px] bg-[#EEEEEC] flex items-center justify-center shrink-0 text-[#171717] shadow-xs">
                  <Icon className="w-6 h-6 text-[#171717]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-extrabold text-[#171717] mb-0.5">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-[#777777] leading-snug">
                    {feature.description}
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
