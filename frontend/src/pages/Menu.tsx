import { useState, useEffect } from 'react';
import type { Dish, Category, CartItem } from '../types';
import { getDishes, getCategories } from '../api';
import { useCurrency } from '../store/currency';

interface MenuProps {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
}

export default function Menu({ cart, setCart }: MenuProps) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    Promise.all([getDishes(), getCategories()])
      .then(([dishesRes, catsRes]) => {
        setDishes(dishesRes.data);
        setCategories(catsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredDishes = selectedCategory
    ? dishes.filter((d) => d.category_id === selectedCategory && d.available)
    : dishes.filter((d) => d.available);

  const addToCart = (dish: Dish) => {
    const existing = cart.find((item) => item.dish.id === dish.id);
    if (existing) {
      setCart(cart.map((item) =>
        item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { dish, quantity: 1 }]);
    }
  };

  const getCartQuantity = (dishId: number) => {
    return cart.find((item) => item.dish.id === dishId)?.quantity || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-warm-200 border-t-accent-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-warm-900 tracking-tight mb-6">菜单</h1>

      {/* Category filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium ${
            selectedCategory === null
              ? 'bg-warm-800 text-white'
              : 'bg-white text-warm-500 border border-warm-200 hover:border-warm-300 hover:text-warm-700'
          }`}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              selectedCategory === cat.id
                ? 'bg-warm-800 text-white'
                : 'bg-white text-warm-500 border border-warm-200 hover:border-warm-300 hover:text-warm-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Dish grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDishes.map((dish) => {
          const qty = getCartQuantity(dish.id);
          return (
            <div key={dish.id} className="bg-white rounded-2xl border border-warm-200 overflow-hidden hover:shadow-sm">
              <div className="h-44 bg-warm-100 flex items-center justify-center text-5xl">
                {dish.image_url ? (
                  <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
                ) : (
                  '🍜'
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-warm-900">{dish.name}</h3>
                <p className="text-warm-400 text-sm mt-1 line-clamp-2">{dish.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-accent-600 font-semibold text-lg">{formatPrice(dish.price)}</span>
                  <div className="flex items-center gap-2">
                    {qty > 0 && (
                      <span className="text-xs text-warm-400 bg-warm-100 px-2 py-0.5 rounded-full">
                        {qty}份
                      </span>
                    )}
                    <button
                      onClick={() => addToCart(dish)}
                      className="w-8 h-8 rounded-full bg-warm-800 text-white text-sm hover:bg-warm-700 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDishes.length === 0 && (
        <div className="text-center py-16 text-warm-400">
          暂无菜品
        </div>
      )}
    </div>
  );
}
