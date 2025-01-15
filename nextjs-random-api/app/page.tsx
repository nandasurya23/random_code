'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  rating: { rate: number; count: number };
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<string>('price-asc');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [cartItems, setCartItems] = useState<number>(0);
  const [wishlistItems, setWishlistItems] = useState<number>(0);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [visibleProductsCount, setVisibleProductsCount] = useState<number>(6);
  const [loading, setLoading] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState<string>('USD');
  const exchangeRate = 15000;

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); 
  const [isModalOpen, setIsModalOpen] = useState(false); 

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://fakestoreapi.com/products');
        if (!res.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    if (minPrice > 0 || maxPrice < 1000) {
      filtered = filtered.filter((product) => product.price >= minPrice && product.price <= maxPrice);
    }

    if (selectedRating > 0) {
      filtered = filtered.filter((product) => product.rating.rate >= selectedRating);
    }

    if (sortOption === 'price-asc') {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
      filtered = filtered.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating') {
      filtered = filtered.sort((a, b) => b.rating.rate - a.rating.rate);
    } else if (sortOption === 'title') {
      filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'popularity') {
      filtered = filtered.sort((a, b) => b.rating.count - a.rating.count);
    }

    setFilteredProducts(filtered);
  }, [
    searchQuery,
    selectedCategory,
    sortOption,
    minPrice,
    maxPrice,
    selectedRating,
    products,
  ]);

  const loadMoreProducts = () => {
    setVisibleProductsCount(visibleProductsCount + 6);
  };

  const addToCart = () => {
    setCartItems(cartItems + 1);
  };

  const addToWishlist = () => {
    setWishlistItems(wishlistItems + 1);
    alert('Product added to wishlist!');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setMinPrice(0);
    setMaxPrice(1000);
    setSortOption('price-asc');
    setSelectedRating(0);
  };

  const getStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStars = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStars;

    return (
      <>
        {'★'.repeat(fullStars)}
        {halfStars ? '☆' : ''}
        {'☆'.repeat(emptyStars)}
      </>
    );
  };

  const convertPrice = (price: number, currency: string) => {
    switch (currency) {
      case 'IDR':
        return price * exchangeRate;
      case 'USD':
      default:
        return price;
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'IDR':
        return 'RP';
      case 'USD':
      default:
        return '$';
    }
  };

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center mb-6">Featured Products</h1>

      <div className="flex justify-end mb-4">
        <select
          className="px-4 py-2 border rounded-md"
          value={currencySymbol}
          onChange={(e) => setCurrencySymbol(e.target.value)}
        >
          <option value="USD">USD ($)</option>
          <option value="IDR">IDR (RP)</option>
        </select>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex gap-4 flex-wrap w-full md:w-auto">
          <input
            type="text"
            className="px-4 py-2 border rounded-md w-full sm:w-72"
            placeholder="Search Products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="px-4 py-2 border rounded-md w-full sm:w-72"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="jewelery">Jewelry</option>
            <option value="men's clothing">Men&apos;s Clothing</option>
            <option value="women's clothing">Women&apos;s Clothing</option>
          </select>
          <input
            type="number"
            className="px-4 py-2 border rounded-md w-full sm:w-32"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
          />
          <input
            type="number"
            className="px-4 py-2 border rounded-md w-full sm:w-32"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
          <select
            className="px-4 py-2 border rounded-md w-full sm:w-72"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="price-asc">Price: High to Low</option>
            <option value="price-desc">Price: Low to High</option>
            <option value="rating">Rating</option>
            <option value="title">Title</option>
            <option value="popularity">Popularity</option>
          </select>
          <select
            className="px-4 py-2 border rounded-md w-full sm:w-72"
            value={selectedRating}
            onChange={(e) => setSelectedRating(Number(e.target.value))}
          >
            <option value={0}>All Ratings</option>
            <option value={3}>3 Stars & Up</option>
            <option value={4}>4 Stars & Up</option>
            <option value={5}>5 Stars</option>
          </select>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <div className="spinner"></div>
        </div>
      ) : (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {filteredProducts.slice(0, visibleProductsCount).map((product) => {
    const priceInSelectedCurrency = convertPrice(product.price, currencySymbol);
    return (
      <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
        <div className="h-48">
          <Image
            src={product.image}
            alt={product.title}
            layout="intrinsic"
            width={500}
            height={500}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="p-4 flex-1 bg-blue-100">
          {/* <h3 className="text-xl font-semibold">{product.title}</h3> */}
          <div className="flex items-center justify-between mt-3">
            <div className="text-xl font-semibold">
              <span>
                {getCurrencySymbol(currencySymbol)}{' '}
                {priceInSelectedCurrency.toLocaleString()}
              </span>
            </div>
            <div className="text-yellow-500">{getStarRating(product.rating.rate)}</div>
          </div>
          <div className="flex justify-between gap-2 mt-4">
            <button
              onClick={addToCart}
              className="bg-blue-500 text-white py-2 px-4 rounded-md"
            >
              Add to Cart <FaShoppingCart className="inline ml-2" />
            </button>
            <button
              onClick={addToWishlist}
              className="bg-pink-500 text-white py-2 px-4 rounded-md"
            >
              Add to Wishlist <FaHeart className="inline ml-2" />
            </button>
          </div>
          <button
            onClick={() => openModal(product)}
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md w-full mt-4"
          >
            View Details
          </button>
        </div>
      </div>
    );
  })}
</div>

      )}

      {/* Load More Button */}
      {visibleProductsCount < filteredProducts.length && (
        <div className="text-center mt-6">
          <button
            onClick={loadMoreProducts}
            className="bg-gray-700 text-white py-2 px-4 rounded-md"
          >
            Load More Products
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-3/4 max-w-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">{selectedProduct.title}</h2>
            <p>{selectedProduct.description}</p>
            <div className="flex justify-between mt-4">
              <div className="text-xl font-semibold">
                <span>
                  {getCurrencySymbol(currencySymbol)}{' '}
                  {convertPrice(selectedProduct.price, currencySymbol).toLocaleString()}
                </span>
              </div>
              <div className="text-yellow-500">{getStarRating(selectedProduct.rating.rate)}</div>
            </div>
            <div className="flex justify-between gap-2 mt-4">
              <button
                onClick={addToCart}
                className="bg-blue-500 text-white py-2 px-4 rounded-md"
              >
                Add to Cart <FaShoppingCart className="inline ml-2" />
              </button>
              <button
                onClick={addToWishlist}
                className="bg-pink-500 text-white py-2 px-4 rounded-md"
              >
                Add to Wishlist <FaHeart className="inline ml-2" />
              </button>
            </div>
            <button
              onClick={closeModal}
              className="mt-4 text-red-500 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
