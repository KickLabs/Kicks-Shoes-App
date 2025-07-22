import React, { createContext, useContext, useState, ReactNode } from "react";
import { DiscountValidationResult } from "@/services/discount";

interface DiscountContextType {
  discount: DiscountValidationResult | null;
  setDiscount: (discount: DiscountValidationResult | null) => void;
  clearDiscount: () => void;
}

const DiscountContext = createContext<DiscountContextType | undefined>(
  undefined
);

export const useDiscount = () => {
  const context = useContext(DiscountContext);
  if (!context) {
    throw new Error("useDiscount must be used within a DiscountProvider");
  }
  return context;
};

interface DiscountProviderProps {
  children: ReactNode;
}

export const DiscountProvider: React.FC<DiscountProviderProps> = ({
  children,
}) => {
  const [discount, setDiscount] = useState<DiscountValidationResult | null>(
    null
  );

  const clearDiscount = () => {
    setDiscount(null);
  };

  const value: DiscountContextType = {
    discount,
    setDiscount,
    clearDiscount,
  };

  return (
    <DiscountContext.Provider value={value}>
      {children}
    </DiscountContext.Provider>
  );
};
