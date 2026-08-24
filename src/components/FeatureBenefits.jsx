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
    <section className="py-8 sm:py-12" aria-label="Feature Benefits">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {FEATURE_BENEFITS.map((feature, idx) => {
            const Icon = iconMap[feature.icon];

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6FD] shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1.5 flex items-center gap-5 cursor-default"
              >
                {/* Icon Container */}
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${feature.iconBg} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                  <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${feature.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-[#15152A] mb-1 group-hover:text-[#6257FF] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#626276] leading-snug">
                    {feature.description}
                  </p>
                </div>

                {/* Subtle Hover Gradient Accent Line */}
                <div className="absolute inset-x-8 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
