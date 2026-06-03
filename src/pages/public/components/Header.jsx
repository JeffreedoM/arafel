import { Menu, ShoppingCart, X, Search } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "@/lib/supabase-client";
import { useCart } from "@/hooks/useCart"; // 1. In-import ang cart custom hook
import Cart from "../Cart/Cart"; // 2. In-import ang Cart overlay drawer component

export default function Header() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [toggleBurgerMenu, setToggleBurgerMenu] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false); // State para sa pagbukas/pagsara ng cart

  // Kunin ang cart items galing sa global context
  const { cartItems } = useCart();

  // Kwentahin ang kabuuang bilang ng mga items (e.g., kung 2x Item A + 1x Item B = 3 items total)
  const totalCartCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // DEBOUNCE LOGIC
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, product_name, price")
          .ilike("product_name", `%${searchQuery.trim()}%`)
          .limit(5);

        if (error) throw error;
        setSuggestions(data || []);
      } catch (err) {
        console.error("Autocomplete error:", err.message);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Isara ang dropdown kapag nag-click sa labas
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerFullSearch = () => {
    setShowDropdown(false);
    if (searchQuery.trim() !== "") {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/products");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      triggerFullSearch();
    }
  };

  return (
    <>
      <header className="bg-background sticky top-0 z-20 flex h-[80px] items-center justify-between gap-x-6 border-b border-gray-100 px-4 py-2 lg:gap-x-16">
        <Link
          to="/"
          className="text-primary flex-shrink-0 text-lg font-bold lg:text-xl"
        >
          Arafel's Gift Shop
        </Link>

        {/* For Desktop Layout */}
        {!isMobile && (
          <ul className="flex flex-grow items-center space-x-5 text-sm font-semibold lg:space-x-10 xl:space-x-14">
            {/* SEARCH COMPONENT CONTAINER */}
            <li className="relative flex-grow" ref={dropdownRef}>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search Product..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-md bg-gray-100 p-2.5 pr-10 pl-4 transition outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <Search
                  size={18}
                  className="absolute right-3 cursor-pointer text-gray-400 hover:text-indigo-600"
                  onClick={triggerFullSearch}
                />
              </div>

              {/* DROPDOWN MATCHES LIST */}
              {showDropdown && searchQuery.trim() !== "" && (
                <div className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white text-left font-normal shadow-lg">
                  {isSearching && (
                    <div className="animate-pulse p-3 text-sm text-gray-500 italic">
                      Searching for matches...
                    </div>
                  )}

                  {!isSearching && suggestions.length === 0 && (
                    <div className="p-3 text-sm text-gray-500">
                      No matches found for "{searchQuery}"
                    </div>
                  )}

                  {!isSearching && suggestions.length > 0 && (
                    <div className="flex flex-col">
                      <div className="bg-gray-50 px-3 py-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                        Product Matches
                      </div>
                      {suggestions.map((item) => (
                        <Link
                          key={item.id}
                          to={`/product/${item.id}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center justify-between border-b border-gray-50 px-4 py-2.5 text-sm text-gray-700 transition last:border-none hover:bg-indigo-50"
                        >
                          <span className="truncate pr-4 font-medium text-gray-900">
                            {item.product_name}
                          </span>
                          <span className="flex-shrink-0 font-semibold text-indigo-600">
                            ₱{Number(item.price).toFixed(2)}
                          </span>
                        </Link>
                      ))}

                      <button
                        onClick={triggerFullSearch}
                        className="w-full bg-indigo-50/50 py-2 text-center text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
                      >
                        See all results for "{searchQuery}"
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>

            <li>
              <Link to="/products" className="hover:text-indigo-600">
                Products
              </Link>
            </li>
            <li>
              <Link to="/categories" className="hover:text-indigo-600">
                Categories
              </Link>
            </li>

            {/* 3. DESKTOP CART ACCESSIBLE TRIGGER ICON */}
            <li>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 transition hover:text-indigo-600"
              >
                <ShoppingCart size={22} />
                {totalCartCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-md ring-2 ring-white">
                    {totalCartCount}
                  </span>
                )}
              </button>
            </li>
          </ul>
        )}

        {/* For Mobile Layout Header Right Control */}
        {isMobile && (
          <div className="z-30 flex items-center gap-x-2">
            {/* MOBILE CART ACCESSIBLE TRIGGER ICON */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-700 transition hover:text-indigo-600"
            >
              <ShoppingCart size={22} />
              {totalCartCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-md ring-2 ring-white">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Mobile Burger Menu Button */}
            <button
              className="cursor-pointer p-2 text-gray-700"
              onClick={() => setToggleBurgerMenu(!toggleBurgerMenu)}
            >
              {toggleBurgerMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        )}
      </header>

      {/* Fullscreen Mobile Menu Overlay */}
      {isMobile && toggleBurgerMenu && (
        <div className="fixed inset-0 z-10 flex flex-col items-center justify-center space-y-10 bg-white text-lg font-semibold">
          <div className="w-4/5">
            <input
              type="text"
              placeholder="Search Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  triggerFullSearch();
                  setToggleBurgerMenu(false);
                }
              }}
              className="w-full rounded-md bg-gray-100 p-2.5 px-4 outline-none"
            />
          </div>
          <div>
            <Link to="/products" onClick={() => setToggleBurgerMenu(false)}>
              Products
            </Link>
          </div>
          <div>
            <Link to="/categories" onClick={() => setToggleBurgerMenu(false)}>
              Categories
            </Link>
          </div>
          {/* Mobile Overlay Cart Text Link Option */}
          <div>
            <button
              onClick={() => {
                setToggleBurgerMenu(false); // Isara ang mobile menu
                setIsCartOpen(true); // Buksan ang slide panel cart
              }}
              className="flex items-center gap-2"
            >
              Cart ({totalCartCount})
            </button>
          </div>
        </div>
      )}

      {/* 4. CART OVERLAY PANEL - Magbubukas kahit saang page ka mag-click sa Header */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
