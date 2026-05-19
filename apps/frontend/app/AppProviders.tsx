"use client";

import React, { createContext, useContext } from "react";
import { useCuverie } from "../hooks/useCuverie";

type CuverieContextValue = ReturnType<typeof useCuverie>;

const CuverieContext = createContext<CuverieContextValue | null>(null);

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const value = useCuverie();
  return <CuverieContext.Provider value={value}>{children}</CuverieContext.Provider>;
};

export const useApp = () => {
  const value = useContext(CuverieContext);
  if (!value) {
    throw new Error("useApp doit etre utilise dans AppProviders");
  }

  return value;
};
