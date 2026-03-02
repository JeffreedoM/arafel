import { Menu, ShoppingCart, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function Header() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [toggleBurgerMenu, setToggleBurgerMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header className="bg-background sticky top-0 z-20 flex h-[80px] items-center justify-between gap-x-16 px-4 py-2">
        <h1 className="text-primary text-lg font-bold lg:text-xl">
          Arafel's Gift Shop
        </h1>

        {/* For desktop */}
        {!isMobile && (
          <ul className="flex flex-grow items-center space-x-5 text-sm font-semibold lg:space-x-10 xl:space-x-14">
            <li className="flex-grow">
              <input
                type="text"
                placeholder="Search Product"
                className="w-full rounded-md bg-gray-100 p-2.5 px-4 outline-none"
              />
            </li>
            <li>Products</li>
            <li>Categories</li>
            <li>
              <ShoppingCart size={20} />
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
          <div>Products</div>
          <div>Categories</div>
          <div>Cart</div>
        </div>
      )}
    </>
  );
}
