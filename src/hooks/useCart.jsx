import { useContext } from "react";
import { CartContext } from "@/contexts/CartContext"; // I-import ang context mula sa kabilang file

// Dahil purong function/hook lang ang laman nito, hindi magrereklamo ang Fast Refresh
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
