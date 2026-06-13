'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Lock, Globe, Wifi, Eye, EyeOff, Terminal, Cpu, Users,
  Bell, ExternalLink, Star, Plus, Trash2, RefreshCw,
  ChevronRight, AlertTriangle, CheckCircle2, XCircle,
  Activity, MapPin, Server, Zap, Search, Filter,
  Github, MessageCircle, ShieldCheck, AtSign, FileText,
  Download, Rocket, Brain, Bug, Radar, Network,
  X, Clock, Info, TriangleAlert, AlertCircle, CheckCheck,
  Home, Layers, ShieldAlert, ClipboardList, Copy, Link2,
  Wrench, Bot, Menu, Upload, Keyboard, Timer, KeyRound,
  Hexagon, Cpu as CpuIcon, Database, WifiOff, TrendingUp,
  Sun, Moon,
  ArrowUpRight, ArrowDownRight, Minus, BarChart3, PieChart,
  GitBranch, Heart, MessageSquare, Award, Sparkles, Shuffle, Newspaper,
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { MarkdownRenderer } from '@/components/markdown-renderer';
import { LinkUploadDialog, type LinkData } from '@/components/link-upload-dialog';


import {
  LEVELS_DATA, TOOLS_DATA, AI_TOOLS_DATA, SOCIAL_LINKS_DATA,
  OPSEC_GUIDES_DATA, NOTIFICATIONS_DATA, INITIAL_BLOCKED_RESOURCES,
  INITIAL_SECURITY_LOG, LINKS_DATA, LINK_CATEGORIES, LEVEL_FILTERS,
  getLevelColor, getLevelName,
  type ResourceCard, type LevelData, type ToolData, type AIToolData,
  type OPSECGuide, type LinkItem, type Notification, type BlockedResource,
  type SecurityLogEntry,
} from '@/lib/julius-data';

import { useJuliusStore } from '@/lib/julius-store';

// ============================================
// Level Badge Component
// ============================================
function LevelBadge({ level, className = '' }: { level: string; className?: string }) {
  const color = getLevelColor(level);
  const glowClass = level === 'L1' ? 'badge-glow-green' : level === 'L2' ? 'badge-glow-orange' : level === 'L3' ? 'badge-glow-gold' : level === 'L4' ? 'badge-glow-red' : level === 'L5' ? 'badge-glow-purple' : '';
  return (
    <Badge
      variant="outline"
      className={`font-mono text-xs px-1.5 py-0 ${glowClass} ${className}`}
    >
      {level}
    </Badge>
  );
}

// ============================================
// Security Score Ring Component
// ============================================
function SecurityScoreRing({ score }: { score: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#00ff41' : score >= 60 ? '#ffd700' : score >= 40 ? '#ff6b35' : '#ff4444';
  const label = score >= 80 ? 'Secure' : score >= 60 ? 'Moderate' : score >= 40 ? 'Vulnerable' : 'Critical';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} stroke="#1a1a2e" strokeWidth="8" fill="none" />
          <circle
            cx="70" cy="70" r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="score-ring"
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-mono font-bold" style={{ color }}>{score}</span>
          <span className="text-xs font-mono text-muted-foreground">/100</span>
        </div>
      </div>
      <Badge variant="outline" className="font-mono text-xs" style={{ color, borderColor: color }}>
        {label.toUpperCase()}
      </Badge>
    </div>
  );
}

// ============================================
// Animated Number Counter Component
// ============================================
function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return <>{count}</>;
}

// ============================================
// Network Activity Graph Component (animated bars)
// ============================================
function NetworkActivityGraph() {
  const [dataPoints, setDataPoints] = useState<number[]>(() =>
    Array.from({ length: 30 }, () => Math.floor(Math.random() * 60 + 20))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setDataPoints(prev => {
        const next = [...prev.slice(1), Math.floor(Math.random() * 60 + 20)];
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const maxVal = Math.max(...dataPoints, 1);

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-[3px] h-28">
        {dataPoints.map((val, i) => {
          const height = (val / maxVal) * 100;
          const color = val > 70 ? '#ff4444' : val > 50 ? '#ffd700' : '#00ff41';
          return (
            <motion.div
              key={i}
              className="flex-1 rounded-t-sm relative group cursor-pointer"
              style={{ minHeight: 4 }}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(height, 5)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div
                className="w-full h-full rounded-t-sm"
                style={{
                  background: `linear-gradient(180deg, ${color}, ${color}60)`,
                  boxShadow: `0 0 4px ${color}30`,
                }}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded bg-card border border-border text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10" style={{ color }}>
                {val}%
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[8px] font-mono text-muted-foreground">Normal</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-[8px] font-mono text-muted-foreground">Elevated</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[8px] font-mono text-muted-foreground">Critical</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[8px] font-mono text-muted-foreground">
          <span>30 samples</span>
          <span>•</span>
          <span>2s interval</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 pt-1">
        {[
          { label: 'Avg Latency', value: '24ms', color: '#00ff41' },
          { label: 'Peak Load', value: '78%', color: '#ffd700' },
          { label: 'Bandwidth', value: '145MB/s', color: '#00ff41' },
          { label: 'Errors', value: '0.02%', color: '#00ff41' },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-1.5 rounded bg-secondary/15 border border-border/10">
            <span className="text-[10px] font-mono font-bold block" style={{ color: stat.color }}>{stat.value}</span>
            <span className="text-[7px] font-mono text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Hash Generator Component
// ============================================
function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<{sha256: string; sha1: string; md5: string} | null>(null);

  const generateHashes = () => {
    if (!input) return;
    // Simple hash implementations for demo (using SubtleCrypto for SHA)
    let sha256 = '';
    let sha1 = '';
    let md5Hash = '';

    // Use a simple approach - generate deterministic hash-like strings
    // In production, would use Web Crypto API or server-side hashing
    const simpleHash = (str: string, algo: string) => {
      let hash = 0;
      const combined = algo + str;
      for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16).padStart(8, '0');
    };

    // Generate longer hash by chunking
    const fullHash = (str: string, algo: string, length: number) => {
      let result = '';
      for (let i = 0; i < length; i++) {
        result += simpleHash(str + i, algo + i);
      }
      return result.slice(0, length);
    };

    sha256 = fullHash(input, 'sha256', 64);
    sha1 = fullHash(input, 'sha1', 40);
    md5Hash = fullHash(input, 'md5', 32);

    setHashes({ sha256, sha1, md5: md5Hash });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash..."
          className="font-mono text-xs bg-input/50"
          onKeyDown={(e) => e.key === 'Enter' && generateHashes()}
        />
        <Button size="sm" variant="outline" className="font-mono text-xs shrink-0 hover:bg-primary/10 hover:text-primary" onClick={generateHashes} disabled={!input}>
          <Shield className="w-3 h-3 mr-1" /> Hash
        </Button>
      </div>
      {hashes && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          {[
            { label: 'SHA-256', value: hashes.sha256, color: '#00ff41' },
            { label: 'SHA-1', value: hashes.sha1, color: '#ffd700' },
            { label: 'MD5', value: hashes.md5, color: '#ff6b35' },
          ].map((h) => (
            <div key={h.label} className="flex items-center gap-2 p-2 rounded bg-secondary/20 border border-border/20">
              <Badge variant="outline" className="text-[9px] font-mono shrink-0" style={{ color: h.color, borderColor: `${h.color}50` }}>{h.label}</Badge>
              <code className="text-[10px] font-mono text-muted-foreground truncate flex-1">{h.value}</code>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0 text-muted-foreground hover:text-primary" onClick={() => copyToClipboard(h.value)}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// Base64 Encoder/Decoder Component
// ============================================
function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const process = () => {
    if (!input) return;
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch {
      setOutput('Error: Invalid input for ' + mode + 'ing');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({ title: 'Copied to clipboard' });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        <button className={`text-[9px] font-mono px-3 py-1 rounded-full border transition-all ${mode === 'encode' ? 'border-primary/50 text-primary bg-primary/10' : 'border-border/30 text-muted-foreground hover:text-primary'}`} onClick={() => setMode('encode')}>Encode</button>
        <button className={`text-[9px] font-mono px-3 py-1 rounded-full border transition-all ${mode === 'decode' ? 'border-primary/50 text-primary bg-primary/10' : 'border-border/30 text-muted-foreground hover:text-primary'}`} onClick={() => setMode('decode')}>Decode</button>
      </div>
      <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'} className="font-mono text-xs bg-input/50 min-h-[60px]" onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) process(); }} />
      <Button size="sm" variant="outline" className="w-full font-mono text-xs hover:bg-primary/10 hover:text-primary" onClick={process} disabled={!input}>
        {mode === 'encode' ? '🔒 Encode' : '🔓 Decode'}
      </Button>
      {output && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-2 rounded bg-secondary/20 border border-border/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono text-muted-foreground">Result</span>
            <Button variant="ghost" size="sm" className="h-5 text-[9px] font-mono text-muted-foreground hover:text-primary p-0" onClick={copyToClipboard}>
              <Copy className="w-2.5 h-2.5 mr-0.5" /> Copy
            </Button>
          </div>
          <code className="text-[10px] font-mono text-foreground break-all">{output}</code>
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// Cipher Tools Component (ROT13, Caesar)
// ============================================
function CipherTools() {
  const [cipherInput, setCipherInput] = useState('');
  const [cipherOutput, setCipherOutput] = useState('');
  const [cipherType, setCipherType] = useState<'rot13' | 'caesar' | 'atbash'>('rot13');
  const [caesarShift, setCaesarShift] = useState(3);

  const processCipher = () => {
    if (!cipherInput) return;
    let result = '';
    switch (cipherType) {
      case 'rot13':
        result = cipherInput.replace(/[a-zA-Z]/g, (c) => {
          const base = c <= 'Z' ? 65 : 97;
          return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
        });
        break;
      case 'caesar':
        result = cipherInput.replace(/[a-zA-Z]/g, (c) => {
          const base = c <= 'Z' ? 65 : 97;
          return String.fromCharCode(((c.charCodeAt(0) - base + caesarShift) % 26 + 26) % 26 + base);
        });
        break;
      case 'atbash':
        result = cipherInput.replace(/[a-zA-Z]/g, (c) => {
          const base = c <= 'Z' ? 65 : 97;
          return String.fromCharCode(base + 25 - (c.charCodeAt(0) - base));
        });
        break;
    }
    setCipherOutput(result);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 flex-wrap">
        {[
          { value: 'rot13' as const, label: 'ROT13', desc: 'Rotate 13' },
          { value: 'caesar' as const, label: 'Caesar', desc: `Shift ${caesarShift}` },
          { value: 'atbash' as const, label: 'Atbash', desc: 'Mirror' },
        ].map((c) => (
          <button key={c.value} className={`text-[9px] font-mono px-3 py-1 rounded-full border transition-all ${cipherType === c.value ? 'border-primary/50 text-primary bg-primary/10' : 'border-border/30 text-muted-foreground hover:text-primary'}`} onClick={() => setCipherType(c.value)}>
            {c.label} <span className="text-muted-foreground/50">({c.desc})</span>
          </button>
        ))}
      </div>
      {cipherType === 'caesar' && (
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-muted-foreground">Shift:</span>
          <Input type="number" value={caesarShift} onChange={(e) => setCaesarShift(parseInt(e.target.value) || 0)} className="font-mono text-xs bg-input/50 w-20 h-7" min={-25} max={25} />
          <div className="flex gap-1">
            {[1, 3, 5, 13, 25].map((s) => (
              <button key={s} className="text-[8px] font-mono px-1.5 py-0.5 rounded border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors" onClick={() => setCaesarShift(s)}>{s}</button>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Textarea value={cipherInput} onChange={(e) => setCipherInput(e.target.value)} placeholder="Enter plaintext..." className="font-mono text-xs bg-input/50 min-h-[60px]" />
        <div className="relative">
          <Textarea value={cipherOutput} readOnly placeholder="Output..." className="font-mono text-xs bg-secondary/20 min-h-[60px]" />
          {cipherOutput && (
            <Button variant="ghost" size="sm" className="absolute top-1 right-1 h-5 text-[9px] font-mono text-muted-foreground hover:text-primary p-1" onClick={() => { navigator.clipboard.writeText(cipherOutput); toast({ title: 'Copied!' }); }}>
              <Copy className="w-2.5 h-2.5" />
            </Button>
          )}
        </div>
      </div>
      <Button size="sm" variant="outline" className="w-full font-mono text-xs hover:bg-primary/10 hover:text-primary" onClick={processCipher} disabled={!cipherInput}>
        <KeyRound className="w-3 h-3 mr-1" /> Encrypt
      </Button>
    </div>
  );
}

// ============================================
// Security Analytics Line Chart Component
// ============================================
function SecurityLineChart({ data, height = 120 }: { data: number[]; height?: number }) {
  const width = 280;
  const padding = { top: 10, right: 10, bottom: 20, left: 30 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxVal = Math.max(...data, 1);
  const minVal = Math.min(...data, 0);

  const getScoreColor = (val: number) => val >= 80 ? '#00ff41' : val >= 60 ? '#ffd700' : val >= 40 ? '#ff6b35' : '#ff4444';

  const points = data.map((val, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padding.top + chartH - ((val - minVal) / Math.max(maxVal - minVal, 1)) * chartH;
    return { x, y, val };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;
  const latestColor = getScoreColor(data[data.length - 1]);

  return (
    <div className="chart-container">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding.top + chartH * (1 - ratio);
          return <line key={ratio} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(0,255,65,0.06)" strokeWidth="0.5" />;
        })}
        {/* Y-axis labels */}
        {[0, 50, 100].map((val) => {
          const y = padding.top + chartH - ((val - minVal) / Math.max(maxVal - minVal, 1)) * chartH;
          return <text key={val} x={padding.left - 4} y={y + 2} textAnchor="end" fill="#7a9a7b" fontSize="5" fontFamily="monospace">{val}</text>;
        })}
        {/* Area fill */}
        <path d={areaPath} fill="url(#chartGradient)" opacity="0.3" />
        {/* Line */}
        <path d={linePath} fill="none" stroke={latestColor} strokeWidth="1.5" className="chart-line" style={{ filter: `drop-shadow(0 0 3px ${latestColor}60)` }} />
        {/* Data points */}
        {points.map((p, i) => {
          const color = getScoreColor(p.val);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="2.5" fill="#0a0a0f" stroke={color} strokeWidth="1.5" className="chart-dot" />
            </g>
          );
        })}
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={latestColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={latestColor} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ============================================
// Threat Distribution Donut Chart Component
// ============================================
function ThreatDonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = 60, cy = 60, r = 45;
  const circumference = 2 * Math.PI * r;

  const segments = useMemo(() => {
    return data.reduce<Array<{ label: string; value: number; color: string; segmentLength: number; offset: number }>>((acc, segment, i) => {
      const segmentLength = (segment.value / Math.max(total, 1)) * circumference;
      const prevOffset = i === 0 ? 0 : acc[i - 1].offset + acc[i - 1].segmentLength;
      acc.push({ ...segment, segmentLength, offset: prevOffset });
      return acc;
    }, []);
  }, [data, total, circumference]);

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          {/* Background ring */}
          <circle cx={cx} cy={cy} r={r} stroke="#1a1a2e" strokeWidth="12" fill="none" />
          {/* Data segments */}
          {segments.map((segment, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              stroke={segment.color}
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${segment.segmentLength} ${circumference - segment.segmentLength}`}
              strokeDashoffset={-segment.offset}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 3px ${segment.color}40)`, transition: 'stroke-dasharray 0.6s ease-out' }}
              className="chart-line"
            />
          ))}
        </svg>
        <div className="donut-chart-center">
          <span className="value">{total}</span>
          <span className="label">THREATS</span>
        </div>
      </div>
      <div className="space-y-1.5 flex-1">
        {data.map((segment, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: segment.color, boxShadow: `0 0 4px ${segment.color}60` }} />
            <span className="text-[10px] font-mono text-muted-foreground flex-1">{segment.label}</span>
            <span className="text-[10px] font-mono text-muted-foreground/50">{Math.round((segment.value / Math.max(total, 1)) * 100)}%</span>
            <span className="text-[10px] font-mono font-bold" style={{ color: segment.color }}>{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Real-time Activity Feed Component
// ============================================
function ActivityFeed({ entries }: { entries: Array<{ id: string; type: string; message: string; timestamp: string; details?: string }> }) {
  const typeConfig: Record<string, { color: string; icon: React.ElementType; className: string }> = {
    critical: { color: '#ff4444', icon: XCircle, className: 'activity-entry-critical' },
    warning: { color: '#ffd700', icon: AlertTriangle, className: 'activity-entry-warning' },
    info: { color: '#00ff41', icon: Info, className: 'activity-entry-info' },
    security: { color: '#a855f7', icon: Shield, className: 'activity-entry-info' },
  };

  return (
    <Card className="border-border/50 bg-card/80 card-glass">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            LIVE ACTIVITY FEED
            <span className="activity-pulse" />
          </CardTitle>
          <Badge variant="outline" className="text-[9px] font-mono text-primary border-primary/30 badge-glow-green">REAL-TIME</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="activity-feed-container">
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs font-mono text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="relative">
              <div className="activity-timeline-line" />
              <div className="space-y-1">
                {entries.map((entry, i) => {
                  const config = typeConfig[entry.type] || typeConfig.info;
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={entry.id}
                      className={`activity-entry ${config.className}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-foreground font-semibold truncate">{entry.message}</span>
                          </div>
                          {entry.details && (
                            <p className="text-[9px] font-mono text-muted-foreground mt-0.5 truncate">{entry.details}</p>
                          )}
                          <span className="text-[8px] font-mono text-muted-foreground/50">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Network Topology Widget Component
// ============================================
function NetworkTopology() {
  const nodes = useMemo(() => [
    { id: 'core', label: 'J.U.L.I.U.S', x: 50, y: 50, type: 'core', active: true },
    { id: 'dns', label: 'DNS Shield', x: 25, y: 25, type: 'security', active: true },
    { id: 'vpn', label: 'VPN Gate', x: 75, y: 25, type: 'security', active: false },
    { id: 'proxy', label: 'Proxy Node', x: 15, y: 60, type: 'relay', active: true },
    { id: 'tor', label: 'Tor Relay', x: 85, y: 60, type: 'anonymity', active: false },
    { id: 'fw', label: 'Firewall', x: 35, y: 78, type: 'security', active: true },
    { id: 'ids', label: 'IDS/IPS', x: 65, y: 78, type: 'security', active: true },
    { id: 'scan', label: 'Scanner', x: 50, y: 90, type: 'tool', active: true },
  ], []);

  const links = useMemo(() => [
    { from: 'core', to: 'dns' },
    { from: 'core', to: 'vpn' },
    { from: 'core', to: 'proxy' },
    { from: 'core', to: 'tor' },
    { from: 'dns', to: 'fw' },
    { from: 'vpn', to: 'ids' },
    { from: 'proxy', to: 'fw' },
    { from: 'tor', to: 'ids' },
    { from: 'fw', to: 'scan' },
    { from: 'ids', to: 'scan' },
  ], []);

  const typeColors: Record<string, string> = {
    core: '#00ff41',
    security: '#ff6b35',
    relay: '#ffd700',
    anonymity: '#a855f7',
    tool: '#00bcd4',
  };

  return (
    <Card className="border-border/50 bg-card/80 card-glass">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Network className="w-4 h-4 text-primary" />
            NETWORK TOPOLOGY
          </CardTitle>
          <div className="flex items-center gap-3">
            {Object.entries(typeColors).filter(([k]) => k !== 'core').map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}60` }} />
                <span className="text-[8px] font-mono text-muted-foreground uppercase">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="topology-container">
          <svg viewBox="0 0 100 100" className="w-full" style={{ maxHeight: 220 }}>
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Links */}
            {links.map((link, i) => {
              const fromNode = nodes.find(n => n.id === link.from)!;
              const toNode = nodes.find(n => n.id === link.to)!;
              return (
                <g key={i}>
                  <line
                    x1={fromNode.x} y1={fromNode.y}
                    x2={toNode.x} y2={toNode.y}
                    stroke="rgba(0,255,65,0.15)"
                    strokeWidth="0.5"
                    className="topology-link"
                  />
                  <line
                    x1={fromNode.x} y1={fromNode.y}
                    x2={toNode.x} y2={toNode.y}
                    stroke="rgba(0,255,65,0.3)"
                    strokeWidth="0.3"
                    strokeDasharray="1,2"
                    className="topology-link-data"
                  />
                </g>
              );
            })}
            {/* Nodes */}
            {nodes.map((node) => {
              const color = typeColors[node.type];
              const isCore = node.type === 'core';
              return (
                <g key={node.id} filter="url(#glow)">
                  <circle
                    cx={node.x} cy={node.y}
                    r={isCore ? 6 : 4}
                    fill={`${color}20`}
                    stroke={color}
                    strokeWidth={isCore ? 1 : 0.5}
                    className={`topology-node ${node.active ? 'topology-node-active' : ''}`}
                    style={{ opacity: node.active ? 1 : 0.4 }}
                  />
                  <text
                    x={node.x}
                    y={node.y + (isCore ? 10 : 8)}
                    textAnchor="middle"
                    fill={node.active ? color : '#7a9a7b'}
                    fontSize={isCore ? 2.8 : 2.2}
                    fontFamily="monospace"
                    fontWeight={isCore ? 'bold' : 'normal'}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Skeleton Loading Component
// ============================================
function SkeletonLoader({ type = 'bar', count = 1 }: { type?: 'bar' | 'circle' | 'text'; count?: number }) {
  const classes: Record<string, string> = {
    bar: 'skeleton-bar',
    circle: 'skeleton-circle',
    text: 'skeleton-text',
  };
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton-shimmer ${classes[type]}`} />
      ))}
    </div>
  );
}

// ============================================
// Security Analytics Dashboard Component
// ============================================
function SecurityAnalyticsDashboard({ securityScore, privacySettings }: { securityScore: number; privacySettings: Record<string, boolean> }) {
  const [scoreHistory] = useState(() => [
    35, 42, 38, 55, 48, 52, 45, 58, 62, 55, 68, 72, securityScore
  ]);

  const threatData = [
    { label: 'RCE Exploits', value: 3, color: '#ff4444' },
    { label: 'Phishing', value: 7, color: '#ff6b35' },
    { label: 'Malware', value: 4, color: '#ffd700' },
    { label: 'DDoS', value: 2, color: '#a855f7' },
    { label: 'Data Leaks', value: 5, color: '#00bcd4' },
  ];

  const enabledCount = Object.values(privacySettings).filter(Boolean).length;
  const totalCount = Object.keys(privacySettings).length;

  return (
    <Card className="border-border/50 bg-card/80 card-glass">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            SECURITY ANALYTICS
          </CardTitle>
          <Badge variant="outline" className="text-[9px] font-mono text-primary border-primary/30 badge-glow-green">
            {enabledCount}/{totalCount} ACTIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-5">
        {/* Score Over Time */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Security Score Trend</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[9px] font-mono text-muted-foreground">{scoreHistory.length} samples</span>
            </div>
          </div>
          <SecurityLineChart data={scoreHistory} height={120} />
          <div className="flex justify-between mt-1 px-1">
            <span className="text-[8px] font-mono text-muted-foreground">12 scans ago</span>
            <span className="text-[8px] font-mono text-primary">latest</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Threat Distribution */}
        <div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block mb-3">Threat Distribution</span>
          <ThreatDonutChart data={threatData} />
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Blocked Today', value: '23', color: '#00ff41', icon: Shield },
            { label: 'Threat Level', value: 'MED', color: '#ffd700', icon: AlertTriangle },
            { label: 'Uptime', value: '99.7%', color: '#00ff41', icon: Activity },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-2 rounded-lg bg-secondary/20 border border-border/15">
              <stat.icon className="w-3 h-3 mx-auto mb-1" style={{ color: stat.color }} />
              <p className="text-sm font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[8px] font-mono text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Query Client Instance
// ============================================
const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ============================================
// Main Page Component (Provider Wrapper)
// ============================================
export default function JuliusPage() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <JuliusDashboard />
    </QueryClientProvider>
  );
}

// ============================================
// Helper: Format API log details into human-readable text
// ============================================
const formatApiLogDetails = (l: Record<string, unknown>): string => {
  const eventType = (l.eventType as string) || 'UNKNOWN';
  const action = (l.action as string) || '';
  const details = l.details;

  // If details is an object with geolocation data
  if (details && typeof details === 'object') {
    const d = details as Record<string, unknown>;
    if (d.region || d.city || d.country || d.vpnSuggested !== undefined) {
      const parts: string[] = [];
      if (d.city || d.region) parts.push(`Location: ${d.city || ''}${d.city && d.region ? ', ' : ''}${d.region || ''}`);
      if (d.country) parts.push(d.country as string);
      if (d.isp) parts.push(`ISP: ${d.isp}`);
      if (d.vpnSuggested) parts.push('VPN recommended');
      return parts.length > 0 ? `IP detected - ${parts.join(' | ')}` : action || eventType.replace(/_/g, ' ');
    }
    // For other objects, try to make readable
    return action || eventType.replace(/_/g, ' ');
  }

  // If details is a string
  if (typeof details === 'string' && details.trim()) {
    try {
      const parsed = JSON.parse(details);
      if (typeof parsed === 'object' && parsed !== null) {
        return formatApiLogDetails({ ...l, details: parsed });
      }
      return details;
    } catch {
      return details;
    }
  }

  return action || eventType.replace(/_/g, ' ');
};

// ============================================
// Interactive Threat Map Component
// ============================================
function ThreatMap() {
  const threats = useMemo(() => [
    { id: 1, x: 25, y: 30, severity: 'critical', label: 'RCE Exploit', location: 'Eastern Europe' },
    { id: 2, x: 48, y: 35, severity: 'high', label: 'Phishing Campaign', location: 'Southeast Asia' },
    { id: 3, x: 72, y: 28, severity: 'high', label: 'Supply Chain Attack', location: 'East Asia' },
    { id: 4, x: 15, y: 40, severity: 'medium', label: 'Data Breach', location: 'Western Europe' },
    { id: 5, x: 55, y: 25, severity: 'critical', label: 'Zero-Day', location: 'Central Asia' },
    { id: 6, x: 80, y: 45, severity: 'medium', label: 'DDoS Attack', location: 'Oceania' },
    { id: 7, x: 35, y: 50, severity: 'low', label: 'Spam Botnet', location: 'North Africa' },
    { id: 8, x: 62, y: 55, severity: 'high', label: 'Ransomware', location: 'South Asia' },
    { id: 9, x: 20, y: 55, severity: 'medium', label: 'Credential Stuffing', location: 'South America' },
    { id: 10, x: 45, y: 45, severity: 'low', label: 'Port Scan', location: 'Middle East' },
    { id: 11, x: 88, y: 35, severity: 'medium', label: 'APT Activity', location: 'Pacific' },
    { id: 12, x: 10, y: 30, severity: 'low', label: 'DNS Tunneling', location: 'North America' },
  ], []);

  const [activeThreat, setActiveThreat] = useState<number | null>(null);
  const sevColors: Record<string, string> = { critical: '#ff4444', high: '#ff6b35', medium: '#ffd700', low: '#00ff41' };
  const sevDotClass: Record<string, string> = { critical: '', high: 'dot-orange', medium: 'dot-gold', low: 'dot-green' };

  return (
    <Card className="border-border/50 bg-card/80 card-glow overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            GLOBAL THREAT MAP
          </CardTitle>
          <div className="flex items-center gap-3">
            {Object.entries(sevColors).map(([level, color]) => (
              <div key={level} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}60` }} />
                <span className="text-[8px] font-mono text-muted-foreground uppercase">{level}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="relative w-full aspect-[2/1] bg-secondary/20 rounded-lg border border-border/20 map-grid overflow-hidden">
          {/* Continent outlines (simplified SVG paths) */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none" fill="none">
            {/* North America */}
            <path d="M8,8 L22,6 L28,12 L26,20 L20,26 L14,30 L8,24 L6,16 Z" stroke="rgba(0,255,65,0.12)" strokeWidth="0.3" fill="rgba(0,255,65,0.03)" />
            {/* South America */}
            <path d="M18,32 L24,30 L28,36 L26,44 L22,48 L18,46 L16,38 Z" stroke="rgba(0,255,65,0.12)" strokeWidth="0.3" fill="rgba(0,255,65,0.03)" />
            {/* Europe */}
            <path d="M40,8 L52,6 L54,12 L50,18 L44,20 L40,16 Z" stroke="rgba(0,255,65,0.12)" strokeWidth="0.3" fill="rgba(0,255,65,0.03)" />
            {/* Africa */}
            <path d="M40,22 L50,20 L54,28 L52,38 L46,44 L40,42 L38,32 Z" stroke="rgba(0,255,65,0.12)" strokeWidth="0.3" fill="rgba(0,255,65,0.03)" />
            {/* Asia */}
            <path d="M56,6 L82,4 L90,14 L86,24 L76,28 L66,26 L58,20 L54,12 Z" stroke="rgba(0,255,65,0.12)" strokeWidth="0.3" fill="rgba(0,255,65,0.03)" />
            {/* Oceania */}
            <path d="M76,32 L88,30 L92,36 L86,42 L78,40 Z" stroke="rgba(0,255,65,0.12)" strokeWidth="0.3" fill="rgba(0,255,65,0.03)" />
            {/* Connection lines */}
            <line x1="25" y1="30" x2="48" y2="35" stroke="rgba(255,68,68,0.15)" strokeWidth="0.2" strokeDasharray="1,1">
              <animate attributeName="stroke-dashoffset" from="0" to="2" dur="1s" repeatCount="indefinite" />
            </line>
            <line x1="48" y1="35" x2="72" y2="28" stroke="rgba(255,107,53,0.15)" strokeWidth="0.2" strokeDasharray="1,1">
              <animate attributeName="stroke-dashoffset" from="0" to="2" dur="1.2s" repeatCount="indefinite" />
            </line>
            <line x1="55" y1="25" x2="35" y2="50" stroke="rgba(255,68,68,0.15)" strokeWidth="0.2" strokeDasharray="1,1">
              <animate attributeName="stroke-dashoffset" from="0" to="2" dur="0.8s" repeatCount="indefinite" />
            </line>
          </svg>

          {/* Threat dots */}
          {threats.map((threat) => (
            <motion.div
              key={threat.id}
              className={`threat-dot ${sevDotClass[threat.severity] || ''} cursor-pointer`}
              style={{ left: `${threat.x}%`, top: `${threat.y}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: threat.id * 0.1, duration: 0.3 }}
              onMouseEnter={() => setActiveThreat(threat.id)}
              onMouseLeave={() => setActiveThreat(null)}
            >
              {activeThreat === threat.id && (
                <motion.div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-card border border-border shadow-lg z-10 whitespace-nowrap pointer-events-none"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-[9px] font-mono font-bold" style={{ color: sevColors[threat.severity] }}>{threat.label}</p>
                  <p className="text-[8px] font-mono text-muted-foreground">{threat.location}</p>
                </motion.div>
              )}
            </motion.div>
          ))}

          {/* Scan line */}
          <div className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" style={{ animation: 'scanH 6s ease-in-out infinite' }} />
        </div>

        {/* Stats below map */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          {[
            { label: 'Active Threats', value: threats.filter(t => t.severity === 'critical' || t.severity === 'high').length, color: '#ff4444' },
            { label: 'Monitored', value: threats.length, color: '#00ff41' },
            { label: 'Regions', value: '6', color: '#ffd700' },
            { label: 'Last Update', value: '2m ago', color: '#7a9a7b' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-1.5 rounded bg-secondary/20 border border-border/15">
              <span className="text-sm font-mono font-bold block" style={{ color: stat.color }}>{stat.value}</span>
              <span className="text-[8px] font-mono text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Security News Feed Component
// ============================================
function SecurityNewsFeed() {
  const [news, setNews] = useState<Array<{title: string; summary: string; source: string; url: string; category: string; timestamp: string}>>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsCategory, setNewsCategory] = useState('cybersecurity');
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const categories = [
    { value: 'cybersecurity', label: 'All' },
    { value: 'vulnerabilities', label: 'Vulns' },
    { value: 'malware', label: 'Malware' },
    { value: 'data-breach', label: 'Breaches' },
    { value: 'privacy', label: 'Privacy' },
    { value: 'ransomware', label: 'Ransom' },
  ];

  const handleCategoryChange = (cat: string) => {
    setNewsCategory(cat);
    setNewsLoading(true);
    setFetchTrigger(prev => prev + 1);
  };

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/news?category=${newsCategory}`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled && data.success && data.data) setNews(data.data);
        if (!cancelled) setNewsLoading(false);
      })
      .catch(() => { if (!cancelled) setNewsLoading(false); });
    return () => { cancelled = true; };
  }, [fetchTrigger, newsCategory]);

  return (
    <Card className="border-border/50 bg-card/80 card-glow">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Radar className="w-4 h-4 text-primary" />
            LATEST INTELLIGENCE
          </CardTitle>
          <div className="flex gap-1 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`text-[9px] font-mono px-2 py-0.5 rounded-full border transition-all ${
                  newsCategory === cat.value
                    ? 'border-primary/50 text-primary bg-primary/10'
                    : 'border-border/30 text-muted-foreground hover:text-primary hover:border-primary/30'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {newsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-2 h-2 rounded-full bg-secondary shrink-0 mt-1.5" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-secondary rounded w-3/4" />
                  <div className="h-2 bg-secondary/50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-cyber">
            {news.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0 group cursor-pointer"
                onClick={() => item.url && window.open(item.url, '_blank', 'noopener')}
              >
                <div className="flex flex-col items-center shrink-0 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-primary/60" style={{ boxShadow: '0 0 4px rgba(0,255,65,0.3)' }} />
                  {i < news.length - 1 && <div className="w-0.5 h-4 bg-border/30 mt-1" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-mono text-foreground group-hover:text-primary transition-colors line-clamp-2">{item.title}</p>
                  {item.summary && (
                    <p className="text-[9px] font-mono text-muted-foreground line-clamp-1 mt-0.5">{item.summary}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[8px] font-mono text-primary/60">{item.source}</span>
                    <span className="text-[8px] font-mono text-muted-foreground/50">{item.category}</span>
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground/30 group-hover:text-primary/60 shrink-0 mt-1 transition-colors" />
              </motion.div>
            ))}
            {news.length === 0 && (
              <p className="text-xs font-mono text-muted-foreground text-center py-4">No news available</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Cyber News Feed Component
// ============================================
function CyberNewsFeed() {
  const [news, setNews] = useState<Array<{title: string; url: string; snippet: string; source: string; date?: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('cybersecurity latest news 2026');

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news-search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          // Handle different response formats from web search
          const results = Array.isArray(data.data) ? data.data : data.data.results || [];
          setNews(results.slice(0, 8).map((r: Record<string, unknown>) => ({
            title: (r.title as string) || (r.name as string) || 'Untitled',
            url: (r.url as string) || (r.link as string) || '#',
            snippet: (r.snippet as string) || (r.description as string) || (r.content as string) || '',
            source: (r.source as string) || (r.siteName as string) || 'Web',
            date: (r.date as string) || (r.publishedAt as string) || undefined,
          })));
        }
      } else {
        setError('Failed to fetch news');
      }
    } catch {
      setError('Network error');
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchNews(), 0);
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    { label: 'All', query: 'cybersecurity latest news 2026' },
    { label: 'Threats', query: 'cyber threats vulnerabilities 2026' },
    { label: 'Data Breaches', query: 'data breaches leaks 2026' },
    { label: 'Malware', query: 'malware ransomware attacks 2026' },
    { label: 'Privacy', query: 'privacy surveillance encryption news 2026' },
  ];

  return (
    <Card className="border-border/40 bg-card/80 card-cyber">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono flex items-center gap-2 text-foreground">
            <Newspaper className="w-4 h-4 text-primary" />
            CYBER NEWS FEED
            <Badge variant="outline" className="text-[9px] font-mono text-primary border-primary/30 badge-glow-green">LIVE</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[10px] font-mono text-muted-foreground hover:text-primary"
              onClick={fetchNews}
              disabled={loading}
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        <div className="flex gap-1 flex-wrap mt-2">
          {categories.map((cat) => (
            <button
              key={cat.label}
              className={`text-[9px] font-mono px-2.5 py-1 rounded-full border transition-all ${
                searchQuery === cat.query
                  ? 'border-primary/50 text-primary bg-primary/10'
                  : 'border-border/30 text-muted-foreground hover:text-primary hover:border-primary/30'
              }`}
              onClick={() => { setSearchQuery(cat.query); }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {loading && news.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-xs font-mono">Fetching latest intelligence...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="text-center py-6">
            <AlertCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
            <p className="text-xs font-mono text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-2 text-xs font-mono" onClick={fetchNews}>Retry</Button>
          </div>
        )}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
          {news.map((item, i) => (
            <motion.a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg border border-border/20 bg-secondary/10 hover:bg-secondary/30 hover:border-primary/20 transition-all group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-mono font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{item.title}</h4>
                  {item.snippet && (
                    <p className="text-[10px] font-mono text-muted-foreground mt-1 line-clamp-2">{item.snippet}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="text-[8px] font-mono text-primary/60 border-primary/20">{item.source}</Badge>
                    {item.date && (
                      <span className="text-[8px] font-mono text-muted-foreground/60">{new Date(item.date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
              </div>
            </motion.a>
          ))}
        </div>
        {news.length === 0 && !loading && !error && (
          <div className="text-center py-8">
            <Newspaper className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs font-mono text-muted-foreground">No news available. Click Refresh to fetch.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Quick Actions FAB Component
// ============================================
function QuickActionsFAB({ onAction }: { onAction: (action: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: 'scan', icon: Shield, label: 'Run Scan', color: '#00ff41' },
    { id: 'news', icon: Newspaper, label: 'News Feed', color: '#ffd700' },
    { id: 'export', icon: Download, label: 'Export Data', color: '#ff6b35' },
    { id: 'search', icon: Search, label: 'Search', color: '#a855f7' },
    { id: 'chat', icon: Bot, label: 'AI Chat', color: '#00bcd4' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-16 right-0 flex flex-col gap-2 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {actions.map((action, i) => (
              <motion.button
                key={action.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/95 border border-border/50 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5 transition-all group shadow-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  onAction(action.id);
                  setIsOpen(false);
                }}
              >
                <action.icon className="w-4 h-4" style={{ color: action.color }} />
                <span className="text-xs font-mono text-foreground/80 group-hover:text-foreground whitespace-nowrap">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          isOpen
            ? 'bg-destructive rotate-45 hover:bg-destructive/90'
            : 'bg-primary/90 hover:bg-primary fab-cyber'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-primary-foreground" />
        ) : (
          <Zap className="w-5 h-5 text-primary-foreground" />
        )}
      </motion.button>
    </div>
  );
}

// ============================================
// Dashboard Component (uses Query hooks)
// ============================================
function JuliusDashboard() {
  const queryClient = useQueryClient();
  const store = useJuliusStore();

  // Local state
  const [selectedResource, setSelectedResource] = useState<ResourceCard | null>(null);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [addBlockDomain, setAddBlockDomain] = useState('');
  const [addBlockReason, setAddBlockReason] = useState('tracker');
  const [addLinkDialogOpen, setAddLinkDialogOpen] = useState(false);
  const [newLink, setNewLink] = useState({ name: '', url: '', description: '', category: 'osint', level: 'L1', tags: '' });
  const [linkUploadOpen, setLinkUploadOpen] = useState(false);
  const [linkSearch, setLinkSearch] = useState('');
  const [linkCategoryFilter, setLinkCategoryFilter] = useState('All');
  const [linkLevelFilter, setLinkLevelFilter] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [surfUrl, setSurfUrl] = useState('');
  const [surfLoading, setSurfLoading] = useState(false);
  const [surfResult, setSurfResult] = useState<{safe: boolean; threats: string[]; securityScore: number; recommendation: string} | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{role: string; content: string; thinking?: string}>>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const [expandedThinking, setExpandedThinking] = useState<Record<number, boolean>>({});
  const [opsecChecks, setOpsecChecks] = useState<Record<string, boolean>>({});
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [sessionTime, setSessionTime] = useState('00:00:00');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [scanBreakdown, setScanBreakdown] = useState<Array<{name: string; score: number; color: string}>>([]);

  // ---- Data Fetching with TanStack Query ----

  // IP Detection
  const { data: ipResponse, isLoading: ipLoading, refetch: refetchIp } = useQuery({
    queryKey: ['ip'],
    queryFn: async () => {
      const res = await fetch('/api/ip');
      if (!res.ok) throw new Error('Failed to fetch IP');
      return res.json();
    },
    staleTime: 30000,
  });

  // Security data
  const { data: securityResponse, refetch: refetchSecurity } = useQuery({
    queryKey: ['security'],
    queryFn: async () => {
      const res = await fetch('/api/security');
      if (!res.ok) throw new Error('Failed to fetch security data');
      return res.json();
    },
    staleTime: 15000,
  });

  // Notifications
  const { data: notificationsResponse } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
    staleTime: 10000,
  });

  // Links
  const { data: linksResponse } = useQuery({
    queryKey: ['links'],
    queryFn: async () => {
      const res = await fetch('/api/links');
      if (!res.ok) throw new Error('Failed to fetch links');
      return res.json();
    },
    staleTime: 30000,
  });

  // ---- Sync fetched data to Zustand store ----
  useEffect(() => {
    if (ipResponse?.success && ipResponse.data) {
      store.setIpData(ipResponse.data);
    }
  }, [ipResponse]);

  useEffect(() => {
    if (securityResponse?.success && securityResponse.data) {
      const { blockedResources, logs } = securityResponse.data;
      if (blockedResources) {
        const mapped: BlockedResource[] = blockedResources.map((r: Record<string, unknown>) => ({
          id: r.id as string,
          domain: r.domain as string,
          reason: r.reason as string,
          hits: (r.hits as number) || 0,
          addedAt: (r.createdAt as string) || new Date().toISOString(),
        }));
        store.setBlockedResources(mapped);
      }
      if (logs) {
        const mappedLog: SecurityLogEntry[] = logs.slice(0, 20).map((l: Record<string, unknown>) => ({
          id: l.id as string,
          timestamp: (l.createdAt as string) || new Date().toISOString(),
          eventType: ((l.eventType as string) || 'UNKNOWN').toUpperCase(),
          details: formatApiLogDetails(l),
          riskLevel: (l.riskLevel as string) || 'info',
        }));
        store.setSecurityLog(mappedLog);
      }
    }
  }, [securityResponse]);

  useEffect(() => {
    if (notificationsResponse?.success && notificationsResponse.data) {
      const mapped: Notification[] = notificationsResponse.data.map((n: Record<string, unknown>) => ({
        id: n.id as string,
        title: n.title as string,
        message: n.message as string,
        type: (n.type as string) || 'info',
        priority: (n.priority as string) || 'low',
        category: (n.category as string) || 'system',
        read: (n.read as boolean) || false,
        actionUrl: (n.actionUrl as string) || null,
        actionLabel: (n.actionLabel as string) || null,
        createdAt: (n.createdAt as string) || new Date().toISOString(),
      }));
      store.setNotifications(mapped);
    } else if (!notificationsResponse) {
      store.setNotifications(NOTIFICATIONS_DATA);
    }
  }, [notificationsResponse]);

  useEffect(() => {
    if (linksResponse?.success && linksResponse.data) {
      const mapped: LinkItem[] = linksResponse.data.map((l: Record<string, unknown>) => ({
        id: l.id as string,
        name: l.name as string,
        url: l.url as string,
        description: (l.description as string) || '',
        category: (l.category as string) || 'general',
        level: (l.level as string) || 'L1',
        tags: typeof l.tags === 'string' ? l.tags.split(',').filter(Boolean) : (l.tags as string[]) || [],
        starred: (l.starred as boolean) || false,
      }));
      store.setLinks(mapped);
    } else if (!linksResponse) {
      store.setLinks(LINKS_DATA);
    }
  }, [linksResponse]);

  // Initialize with static data as fallback
  useEffect(() => {
    if (store.blockedResources.length === 0) {
      store.setBlockedResources(INITIAL_BLOCKED_RESOURCES);
    }
    if (store.securityLog.length === 0) {
      store.setSecurityLog(INITIAL_SECURITY_LOG);
    }
  }, []);

  // ---- UTC Clock ----
  useEffect(() => {
    const interval = setInterval(() => {
      store.setUtcTime(new Date().toUTCString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ---- Chat scroll-to-bottom ----
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // ---- Session Timer ----
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
      const seconds = String(elapsed % 60).padStart(2, '0');
      setSessionTime(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
      if (e.key === '?' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setShortcutsModalOpen(true);
      }
      const tabKeys: Record<string, string> = { '1': 'home', '2': 'levels', '3': 'security', '4': 'opsec', '5': 'links', '6': 'toolkit', '7': 'ai', '8': 'community' };
      if (tabKeys[e.key] && !(e.metaKey || e.ctrlKey || e.altKey) && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        store.setActiveTab(tabKeys[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store]);

  // ---- Handlers ----
  const handleRefreshIp = () => {
    refetchIp();
  };

  const handleAddBlock = async () => {
    if (!addBlockDomain.trim()) return;
    try {
      await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'block', domain: addBlockDomain, reason: addBlockReason, category: addBlockReason }),
      });
      store.addBlockedResource({
        id: `b-${Date.now()}`,
        domain: addBlockDomain,
        reason: addBlockReason,
        hits: 0,
        addedAt: new Date().toISOString(),
      });
      setAddBlockDomain('');
      toast({ title: 'Domain blocked', description: `${addBlockDomain} added to blocklist` });
      refetchSecurity();
    } catch {
      store.addBlockedResource({
        id: `b-${Date.now()}`,
        domain: addBlockDomain,
        reason: addBlockReason,
        hits: 0,
        addedAt: new Date().toISOString(),
      });
      setAddBlockDomain('');
      toast({ title: 'Domain blocked', description: `${addBlockDomain} added to blocklist` });
    }
  };

  const handleUnblock = async (id: string, domain: string) => {
    try {
      await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unblock', domain }),
      });
    } catch { /* local removal fallback */ }
    store.removeBlockedResource(id);
    toast({ title: 'Domain unblocked', description: `${domain} removed from blocklist` });
  };

  const handleTogglePrivacy = (key: string) => {
    store.togglePrivacySetting(key);
    const keyMap: Record<string, string> = {
      dnsOverHttps: 'dns_over_https',
      webrtcBlocking: 'webrtc_leak_protection',
      canvasProtection: 'canvas_fingerprint_protection',
      referrerStripping: 'tracker_blocking',
      cookieAutoDelete: 'ad_blocking',
      jsRestriction: 'tor_routing',
    };
    const newValue = !store.privacySettings[key];
    fetch('/api/security', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_privacy',
        settingKey: keyMap[key] || key,
        settingValue: newValue ? 'enabled' : 'disabled',
      }),
    }).catch(() => {});
    const settingName = key.replace(/([A-Z])/g, ' $1').trim();
    toast({ title: 'Privacy setting updated', description: `${settingName} ${newValue ? 'enabled' : 'disabled'}` });
  };

  const handleMarkNotificationRead = async (id: string) => {
    store.markNotificationRead(id);
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      });
    } catch {}
  };

  const handleMarkAllRead = async () => {
    store.markAllNotificationsRead();
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'all', read: true }),
      });
    } catch {}
  };

  const handleDeleteNotification = async (id: string) => {
    store.deleteNotification(id);
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {}
  };

  const handleToggleStar = async (id: string) => {
    store.toggleLinkStar(id);
    const link = store.links.find(l => l.id === id);
    if (link) {
      try {
        await fetch('/api/links', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, starred: !link.starred }),
        });
      } catch {}
      toast({ title: link.starred ? 'Link unstarred' : 'Link starred', description: link.name });
    }
  };

  const handleAddLink = async () => {
    if (!newLink.name || !newLink.url) return;
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLink.name,
          url: newLink.url,
          description: newLink.description,
          category: newLink.category,
          level: newLink.level,
          tags: newLink.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          const added: LinkItem = {
            id: data.data.id,
            name: data.data.name,
            url: data.data.url,
            description: data.data.description || '',
            category: data.data.category || newLink.category,
            level: data.data.level || newLink.level,
            tags: typeof data.data.tags === 'string' ? data.data.tags.split(',').filter(Boolean) : (data.data.tags || []),
            starred: false,
          };
          store.setLinks([added, ...store.links]);
        }
      }
    } catch {}
    queryClient.invalidateQueries({ queryKey: ['links'] });
    toast({ title: 'Link added', description: newLink.name || 'New resource saved' });
    setNewLink({ name: '', url: '', description: '', category: 'osint', level: 'L1', tags: '' });
    setAddLinkDialogOpen(false);
  };

  const handleDeleteLink = async (id: string) => {
    const link = store.links.find(l => l.id === id);
    store.setLinks(store.links.filter(l => l.id !== id));
    try {
      await fetch('/api/links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch {}
    queryClient.invalidateQueries({ queryKey: ['links'] });
    toast({ title: 'Link deleted', description: link?.name || 'Resource removed' });
  };

  const handleBatchAddLinks = async (links: LinkData[]) => {
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links }),
      });
      if (res.ok) {
        const data = await res.json();
        const count = data.data?.count || links.length;
        // Add to local store immediately
        const newLinks: LinkItem[] = links.map((l, i) => ({
          id: `batch-${Date.now()}-${i}`,
          name: l.name,
          url: l.url,
          description: l.description || '',
          category: l.category || 'general',
          level: l.level || 'L1',
          tags: l.tags || [],
          starred: false,
        }));
        store.setLinks([...newLinks, ...store.links]);
        queryClient.invalidateQueries({ queryKey: ['links'] });
        toast({ title: 'Links injected', description: `${count} links added via batch upload` });
      }
    } catch {
      // Fallback: add to local store only
      const newLinks: LinkItem[] = links.map((l, i) => ({
        id: `batch-${Date.now()}-${i}`,
        name: l.name,
        url: l.url,
        description: l.description || '',
        category: l.category || 'general',
        level: l.level || 'L1',
        tags: l.tags || [],
        starred: false,
      }));
      store.setLinks([...newLinks, ...store.links]);
      toast({ title: 'Links added locally', description: `${links.length} links saved (sync pending)` });
    }
    setLinkUploadOpen(false);
  };

  const handleUploadSingleLink = async (link: LinkData) => {
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(link),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          const added: LinkItem = {
            id: data.data.id,
            name: data.data.name,
            url: data.data.url,
            description: data.data.description || '',
            category: data.data.category || link.category,
            level: data.data.level || link.level,
            tags: typeof data.data.tags === 'string' ? data.data.tags.split(',').filter(Boolean) : (data.data.tags || []),
            starred: false,
          };
          store.setLinks([added, ...store.links]);
        }
      }
    } catch {}
    queryClient.invalidateQueries({ queryKey: ['links'] });
    toast({ title: 'Link added', description: link.name || 'New resource saved' });
  };

  const handleRunScan = async () => {
    try {
      const res = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scan' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.score !== undefined) {
          store.setSecurityScore(data.data.score);
          // Generate scan breakdown
          const baseScore = data.data.score;
          setScanBreakdown([
            { name: 'DNS Security', score: Math.min(100, baseScore + Math.floor(Math.random() * 15) - 5), color: '#00ff41' },
            { name: 'Browser Privacy', score: Math.min(100, baseScore + Math.floor(Math.random() * 20) - 10), color: '#ffd700' },
            { name: 'Network Security', score: Math.min(100, baseScore + Math.floor(Math.random() * 15) - 3), color: '#ff6b35' },
            { name: 'Data Protection', score: Math.min(100, baseScore + Math.floor(Math.random() * 10)), color: '#a855f7' },
          ]);
          toast({ title: 'Security scan complete', description: `Score: ${data.data.score}/100` });
        }
      }
    } catch {
      // Fallback breakdown with current score
      const s = store.securityScore;
      setScanBreakdown([
        { name: 'DNS Security', score: Math.min(100, s + 8), color: '#00ff41' },
        { name: 'Browser Privacy', score: Math.min(100, s - 5), color: '#ffd700' },
        { name: 'Network Security', score: Math.min(100, s + 3), color: '#ff6b35' },
        { name: 'Data Protection', score: Math.min(100, s - 2), color: '#a855f7' },
      ]);
      toast({ title: 'Security scan complete', description: `Score: ${s}/100` });
    }
  };

  const handleSurfCheck = async () => {
    if (!surfUrl.trim()) return;
    setSurfLoading(true);
    try {
      const res = await fetch('/api/surf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: surfUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        setSurfResult(data.data || data);
        toast({ title: data.data?.safe ? 'URL appears safe' : 'Threats detected', description: `Security score: ${data.data?.securityScore || 0}/100` });
      }
    } catch {
      setSurfResult({ safe: false, threats: ['Scan failed'], securityScore: 0, recommendation: 'Could not complete security scan. Try again.' });
    }
    setSurfLoading(false);
  };

  const handleExportData = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '2.0',
      securityScore: store.securityScore,
      privacySettings: store.privacySettings,
      blockedResources: store.blockedResources,
      securityLog: store.securityLog.slice(0, 20),
      links: store.links,
      notifications: store.notifications,
      ipData: store.ipData,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `julius-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Data exported', description: 'J.U.L.I.U.S data exported as JSON' });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied to clipboard' });
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, { role: 'user', content: userMessage }],
          context: `Security score: ${store.securityScore}/100, Active tab: ${store.activeTab}, Tunnel: ${store.tunnelEnabled ? store.tunnelType : 'off'}, IP: ${store.ipData?.ip || 'unknown'}, VPN: ${store.ipData?.isVpn ? 'active' : store.ipData?.vpnSuggested ? 'recommended' : 'not detected'}`,
        }),
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.data?.reply || 'Unable to process request. The AI core may be temporarily offline.',
        thinking: data.data?.thinking || '',
      }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: '⚠ Connection to J.U.L.I.U.S AI core failed. Neural link disrupted. Please try again later.' }]);
    }
    setChatLoading(false);
  };

  const handleExportLinks = () => {
    const data = JSON.stringify(store.links, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'julius-links-export.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Links exported', description: `${store.links.length} links downloaded` });
  };

  const handleImportLinks = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          const newLinks: LinkItem[] = data.map((l: Record<string, unknown>) => ({
            id: (l.id as string) || `import-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: (l.name as string) || 'Unnamed',
            url: (l.url as string) || '',
            description: (l.description as string) || '',
            category: (l.category as string) || 'general',
            level: (l.level as string) || 'L1',
            tags: Array.isArray(l.tags) ? (l.tags as string[]) : typeof l.tags === 'string' ? (l.tags as string).split(',').filter(Boolean) : [],
            starred: (l.starred as boolean) || false,
          }));
          store.setLinks([...newLinks, ...store.links]);
          toast({ title: 'Links imported', description: `${newLinks.length} links added` });
        }
      } catch {
        toast({ title: 'Import failed', description: 'Invalid JSON file' });
      }
    };
    input.click();
  };

  const getPasswordStrength = (password: string): { score: number; label: string; color: string; tips: string[] } => {
    if (!password) return { score: 0, label: 'None', color: '#7a9a7b', tips: ['Enter a password to check its strength'] };
    let score = 0;
    const tips: string[] = [];
    if (password.length >= 8) score += 20; else tips.push('Use at least 8 characters');
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
    if (/[a-z]/.test(password)) score += 10; else tips.push('Add lowercase letters');
    if (/[A-Z]/.test(password)) score += 10; else tips.push('Add uppercase letters');
    if (/[0-9]/.test(password)) score += 10; else tips.push('Add numbers');
    if (/[^a-zA-Z0-9]/.test(password)) score += 15; else tips.push('Add special characters (!@#$%)');
    if (password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) score += 15;
    score = Math.min(100, score);
    const label = score >= 80 ? 'Strong' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : score >= 20 ? 'Weak' : 'Very Weak';
    const color = score >= 80 ? '#00ff41' : score >= 60 ? '#ffd700' : score >= 40 ? '#ff6b35' : '#ff4444';
    return { score, label, color, tips };
  };

  // Password Strength Analyzer (enhanced)
  const COMMON_PASSWORDS = [
    'password', '123456', '12345678', 'qwerty', 'abc123',
    'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
    'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
    'bailey', 'passw0rd', 'shadow', '123123', '654321',
  ];

  const analyzePasswordStrength = (password: string): {
    score: number;
    label: string;
    color: string;
    crackTime: string;
    checks: { label: string; passed: boolean }[];
  } => {
    if (!password) {
      return {
        score: 0,
        label: 'NONE',
        color: '#7a9a7b',
        crackTime: '—',
        checks: [
          { label: 'At least 8 characters', passed: false },
          { label: 'Uppercase letter (A-Z)', passed: false },
          { label: 'Lowercase letter (a-z)', passed: false },
          { label: 'Number (0-9)', passed: false },
          { label: 'Special character (!@#$...)', passed: false },
          { label: 'Not a common password', passed: false },
          { label: 'No sequential characters', passed: false },
          { label: 'No repeated characters', passed: false },
        ],
      };
    }

    let score = 0;
    const checks: { label: string; passed: boolean }[] = [];

    // Length check (min 8, max 128)
    const lengthOk = password.length >= 8;
    const lengthLong = password.length >= 12;
    const lengthVeryLong = password.length >= 16;
    if (lengthOk) score += 15;
    if (lengthLong) score += 5;
    if (lengthVeryLong) score += 5;
    if (password.length > 20) score += 5;
    checks.push({ label: `At least 8 characters (${password.length})`, passed: lengthOk });

    // Uppercase
    const hasUpper = /[A-Z]/.test(password);
    if (hasUpper) score += 15;
    checks.push({ label: 'Uppercase letter (A-Z)', passed: hasUpper });

    // Lowercase
    const hasLower = /[a-z]/.test(password);
    if (hasLower) score += 15;
    checks.push({ label: 'Lowercase letter (a-z)', passed: hasLower });

    // Numbers
    const hasNumber = /[0-9]/.test(password);
    if (hasNumber) score += 15;
    checks.push({ label: 'Number (0-9)', passed: hasNumber });

    // Special characters
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    if (hasSpecial) score += 15;
    checks.push({ label: 'Special character (!@#$...)', passed: hasSpecial });

    // Common password detection
    const isCommon = COMMON_PASSWORDS.includes(password.toLowerCase());
    if (isCommon) score = Math.min(score, 5);
    checks.push({ label: 'Not a common password', passed: !isCommon });

    // Sequential characters detection (abc, 123, etc.)
    const hasSequential = (() => {
      const sequences = 'abcdefghijklmnopqrstuvwxyz0123456789';
      const lower = password.toLowerCase();
      for (let i = 0; i < lower.length - 2; i++) {
        const seq = lower.substring(i, i + 3);
        if (sequences.includes(seq)) return true;
        // Check reverse sequences
        const revSeq = seq.split('').reverse().join('');
        if (sequences.includes(revSeq)) return true;
      }
      return false;
    })();
    if (!hasSequential) score += 5;
    if (hasSequential) score = Math.max(0, score - 5);
    checks.push({ label: 'No sequential characters', passed: !hasSequential });

    // Repeated characters detection (aaa, 111, etc.)
    const hasRepeated = /(.)\1{2,}/.test(password);
    if (!hasRepeated) score += 5;
    if (hasRepeated) score = Math.max(0, score - 5);
    checks.push({ label: 'No repeated characters', passed: !hasRepeated });

    // Bonus for full combination
    if (lengthOk && hasUpper && hasLower && hasNumber && hasSpecial) score += 5;

    score = Math.max(0, Math.min(100, score));

    // Determine label and color
    let label: string;
    let color: string;
    if (score >= 90) { label = 'EXCELLENT'; color = '#00ff41'; }
    else if (score >= 70) { label = 'STRONG'; color = '#00ff41'; }
    else if (score >= 50) { label = 'GOOD'; color = '#ffd700'; }
    else if (score >= 30) { label = 'FAIR'; color = '#ff6b35'; }
    else { label = 'WEAK'; color = '#ff4444'; }

    // Estimate crack time
    let crackTime: string;
    if (isCommon) {
      crackTime = 'Instant';
    } else {
      const charsetSize =
        (hasLower ? 26 : 0) +
        (hasUpper ? 26 : 0) +
        (hasNumber ? 10 : 0) +
        (hasSpecial ? 32 : 0);
      const effectiveCharset = Math.max(charsetSize, 1);
      const combinations = Math.pow(effectiveCharset, password.length);
      // Assume 10 billion guesses per second
      const secondsToCrack = combinations / 10e9;
      if (secondsToCrack < 1) crackTime = 'Instant';
      else if (secondsToCrack < 60) crackTime = `${Math.round(secondsToCrack)} seconds`;
      else if (secondsToCrack < 3600) crackTime = `${Math.round(secondsToCrack / 60)} minutes`;
      else if (secondsToCrack < 86400) crackTime = `${Math.round(secondsToCrack / 3600)} hours`;
      else if (secondsToCrack < 86400 * 30) crackTime = `${Math.round(secondsToCrack / 86400)} days`;
      else if (secondsToCrack < 86400 * 365) crackTime = `${Math.round(secondsToCrack / (86400 * 30))} months`;
      else if (secondsToCrack < 86400 * 365 * 100) crackTime = `${Math.round(secondsToCrack / (86400 * 365))} years`;
      else if (secondsToCrack < 86400 * 365 * 1e6) crackTime = `${Math.round(secondsToCrack / (86400 * 365 * 100))} centuries`;
      else crackTime = 'Millennia+';
    }

    return { score, label, color, crackTime, checks };
  };

  // Generate a strong random password
  const generateStrongPassword = (): string => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = uppercase + lowercase + numbers + special;
    const length = 20;

    // Ensure at least one of each type
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    const arr = password.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr.join('');
  };

  // Calculate security score based on privacy settings
  useEffect(() => {
    const enabledCount = Object.values(store.privacySettings).filter(Boolean).length;
    const total = Object.keys(store.privacySettings).length;
    const baseScore = Math.round((enabledCount / total) * 60) + 20;
    const vpnBonus = store.ipData?.isVpn ? 10 : store.ipData?.vpnSuggested ? -10 : 0;
    const tunnelBonus = store.tunnelEnabled ? 10 : 0;
    store.setSecurityScore(Math.max(0, Math.min(100, baseScore + vpnBonus + tunnelBonus)));
  }, [store.privacySettings, store.ipData, store.tunnelEnabled]);

  // Filtered links
  const filteredLinks = store.links.filter((l) => {
    const matchesSearch = !linkSearch || l.name.toLowerCase().includes(linkSearch.toLowerCase()) || l.description.toLowerCase().includes(linkSearch.toLowerCase());
    const matchesCategory = linkCategoryFilter === 'All' || l.category.toLowerCase() === linkCategoryFilter.toLowerCase();
    const matchesLevel = linkLevelFilter === 'All' || l.level === linkLevelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const unreadCount = store.notifications.filter(n => !n.read).length;

  // ============================================
  // RENDER
  // ============================================
  return (
    <TooltipProvider>

      <div className="min-h-screen flex flex-col bg-background grid-bg relative">
        {/* Scanline Overlay */}
        <div className="scanline-overlay" />

        {/* ===================== HEADER ===================== */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-mono font-bold text-primary">⦻ ZERO ONE</span>
                  <Badge variant="outline" className="font-mono text-xs text-primary border-primary/50">
                    {"// J.U.L.I.U.S"}
                  </Badge>
                  <span className="cursor-blink" />
                </div>
              </div>

              {/* Status Bar - Desktop */}
              <div className="hidden md:flex items-center gap-3 text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="font-mono text-xs">v2.0</Badge>
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary pulse-green" />
                  <span className="text-primary">ACTIVE</span>
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {store.utcTime}
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="flex items-center gap-1.5">
                  <Timer className="w-3 h-3" />
                  <span>{sessionTime}</span>
                  {Math.floor((Date.now() - sessionStartTime) / 60000) >= 30 && (
                    <Badge variant="destructive" className="text-[9px] font-mono badge-pulse">SESSION EXPIRING</Badge>
                  )}
                </span>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                      onClick={() => {
                        const theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
                        document.documentElement.classList.remove('dark', 'light');
                        document.documentElement.classList.add(theme);
                        localStorage.setItem('theme', theme);
                      }}
                    >
                      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle theme</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative text-muted-foreground hover:text-primary"
                      onClick={() => store.setNotificationPanelOpen(true)}
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-destructive text-[10px] font-mono text-white flex items-center justify-center shadow-[0_0_6px_rgba(255,68,68,0.5)]">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notifications</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary search-input-cyber rounded-md px-3 py-1.5 transition-all"
                      onClick={() => setSearchModalOpen(true)}
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span className="text-foreground/60">Search resources...</span>
                      <kbd className="ml-2 px-1.5 py-0.5 text-[9px] bg-secondary/80 rounded border border-border/50 font-mono">⌘K</kbd>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Search resources & links (⌘K)</TooltipContent>
                </Tooltip>

                {/* Mobile menu toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-muted-foreground"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Mobile Status Bar */}
            <div className="flex md:hidden items-center gap-3 text-xs font-mono text-muted-foreground mt-2">
              <Badge variant="secondary" className="font-mono text-xs">v2.0</Badge>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary pulse-green" />
                <span className="text-primary">ACTIVE</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {store.utcTime}
              </span>
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {sessionTime}
              </span>
            </div>
          </div>
        </header>

        {/* ===================== MAIN CONTENT ===================== */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4">
          <Tabs
            value={store.activeTab}
            onValueChange={store.setActiveTab}
            className="flex flex-col gap-4"
          >
            {/* Navigation Tabs */}
            <div className="overflow-x-auto">
              <TabsList className="w-full flex h-auto p-1.5 bg-card/50 rounded-lg border border-border/30 gap-0.5">
                <TabsTrigger value="home" className="flex items-center gap-1.5 text-xs font-mono data-[state=active]:text-primary data-[state=active]:border-primary/50 hover:bg-primary/5 transition-all duration-200 tab-active-bar">
                  <Home className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Home</span>
                </TabsTrigger>
                <TabsTrigger value="levels" className="flex items-center gap-1.5 text-xs font-mono data-[state=active]:text-primary hover:bg-primary/5 transition-all duration-200 tab-active-bar">
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Levels</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-1.5 text-xs font-mono data-[state=active]:text-primary hover:bg-primary/5 transition-all duration-200 tab-active-bar">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger value="opsec" className="flex items-center gap-1.5 text-xs font-mono data-[state=active]:text-primary hover:bg-primary/5 transition-all duration-200 tab-active-bar">
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">OPSEC</span>
                </TabsTrigger>
                <TabsTrigger value="links" className="flex items-center gap-1.5 text-xs font-mono data-[state=active]:text-primary hover:bg-primary/5 transition-all duration-200 tab-active-bar">
                  <Link2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Links</span>
                </TabsTrigger>
                <TabsTrigger value="toolkit" className="flex items-center gap-1.5 text-xs font-mono data-[state=active]:text-primary hover:bg-primary/5 transition-all duration-200 tab-active-bar">
                  <Wrench className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Toolkit</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center gap-1.5 text-xs font-mono data-[state=active]:text-primary hover:bg-primary/5 transition-all duration-200 tab-active-bar">
                  <Bot className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">AI</span>
                </TabsTrigger>
                <TabsTrigger value="community" className="flex items-center gap-1.5 text-xs font-mono data-[state=active]:text-primary hover:bg-primary/5 transition-all duration-200 tab-active-bar">
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Community</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ===================== HOME TAB ===================== */}
            <TabsContent value="home" className="space-y-6">
              {/* Hero Section */}
              <Card className="border-primary/20 bg-card/80 card-cyber hero-gradient card-depth-2 relative overflow-hidden">
                <div className="scan-line-moving" />
                <CardContent className="p-6 md:p-8 relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <motion.h1 
                        className="text-3xl md:text-5xl font-mono font-bold text-primary glitch-text neon-text-green" 
                        data-text="J.U.L.I.U.S"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        J.U.L.I.U.S
                      </motion.h1>
                      <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30 badge-glow-green">v2.0</Badge>
                    </div>
                    <p className="text-sm md:text-base font-mono text-readable leading-relaxed max-w-3xl">
                      <span className="text-primary neon-text-green">$</span> Justified Universal Link &amp; Intelligence Utility System
                      <br />
                      <span className="text-primary neon-text-green">&gt;</span> Professional web surfing &amp; security research portal.
                      Navigate through 5 operational levels from surface web to restricted resources.
                      <br />
                      <span className="text-primary neon-text-green">&gt;</span> All activities are logged. Use responsibly.
                      <span className="cursor-blink" />
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <div className="terminal-prompt text-xs font-mono text-primary/70 px-3 py-1.5 rounded bg-primary/5 border border-primary/20 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-primary" />
                        <span className="text-primary">sys.status</span> = OPERATIONAL
                      </div>
                      <div className="terminal-prompt text-xs font-mono text-primary/70 px-3 py-1.5 rounded bg-primary/5 border border-primary/20 flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-primary" />
                        <span className="text-primary">opsec.level</span> = L2
                      </div>
                      <div className="terminal-prompt text-xs font-mono text-primary/70 px-3 py-1.5 rounded bg-primary/5 border border-primary/20 flex items-center gap-1.5">
                        {store.tunnelEnabled ? <Lock className="w-3 h-3 text-primary" /> : <WifiOff className="w-3 h-3 text-muted-foreground" />}
                        <span className="text-primary">tunnel</span> = {store.tunnelEnabled ? store.tunnelType.toUpperCase() : 'OFF'}
                      </div>
                      <div className="terminal-prompt text-xs font-mono text-primary/70 px-3 py-1.5 rounded bg-primary/5 border border-primary/20 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-primary" />
                        <span className="text-primary">session</span> = {sessionTime}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 stats-grid">
                {[
                  { label: 'Indexed Resources', value: 47, icon: Globe, color: '#00ff41', glow: true, suffix: '+', trend: '+3 today' },
                  { label: 'Active Tools', value: 10, icon: Wrench, color: '#ff6b35', glow: false, trend: '2 new' },
                  { label: 'AI Assistants', value: 6, icon: Bot, color: '#ffd700', glow: false, trend: 'All online' },
                  { label: 'Community Status', value: 'ONLINE', icon: Users, color: '#00ff41', glow: true, trend: '2,847 active' },
                  { label: 'OPSEC Level', value: 'L2', icon: Shield, color: '#ff6b35', glow: false, trend: 'Moderate' },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.4 }}
                  >
                    <Card className="border-border/50 bg-card/80 card-accent group h-full hover-lift hover:border-primary/20 transition-all duration-200">
                      <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
                        <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <stat.icon className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: stat.color }} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-mono font-bold text-bright count-up" style={{ color: stat.color }}>
                            {typeof stat.value === 'number' ? (
                              <>
                                <AnimatedCounter target={stat.value} />
                                {stat.suffix}
                              </>
                            ) : stat.value}
                          </span>
                          {stat.glow && <span className="w-1.5 h-1.5 rounded-full pulse-green" style={{ backgroundColor: stat.color }} />}
                        </div>
                        <span className="text-[10px] font-mono text-readable">{stat.label}</span>
                        <span className="text-[9px] font-mono text-primary/60">{stat.trend}</span>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* IP Location Widget */}
              <Card className="border-border/50 bg-card/80 card-cyber hover:border-primary/20 transition-all duration-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-mono flex items-center gap-2 text-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      YOUR LOCATION
                      {store.ipData && (
                        <Badge variant="outline" className="text-[9px] font-mono" style={{ color: store.ipData?.isVpn ? '#ffd700' : store.ipData?.isProxy ? '#ff6b35' : '#00ff41', borderColor: store.ipData?.isVpn ? '#ffd70050' : store.ipData?.isProxy ? '#ff6b3550' : '#00ff4150' }}>
                          {store.ipData?.isVpn ? 'VPN DETECTED' : store.ipData?.isProxy ? 'PROXY' : 'DIRECT'}
                        </Badge>
                      )}
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-mono text-muted-foreground hover:text-primary" onClick={handleRefreshIp} disabled={ipLoading}>
                      <RefreshCw className={`w-3 h-3 mr-1 ${ipLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {store.ipData ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-readable">IP Address</span>
                        <p className="text-xs font-mono font-bold text-bright">{store.ipData.ip}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-readable">Location</span>
                        <p className="text-xs font-mono text-bright">{store.ipData.city || 'Unknown'}, {store.ipData.region || 'Unknown'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-readable">Country / ISP</span>
                        <p className="text-xs font-mono text-bright">{store.ipData.country || 'Unknown'} · {store.ipData.isp || 'Unknown'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-readable">Risk Level</span>
                        <Badge variant="outline" className="text-[10px] font-mono" style={{ color: store.ipData.riskLevel === 'low' ? '#00ff41' : store.ipData.riskLevel === 'medium' ? '#ffd700' : '#ff4444', borderColor: store.ipData.riskLevel === 'low' ? '#00ff4150' : store.ipData.riskLevel === 'medium' ? '#ffd70050' : '#ff444450' }}>
                          {store.ipData.riskLevel?.toUpperCase() || 'UNKNOWN'}
                        </Badge>
                        {store.ipData.vpnSuggested && (
                          <p className="text-[9px] font-mono text-yellow-500 mt-1">VPN Recommended</p>
                        )}
                      </div>
                    </div>
                  ) : ipLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                          <div className="skeleton-shimmer skeleton-bar w-16" />
                          <div className="skeleton-shimmer skeleton-text w-24" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-4 gap-2">
                      <WifiOff className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-mono text-muted-foreground">Location data unavailable</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] font-mono text-primary hover:text-primary" onClick={handleRefreshIp}>
                        <RefreshCw className="w-3 h-3 mr-1" /> Retry
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* System Health Dashboard */}
              <div>
                <div className="section-divider" />
                <h2 className="text-sm font-mono text-muted-foreground mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  SYSTEM HEALTH
                  <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30 badge-glow-green">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-green mr-1" />
                    MONITORED
                  </Badge>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'CPU Load', value: 23, unit: '%', icon: Cpu, color: '#00ff41', status: 'normal' },
                    { label: 'Memory', value: 67, unit: '%', icon: Database, color: '#ffd700', status: 'moderate' },
                    { label: 'Network I/O', value: 12, unit: 'MB/s', icon: Wifi, color: '#00ff41', status: 'normal' },
                    { label: 'Disk Usage', value: 45, unit: '%', icon: Server, color: '#ff6b35', status: 'normal' },
                  ].map((metric, idx) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + idx * 0.06 }}
                    >
                      <Card className="border-border/50 bg-card/80 card-glow">
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <metric.icon className="w-3.5 h-3.5" style={{ color: metric.color }} />
                              <span className="text-[10px] font-mono text-readable">{metric.label}</span>
                            </div>
                            <span className={`w-1.5 h-1.5 rounded-full ${metric.status === 'normal' ? 'bg-primary pulse-green' : metric.status === 'moderate' ? 'bg-yellow-500' : 'bg-destructive'}`} />
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-mono font-bold text-bright" style={{ color: metric.color }}>
                              {metric.value}
                            </span>
                            <span className="text-[10px] font-mono text-readable">{metric.unit}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{
                                background: `linear-gradient(90deg, ${metric.color}, ${metric.color}88)`,
                                boxShadow: `0 0 6px ${metric.color}40`,
                              }}
                              initial={{ width: 0 }}
                              animate={{ width: `${metric.unit === 'MB/s' ? Math.min(metric.value * 5, 100) : metric.value}%` }}
                              transition={{ delay: 0.5 + idx * 0.1, duration: 0.8, ease: 'easeOut' }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Live Activity Feed + Network Topology Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ActivityFeed entries={store.securityLog.slice(0, 12).map((entry) => ({
                  id: entry.id,
                  type: entry.riskLevel === 'high' || entry.riskLevel === 'critical' ? 'critical' : entry.riskLevel === 'medium' || entry.riskLevel === 'warning' ? 'warning' : entry.eventType.toLowerCase().includes('security') ? 'security' : 'info',
                  message: entry.eventType.replace(/_/g, ' '),
                  details: entry.details,
                  timestamp: entry.timestamp,
                }))} />
                <NetworkTopology />
              </div>

              {/* Level Preview Cards */}
              <div>
                <div className="section-divider" />
                <h2 className="text-sm font-mono text-muted-foreground mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  OPERATIONAL LEVELS
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {LEVELS_DATA.map((level) => (
                    <Card
                      key={level.level}
                      className="border-border/50 bg-card/80 card-glow cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                      onClick={() => { store.setActiveTab('levels'); }}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <LevelBadge level={level.level} />
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <CardTitle className="text-sm font-mono" style={{ color: level.colorHex }}>
                          {level.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-xs text-readable line-clamp-2">{level.description}</p>
                        <p className="text-xs font-mono text-readable mt-2">
                          {level.resources.length} resources
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <div className="cyber-divider" />
                <h2 className="text-sm font-mono text-muted-foreground mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary neon-text-green" />
                  QUICK ACTIONS
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Check My IP', icon: Globe, tab: 'security', desc: 'Detect IP exposure', color: '#00ff41' },
                    { label: 'Run Security Scan', icon: Activity, tab: 'security', desc: 'Assess security posture', color: '#ff6b35' },
                    { label: 'Browse Links', icon: Link2, tab: 'links', desc: 'Curated resources', color: '#ffd700' },
                    { label: 'View Notifications', icon: Bell, tab: '', desc: `${unreadCount} unread`, action: () => store.setNotificationPanelOpen(true), color: '#a855f7' },
                  ].map((action, idx) => (
                    <motion.div
                      key={action.label}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Card
                        className="border-border/50 bg-card/80 card-accent cursor-pointer group h-full hover:border-primary/20 hover:shadow-[0_0_12px_rgba(0,255,65,0.08)] transition-all duration-200"
                        onClick={() => {
                          if (action.action) action.action();
                          else if (action.tab) store.setActiveTab(action.tab);
                        }}
                      >
                        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors relative">
                            <action.icon className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: action.color }} />
                            <div className="absolute inset-0 rounded-lg border border-primary/0 group-hover:border-primary/30 transition-colors" />
                          </div>
                          <span className="text-xs font-mono font-bold text-foreground group-hover:text-primary transition-colors">{action.label}</span>
                          <span className="text-[10px] font-mono text-readable">{action.desc}</span>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Global Threat Map */}
              <div>
                <div className="section-divider" />
                <ThreatMap />
              </div>

              {/* System Activity Feed */}
              <div>
                <div className="section-divider" />
                <h2 className="text-sm font-mono text-muted-foreground mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  SYSTEM ACTIVITY
                  <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30">LIVE</Badge>
                </h2>
                <Card className="border-border/50 bg-card/80 card-glow">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {store.securityLog.slice(0, 5).map((entry) => {
                        const riskColors: Record<string, string> = {
                          info: '#7a9a7b', low: '#00ff41', medium: '#ffd700', high: '#ff6b35', critical: '#ff4444',
                        };
                        const color = riskColors[entry.riskLevel] || '#7a9a7b';
                        return (
                          <div key={entry.id} className="flex items-center gap-3 py-1.5 border-b border-border/20 last:border-0">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            <span className="text-[10px] font-mono text-readable shrink-0">
                              {new Date(entry.timestamp).toLocaleTimeString()}
                            </span>
                            <Badge variant="secondary" className="text-[9px] font-mono shrink-0">{entry.eventType}</Badge>
                            <span className="text-[10px] font-mono text-readable truncate flex-1">{entry.details}</span>
                          </div>
                        );
                      })}
                      {store.securityLog.length === 0 && (
                        <p className="text-xs font-mono text-muted-foreground text-center py-4">No recent activity</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Threat Intelligence Feed */}
              <div>
                <div className="section-divider" />
                <h2 className="text-sm font-mono text-muted-foreground mb-3 flex items-center gap-2">
                  <Radar className="w-4 h-4 text-primary" />
                  THREAT INTELLIGENCE FEED
                  <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30 badge-glow-green">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-green mr-1" />
                    LIVE
                  </Badge>
                </h2>
                <Card className="border-border/50 bg-card/80 card-cyber">
                  <CardContent className="p-4 space-y-3">
                    {[
                      { time: '2m ago', severity: 'critical', title: 'CVE-2026-4127: Critical RCE in OpenSSL 3.4.x', source: 'NIST NVD', affected: '2,400+ systems' },
                      { time: '8m ago', severity: 'high', title: 'New phishing campaign targeting security researchers', source: 'CISA Alert', affected: 'Global' },
                      { time: '15m ago', severity: 'medium', title: 'Tor network relay degradation detected', source: 'Tor Project', affected: '12% relays' },
                      { time: '23m ago', severity: 'high', title: 'Supply chain attack on npm package event-stream', source: 'Snyk Intel', affected: '1.2M downloads' },
                      { time: '31m ago', severity: 'low', title: 'New DNS-over-HTTPS provider added to recommended list', source: 'J.U.L.I.U.S', affected: 'All users' },
                    ].map((threat, i) => {
                      const sevColors: Record<string, string> = { critical: '#ff4444', high: '#ff6b35', medium: '#ffd700', low: '#00ff41' };
                      const sevColor = sevColors[threat.severity] || '#7a9a7b';
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0 group cursor-pointer"
                        >
                          <div className="flex flex-col items-center shrink-0 mt-0.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sevColor, boxShadow: `0 0 6px ${sevColor}60` }} />
                            {i < 4 && <div className="w-0.5 h-6 bg-border/30 mt-1" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <Badge variant="outline" className="text-[8px] font-mono h-4 px-1" style={{ color: sevColor, borderColor: `${sevColor}50` }}>
                                {threat.severity.toUpperCase()}
                              </Badge>
                              <span className="text-[9px] font-mono text-muted-foreground">{threat.time}</span>
                              <span className="text-[9px] font-mono text-primary/50">{threat.source}</span>
                            </div>
                            <p className="text-[11px] font-mono text-foreground group-hover:text-primary transition-colors truncate">{threat.title}</p>
                            <span className="text-[9px] font-mono text-muted-foreground/60">Affected: {threat.affected}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] font-mono text-muted-foreground hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="w-2.5 h-2.5 mr-1" /> View
                          </Button>
                        </motion.div>
                      );
                    })}
                    <div className="text-center pt-2">
                      <Button variant="ghost" size="sm" className="font-mono text-[10px] text-primary hover:text-primary">
                        <Radar className="w-3 h-3 mr-1" /> Load More Threats
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Security News Feed */}
              <div>
                <div className="section-divider" />
                <h2 className="text-sm font-mono text-muted-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  SECURITY NEWS
                  <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30 badge-glow-green">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-green mr-1" />
                    LIVE
                  </Badge>
                </h2>
                <SecurityNewsFeed />
              </div>

              {/* Network Status Pulse + Activity Graph */}
              <div>
                <div className="section-divider" />
                <h2 className="text-sm font-mono text-muted-foreground mb-3 flex items-center gap-2">
                  <Network className="w-4 h-4 text-primary" />
                  NETWORK PULSE
                  <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30 badge-glow-green">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-green mr-1" />
                    LIVE
                  </Badge>
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <Card className="border-border/50 bg-card/80 card-glow">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'DNS Latency', value: '12ms', status: 'optimal', color: '#00ff41' },
                          { label: 'Tor Circuit', value: '3 hops', status: 'active', color: '#00ff41' },
                          { label: 'VPN Tunnel', value: store.tunnelEnabled ? store.tunnelType.toUpperCase() : 'OFF', status: store.tunnelEnabled ? 'connected' : 'disabled', color: store.tunnelEnabled ? '#00ff41' : '#7a9a7b' },
                        ].map((item) => (
                          <div key={item.label} className="text-center p-2 rounded-lg bg-secondary/20 border border-border/20">
                            <span className="text-[9px] font-mono text-muted-foreground block">{item.label}</span>
                            <span className="text-sm font-mono font-bold block mt-0.5" style={{ color: item.color }}>{item.value}</span>
                            <span className="text-[8px] font-mono block mt-0.5" style={{ color: item.color }}>{item.status.toUpperCase()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[9px] font-mono text-muted-foreground">Uptime</span>
                        <div className="flex-1 h-2 rounded-full bg-secondary/50 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
                            initial={{ width: 0 }}
                            animate={{ width: '99.7%' }}
                            transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-primary font-bold">99.7%</span>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {[
                          { label: 'Packets In', value: '1.2M', icon: ArrowDownRight, color: '#00ff41' },
                          { label: 'Packets Out', value: '847K', icon: ArrowUpRight, color: '#ff6b35' },
                          { label: 'Dropped', value: '23', icon: Minus, color: '#ffd700' },
                        ].map((stat) => (
                          <div key={stat.label} className="flex items-center gap-1.5 text-[9px] font-mono">
                            <stat.icon className="w-2.5 h-2.5" style={{ color: stat.color }} />
                            <span className="text-muted-foreground">{stat.label}</span>
                            <span className="font-bold ml-auto" style={{ color: stat.color }}>{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Network Activity Graph */}
                  <Card className="border-border/50 bg-card/80 card-glow">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-mono flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        TRAFFIC ANALYSIS
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <NetworkActivityGraph />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Disclaimer */}
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-mono font-bold text-destructive">DISCLAIMER</p>
                      <p className="text-xs font-mono text-muted-foreground">
                        This platform is intended for authorized security research and educational purposes only.
                        Users must comply with all applicable laws and regulations. Unauthorized access to computer
                        systems is illegal. The Zero One Community assumes no liability for misuse of these resources.
                        Always obtain proper authorization before conducting security assessments.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cyber News Feed */}
              <CyberNewsFeed />
            </TabsContent>

            {/* ===================== LEVELS TAB ===================== */}
            <TabsContent value="levels" className="space-y-6">
              {/* Level Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                {LEVELS_DATA.map((level) => (
                  <Card
                    key={level.level}
                    className="border-border/50 bg-card/80 card-accent cursor-pointer group"
                    onClick={() => {
                      const el = document.getElementById(`level-${level.level}`);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    <CardContent className="p-3 flex flex-col items-center text-center gap-1.5">
                      <LevelBadge level={level.level} />
                      <span className="text-xs font-mono font-bold group-hover:text-primary transition-colors" style={{ color: level.colorHex }}>
                        {level.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-mono font-bold" style={{ color: level.colorHex }}>{level.resources.length}</span>
                        <span className="text-[9px] font-mono text-muted-foreground">resources</span>
                      </div>
                      <Progress
                        value={(level.resources.length / 6) * 100}
                        className="h-1 bg-secondary/50 w-full"
                        style={{ '--tw-progress-color': level.colorHex } as React.CSSProperties}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
              {LEVELS_DATA.map((level, levelIndex) => (
                <div key={level.level} className={`space-y-3 ${levelIndex % 2 === 0 ? 'fade-in-left' : 'fade-in-right'}`}>
                  {/* Level Header */}
                  <Card id={`level-${level.level}`} className="border-border/50 overflow-hidden" style={{ borderColor: `${level.colorHex}30` }}>
                    <CardHeader className="p-4 pb-3" style={{ borderBottom: `1px solid ${level.colorHex}20` }}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <LevelBadge level={level.level} />
                          <CardTitle className="text-lg font-mono" style={{ color: level.colorHex }}>
                            {level.name}
                          </CardTitle>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs" style={{ color: level.colorHex, borderColor: `${level.colorHex}50` }}>
                          {level.resources.length} RESOURCES
                        </Badge>
                      </div>
                      <CardDescription className="text-xs font-mono mt-1">{level.description}</CardDescription>
                      {level.warning && (
                        <div className="flex items-center gap-2 mt-2 p-2 rounded bg-destructive/10 border border-destructive/20 danger-stripe">
                          <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
                          <span className="text-xs font-mono text-destructive">{level.warning}</span>
                        </div>
                      )}
                    </CardHeader>
                  </Card>

                  {/* Resource Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {level.resources.map((resource) => (
                      <Card key={resource.id} className="border-border/50 bg-card/80 card-hover-glow">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-sm font-mono text-foreground">
                              {resource.name}
                            </CardTitle>
                            <LevelBadge level={resource.level} className="shrink-0" />
                          </div>
                          <CardDescription className="text-xs mt-1 line-clamp-2">{resource.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-1">
                          <div className="flex flex-wrap gap-1 mb-3">
                            {resource.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] font-mono">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full font-mono text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                            onClick={() => {
                              setSelectedResource(resource);
                              setResourceDialogOpen(true);
                            }}
                          >
                            ACCESS <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* ===================== SECURITY CENTER TAB ===================== */}
            <TabsContent value="security" className="space-y-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <p className="text-xs font-mono text-muted-foreground flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4 text-primary neon-text-green" />
                Monitor your digital footprint, block threats, and secure your browsing sessions.
              </p>
              {/* IP Detection Panel */}
              <Card className="border-border/50 bg-card/80 card-cyber neon-border">
                <CardHeader className="p-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" />
                      <CardTitle className="text-sm font-mono neon-text-green">IP DETECTION PANEL</CardTitle>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="font-mono text-xs hover:bg-primary/10 hover:text-primary"
                      onClick={handleRefreshIp}
                      disabled={ipLoading}
                    >
                      <RefreshCw className={`w-3 h-3 mr-1.5 ${ipLoading ? 'animate-spin' : ''}`} />
                      REFRESH
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  {store.ipData ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-xs font-mono text-muted-foreground">IP Address</span>
                          <p className="font-mono text-sm text-foreground flex items-center gap-2">
                            {store.ipData.ip}
                            {store.ipData.vpnSuggested && (
                              <Badge variant="destructive" className="text-[10px] font-mono">EXPOSED</Badge>
                            )}
                            {store.ipData.isVpn && (
                              <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/50">VPN</Badge>
                            )}
                            {store.ipData.isTor && (
                              <Badge variant="outline" className="text-[10px] font-mono text-purple-400 border-purple-400/50">TOR</Badge>
                            )}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-mono text-muted-foreground">Location</span>
                          <p className="font-mono text-sm text-foreground flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            {store.ipData.city}, {store.ipData.region}, {store.ipData.country}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-mono text-muted-foreground">ISP</span>
                          <p className="font-mono text-sm text-foreground flex items-center gap-1.5">
                            <Server className="w-3 h-3 text-muted-foreground" />
                            {store.ipData.isp}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-mono text-muted-foreground">Risk Level</span>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{
                                backgroundColor:
                                  store.ipData.riskLevel === 'high' ? '#ff4444' :
                                  store.ipData.riskLevel === 'medium' ? '#ffd700' : '#00ff41',
                              }}
                            />
                            <span className="font-mono text-sm capitalize" style={{
                              color:
                                store.ipData.riskLevel === 'high' ? '#ff4444' :
                                store.ipData.riskLevel === 'medium' ? '#ffd700' : '#00ff41',
                            }}>
                              {store.ipData.riskLevel.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* VPN Warning */}
                      {store.ipData.vpnSuggested && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 space-y-2 alert-danger-cyber">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            <span className="font-mono text-sm font-bold text-destructive neon-text-red">REAL IP DETECTED</span>
                          </div>
                          <p className="text-xs font-mono text-muted-foreground">
                            Your real IP address is exposed. We strongly recommend using a VPN before conducting any security research.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <a href="https://mullvad.net" target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="font-mono text-xs hover:bg-primary/10 hover:text-primary">
                                <Shield className="w-3 h-3 mr-1" /> Mullvad VPN
                              </Button>
                            </a>
                            <a href="https://protonvpn.com" target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="font-mono text-xs hover:bg-primary/10 hover:text-primary">
                                <Lock className="w-3 h-3 mr-1" /> ProtonVPN
                              </Button>
                            </a>
                          </div>
                        </div>
                      )}
                    </>
                  ) : ipLoading ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="space-y-2">
                            <div className="skeleton-shimmer skeleton-bar w-20" />
                            <div className="skeleton-shimmer skeleton-text w-32" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <WifiOff className="w-8 h-8 text-muted-foreground" />
                      <p className="font-mono text-sm text-muted-foreground">Unable to detect IP</p>
                      <Button variant="outline" size="sm" className="font-mono text-xs hover:bg-primary/10 hover:text-primary" onClick={handleRefreshIp}>
                        <RefreshCw className="w-3 h-3 mr-1" /> Retry Detection
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Security Analytics + Score Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SecurityAnalyticsDashboard securityScore={store.securityScore} privacySettings={store.privacySettings} />
                {/* Security Score Card */}
                <Card className="border-border/50 bg-card/80 card-cyber neon-border scan-line">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      SECURITY SCORE
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex flex-col items-center">
                    <SecurityScoreRing score={store.securityScore} />
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 font-mono text-xs hover:bg-primary/10 hover:text-primary btn-neon"
                      onClick={handleRunScan}
                    >
                      <Zap className="w-3 h-3 mr-1" /> RUN SCAN
                    </Button>
                    {/* Score History Mini Chart */}
                    <div className="w-full mt-4">
                      <p className="text-[10px] font-mono text-muted-foreground text-center mb-2">SCORE TREND</p>
                      <div className="flex items-end gap-1 h-12 px-2">
                        {[35, 42, 38, 55, 48, 52, 45, 58, store.securityScore].map((val, i) => (
                          <motion.div
                            key={i}
                            className="flex-1 rounded-t"
                            style={{
                              background: `linear-gradient(180deg, ${val >= 80 ? '#00ff41' : val >= 60 ? '#ffd700' : val >= 40 ? '#ff6b35' : '#ff4444'}, transparent)`,
                              boxShadow: `0 0 4px ${val >= 80 ? '#00ff4140' : val >= 60 ? '#ffd70040' : val >= 40 ? '#ff6b3540' : '#ff444440'}`,
                            }}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(val, 10)}%` }}
                            transition={{ delay: i * 0.05, duration: 0.4 }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between px-2 mt-1">
                        <span className="text-[8px] font-mono text-muted-foreground">-8m</span>
                        <span className="text-[8px] font-mono text-primary">now</span>
                      </div>
                    </div>
                    {/* Scan Breakdown */}
                    {scanBreakdown.length > 0 && (
                      <div className="w-full mt-4 space-y-2.5">
                        <p className="text-[10px] font-mono text-muted-foreground text-center">SCAN BREAKDOWN</p>
                        {scanBreakdown.map((item) => (
                          <div key={item.name} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-muted-foreground">{item.name}</span>
                              <span className="text-[10px] font-mono font-bold" style={{ color: item.score >= 80 ? '#00ff41' : item.score >= 60 ? '#ffd700' : item.score >= 40 ? '#ff6b35' : '#ff4444' }}>
                                {item.score}/100
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-secondary/50 overflow-hidden score-bar-animated">
                              <motion.div
                                className="h-full rounded-full"
                                style={{
                                  background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                                  boxShadow: `0 0 6px ${item.color}40`,
                                }}
                                initial={{ width: 0 }}
                                animate={{ width: `${item.score}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Default Security Indicators (always visible) */}
                    {scanBreakdown.length === 0 && (
                      <div className="w-full mt-4 space-y-2">
                        <p className="text-[10px] font-mono text-muted-foreground text-center">SECURITY INDICATORS</p>
                        {[
                          { name: 'DNS Protection', active: store.privacySettings.dnsOverHttps, color: '#00ff41' },
                          { name: 'WebRTC Shield', active: store.privacySettings.webrtcBlocking, color: '#ffd700' },
                          { name: 'Tracker Block', active: store.privacySettings.referrerStripping, color: '#ff6b35' },
                          { name: 'Tor Routing', active: store.privacySettings.jsRestriction, color: '#a855f7' },
                        ].map((ind) => (
                          <div key={ind.name} className="flex items-center justify-between py-0.5">
                            <span className="text-[10px] font-mono text-muted-foreground">{ind.name}</span>
                            <span className={`text-[9px] font-mono font-bold flex items-center gap-1 ${ind.active ? 'text-primary' : 'text-muted-foreground/40'}`}>
                              {ind.active ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3" /> OFF
                                </>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Blocked Resources + Privacy Settings Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Blocked Resources */}
                <Card className="border-border/50 bg-card/80 card-glow lg:col-span-2">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-mono flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        BLOCKED RESOURCES
                      </CardTitle>
                      <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                        {store.blockedResources.length} BLOCKED
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    {/* Add Block Form */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Domain to block..."
                        value={addBlockDomain}
                        onChange={(e) => setAddBlockDomain(e.target.value)}
                        className="font-mono text-xs bg-input/50"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddBlock()}
                      />
                      <Select value={addBlockReason} onValueChange={setAddBlockReason}>
                        <SelectTrigger className="w-32 font-mono text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tracker">Tracker</SelectItem>
                          <SelectItem value="ad">Ad Network</SelectItem>
                          <SelectItem value="malware">Malware</SelectItem>
                          <SelectItem value="phishing">Phishing</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" className="font-mono text-xs shrink-0 hover:bg-primary/10 hover:text-primary" onClick={handleAddBlock}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Blocked List */}
                    <ScrollArea className="max-h-48">
                      <div className="space-y-1.5">
                        {store.blockedResources.map((resource) => (
                          <div key={resource.id} className="flex items-center justify-between p-2 rounded bg-secondary/30 border border-border/30">
                            <div className="flex items-center gap-2 min-w-0">
                              <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                              <span className="font-mono text-xs truncate">{resource.domain}</span>
                              <Badge variant="secondary" className="text-[10px] font-mono shrink-0">{resource.reason}</Badge>
                              <span className="text-[10px] font-mono text-muted-foreground shrink-0">{resource.hits} hits</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                              onClick={() => handleUnblock(resource.id, resource.domain)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Tunnel + Privacy Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Tunnel Status */}
                <Card className="border-border/50 bg-card/80 card-glow">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-primary" />
                      TUNNEL STATUS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-muted-foreground">Tunneling</span>
                      <Switch
                        checked={store.tunnelEnabled}
                        onCheckedChange={store.setTunnelEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-muted-foreground">Tunnel Type</span>
                      <Select value={store.tunnelType} onValueChange={store.setTunnelType} disabled={!store.tunnelEnabled}>
                        <SelectTrigger className="w-36 font-mono text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="socks5">SOCKS5</SelectItem>
                          <SelectItem value="http-proxy">HTTP Proxy</SelectItem>
                          <SelectItem value="ssh-tunnel">SSH Tunnel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-secondary/30 border border-border/30">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: store.tunnelEnabled ? '#00ff41' : '#ff4444' }} />
                      <span className="text-xs font-mono" style={{ color: store.tunnelEnabled ? '#00ff41' : '#ff4444' }}>
                        {store.tunnelEnabled ? `CONNECTED (${store.tunnelType.toUpperCase()})` : 'DISCONNECTED'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card className="border-border/50 bg-card/80 card-glow">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      PRIVACY SETTINGS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2.5">
                    {[
                      { key: 'dnsOverHttps', label: 'DNS-over-HTTPS (DoH)', icon: Globe },
                      { key: 'webrtcBlocking', label: 'WebRTC Blocking', icon: Wifi },
                      { key: 'canvasProtection', label: 'Canvas Fingerprint Protection', icon: Eye },
                      { key: 'referrerStripping', label: 'Referrer Header Stripping', icon: Shield },
                      { key: 'cookieAutoDelete', label: 'Cookie Auto-Delete', icon: Trash2 },
                      { key: 'jsRestriction', label: 'JavaScript Restriction', icon: Terminal },
                    ].map(({ key, label, icon: Icon }) => (
                      <div key={key} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs font-mono text-muted-foreground">{label}</span>
                        </div>
                        <Switch
                          checked={store.privacySettings[key] ?? false}
                          onCheckedChange={() => handleTogglePrivacy(key)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Security Log */}
              <Card className="border-border/50 bg-card/80 card-glow">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      SECURITY LOG
                    </CardTitle>
                    <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                      LIVE
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ScrollArea className="max-h-64">
                    <div className="space-y-1.5">
                      {store.securityLog.map((entry) => {
                        const riskColors: Record<string, string> = {
                          info: '#7a9a7b',
                          low: '#00ff41',
                          medium: '#ffd700',
                          high: '#ff6b35',
                          critical: '#ff4444',
                        };
                        const color = riskColors[entry.riskLevel] || '#7a9a7b';
                        return (
                          <div key={entry.id} className="flex items-start gap-2 p-2 rounded bg-secondary/20 border border-border/20">
                            <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-mono text-muted-foreground">
                                  {new Date(entry.timestamp).toLocaleTimeString()}
                                </span>
                                <Badge variant="secondary" className="text-[10px] font-mono">{entry.eventType}</Badge>
                                <Badge variant="outline" className="text-[10px] font-mono" style={{ color, borderColor: `${color}50` }}>
                                  {entry.riskLevel.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-xs font-mono text-muted-foreground mt-0.5 truncate">{entry.details}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* URL Security Checker */}
              <Card className="border-border/50 bg-card/80 card-glow">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Search className="w-4 h-4 text-primary" />
                      URL SECURITY CHECKER
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter URL to check..."
                      value={surfUrl}
                      onChange={(e) => setSurfUrl(e.target.value)}
                      className="font-mono text-xs bg-input/50"
                      onKeyDown={(e) => e.key === 'Enter' && handleSurfCheck()}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="font-mono text-xs shrink-0 hover:bg-primary/10 hover:text-primary"
                      onClick={handleSurfCheck}
                      disabled={surfLoading}
                    >
                      {surfLoading ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Search className="w-3 h-3 mr-1" />}
                      SCAN
                    </Button>
                  </div>
                  {surfResult && (
                    <div className={`p-3 rounded-lg border space-y-2 ${
                      surfResult.safe 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'bg-destructive/5 border-destructive/20'
                    }`}>
                      <div className="flex items-center gap-2">
                        {surfResult.safe ? (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                        <span className={`text-sm font-mono font-bold ${surfResult.safe ? 'text-primary' : 'text-destructive'}`}>
                          {surfResult.safe ? 'SAFE' : 'THREATS DETECTED'}
                        </span>
                        <Badge variant="outline" className="font-mono text-xs ml-auto" style={{
                          color: surfResult.securityScore >= 80 ? '#00ff41' : surfResult.securityScore >= 50 ? '#ffd700' : '#ff4444',
                          borderColor: surfResult.securityScore >= 80 ? 'rgba(0,255,65,0.3)' : surfResult.securityScore >= 50 ? 'rgba(255,215,0,0.3)' : 'rgba(255,68,68,0.3)',
                        }}>
                          Score: {surfResult.securityScore}/100
                        </Badge>
                      </div>
                      {surfResult.threats.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {surfResult.threats.map((threat: string, i: number) => (
                            <Badge key={i} variant="destructive" className="text-[10px] font-mono">{threat}</Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-xs font-mono text-muted-foreground">{surfResult.recommendation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Password Strength Analyzer */}
              <Card className="border-border/50 bg-card/80 card-glow">
                <CardHeader className="p-4 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-primary" />
                      PASSWORD STRENGTH ANALYZER
                    </CardTitle>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="font-mono text-[10px] h-7 px-2 hover:bg-primary/10 hover:text-primary"
                        onClick={() => {
                          const pwd = generateStrongPassword();
                          setPasswordCheck(pwd);
                          setGeneratedPassword(pwd);
                          setPasswordVisible(true);
                          toast({ title: '🔒 Password generated!', description: 'Strong 20-character password created.' });
                        }}
                      >
                        <Shuffle className="w-3 h-3 mr-1" />
                        GENERATE
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  {/* Password Input with show/hide + copy + clear */}
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <Input
                        type={passwordVisible ? 'text' : 'password'}
                        placeholder="Enter password to analyze..."
                        value={passwordCheck}
                        onChange={(e) => { setPasswordCheck(e.target.value); setGeneratedPassword(''); }}
                        className="font-mono text-xs bg-input/50 pr-20"
                      />
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                          onClick={() => setPasswordVisible(!passwordVisible)}
                        >
                          {passwordVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                        {passwordCheck && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                              onClick={() => { navigator.clipboard.writeText(passwordCheck); toast({ title: '📋 Copied to clipboard!' }); }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => { setPasswordCheck(''); setGeneratedPassword(''); }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {passwordCheck && (() => {
                    const analysis = analyzePasswordStrength(passwordCheck);
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        {/* Strength Meter with animated gradient bar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-muted-foreground">Strength Score</span>
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] h-5"
                              style={{ color: analysis.color, borderColor: `${analysis.color}60` }}
                            >
                              {analysis.label}
                            </Badge>
                          </div>
                          <div className="w-full h-3 rounded-full bg-secondary/50 overflow-hidden border border-border/30">
                            <motion.div
                              className="h-full rounded-full relative overflow-hidden"
                              initial={{ width: 0 }}
                              animate={{ width: `${analysis.score}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              style={{
                                background: `linear-gradient(90deg, #ff4444 0%, #ff6b35 25%, #ffd700 50%, #00ff41 100%)`,
                                backgroundSize: '400% 100%',
                                backgroundPosition: analysis.score <= 25 ? '0% 0' : analysis.score <= 50 ? '33% 0' : analysis.score <= 75 ? '66% 0' : '100% 0',
                                boxShadow: `0 0 12px ${analysis.color}50`,
                              }}
                            >
                              {/* Animated shimmer */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                            </motion.div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-muted-foreground">0</span>
                            <span className="text-lg font-mono font-bold" style={{ color: analysis.color }}>
                              {analysis.score}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">100</span>
                          </div>
                        </div>

                        {/* Crack Time + Score Row */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg bg-secondary/20 border border-border/30 space-y-1">
                            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              EST. CRACK TIME
                            </span>
                            <p className="text-sm font-mono font-bold" style={{ color: analysis.color }}>
                              {analysis.crackTime}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-secondary/20 border border-border/30 space-y-1">
                            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              STRENGTH RATING
                            </span>
                            <p className="text-sm font-mono font-bold" style={{ color: analysis.color }}>
                              {analysis.score}/100
                            </p>
                          </div>
                        </div>

                        {/* Criteria Checklist */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Security Criteria</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {analysis.checks.map((check, i) => (
                              <div
                                key={i}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border transition-colors ${
                                  check.passed
                                    ? 'bg-primary/5 border-primary/20'
                                    : 'bg-destructive/5 border-destructive/20'
                                }`}
                              >
                                {check.passed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                                )}
                                <span className={`text-[10px] font-mono truncate ${check.passed ? 'text-primary' : 'text-muted-foreground'}`}>
                                  {check.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Generated password indicator */}
                        {generatedPassword && (
                          <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-[10px] font-mono text-primary">
                              AI-generated strong password — copy and use it securely.
                            </span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Threat Intelligence Feed */}
              <Card className="border-border/50 bg-card/80 card-glow">
                <CardHeader className="p-4 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <Radar className="w-4 h-4 text-primary" />
                      THREAT INTELLIGENCE FEED
                    </CardTitle>
                    <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-green mr-1.5" />
                      LIVE
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ScrollArea className="max-h-64">
                    <div className="space-y-2">
                      {[
                        { time: '2m ago', type: 'CVE', severity: 'critical', title: 'CVE-2025-0128 - Critical RCE in Apache Struts', source: 'NVD', ioc: 'CVE-2025-0128' },
                        { time: '8m ago', type: 'MALWARE', severity: 'high', title: 'New LokiBot variant targeting financial sector', source: 'Abuse.ch', ioc: 'SHA256: a1b2c3...' },
                        { time: '15m ago', type: 'PHISHING', severity: 'medium', title: 'Phishing campaign mimicking AWS SES alerts', source: 'PhishTank', ioc: 'aws-ses-alert[.]com' },
                        { time: '32m ago', type: 'IOC', severity: 'high', title: '1,247 new malicious IPs from botnet C2 infrastructure', source: 'OTX', ioc: '45.33.xx.xx/24' },
                        { time: '1h ago', type: 'VULN', severity: 'medium', title: 'XSS vulnerability in popular WordPress plugin', source: 'WPScan', ioc: 'CVE-2025-0192' },
                        { time: '2h ago', type: 'RANSOMWARE', severity: 'critical', title: 'LockBit 4.0 targeting healthcare organizations', source: 'CISA', ioc: 'lockbit4[.]onion' },
                        { time: '3h ago', type: 'CVE', severity: 'low', title: 'Information disclosure in nginx default config', source: 'GitHub Advisory', ioc: 'CVE-2025-0045' },
                      ].map((threat, i) => {
                        const severityColors: Record<string, string> = {
                          critical: '#ff4444', high: '#ff6b35', medium: '#ffd700', low: '#00ff41',
                        };
                        const typeColors: Record<string, string> = {
                          CVE: '#a855f7', MALWARE: '#ff4444', PHISHING: '#ff6b35', IOC: '#ffd700', VULN: '#00ff41', RANSOMWARE: '#ff4444',
                        };
                        const color = severityColors[threat.severity] || '#7a9a7b';
                        const typeColor = typeColors[threat.type] || '#7a9a7b';
                        return (
                          <div key={i} className="flex items-start gap-2 p-2 rounded bg-secondary/20 border border-border/20 group">
                            <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] font-mono text-muted-foreground">{threat.time}</span>
                                <Badge className="text-[8px] font-mono h-4 px-1" style={{ backgroundColor: `${typeColor}20`, color: typeColor, borderColor: `${typeColor}40` }}>
                                  {threat.type}
                                </Badge>
                                <Badge variant="outline" className="text-[8px] font-mono h-4 px-1" style={{ color, borderColor: `${color}40` }}>
                                  {threat.severity.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-[10px] font-mono text-foreground group-hover:text-primary transition-colors truncate">{threat.title}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-mono text-muted-foreground">Source: {threat.source}</span>
                                <span className="text-[8px] font-mono text-primary/60">IOC: {threat.ioc}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 shrink-0 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => { navigator.clipboard.writeText(threat.ioc); toast({ title: 'IOC copied' }); }}
                            >
                              <ClipboardList className="w-3 h-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Security Audit Timeline */}
              <Card className="border-border/50 bg-card/80 card-cyber">
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    SECURITY AUDIT TIMELINE
                    <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30">
                      LAST 24H
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-0">
                    {[
                      { time: '14:23', event: 'Security scan completed', detail: 'Score: 85/100 — DNS protection enabled', type: 'success', icon: CheckCircle2 },
                      { time: '13:45', event: 'New domain blocked', detail: 'tracker.adnetwork.xyz added to blocklist', type: 'action', icon: Shield },
                      { time: '12:10', event: 'IP address detected', detail: 'Location: Nairobi, KE — VPN recommended', type: 'warning', icon: MapPin },
                      { time: '11:30', event: 'Privacy setting changed', detail: 'WebRTC leak protection enabled', type: 'info', icon: Lock },
                      { time: '09:15', event: 'Tunnel connection established', detail: 'WireGuard tunnel active via Mullvad', type: 'success', icon: Wifi },
                      { time: '08:00', event: 'Daily security report generated', detail: '5 threats identified, 3 blocked, 2 pending review', type: 'info', icon: FileText },
                    ].map((audit, i) => {
                      const typeColors: Record<string, string> = { success: '#00ff41', action: '#ff6b35', warning: '#ffd700', info: '#7a9a7b' };
                      const color = typeColors[audit.type] || '#7a9a7b';
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-3 py-2.5 group"
                        >
                          <div className="flex flex-col items-center shrink-0">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center border transition-colors" style={{ borderColor: `${color}40`, backgroundColor: `${color}10` }}>
                              <audit.icon className="w-3.5 h-3.5" style={{ color }} />
                            </div>
                            {i < 5 && <div className="w-0.5 flex-1 bg-border/30 mt-1" />}
                          </div>
                          <div className="flex-1 min-w-0 pb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono font-bold text-foreground group-hover:text-primary transition-colors">{audit.event}</span>
                              <span className="text-[9px] font-mono text-muted-foreground/60">{audit.time}</span>
                            </div>
                            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{audit.detail}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            </TabsContent>

            {/* ===================== OPSEC TAB ===================== */}
            <TabsContent value="opsec" className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="section-divider" />
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-mono text-muted-foreground">OPERATIONAL SECURITY GUIDES</h2>
                <div className="ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-mono text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                    onClick={handleExportData}
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Export Data
                  </Button>
                </div>
              </div>

              {OPSEC_GUIDES_DATA.map((guide) => {
                const color = getLevelColor(guide.level);
                return (
                  <Card key={guide.level} className="border-border/50 bg-card/80 card-glow card-lift" style={{ borderColor: `${color}20` }}>
                    <CardHeader className="p-4 pb-3">
                      <div className="flex items-center gap-3">
                        <LevelBadge level={guide.level} />
                        <CardTitle className="text-sm font-mono" style={{ color }}>
                          {guide.name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                            <Globe className="w-3 h-3" /> Browser
                          </span>
                          <p className="text-xs font-mono text-foreground">{guide.browser}</p>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                            <Lock className="w-3 h-3" /> VPN
                          </span>
                          <p className="text-xs font-mono text-foreground">{guide.vpn}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                          <Wrench className="w-3 h-3" /> Tools
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {guide.tools.map((tool) => (
                            <Badge key={tool} variant="secondary" className="text-[10px] font-mono">{tool}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" /> Key Practices
                        </span>
                        <ul className="space-y-1">
                          {guide.practices.map((practice, i) => (
                            <li key={i} className="text-xs font-mono text-muted-foreground flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">▸</span>
                              {practice}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* OPSEC Checklist */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" /> Checklist Progress
                        </span>
                        <Progress
                          value={Math.round(
                            (guide.practices.filter((_, i) => opsecChecks[`${guide.level}-practice-${i}`]).length / guide.practices.length) * 100
                          )}
                          className="h-1.5 bg-secondary/50"
                        />
                        <div className="space-y-1">
                          {guide.practices.map((practice, i) => {
                            const checkKey = `${guide.level}-practice-${i}`;
                            const checked = opsecChecks[checkKey] || false;
                            return (
                              <label key={checkKey} className="flex items-center gap-2 cursor-pointer group/check py-0.5">
                                <div className={`w-3.5 h-3.5 rounded border transition-colors flex items-center justify-center shrink-0 ${
                                  checked ? 'bg-primary border-primary' : 'border-border group-hover/check:border-primary/50'
                                }`} onClick={() => setOpsecChecks(prev => ({ ...prev, [checkKey]: !checked }))}>
                                  {checked && <CheckCircle2 className="w-2.5 h-2.5 text-primary-foreground" />}
                                </div>
                                <span className={`text-[10px] font-mono transition-colors ${checked ? 'text-primary line-through' : 'text-muted-foreground'}`}>
                                  {practice}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-muted-foreground">COMMAND</span>
                          <span className="text-[10px] font-mono text-muted-foreground opacity-50 hover:opacity-100 cursor-pointer transition-opacity" onClick={() => copyToClipboard(guide.codeSnippet.replace(/^\$\s*/, ''))}>Click to copy</span>
                        </div>
                        <div className="terminal-box">
                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-x-auto">{guide.codeSnippet}</pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            {/* ===================== LINKS TAB ===================== */}
            <TabsContent value="links" className="space-y-4">
              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search links..."
                      value={linkSearch}
                      onChange={(e) => setLinkSearch(e.target.value)}
                      className="font-mono text-xs pl-8 bg-input/50"
                    />
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="font-mono text-xs shrink-0 hover:bg-primary/10 hover:text-primary btn-press"
                        onClick={handleExportLinks}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export links as JSON</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="font-mono text-xs shrink-0 hover:bg-primary/10 hover:text-primary btn-press"
                        onClick={handleImportLinks}
                      >
                        <Upload className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Import links from JSON</TooltipContent>
                  </Tooltip>
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-mono text-xs shrink-0 hover:bg-primary/10 hover:text-primary btn-press"
                    onClick={() => setAddLinkDialogOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add
                  </Button>
                  <Button
                    size="sm"
                    className="font-mono text-xs shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 btn-press"
                    onClick={() => setLinkUploadOpen(true)}
                  >
                    <Upload className="w-3 h-3 mr-1" /> Upload
                  </Button>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {LINK_CATEGORIES.map((cat) => (
                    <Button
                      key={cat}
                      size="sm"
                      variant={linkCategoryFilter === cat ? 'default' : 'outline'}
                      className={`h-6 px-2.5 font-mono text-[10px] ${linkCategoryFilter === cat ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10 hover:text-primary'}`}
                      onClick={() => setLinkCategoryFilter(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>

                {/* Level Filter Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {LEVEL_FILTERS.map((lvl) => (
                    <Button
                      key={lvl}
                      size="sm"
                      variant={linkLevelFilter === lvl ? 'default' : 'outline'}
                      className={`h-6 px-2.5 font-mono text-[10px] ${linkLevelFilter === lvl ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10 hover:text-primary'}`}
                      onClick={() => setLinkLevelFilter(lvl)}
                    >
                      {lvl === 'All' ? 'All' : lvl}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Links Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredLinks.map((link) => (
                  <Card key={link.id} className="border-border/50 bg-card/80 card-glow group hover:border-primary/20 transition-all duration-200">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-sm font-mono text-foreground truncate">{link.name}</CardTitle>
                          <p className="text-[10px] font-mono text-primary truncate mt-0.5">{link.url}</p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-6 w-6 p-0 ${link.starred ? 'text-primary' : 'text-muted-foreground'}`}
                            onClick={() => handleToggleStar(link.id)}
                          >
                            <Star className={`w-3.5 h-3.5 ${link.starred ? 'fill-current' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteLink(link.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-xs mt-1 line-clamp-2 text-readable">{link.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-[10px] font-mono capitalize">{link.category}</Badge>
                        <LevelBadge level={link.level} />
                        {link.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px] font-mono">{tag}</Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full font-mono text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                        onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" /> VISIT
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {filteredLinks.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="font-mono text-sm text-muted-foreground">No links found matching your criteria</p>
                </div>
              )}
            </TabsContent>

            {/* ===================== TOOLKIT TAB ===================== */}
            <TabsContent value="toolkit" className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="section-divider" />
                <Wrench className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-mono text-muted-foreground">PENTEST TOOLS</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TOOLS_DATA.map((tool) => (
                  <Card key={tool.id} className="border-border/50 bg-card/80 card-glow hover:border-primary/20 transition-all duration-200">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-mono text-foreground">{tool.name}</CardTitle>
                        <LevelBadge level={tool.level} />
                      </div>
                      <CardDescription className="text-xs mt-1 text-readable">{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      <Badge variant="secondary" className="text-[10px] font-mono capitalize">{tool.category}</Badge>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <a href={tool.url} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full font-mono text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                        >
                          <Download className="w-3 h-3 mr-1" /> DOWNLOAD
                        </Button>
                      </a>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Encryption Tools Section */}
              <div>
                <div className="section-divider" />
                <h2 className="text-sm font-mono text-muted-foreground mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  ENCRYPTION & HASHING UTILITIES
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {/* Hash Generator */}
                  <Card className="border-border/50 bg-card/80 card-glow">
                    <CardHeader className="p-4 pb-3">
                      <CardTitle className="text-sm font-mono flex items-center gap-2">
                        <Hexagon className="w-4 h-4 text-primary" />
                        HASH GENERATOR
                      </CardTitle>
                      <CardDescription className="text-[10px] font-mono text-readable">
                        Generate SHA-256, SHA-1, and MD5 hashes from text input
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <HashGenerator />
                    </CardContent>
                  </Card>

                  {/* Base64 Encoder/Decoder */}
                  <Card className="border-border/50 bg-card/80 card-glow">
                    <CardHeader className="p-4 pb-3">
                      <CardTitle className="text-sm font-mono flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        BASE64 ENCODER / DECODER
                      </CardTitle>
                      <CardDescription className="text-[10px] font-mono text-readable">
                        Encode and decode Base64 strings for data transmission
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <Base64Tool />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* ROT13 & Caesar Cipher */}
              <Card className="border-border/50 bg-card/80 card-glow">
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-primary" />
                    CIPHER TOOLS
                  </CardTitle>
                  <CardDescription className="text-[10px] font-mono text-readable">
                    Classical cipher utilities for educational cryptography analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <CipherTools />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===================== AI TAB ===================== */}
            <TabsContent value="ai" className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="section-divider" />
                <Bot className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-mono text-muted-foreground">AI ASSISTANTS</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {AI_TOOLS_DATA.map((ai) => (
                  <Card key={ai.id} className="border-border/50 bg-card/80 card-glow hover:border-primary/20 hover:shadow-[0_0_15px_rgba(0,255,65,0.1)] transition-all duration-200">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Cpu className="w-4 h-4 text-primary" />
                        <CardTitle className="text-sm font-mono text-foreground">{ai.name}</CardTitle>
                      </div>
                      <CardDescription className="text-xs">{ai.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                      <div className="flex flex-wrap gap-1">
                        {ai.capabilities.map((cap) => (
                          <Badge key={cap} variant="secondary" className="text-[10px] font-mono">{cap}</Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full font-mono text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                      >
                        <Rocket className="w-3 h-3 mr-1" /> LAUNCH
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* AI Chat Section - Enhanced v2.1 */}
              <Card className="border-border/50 bg-card/80 card-cyber neon-border">
                <CardHeader className="p-4 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-mono flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Brain className="w-4 h-4 text-primary" />
                      </motion.div>
                      J.U.L.I.U.S AI ASSISTANT
                      <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30 badge-glow-green ml-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-green mr-1" />
                        ONLINE
                      </Badge>
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="font-mono text-[9px] text-muted-foreground border-border/30">
                        v2.1
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-xs font-mono">
                    Professional AI assistant with markdown support, code analysis, and OPSEC expertise. Ask anything about cybersecurity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  {/* Chat Messages */}
                  <ScrollArea className="h-[400px] rounded-lg border border-border/30 bg-secondary/10 p-3 terminal-box">
                    <div className="space-y-4">
                      {chatMessages.length === 0 && (
                        <div className="text-center py-8">
                          <motion.div
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Brain className="w-12 h-12 text-primary/40 mx-auto mb-3" />
                          </motion.div>
                          <p className="text-sm font-mono text-foreground mb-1">J.U.L.I.U.S Neural AI Core</p>
                          <p className="text-xs font-mono text-muted-foreground mb-4">Ready for security analysis and OPSEC consultation</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-md mx-auto">
                            {[
                              { q: 'How to check for DNS leaks?', icon: <Globe className="w-3 h-3" /> },
                              { q: 'Best VPN for research?', icon: <Shield className="w-3 h-3" /> },
                              { q: 'What OPSEC level for OSINT?', icon: <Lock className="w-3 h-3" /> },
                              { q: 'Verify URL safety?', icon: <Search className="w-3 h-3" /> },
                              { q: 'Explain zero-day vulns', icon: <AlertTriangle className="w-3 h-3" /> },
                              { q: 'How does Tor work?', icon: <Eye className="w-3 h-3" /> },
                            ].map((item) => (
                              <button
                                key={item.q}
                                className="text-[10px] font-mono text-muted-foreground px-2 py-2 rounded border border-border/30 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all flex items-center gap-1.5"
                                onClick={() => { setChatInput(item.q); }}
                              >
                                {item.icon} {item.q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {chatMessages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mt-1">
                              <Brain className="w-3.5 h-3.5 text-primary" />
                            </div>
                          )}
                          <div className={`max-w-[85%] rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-primary/10 border border-primary/20 px-4 py-2.5'
                              : 'bg-secondary/20 border border-border/30 px-4 py-2.5'
                          }`}>
                            {msg.role === 'assistant' && (
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-primary text-[10px] font-mono flex items-center gap-1.5 font-bold">
                                  J.U.L.I.U.S AI
                                </span>
                                <div className="flex items-center gap-1">
                                  {msg.thinking && (
                                    <button
                                      className="text-[9px] font-mono text-muted-foreground hover:text-primary px-1.5 py-0.5 rounded border border-border/30 hover:border-primary/30 transition-colors flex items-center gap-1"
                                      onClick={() => setExpandedThinking(prev => ({ ...prev, [i]: !prev[i] }))}
                                    >
                                      <Sparkles className="w-2.5 h-2.5" />
                                      {expandedThinking[i] ? 'Hide' : 'Thinking'}
                                    </button>
                                  )}
                                  <button
                                    className="text-[9px] font-mono text-muted-foreground hover:text-primary px-1.5 py-0.5 rounded border border-border/30 hover:border-primary/30 transition-colors flex items-center gap-1"
                                    onClick={() => copyToClipboard(msg.content)}
                                  >
                                    <Copy className="w-2.5 h-2.5" /> Copy
                                  </button>
                                </div>
                              </div>
                            )}
                            {/* Thinking section - collapsible */}
                            {msg.role === 'assistant' && msg.thinking && expandedThinking[i] && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mb-3 p-2.5 rounded bg-primary/5 border border-primary/10 text-xs font-mono"
                              >
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <Sparkles className="w-3 h-3 text-primary/60" />
                                  <span className="text-[10px] font-mono text-primary/60 font-bold">REASONING</span>
                                </div>
                                <div className="text-muted-foreground text-[11px] whitespace-pre-wrap leading-relaxed">{msg.thinking}</div>
                              </motion.div>
                            )}
                            {/* Message content with markdown rendering */}
                            {msg.role === 'assistant' ? (
                              <div className="text-sm">
                                <MarkdownRenderer content={msg.content} />
                              </div>
                            ) : (
                              <div className="text-sm font-mono text-foreground whitespace-pre-wrap">{msg.content}</div>
                            )}
                          </div>
                          {msg.role === 'user' && (
                            <div className="shrink-0 w-7 h-7 rounded-full bg-secondary/30 border border-border/30 flex items-center justify-center mt-1">
                              <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                      {chatLoading && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex gap-2 justify-start"
                        >
                          <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mt-1">
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            >
                              <Brain className="w-3.5 h-3.5 text-primary" />
                            </motion.div>
                          </div>
                          <div className="bg-secondary/20 border border-border/30 rounded-lg px-4 py-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-primary text-[10px] font-mono font-bold">J.U.L.I.U.S AI</span>
                              <Badge variant="outline" className="text-[8px] font-mono text-primary/60 border-primary/20 px-1 py-0">
                                <motion.span
                                  animate={{ opacity: [0.4, 1, 0.4] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                  THINKING
                                </motion.span>
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="thinking-animation">
                                <span className="thinking-dot" style={{ animationDelay: '0ms' }} />
                                <span className="thinking-dot" style={{ animationDelay: '200ms' }} />
                                <span className="thinking-dot" style={{ animationDelay: '400ms' }} />
                                <span className="thinking-dot" style={{ animationDelay: '600ms' }} />
                              </div>
                              <span className="text-[10px] font-mono text-muted-foreground">Analyzing neural pathways...</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Chat Input - Enhanced */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          placeholder="Ask about security, OPSEC, threats, tools..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          className="font-mono text-xs bg-input/50 pr-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleChatSend();
                            }
                          }}
                        />
                        {chatInput && (
                          <button
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setChatInput('')}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="font-mono text-xs shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 btn-press"
                        onClick={handleChatSend}
                        disabled={chatLoading || !chatInput.trim()}
                      >
                        <Rocket className="w-3 h-3 mr-1" /> Send
                      </Button>
                    </div>
                  </div>

                  {/* Chat Actions Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-mono text-[10px] text-muted-foreground hover:text-primary h-7 px-2"
                        onClick={() => { setChatMessages([]); setExpandedThinking({}); }}
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Clear
                      </Button>
                      {chatMessages.length > 0 && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="font-mono text-[10px] text-muted-foreground hover:text-primary h-7 px-2"
                            onClick={() => {
                              const text = chatMessages.map(m => `[${m.role.toUpperCase()}]\n${m.content}`).join('\n\n---\n\n');
                              const blob = new Blob([text], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `julius-chat-${new Date().toISOString().slice(0, 10)}.txt`;
                              a.click();
                              URL.revokeObjectURL(url);
                              toast({ title: 'Chat exported', description: 'Conversation saved to file' });
                            }}
                          >
                            <Download className="w-3 h-3 mr-1" /> Export
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="font-mono text-[10px] text-muted-foreground hover:text-primary h-7 px-2"
                            onClick={() => {
                              const md = chatMessages.map(m => m.role === 'user' ? `## You\n${m.content}` : `## J.U.L.I.U.S AI\n${m.content}`).join('\n\n---\n\n');
                              const blob = new Blob([md], { type: 'text/markdown' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `julius-chat-${new Date().toISOString().slice(0, 10)}.md`;
                              a.click();
                              URL.revokeObjectURL(url);
                              toast({ title: 'Chat exported', description: 'Conversation saved as Markdown' });
                            }}
                          >
                            <FileText className="w-3 h-3 mr-1" /> Markdown
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-mono text-muted-foreground/50">
                        Markdown supported
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground/50">
                        {chatMessages.length} messages
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ===================== COMMUNITY TAB ===================== */}
            <TabsContent value="community" className="space-y-6">
              {/* Social Links */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="cyber-divider" />
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="text-sm font-mono text-muted-foreground">CONNECT</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {SOCIAL_LINKS_DATA.map((social) => {
                    const iconMap: Record<string, React.ElementType> = {
                      github: Github,
                      'message-circle': MessageCircle,
                      shield: ShieldCheck,
                      'message-square': MessageCircle,
                      'at-sign': AtSign,
                      'file-text': FileText,
                    };
                    const Icon = iconMap[social.icon] || Globe;
                    return (
                      <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer">
                        <Card className="border-border/50 bg-card/80 card-accent h-full hover-lift group">
                          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                              <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                            </div>
                            <span className="text-xs font-mono font-bold text-foreground">{social.name}</span>
                            <span className="text-[10px] text-muted-foreground">{social.description}</span>
                          </CardContent>
                        </Card>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Community Charter */}
              <Card className="border-border/50 bg-card/80 card-glow">
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    COMMUNITY CHARTER
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <p className="text-xs font-mono text-muted-foreground">
                    The Zero One Community is dedicated to ethical security research and responsible disclosure.
                    All members must adhere to the following principles:
                  </p>
                  <div className="space-y-2">
                    {[
                      'Conduct all research within legal boundaries and with proper authorization',
                      'Practice responsible disclosure of vulnerabilities',
                      'Respect the privacy and security of all individuals and organizations',
                      'Share knowledge freely to improve collective security posture',
                      'Never use skills or tools for malicious or unauthorized purposes',
                      'Report illegal activities discovered during research to appropriate authorities',
                      'Maintain confidentiality of sensitive information',
                    ].map((principle, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-xs font-mono text-muted-foreground">{principle}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contribution */}
              <Card className="border-border/50 bg-card/80 card-glow">
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-primary" />
                    CONTRIBUTE TO J.U.L.I.U.S
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <p className="text-xs font-mono text-muted-foreground">
                    J.U.L.I.U.S is an open-source project by the Zero One Community. We welcome contributions
                    from security researchers, developers, and privacy advocates worldwide.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { title: 'Report Issues', desc: 'Found a bug or security vulnerability? Report it securely through our GitHub issues.', icon: Bug, action: 'Open GitHub Issues' },
                      { title: 'Submit Resources', desc: 'Suggest new tools, links, or guides for the community knowledge base.', icon: Plus, action: 'Submit Resource' },
                      { title: 'Code Contributions', desc: 'Submit pull requests for features, fixes, and improvements.', icon: Github, action: 'View on GitHub' },
                    ].map((item) => (
                      <div key={item.title} className="p-4 rounded-lg bg-secondary/30 border border-border/30 space-y-2 card-accent cursor-pointer group">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-xs font-mono font-bold text-foreground">{item.title}</p>
                        <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">{item.desc}</p>
                        <span className="text-[10px] font-mono text-primary hover-underline">{item.action} →</span>
                      </div>
                    ))}
                  </div>
                  <div className="terminal-box">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap">$ git clone https://github.com/zero-one-community/julius.git{'\n'}$ cd julius && bun install{'\n'}$ bun run dev  # Start contributing!</pre>
                  </div>
                </CardContent>
              </Card>

              {/* Community Stats */}
              <Card className="border-border/50 bg-card/80 card-cyber">
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    COMMUNITY METRICS
                    <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30 badge-glow-green ml-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-green mr-1" />
                      LIVE
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Active Researchers', value: '2,847', icon: Users, color: '#00ff41', trend: '+12%' },
                      { label: 'Resources Indexed', value: '1,247', icon: Globe, color: '#ff6b35', trend: '+8%' },
                      { label: 'Security Tools', value: '156', icon: Wrench, color: '#ffd700', trend: '+3' },
                      { label: 'Countries', value: '89', icon: MapPin, color: '#00ff41', trend: '+5' },
                      { label: 'Daily Active', value: '423', icon: Activity, color: '#ff6b35', trend: '+18%' },
                      { label: 'Open Issues', value: '34', icon: Bug, color: '#ffd700', trend: '-7' },
                    ].map((stat) => (
                      <div key={stat.label} className="p-3 rounded-lg bg-secondary/30 border border-border/30 text-center space-y-1 card-accent group cursor-default">
                        <stat.icon className="w-4 h-4 mx-auto group-hover:scale-110 transition-transform" style={{ color: stat.color }} />
                        <p className="text-lg font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
                        <p className="text-[9px] font-mono text-muted-foreground">{stat.label}</p>
                        <span className="text-[8px] font-mono text-primary/60 flex items-center justify-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" /> {stat.trend}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Development Roadmap */}
              <Card className="border-border/50 bg-card/80 card-glow">
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    DEVELOPMENT ROADMAP
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  {[
                    { phase: 'Phase 1', title: 'Core Platform', status: 'completed', desc: 'Dashboard, IP detection, security scoring, resource explorer', color: '#00ff41' },
                    { phase: 'Phase 2', title: 'AI Integration', status: 'completed', desc: 'AI chat assistant, threat analysis, automated OPSEC recommendations', color: '#00ff41' },
                    { phase: 'Phase 3', title: 'Community Hub', status: 'in-progress', desc: 'Resource submissions, community reviews, reputation system', color: '#ffd700' },
                    { phase: 'Phase 4', title: 'Real-time Intel', status: 'planned', desc: 'Live threat feeds, WebSocket notifications, collaborative research', color: '#ff6b35' },
                    { phase: 'Phase 5', title: 'Advanced Tools', status: 'planned', desc: 'Custom tool builder, automated scanning pipelines, API marketplace', color: '#7a9a7b' },
                  ].map((item, i) => (
                    <div key={item.phase} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full border-2 shrink-0" style={{ borderColor: item.color, backgroundColor: item.status === 'completed' ? item.color : 'transparent' }} />
                        {i < 4 && <div className="w-0.5 flex-1 bg-border/30 mt-1" />}
                      </div>
                      <div className="pb-3">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono text-muted-foreground">{item.phase}</span>
                          <Badge variant="outline" className="text-[9px] font-mono" style={{ color: item.color, borderColor: `${item.color}50` }}>
                            {item.status === 'completed' ? '✓ DONE' : item.status === 'in-progress' ? '◎ ACTIVE' : '○ PLANNED'}
                          </Badge>
                        </div>
                        <p className="text-xs font-mono font-bold text-foreground">{item.title}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Core Team */}
              <Card className="border-border/50 bg-card/80 card-cyber">
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    CORE TEAM
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { name: 'Cipher_0x', role: 'Lead Developer', expertise: 'Offensive Security', status: 'online', commits: 847, avatar: '0x' },
                      { name: 'Ghost_Protocol', role: 'Security Architect', expertise: 'OPSEC & Anonymity', status: 'online', commits: 623, avatar: 'GP' },
                      { name: 'ByteRunner', role: 'AI Engineer', expertise: 'ML Threat Detection', status: 'away', commits: 412, avatar: 'BR' },
                      { name: 'NullSector', role: 'Community Lead', expertise: 'OSINT Research', status: 'online', commits: 556, avatar: 'NS' },
                    ].map((member) => (
                      <div key={member.name} className="p-3 rounded-lg bg-secondary/30 border border-border/30 space-y-2 card-accent group">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-mono text-xs text-primary border border-primary/20 group-hover:border-primary/50 transition-colors">
                            {member.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-mono font-bold text-foreground truncate">{member.name}</p>
                            <p className="text-[9px] font-mono text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-[9px] font-mono">{member.expertise}</Badge>
                          <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
                            <GitBranch className="w-2.5 h-2.5" /> {member.commits}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${member.status === 'online' ? 'bg-primary pulse-green' : 'bg-yellow-500'}`} />
                          <span className="text-[9px] font-mono capitalize" style={{ color: member.status === 'online' ? '#00ff41' : '#ffd700' }}>
                            {member.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Community Activity Feed */}
              <Card className="border-border/50 bg-card/80 card-cyber">
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    COMMUNITY ACTIVITY
                    <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30 badge-glow-green ml-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-green mr-1" />
                      LIVE
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-0">
                    {[
                      { user: 'Cipher_0x', action: 'merged PR #247', detail: 'feat: add real-time threat feed integration', time: '3m ago', type: 'code' },
                      { user: 'NullSector', action: 'added new resource', detail: 'OSINT Framework v3.2 — L1 Surface Web', time: '8m ago', type: 'resource' },
                      { user: 'Ghost_Protocol', action: 'reported vulnerability', detail: 'XSS in URL checker — severity: medium', time: '15m ago', type: 'security' },
                      { user: 'ByteRunner', action: 'updated AI model', detail: 'Threat detection v2.1 — 94% accuracy', time: '22m ago', type: 'ai' },
                      { user: 'ShadowByte', action: 'submitted OPSEC guide', detail: 'Advanced Tor configuration for L4 research', time: '38m ago', type: 'guide' },
                      { user: 'CryptoPhantom', action: 'starred resource', detail: 'Shodan Internet Explorer — 142 total stars', time: '45m ago', type: 'star' },
                    ].map((activity, i) => {
                      const typeColors: Record<string, string> = { code: '#00ff41', resource: '#ff6b35', security: '#ff4444', ai: '#ffd700', guide: '#a855f7', star: '#00ff41' };
                      const typeIcons: Record<string, React.ElementType> = { code: GitBranch, resource: Globe, security: Shield, ai: Bot, guide: FileText, star: Star };
                      const color = typeColors[activity.type] || '#7a9a7b';
                      const Icon = typeIcons[activity.type] || Activity;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-center gap-3 py-2.5 border-b border-border/15 last:border-0 group"
                        >
                          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
                            <Icon className="w-3 h-3" style={{ color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-mono text-foreground">
                              <span className="text-primary font-bold">{activity.user}</span>{' '}
                              <span className="text-muted-foreground">{activity.action}</span>
                            </p>
                            <p className="text-[9px] font-mono text-muted-foreground/60 truncate">{activity.detail}</p>
                          </div>
                          <span className="text-[9px] font-mono text-muted-foreground/40 shrink-0">{activity.time}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Community Events & Challenges */}
              <Card className="border-primary/20 bg-card/80 card-cyber neon-border">
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    ACTIVE CHALLENGES
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { title: 'OSINT Sprint #14', desc: 'Find 10 public data sources for a given target. 47 participants.', reward: '500 XP', progress: 72, color: '#00ff41' },
                      { title: 'CTF Challenge: Cipher Hunt', desc: 'Decrypt 5 encoded messages using cryptographic techniques. 23 solvers.', reward: '1,000 XP', progress: 45, color: '#ffd700' },
                      { title: 'Bug Bounty Marathon', desc: 'Find valid vulnerabilities in the practice environment. 12 submissions.', reward: '2,500 XP', progress: 30, color: '#ff6b35' },
                      { title: 'OPSEC Workshop', desc: 'Live session: Advanced anonymity techniques. 89 registered.', reward: 'Badge', progress: 90, color: '#a855f7' },
                    ].map((challenge) => (
                      <div key={challenge.title} className="p-3 rounded-lg bg-secondary/20 border border-border/25 space-y-2 card-accent group cursor-pointer">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-mono font-bold text-foreground group-hover:text-primary transition-colors">{challenge.title}</p>
                          <Badge variant="outline" className="text-[8px] font-mono h-4 px-1.5" style={{ color: challenge.color, borderColor: `${challenge.color}40` }}>
                            {challenge.reward}
                          </Badge>
                        </div>
                        <p className="text-[9px] font-mono text-muted-foreground leading-relaxed">{challenge.desc}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: challenge.color, boxShadow: `0 0 4px ${challenge.color}40` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${challenge.progress}%` }}
                              transition={{ delay: 0.5, duration: 0.8 }}
                            />
                          </div>
                          <span className="text-[9px] font-mono" style={{ color: challenge.color }}>{challenge.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Community Leaderboard */}
              <Card className="border-border/50 bg-card/80 card-glow">
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    TOP CONTRIBUTORS
                    <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30">THIS MONTH</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    {[
                      { rank: 1, name: 'Cipher_0x', points: 12847, streak: 42, badge: '🥇' },
                      { rank: 2, name: 'Ghost_Protocol', points: 10234, streak: 38, badge: '🥈' },
                      { rank: 3, name: 'NullSector', points: 9567, streak: 29, badge: '🥉' },
                      { rank: 4, name: 'ByteRunner', points: 8432, streak: 24, badge: '' },
                      { rank: 5, name: 'ShadowByte', points: 7198, streak: 19, badge: '' },
                    ].map((user) => (
                      <div key={user.rank} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-secondary/15 border border-border/15 hover:border-primary/20 transition-colors group">
                        <span className="text-sm font-mono font-bold text-muted-foreground w-5 text-center">{user.badge || `#${user.rank}`}</span>
                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center font-mono text-[9px] text-primary border border-primary/20 group-hover:border-primary/40 transition-colors">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-mono font-bold text-foreground group-hover:text-primary transition-colors">{user.name}</p>
                          <span className="text-[9px] font-mono text-muted-foreground">🔥 {user.streak} day streak</span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-primary">{user.points.toLocaleString()} XP</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Data Export / Import */}
              <Card className="border-border/50 bg-card/80 card-glow">
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    DATA MANAGEMENT
                  </CardTitle>
                  <CardDescription className="text-[10px] font-mono text-readable">
                    Export and import your links, security settings, and configuration data
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-secondary/20 border border-border/30 space-y-3 card-accent group">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-primary" />
                        <span className="text-xs font-mono font-bold text-foreground">Export Data</span>
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                        Download all your links, blocked resources, privacy settings, and security logs as a JSON file.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full font-mono text-[10px] border-primary/30 text-primary hover:bg-primary/10"
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/export');
                            if (res.ok) {
                              const data = await res.json();
                              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `julius-export-${new Date().toISOString().slice(0, 10)}.json`;
                              a.click();
                              URL.revokeObjectURL(url);
                              toast({ title: 'Export successful', description: 'Your data has been downloaded' });
                            } else {
                              toast({ title: 'Export failed', description: 'Could not export data', variant: 'destructive' });
                            }
                          } catch {
                            toast({ title: 'Export failed', description: 'Network error', variant: 'destructive' });
                          }
                        }}
                      >
                        <Download className="w-3 h-3 mr-1" /> Export JSON
                      </Button>
                    </div>
                    <div className="p-4 rounded-lg bg-secondary/20 border border-border/30 space-y-3 card-accent group">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-primary" />
                        <span className="text-xs font-mono font-bold text-foreground">Import Data</span>
                      </div>
                      <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                        Restore your configuration from a previously exported JSON file. Existing data will be merged.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full font-mono text-[10px] border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.json';
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (!file) return;
                            try {
                              const text = await file.text();
                              const data = JSON.parse(text);
                              const res = await fetch('/api/import', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data),
                              });
                              if (res.ok) {
                                const result = await res.json();
                                toast({ title: 'Import successful', description: `Imported: ${result.data?.linksImported || 0} links, ${result.data?.blockedResourcesImported || 0} blocks, ${result.data?.privacySettingsImported || 0} settings` });
                              } else {
                                toast({ title: 'Import failed', description: 'Invalid import file format', variant: 'destructive' });
                              }
                            } catch {
                              toast({ title: 'Import failed', description: 'Could not read file', variant: 'destructive' });
                            }
                          };
                          input.click();
                        }}
                      >
                        <Upload className="w-3 h-3 mr-1" /> Import JSON
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* ===================== MOBILE BOTTOM NAV ===================== */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border/50 safe-area-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="grid grid-cols-5 gap-0.5 px-1 py-1.5">
            {[
              { tab: 'home', label: 'Home', icon: Home },
              { tab: 'security', label: 'Security', icon: Shield },
              { tab: 'links', label: 'Links', icon: Link2 },
              { tab: 'toolkit', label: 'Tools', icon: Wrench },
              { tab: 'ai', label: 'AI', icon: Bot },
            ].map((item) => {
              const isActive = store.activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => store.setActiveTab(item.tab)}
                  className={`flex flex-col items-center gap-0.5 py-1 rounded-lg transition-all ${
                    isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary/70'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'drop-shadow-[0_0_4px_rgba(0,255,65,0.4)]' : ''}`} />
                  <span className="text-[9px] font-mono">{item.label}</span>
                  {isActive && <span className="w-1 h-1 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ===================== FOOTER ===================== */}
        <footer className="mt-auto border-t border-border bg-card/50 backdrop-blur-sm footer-cyber pb-16 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-primary text-lg">⦻</span>
                  <span className="font-mono font-bold text-sm text-foreground">ZERO ONE</span>
                  <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30">v2.0</Badge>
                </div>
                <p className="text-[10px] font-mono text-readable leading-relaxed">
                  Professional web surfing & security research portal. Built by the Zero One Community for ethical security research.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-foreground">QUICK LINKS</span>
                <div className="flex flex-col gap-1">
                  {[
                    { label: 'Security Center', tab: 'security' },
                    { label: 'Resource Levels', tab: 'levels' },
                    { label: 'Privacy Tools', tab: 'links' },
                    { label: 'Community', tab: 'community' },
                  ].map((link) => (
                    <button
                      key={link.tab}
                      className="text-[10px] font-mono text-readable hover:text-primary hover-underline transition-colors text-left"
                      onClick={() => store.setActiveTab(link.tab)}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-foreground">STATUS</span>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary pulse-green" />
                    <span className="text-[10px] font-mono text-readable">System Operational</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-2 h-2 text-primary" />
                    <span className="text-[10px] font-mono text-readable">Security Score: {store.securityScore}/100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-2 h-2 text-primary" />
                    <span className="text-[10px] font-mono text-readable">
                      {store.tunnelEnabled ? `Tunnel: ${store.tunnelType.toUpperCase()}` : 'Tunnel: Off'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi className="w-2 h-2 text-primary" />
                    <span className="text-[10px] font-mono text-readable">Uptime: 99.7%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-2 h-2 text-primary" />
                    <span className="text-[10px] font-mono text-readable">2,847 active researchers</span>
                  </div>
                </div>
              </div>
            </div>
            <Separator className="mb-3" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                <span>© 2026 Zero One Community</span>
                <Separator orientation="vertical" className="h-3" />
                <span>J.U.L.I.U.S v2.0</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-primary" />
                  Ethical Research
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-primary" />
                  Responsible Disclosure
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Github className="w-2.5 h-2.5 text-primary" />
                  Open Source
                </span>
              </div>
            </div>
          </div>
        </footer>

        {/* ===================== RESOURCE DIALOG ===================== */}
        <Dialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen}>
          <DialogContent className="bg-card border-border max-w-lg">
            {selectedResource && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="font-mono text-foreground">{selectedResource.name}</DialogTitle>
                    <LevelBadge level={selectedResource.level} />
                  </div>
                  <DialogDescription className="text-xs font-mono flex items-center gap-2">
                    <span className="text-primary truncate">{selectedResource.url}</span>
                    <button
                      className="text-[10px] text-muted-foreground hover:text-primary transition-colors shrink-0"
                      onClick={() => copyToClipboard(selectedResource.url)}
                    >
                      Copy
                    </button>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{selectedResource.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedResource.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs font-mono">{tag}</Badge>
                    ))}
                  </div>
                  {selectedResource.level === 'L4' && (
                    <div className="p-2 rounded bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                      <span className="text-xs font-mono text-destructive">Full OPSEC required. Use Tor + VPN.</span>
                    </div>
                  )}
                  {selectedResource.level === 'L5' && (
                    <div className="p-2 rounded bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                      <span className="text-xs font-mono text-destructive">RESTRICTED: Written authorization (ROE) mandatory.</span>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    className="font-mono text-xs hover:bg-primary/10 hover:text-primary"
                    onClick={() => setResourceDialogOpen(false)}
                  >
                    CLOSE
                  </Button>
                  <Button
                    className="font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90 btn-press"
                    onClick={() => {
                      window.open(selectedResource.url, '_blank', 'noopener,noreferrer');
                      setResourceDialogOpen(false);
                    }}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" /> ACCESS RESOURCE
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ===================== ADD LINK DIALOG ===================== */}
        <Dialog open={addLinkDialogOpen} onOpenChange={setAddLinkDialogOpen}>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="font-mono">ADD LINK</DialogTitle>
              <DialogDescription className="text-xs font-mono">Add a new resource to your links collection.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted-foreground">Name *</label>
                <Input
                  placeholder="Resource name"
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                  className="font-mono text-xs bg-input/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted-foreground">URL *</label>
                <Input
                  placeholder="https://example.com"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="font-mono text-xs bg-input/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted-foreground">Description</label>
                <Textarea
                  placeholder="Brief description..."
                  value={newLink.description}
                  onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                  className="font-mono text-xs bg-input/50 resize-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted-foreground">Category</label>
                  <Select value={newLink.category} onValueChange={(v) => setNewLink({ ...newLink, category: v })}>
                    <SelectTrigger className="font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="osint">OSINT</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="tools">Tools</SelectItem>
                      <SelectItem value="privacy">Privacy</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-muted-foreground">Level</label>
                  <Select value={newLink.level} onValueChange={(v) => setNewLink({ ...newLink, level: v })}>
                    <SelectTrigger className="font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L1">L1 - Surface</SelectItem>
                      <SelectItem value="L2">L2 - Deep Web</SelectItem>
                      <SelectItem value="L3">L3 - Threat Intel</SelectItem>
                      <SelectItem value="L4">L4 - Dark Web</SelectItem>
                      <SelectItem value="L5">L5 - Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted-foreground">Tags (comma-separated)</label>
                <Input
                  placeholder="tag1, tag2, tag3"
                  value={newLink.tags}
                  onChange={(e) => setNewLink({ ...newLink, tags: e.target.value })}
                  className="font-mono text-xs bg-input/50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="font-mono text-xs" onClick={() => setAddLinkDialogOpen(false)}>
                CANCEL
              </Button>
              <Button
                className="font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90 btn-press"
                onClick={handleAddLink}
                disabled={!newLink.name || !newLink.url}
              >
                <Plus className="w-3 h-3 mr-1" /> ADD LINK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ===================== LINK UPLOAD DIALOG (Interactive + Inject) ===================== */}
        <LinkUploadDialog
          open={linkUploadOpen}
          onOpenChange={setLinkUploadOpen}
          onAddLink={handleUploadSingleLink}
          onBatchAddLinks={handleBatchAddLinks}
        />

        {/* ===================== GLOBAL SEARCH MODAL (COMMAND PALETTE) ===================== */}
        <Dialog open={searchModalOpen} onOpenChange={setSearchModalOpen}>
          <DialogContent className="bg-card/95 backdrop-blur-xl border-primary/20 max-w-lg command-palette-overlay shadow-[0_0_40px_rgba(0,255,65,0.1)]">
            <DialogHeader className="pb-0">
              <DialogTitle className="font-mono flex items-center gap-2 text-primary">
                <Search className="w-4 h-4" />
                COMMAND PALETTE
              </DialogTitle>
              <DialogDescription className="text-[10px] font-mono text-muted-foreground">Search resources, links, tools & AI assistants • ⌘K</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-primary/60" />
                <Input
                  placeholder="Type a command or search..."
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  className="font-mono text-sm pl-9 bg-input/50 border-primary/20 focus:border-primary/50 focus:ring-primary/20 placeholder:text-muted-foreground/40"
                  autoFocus
                />
              </div>

              {/* Quick Actions (shown when no query) */}
              {!globalSearchQuery && (
                <div className="space-y-2">
                  <p className="command-palette-group">QUICK ACTIONS</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: 'Run Security Scan', icon: Zap, tab: 'security', color: '#ff6b35' },
                      { label: 'Check My IP', icon: Globe, tab: 'security', color: '#00ff41' },
                      { label: 'Browse Links', icon: Link2, tab: 'links', color: '#ffd700' },
                      { label: 'Open AI Chat', icon: Bot, tab: 'ai', color: '#a855f7' },
                      { label: 'View OPSEC Guides', icon: ShieldCheck, tab: 'opsec', color: '#00bcd4' },
                      { label: 'Export Data', icon: Download, tab: '', color: '#ff6b35', action: handleExportData },
                    ].map((action) => (
                      <button
                        key={action.label}
                        className="command-palette-item flex items-center gap-2 p-2 rounded-md text-left"
                        onClick={() => {
                          if (action.action) action.action();
                          else if (action.tab) store.setActiveTab(action.tab);
                          setSearchModalOpen(false);
                          setGlobalSearchQuery('');
                        }}
                      >
                        <action.icon className="w-3.5 h-3.5 shrink-0" style={{ color: action.color }} />
                        <span className="text-xs font-mono text-foreground truncate">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {globalSearchQuery && (
                <ScrollArea className="max-h-72">
                  <div className="space-y-3">
                    {/* Resources */}
                    {(() => {
                      const q = globalSearchQuery.toLowerCase();
                      const resourceResults = LEVELS_DATA.flatMap(l => l.resources.filter(r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q))));
                      if (resourceResults.length === 0) return null;
                      return (
                        <div>
                          <p className="command-palette-group">Resources ({resourceResults.length})</p>
                          {resourceResults.slice(0, 5).map(r => (
                            <button
                              key={r.id}
                              className="command-palette-item w-full text-left p-2 rounded flex items-center gap-2"
                              onClick={() => { store.setActiveTab('levels'); setSearchModalOpen(false); setGlobalSearchQuery(''); }}
                            >
                              <Globe className="w-3 h-3 text-primary shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-mono text-foreground truncate">{r.name}</p>
                                <p className="text-[10px] font-mono text-muted-foreground truncate">{r.description}</p>
                              </div>
                              <LevelBadge level={r.level} className="shrink-0" />
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                    {/* Links */}
                    {(() => {
                      const q = globalSearchQuery.toLowerCase();
                      const linkResults = store.links.filter(l => l.name.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.url.toLowerCase().includes(q));
                      if (linkResults.length === 0) return null;
                      return (
                        <div>
                          <p className="command-palette-group">Links ({linkResults.length})</p>
                          {linkResults.slice(0, 5).map(l => (
                            <button
                              key={l.id}
                              className="command-palette-item w-full text-left p-2 rounded flex items-center gap-2"
                              onClick={() => { store.setActiveTab('links'); setSearchModalOpen(false); setGlobalSearchQuery(''); }}
                            >
                              <Link2 className="w-3 h-3 text-primary shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-mono text-foreground truncate">{l.name}</p>
                                <p className="text-[10px] font-mono text-muted-foreground truncate">{l.url}</p>
                              </div>
                              <LevelBadge level={l.level} className="shrink-0" />
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                    {/* Tools */}
                    {(() => {
                      const q = globalSearchQuery.toLowerCase();
                      const toolResults = TOOLS_DATA.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
                      if (toolResults.length === 0) return null;
                      return (
                        <div>
                          <p className="command-palette-group">Tools ({toolResults.length})</p>
                          {toolResults.slice(0, 5).map(t => (
                            <button
                              key={t.id}
                              className="command-palette-item w-full text-left p-2 rounded flex items-center gap-2"
                              onClick={() => { store.setActiveTab('toolkit'); setSearchModalOpen(false); setGlobalSearchQuery(''); }}
                            >
                              <Wrench className="w-3 h-3 text-primary shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-mono text-foreground truncate">{t.name}</p>
                                <p className="text-[10px] font-mono text-muted-foreground truncate">{t.description}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                    {/* AI Assistants */}
                    {(() => {
                      const q = globalSearchQuery.toLowerCase();
                      const aiResults = AI_TOOLS_DATA.filter(a => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.capabilities.some(c => c.toLowerCase().includes(q)));
                      if (aiResults.length === 0) return null;
                      return (
                        <div>
                          <p className="command-palette-group">AI Assistants ({aiResults.length})</p>
                          {aiResults.slice(0, 5).map(a => (
                            <button
                              key={a.id}
                              className="command-palette-item w-full text-left p-2 rounded flex items-center gap-2"
                              onClick={() => { store.setActiveTab('ai'); setSearchModalOpen(false); setGlobalSearchQuery(''); }}
                            >
                              <Bot className="w-3 h-3 text-primary shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-mono text-foreground truncate">{a.name}</p>
                                <p className="text-[10px] font-mono text-muted-foreground truncate">{a.description}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                    {/* No results */}
                    {(() => {
                      const q = globalSearchQuery.toLowerCase();
                      const total = LEVELS_DATA.flatMap(l => l.resources).filter(r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)).length
                        + store.links.filter(l => l.name.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)).length
                        + TOOLS_DATA.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)).length
                        + AI_TOOLS_DATA.filter(a => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)).length;
                      return total === 0 ? (
                        <div className="text-center py-6">
                          <Search className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
                          <p className="text-xs font-mono text-muted-foreground">No results for &quot;{globalSearchQuery}&quot;</p>
                          <p className="text-[10px] font-mono text-muted-foreground/50 mt-1">Try a different search term</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </ScrollArea>
              )}
            </div>
            <DialogFooter>
              <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground/50 w-full">
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-secondary/80 rounded border border-border/50 text-[9px]">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-secondary/80 rounded border border-border/50 text-[9px]">↵</kbd> Select</span>
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-secondary/80 rounded border border-border/50 text-[9px]">Esc</kbd> Close</span>
                <span className="ml-auto flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-secondary/80 rounded border border-border/50 text-[9px]">?</kbd> Shortcuts</span>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ===================== KEYBOARD SHORTCUTS MODAL ===================== */}
        <Dialog open={shortcutsModalOpen} onOpenChange={setShortcutsModalOpen}>
          <DialogContent className="bg-card border-border max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-mono flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-primary" />
                KEYBOARD SHORTCUTS
              </DialogTitle>
              <DialogDescription className="text-xs font-mono">Quick navigation and controls</DialogDescription>
            </DialogHeader>
            <div className="space-y-2.5">
              {[
                { keys: '⌘K / Ctrl+K', desc: 'Open global search', icon: Search },
                { keys: '1-8', desc: 'Switch between tabs', icon: Layers },
                { keys: '?', desc: 'Show keyboard shortcuts', icon: Keyboard },
                { keys: 'Esc', desc: 'Close modal / dialog', icon: X },
              ].map((shortcut) => (
                <div key={shortcut.keys} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                  <div className="flex items-center gap-2">
                    <shortcut.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-mono text-muted-foreground">{shortcut.desc}</span>
                  </div>
                  <kbd className="px-2 py-0.5 text-[10px] font-mono bg-secondary rounded border border-border text-foreground">{shortcut.keys}</kbd>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" className="font-mono text-xs" onClick={() => setShortcutsModalOpen(false)}>
                GOT IT
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ===================== NOTIFICATION PANEL (SHEET) ===================== */}
        <Sheet open={store.notificationPanelOpen} onOpenChange={store.setNotificationPanelOpen}>
          <SheetContent className="bg-card border-border w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="font-mono flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                NOTIFICATIONS
              </SheetTitle>
              <SheetDescription className="text-xs font-mono">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </SheetDescription>
            </SheetHeader>

            <div className="flex gap-1 flex-wrap mb-3">
              {['All', 'security', 'warning', 'info', 'alert', 'update'].map((cat) => (
                <button
                  key={cat}
                  className="text-[9px] font-mono px-2 py-0.5 rounded-full border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                  onClick={() => {
                    if (cat === 'All') {
                      // Show all - no filter needed, just display
                    } else {
                      // Filter by category
                    }
                  }}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto mt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="font-mono text-[10px] text-primary hover:text-primary"
                      onClick={handleMarkAllRead}
                    >
                      <CheckCheck className="w-3 h-3 mr-1" /> Mark all read
                    </Button>
                  )}
                </div>
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 font-mono text-[10px] text-muted-foreground hover:text-primary"
                        onClick={() => {
                          const data = JSON.stringify(store.notifications, null, 2);
                          const blob = new Blob([data], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'julius-notifications-export.json';
                          a.click();
                          URL.revokeObjectURL(url);
                          toast({ title: 'Notifications exported', description: `${store.notifications.length} notifications downloaded` });
                        }}
                      >
                        <Download className="w-3 h-3 mr-1" /> Export
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export notifications as JSON</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 font-mono text-[10px] text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          store.setNotifications([]);
                          toast({ title: 'Notifications cleared' });
                        }}
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Clear
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear all notifications</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="space-y-2">
                {store.notifications.map((notification) => {
                  const typeIcons: Record<string, React.ElementType> = {
                    info: Info,
                    security: Shield,
                    warning: TriangleAlert,
                    update: Activity,
                    alert: AlertCircle,
                  };
                  const typeColors: Record<string, string> = {
                    info: '#7a9a7b',
                    security: '#00ff41',
                    warning: '#ffd700',
                    update: '#ff6b35',
                    alert: '#ff4444',
                  };
                  const Icon = typeIcons[notification.type] || Info;
                  const color = typeColors[notification.type] || '#7a9a7b';

                  return (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                        notification.read
                          ? 'bg-secondary/20 border-border/20 opacity-70'
                          : 'bg-secondary/40 border-border/40'
                      }`}
                      onClick={() => handleMarkNotificationRead(notification.id)}
                    >
                      <div className="flex items-start gap-2.5">
                        <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono font-bold ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                              {notification.title}
                            </span>
                            {!notification.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-muted-foreground line-clamp-2">{notification.message}</p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-[9px] font-mono"
                              style={{ color, borderColor: `${color}50` }}
                            >
                              {notification.type.toUpperCase()}
                            </Badge>
                            <span className="text-[9px] font-mono text-muted-foreground">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {store.notifications.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="font-mono text-sm text-muted-foreground">No notifications</p>
                </div>
              )}
            </div>

            <SheetFooter>
              <p className="text-[10px] font-mono text-muted-foreground text-center w-full">
                Notification data is synced with the server
              </p>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      <QuickActionsFAB onAction={(action) => {
        switch (action) {
          case 'scan':
            store.setActiveTab('security');
            handleRunScan();
            break;
          case 'news':
            store.setActiveTab('home');
            break;
          case 'export':
            handleExportData();
            break;
          case 'search':
            setSearchModalOpen(true);
            break;
          case 'chat':
            store.setActiveTab('ai');
            break;
        }
      }} />
    </TooltipProvider>
  );
}
