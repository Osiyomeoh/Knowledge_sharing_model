// src/types/global.d.ts

interface Window {
    ethereum: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, handler: (...args: any[]) => void) => void;
      removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
    };
  }