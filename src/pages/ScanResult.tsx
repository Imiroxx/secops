import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { useScan } from "../hooks/use-scans";
import { Layout } from "../components/Layout";
import { 
  Loader2, CheckCircle, AlertOctagon, Shield, AlertTriangle, 
  ChevronDown, ChevronUp, FileText, Bug, ShieldCheck, ArrowLeft,
  ExternalLink, Clock, Target
} from "lucide-react";
import { type AnalysisResult } from "@shared/schema";
import { Button } from "../components/ui/button";

function VulnerabilityCard({ vuln, idx }: { vuln: any; idx: number }) {
  const [expanded, setExpanded] = useState(true);
  
  const severityColors = {
    critical: 'bg-red-600 text-white border-red-600',
    high: 'bg-accent text-white border-accent',
    medium: 'bg-orange-500 text-white border-orange-500',
    low: 'bg-blue-500 text-white border-blue-500',
    info: 'bg-gray-500 text-white border-gray-500'
  };

  const severityIcons = {
    critical: <AlertOctagon className="w-6 h-6" />,
    high: <AlertTriangle className="w-6 h-6" />,
    medium: <AlertTriangle className="w-5 h-5" />,
    low: <Shield className="w-5 h-5" />,
    info: <ShieldCheck className="w-5 h-5" />
  };

  return (
    <div className="cyber-card overflow-hidden">
      <div 
        className={`p-6 cursor-pointer border-l-4 transition-all ${
          expanded ? 'bg-primary/5' : ''
        } ${severityColors[vuln.severity as keyof typeof severityColors] || severityColors.medium}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-black/30 rounded-lg">
              {severityIcons[vuln.severity as keyof typeof severityIcons] || severityIcons.medium}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${
                  severityColors[vuln.severity as keyof typeof severityColors] || severityColors.medium
                }`}>
                  {vuln.severity}
                </span>
                <span className="text-gray-400 text-sm font-mono">#{idx + 1}</span>
              </div>
              <h3 className="text-lg font-display text-white">{vuln.type}</h3>
            </div>
          </div>
          <div className="text-gray-400">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
        
        {!expanded && (
          <p className="mt-2 text-gray-400 text-sm font-mono line-clamp-2 pl-16">
            {vuln.description}
          </p>
        )}
      </div>
      
      {expanded && (
        <div className="p-6 pt-0 bg-black/20">
          <div className="border-t border-primary/10 pt-4 mt-2">
            {/* Description Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Bug className="w-4 h-4 text-accent" />
                <h4 className="text-accent font-bold text-sm uppercase">Описание угрозы</h4>
              </div>
              <p className="text-gray-300 leading-relaxed font-mono text-sm pl-6">
                {vuln.description}
              </p>
            </div>
            
            {/* Impact Section */}
            {vuln.impact && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-orange-400" />
                  <h4 className="text-orange-400 font-bold text-sm uppercase">Возможное воздействие</h4>
                </div>
                <p className="text-gray-300 leading-relaxed font-mono text-sm pl-6">
                  {vuln.impact}
                </p>
              </div>
            )}
            
            {/* Evidence/Proof Section */}
            {vuln.evidence && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-primary" />
                  <h4 className="text-primary font-bold text-sm uppercase">Доказательства</h4>
                </div>
                <div className="bg-black/50 border border-primary/20 rounded p-4 pl-6 overflow-x-auto">
                  <pre className="text-emerald-400 font-mono text-xs whitespace-pre-wrap">{vuln.evidence}</pre>
                </div>
              </div>
            )}
            
            {/* Remediation Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-emerald-400 font-bold text-sm uppercase">Как исправить</h4>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 pl-6">
                <p className="text-gray-300 leading-relaxed font-mono text-sm whitespace-pre-wrap">
                  {vuln.remediation}
                </p>
              </div>
            </div>
            
            {/* References Section */}
            {vuln.references && vuln.references.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                  <h4 className="text-blue-400 font-bold text-sm uppercase">Полезные ссылки</h4>
                </div>
                <ul className="space-y-2 pl-6">
                  {vuln.references.map((ref: string, i: number) => (
                    <li key={i}>
                      <a 
                        href={ref} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm font-mono flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3" />
                        {ref}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScanResult() {
  const { id } = useParams();
  const { data: scan, isLoading, error } = useScan(Number(id));
  const [showRecommendations, setShowRecommendations] = useState(true);

  if (isLoading) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    </Layout>
  );

  if (error || !scan) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[50vh] text-accent">
        Error loading scan results.
      </div>
    </Layout>
  );

  const result = scan.result as unknown as AnalysisResult;
  const vulnCount = scan.vulnerabilityCount || 0;

  // Group vulnerabilities by severity
  const groupedVulns = result.vulnerabilities.reduce((acc: any, vuln: any) => {
    const sev = vuln.severity || 'medium';
    if (!acc[sev]) acc[sev] = [];
    acc[sev].push(vuln);
    return acc;
  }, {});

  const severityOrder = ['critical', 'high', 'medium', 'low', 'info'];
  const sortedVulns = severityOrder.flatMap(sev => groupedVulns[sev] || []);

  return (
    <Layout>
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <Link href="/scanner">
              <Button variant="outline" className="mb-6 border-primary/30 hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Новый скан
              </Button>
            </Link>
            
            <div className={`cyber-card p-8 border-t-4 ${scan.isSafe ? 'border-t-emerald-500' : 'border-t-accent'}`}>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-gray-400 font-mono text-sm">Отчет #{scan.id}</span>
                    <span className="text-gray-600">|</span>
                    <span className="text-gray-400 font-mono text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(scan.createdAt || Date.now()).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-display text-white mb-2">
                    {scan.isSafe ? '✅ Система безопасна' : '⚠️ Обнаружены уязвимости'}
                  </h1>
                  <p className="font-mono text-gray-400 text-sm break-all">{scan.target}</p>
                </div>
                
                <div className={`flex items-center gap-4 px-8 py-4 rounded-xl border-2 ${
                  scan.isSafe 
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                    : 'bg-accent/10 border-accent/50 text-accent'
                }`}>
                  {scan.isSafe ? <CheckCircle className="w-10 h-10" /> : <AlertOctagon className="w-10 h-10" />}
                  <div className="text-center">
                    <div className="text-3xl font-display font-bold">{vulnCount}</div>
                    <div className="text-xs uppercase tracking-wider">{vulnCount === 1 ? 'уязвимость' : vulnCount < 5 ? 'уязвимости' : 'уязвимостей'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="container mx-auto px-4 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['critical', 'high', 'medium', 'low'].map((sev) => {
              const count = groupedVulns[sev]?.length || 0;
              const colors = {
                critical: 'bg-red-600/20 border-red-600/50 text-red-400',
                high: 'bg-accent/20 border-accent/50 text-accent',
                medium: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
                low: 'bg-blue-500/20 border-blue-500/50 text-blue-400'
              };
              return (
                <div key={sev} className={`cyber-card p-4 border ${colors[sev as keyof typeof colors]}`}>
                  <div className="text-2xl font-display font-bold">{count}</div>
                  <div className="text-xs uppercase tracking-wider opacity-70">{sev}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-20">
          {/* Summary */}
          <div className="cyber-card p-6 mb-8">
            <h2 className="text-xl font-display text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Резюме анализа
            </h2>
            <p className="text-gray-300 leading-relaxed font-mono text-sm">
              {result.summary}
            </p>
          </div>

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="cyber-card p-6 mb-8">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowRecommendations(!showRecommendations)}
              >
                <h2 className="text-xl font-display text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Общие рекомендации по безопасности
                </h2>
                {showRecommendations ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
              
              {showRecommendations && (
                <ul className="mt-4 space-y-3">
                  {result.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300 font-mono text-sm">
                      <span className="text-emerald-400 mt-0.5">▸</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Vulnerabilities */}
          {sortedVulns.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-display text-white mb-6 flex items-center gap-2">
                <Bug className="w-6 h-6 text-accent" />
                Детальная информация об уязвимостях
              </h2>
              
              {sortedVulns.map((vuln: any, idx: number) => (
                <VulnerabilityCard key={idx} vuln={vuln} idx={idx} />
              ))}
            </div>
          ) : (
            <div className="cyber-card p-12 text-center border-emerald-500/30">
              <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
              <h3 className="text-2xl font-display text-white mb-3">Уязвимостей не обнаружено</h3>
              <p className="text-gray-400 font-mono max-w-md mx-auto">
                Система прошла проверку безопасности. Никаких критических проблем не выявлено.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
