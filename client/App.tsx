import "./global.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import UI components
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Import notification components
import {
  WordDatabaseNotifications,
  CompactWordDatabaseNotifications,
} from "./components/WordDatabaseNotifications";

// Import essential components
import LoginForm from "./pages/LoginForm";
import SignUp from "./pages/SignUp";
import AppPage from "./pages/App";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Test with notification components
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <WordDatabaseNotifications />
      <CompactWordDatabaseNotifications />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/app" element={<AppPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
