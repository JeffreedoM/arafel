import { Menu, ShoppingCart, X, Search } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { supabase } from "@/lib/supabase-client";

export default function Header() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [toggleBurgerMenu, setToggleBurgerMenu] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null); // Para ma-detect kung nag-click sa labas ng dropdown

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // DEBOUNCE LOGIC: Ito ang gumagawa ng interval/delay para hindi mabigat sa fetching
  useEffect(() => {
    // Kung walang laman ang search input, linisin ang dropdown at huwag mag-fetch
    if (searchQuery.trim() === "") {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Mag-antay ng 500ms matapos tumigil sa pag-type ang user bago tumakbo ang code sa loob
    const delayDebounceFn = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, product_name, price")
          .ilike("product_name", `%${searchQuery.trim()}%`)
          .limit(5); // Limitahan sa 5 items lang para malinis tingnan ang dropdown

        if (error) throw error;
        setSuggestions(data || []);
      } catch (err) {
        console.error("Autocomplete error:", err.message);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms delay interval

    // Linisin ang timer kapag nag-type uli ang user bago matapos ang kalahating segundo
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Isara ang dropdown kapag nag-click ang user sa labas ng search bar
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Kapag pinindot ang 'Enter' key o i-click ang search icon
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
      <header className="bg-background sticky top-0 z-20 flex h-[80px] items-center justify-between gap-x-16 border-b border-gray-100 px-4 py-2">
        <Link to="/" className="text-primary text-lg font-bold lg:text-xl">
          Arafel's Gift Shop
        </Link>

        {/* For Desktop */}
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
                  {/* Loading State habang naghihintay ng interval */}
                  {isSearching && (
                    <div className="animate-pulse p-3 text-sm text-gray-500 italic">
                      Searching for matches...
                    </div>
                  )}

                  {/* Kapag tapos na mag-load at walang nakitang match */}
                  {!isSearching && suggestions.length === 0 && (
                    <div className="p-3 text-sm text-gray-500">
                      No matches found for "{searchQuery}"
                    </div>
                  )}

                  {/* Listahan ng mga nahanap na produkto */}
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

                      {/* View All Results Trigger */}
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
          </ul>
        )}

        {/* For Mobile */}
        {isMobile && (
          <button
            className="z-30 cursor-pointer p-2"
            onClick={() => setToggleBurgerMenu(!toggleBurgerMenu)}
          >
            {toggleBurgerMenu ? <X /> : <Menu size={24} />}
          </button>
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
          <div>Categories</div>
          <div>Cart</div>
        </div>
      )}
    </>
  );
}
