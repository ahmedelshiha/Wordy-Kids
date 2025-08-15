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

// Import all page components
import LoginForm from "./pages/LoginForm";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AppPage from "./pages/App";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import WordGardenDemo from "./pages/WordGardenDemo";
import { EnhancedWordCardDemo } from "./components/EnhancedWordCardDemo";
import { WordAdventureDemo } from "./pages/WordAdventureDemo";
import { WordAdventureTest } from "./pages/WordAdventureTest";

const queryClient = new QueryClient();

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
          <Route path="/profile" element={<Login />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/word-card-demo" element={<EnhancedWordCardDemo />} />
          <Route path="/word-garden-demo" element={<WordGardenDemo />} />
          <Route path="/word-adventure-demo" element={<WordAdventureDemo />} />
          <Route path="/WordAdventureDemo" element={<WordAdventureDemo />} />
          <Route path="/word-adventure-test" element={<WordAdventureTest />} />
          <Route path="/WordAdventureTest" element={<WordAdventureTest />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
