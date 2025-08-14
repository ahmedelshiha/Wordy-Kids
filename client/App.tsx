import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import LoginForm from "./pages/LoginForm";
import SignUp from "./pages/SignUp";
import AppPage from "./pages/App";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import { EnhancedWordCardDemo } from "./components/EnhancedWordCardDemo";
import {
  WordDatabaseNotifications,
  CompactWordDatabaseNotifications,
} from "./components/WordDatabaseNotifications";

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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
