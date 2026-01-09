'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/lib/types';
import CategoryIcon from './CategoryIcon';

interface CategoryFilterProps {
  onCategoryChange: (categoryId: string | null) => void;
  selectedCategory: string | null;
}

export default function CategoryFilter({ onCategoryChange, selectedCategory }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // استخدام API بدلاً من localStorage
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
        التصنيفات
      </h2>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-6 py-3 rounded-xl font-semibold arabic-text transition-all duration-300 flex items-center gap-2 ${
            selectedCategory === null
              ? 'bg-gradient-to-r from-[#1a5f3f] to-[#2d7a54] text-white shadow-lg scale-105'
              : 'bg-white dark:bg-[#1a2028] text-[#1a5f3f] dark:text-[#d4af37] border-2 border-[#e5dcc8] dark:border-[#2d3748] hover:border-[#d4af37] dark:hover:border-[#d4af37] hover:scale-105'
          }`}
        >
          <span>الكل</span>
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-6 py-3 rounded-xl font-semibold arabic-text transition-all duration-300 flex items-center gap-2 ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-[#1a5f3f] to-[#2d7a54] text-white shadow-lg scale-105'
                : 'bg-white dark:bg-[#1a2028] text-[#1a5f3f] dark:text-[#d4af37] border-2 border-[#e5dcc8] dark:border-[#2d3748] hover:border-[#d4af37] dark:hover:border-[#d4af37] hover:scale-105'
            }`}
            title={category.description}
          >
            <CategoryIcon
              icon={category.icon}
              className={`w-5 h-5 ${selectedCategory === category.id ? 'text-white' : ''}`}
            />
            <span>{category.arabicName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
