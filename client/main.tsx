import "./global.css";

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import LoginForm from "./pages/LoginForm";
import SignUp from "./pages/SignUp";
import App from "./App";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import { EnhancedWordCardDemo } from "./components/EnhancedWordCardDemo";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const MainApp = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/app" element={<App />} />
            <Route path="/profile" element={<Login />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/word-card-demo" element={<EnhancedWordCardDemo />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// Ensure we only create the root once
const rootElement = document.getElementById("root");
if (rootElement && !rootElement.dataset.reactRoot) {
  rootElement.dataset.reactRoot = "true";
  const root = createRoot(rootElement);
  root.render(<MainApp />);
}
