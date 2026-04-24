import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { useLanguage } from "../lib/i18n";
import { useCreateScan, useScans } from "../hooks/use-scans";
import { StatsCharts } from "../components/StatsCharts";
import { Loader2, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "../lib/utils";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";

export default function Dashboard() {
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { mutate: createScan, isPending } = useCreateScan();
  const { data: scans } = useScans();
  
  const [target, setTarget] = useState("");
  const [scanType, setScanType] = useState<"general" | "sql_injection" | "code_review">("general");

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "Please login to access the dashboard.",
        variant: "destructive",
      });
      setLocation("/auth");
    }
  }, [user, authLoading, setLocation, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim()) return;
    createScan({ target, scanType });
    setTarget("");
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Input Section */}
          <div className="flex-1">
            <div className="cyber-card p-6 md:p-8 mb-8">
              <h2 className="text-2xl font-display mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-primary block animate-pulse"></span>
                {t('dashboard.title')}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-mono text-primary uppercase tracking-wider">{t('scan.type.label')}</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['general', 'sql_injection', 'code_review'] as const).map((type) => (
                      <div 
                        key={type}
                        onClick={() => setScanType(type)}
                        className={cn(
                          "cursor-pointer p-3 border rounded text-center font-mono text-sm uppercase transition-all",
                          scanType === type 
                            ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(0,255,65,0.2)]" 
                            : "bg-black/40 border-gray-800 text-gray-500 hover:border-primary/50"
                        )}
                      >
                        {type.replace('_', ' ')}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-mono text-primary uppercase tracking-wider">{t('scan.input.label')}</label>
                  <textarea
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full h-40 cyber-input p-4 rounded font-mono text-sm"
                    placeholder="// Paste code snippet or enter URL here..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isPending || !target.trim()}
                  className="w-full cyber-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('scan.scanning')}
                    </>
                  ) : (
                    t('scan.button')
                  )}
                </button>
              </form>
            </div>

            {/* Recent Scans List */}
            <div className="cyber-card p-6">
              <h3 className="text-xl font-display mb-4 border-b border-gray-800 pb-2">{t('scan.recent')}</h3>
              <div className="space-y-3">
                {scans?.map((scan) => (
                  <Link key={scan.id} href={`/scan/${scan.id}`}>
                    <div className="group flex items-center justify-between p-4 bg-black/40 border border-gray-800 rounded hover:border-primary/50 cursor-pointer transition-all">
                      <div className="flex items-center gap-4">
                        {scan.isSafe ? (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-accent animate-pulse" />
                        )}
                        <div>
                          <div className="font-mono text-sm text-white truncate max-w-[200px] md:max-w-md">{scan.target}</div>
                          <div className="text-xs text-gray-500 uppercase">{scan.scanType.replace('_', ' ')} • {new Date(scan.createdAt!).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
                {scans?.length === 0 && (
                  <div className="text-center text-gray-500 py-8 font-mono">No operations recorded.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <StatsCharts />
      </div>
    </Layout>
  );
}
