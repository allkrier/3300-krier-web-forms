import { ReactNode } from "react";
import { Link } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-[#fcfcfc] text-[#1a1a1a]">
      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 sm:px-6 md:px-8">
        {children}
      </main>
      
      <footer className="py-6 mt-12 border-t border-gray-200">
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 md:px-8 text-center">
          <p className="text-sm text-gray-500 font-medium" data-testid="footer-text">
            Survey by Allie Krier, BAIS:3300 - spring 2026.
          </p>
        </div>
      </footer>
    </div>
  );
}
