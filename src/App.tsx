import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { LanguageProvider } from "./lib/i18n";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import ScanResult from "./pages/ScanResult";
import VulnerabilityDetail from "./pages/VulnerabilityDetail";
import QRAuthPage from "./pages/QRAuthPage";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Arena from "./pages/Arena";
import ArenaSession from "./pages/ArenaSession";
import Scanner from "./pages/Scanner";
import Profile from "./pages/Profile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/courses" component={Courses} />
      <Route path="/courses/:id" component={CourseDetail} />
      <Route path="/arena" component={Arena} />
      <Route path="/scanner" component={Scanner} />
      <Route path="/arena" component={Arena} />
      <Route path="/arena/session/:id" component={ArenaSession} />
      <Route path="/tournaments" component={Arena} />
      <Route path="/rankings" component={Arena} />
      <Route path="/scan/:id" component={ScanResult} />
      <Route path="/vulnerability/:cveId" component={VulnerabilityDetail} />
      <Route path="/profile" component={Profile} />
      <Route path="/auth/qr" component={QRAuthPage} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
