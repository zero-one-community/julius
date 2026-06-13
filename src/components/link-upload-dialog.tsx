'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Upload,
  Link2,
  FileText,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Terminal,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LinkData {
  name: string;
  url: string;
  description: string;
  category: string;
  level: string;
  tags: string[];
}

interface LinkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddLink: (link: LinkData) => void;
  onBatchAddLinks: (links: LinkData[]) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES = ['osint', 'security', 'tools', 'privacy', 'community'] as const;

const LEVELS = [
  { value: 'L1', label: 'L1 (Surface)' },
  { value: 'L2', label: 'L2 (Deep Web)' },
  { value: 'L3', label: 'L3 (Threat Intel)' },
  { value: 'L4', label: 'L4 (Dark Web)' },
  { value: 'L5', label: 'L5 (Restricted)' },
] as const;

const VALID_LEVELS = new Set(['L1', 'L2', 'L3', 'L4', 'L5']);
const VALID_CATEGORIES = new Set<string>(CATEGORIES);

const SYNTAX_TEMPLATE = `NAME | URL | DESCRIPTION | CATEGORY | LEVEL | TAG1,TAG2
Example: Shodan | https://shodan.io | Device search engine | osint | L1 | device-search,iot`;

// ---------------------------------------------------------------------------
// Validation helpers (Inject mode)
// ---------------------------------------------------------------------------

interface ParsedLine {
  lineIndex: number;
  raw: string;
  valid: boolean;
  link: LinkData | null;
  errors: string[];
}

function parseInjectText(text: string): ParsedLine[] {
  const lines = text.split('\n');
  const results: ParsedLine[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();

    // Skip empty lines
    if (raw === '') continue;

    // Skip comment lines
    if (raw.startsWith('#')) continue;

    const parts = raw.split('|').map((p) => p.trim());

    // Must have at least NAME and URL
    if (parts.length < 2) {
      results.push({
        lineIndex: i + 1,
        raw,
        valid: false,
        link: null,
        errors: ['Insufficient fields — at least NAME and URL are required (pipe-delimited)'],
      });
      continue;
    }

    const errors: string[] = [];
    const name = parts[0];
    const url = parts[1];
    const description = parts[2] ?? '';
    const categoryRaw = parts[3] ?? '';
    const levelRaw = parts[4] ?? '';
    const tagsRaw = parts[5] ?? '';

    if (!name) {
      errors.push('NAME must not be empty');
    }

    if (!url) {
      errors.push('URL must not be empty');
    } else if (!/^https?:\/\/.+/.test(url)) {
      errors.push('URL must start with http:// or https://');
    }

    const category = VALID_CATEGORIES.has(categoryRaw) ? categoryRaw : 'general';
    if (categoryRaw && !VALID_CATEGORIES.has(categoryRaw)) {
      errors.push(`Invalid CATEGORY "${categoryRaw}" — defaulting to "general"`);
    }

    const level = VALID_LEVELS.has(levelRaw) ? levelRaw : 'L1';
    if (levelRaw && !VALID_LEVELS.has(levelRaw)) {
      errors.push(`Invalid LEVEL "${levelRaw}" — defaulting to "L1"`);
    }

    const tags = tagsRaw
      ? tagsRaw
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const criticalErrors = errors.filter(
      (e) => !e.includes('defaulting')
    );

    if (criticalErrors.length > 0) {
      results.push({
        lineIndex: i + 1,
        raw,
        valid: false,
        link: null,
        errors,
      });
    } else {
      results.push({
        lineIndex: i + 1,
        raw,
        valid: true,
        link: { name, url, description, category, level, tags },
        errors, // may contain non-critical warnings about defaults
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LinkUploadDialog({
  open,
  onOpenChange,
  onAddLink,
  onBatchAddLinks,
}: LinkUploadDialogProps) {
  // ---- Interactive mode state ----
  const [interactiveName, setInteractiveName] = useState('');
  const [interactiveUrl, setInteractiveUrl] = useState('');
  const [interactiveDescription, setInteractiveDescription] = useState('');
  const [interactiveCategory, setInteractiveCategory] = useState('');
  const [interactiveLevel, setInteractiveLevel] = useState('');
  const [interactiveTags, setInteractiveTags] = useState('');

  // ---- Inject mode state ----
  const [injectText, setInjectText] = useState('');
  const [syntaxOpen, setSyntaxOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [parsedResults, setParsedResults] = useState<ParsedLine[]>([]);
  const [hasValidated, setHasValidated] = useState(false);

  // ---- Derived counts ----
  const validCount = useMemo(
    () => parsedResults.filter((r) => r.valid).length,
    [parsedResults]
  );
  const invalidCount = useMemo(
    () => parsedResults.filter((r) => !r.valid).length,
    [parsedResults]
  );

  // ---- Reset helpers ----
  const resetInteractive = useCallback(() => {
    setInteractiveName('');
    setInteractiveUrl('');
    setInteractiveDescription('');
    setInteractiveCategory('');
    setInteractiveLevel('');
    setInteractiveTags('');
  }, []);

  const resetInject = useCallback(() => {
    setInjectText('');
    setParsedResults([]);
    setHasValidated(false);
  }, []);

  // ---- Handlers: Interactive ----
  const handleInteractiveSubmit = useCallback(() => {
    if (!interactiveName.trim() || !interactiveUrl.trim()) return;

    onAddLink({
      name: interactiveName.trim(),
      url: interactiveUrl.trim(),
      description: interactiveDescription.trim(),
      category: interactiveCategory || 'general',
      level: interactiveLevel || 'L1',
      tags: interactiveTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });

    resetInteractive();
    onOpenChange(false);
  }, [
    interactiveName,
    interactiveUrl,
    interactiveDescription,
    interactiveCategory,
    interactiveLevel,
    interactiveTags,
    onAddLink,
    onOpenChange,
    resetInteractive,
  ]);

  // ---- Handlers: Inject ----
  const handleValidate = useCallback(() => {
    const results = parseInjectText(injectText);
    setParsedResults(results);
    setHasValidated(true);
  }, [injectText]);

  const handleBatchUpload = useCallback(() => {
    const validLinks = parsedResults
      .filter((r) => r.valid && r.link)
      .map((r) => r.link!);

    if (validLinks.length === 0) return;

    onBatchAddLinks(validLinks);
    resetInject();
    onOpenChange(false);
  }, [parsedResults, onBatchAddLinks, onOpenChange, resetInject]);

  const handleCopyTemplate = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SYNTAX_TEMPLATE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments where clipboard API is unavailable
      const textarea = document.createElement('textarea');
      textarea.value = SYNTAX_TEMPLATE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  // Reset everything when the dialog closes
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        resetInteractive();
        resetInject();
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetInteractive, resetInject]
  );

  // ---- Level badge colour helper ----
  const levelColor = (level: string) => {
    switch (level) {
      case 'L1':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'L2':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'L3':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'L4':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'L5':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // ---- Category badge colour helper ----
  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'osint':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'security':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'tools':
        return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
      case 'privacy':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'community':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="font-mono sm:max-w-2xl bg-[#0a0e17] border-[#1e293b] text-[#c8d6e5] max-h-[90vh] overflow-y-auto"
        style={{ scrollbarColor: '#1e293b #0a0e17' }}
      >
        {/* Custom scrollbar for WebKit */}
        <style>{`
          .julius-scroll::-webkit-scrollbar { width: 6px; }
          .julius-scroll::-webkit-scrollbar-track { background: #0a0e17; }
          .julius-scroll::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        `}</style>

        <DialogHeader>
          <DialogTitle className="font-mono flex items-center gap-2 text-[#00ff41]">
            <Terminal className="size-5" />
            J.U.L.I.U.S. — Link Upload
          </DialogTitle>
          <DialogDescription className="font-mono text-[#4a5568]">
            Add links to the intelligence database via interactive form or batch inject.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="interactive" className="w-full">
          <TabsList className="font-mono bg-[#111827] border border-[#1e293b] w-full">
            <TabsTrigger
              value="interactive"
              className="font-mono data-[state=active]:bg-[#1e293b] data-[state=active]:text-[#00ff41] flex-1"
            >
              <Upload className="size-4 mr-1" />
              Interactive
            </TabsTrigger>
            <TabsTrigger
              value="inject"
              className="font-mono data-[state=active]:bg-[#1e293b] data-[state=active]:text-[#00ff41] flex-1"
            >
              <FileText className="size-4 mr-1" />
              Inject
            </TabsTrigger>
          </TabsList>

          {/* ================================================================ */}
          {/* INTERACTIVE TAB                                                  */}
          {/* ================================================================ */}
          <TabsContent value="interactive" className="mt-4 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-[#4a5568] uppercase tracking-wider">
                Name <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g. Shodan"
                value={interactiveName}
                onChange={(e) => setInteractiveName(e.target.value)}
                className="font-mono bg-[#111827] border-[#1e293b] text-[#c8d6e5] placeholder:text-[#2d3748] focus-visible:border-[#00ff41] focus-visible:ring-[#00ff41]/20"
              />
            </div>

            {/* URL */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-[#4a5568] uppercase tracking-wider">
                URL <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#4a5568]" />
                <Input
                  placeholder="https://example.com"
                  value={interactiveUrl}
                  onChange={(e) => setInteractiveUrl(e.target.value)}
                  className="font-mono bg-[#111827] border-[#1e293b] text-[#c8d6e5] placeholder:text-[#2d3748] pl-9 focus-visible:border-[#00ff41] focus-visible:ring-[#00ff41]/20"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-[#4a5568] uppercase tracking-wider">
                Description
              </label>
              <Input
                placeholder="Brief description of the resource"
                value={interactiveDescription}
                onChange={(e) => setInteractiveDescription(e.target.value)}
                className="font-mono bg-[#111827] border-[#1e293b] text-[#c8d6e5] placeholder:text-[#2d3748] focus-visible:border-[#00ff41] focus-visible:ring-[#00ff41]/20"
              />
            </div>

            {/* Category + Level row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-mono text-xs text-[#4a5568] uppercase tracking-wider">
                  Category
                </label>
                <Select
                  value={interactiveCategory}
                  onValueChange={setInteractiveCategory}
                >
                  <SelectTrigger className="font-mono w-full bg-[#111827] border-[#1e293b] text-[#c8d6e5] focus:ring-[#00ff41]/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="font-mono bg-[#111827] border-[#1e293b]">
                    {CATEGORIES.map((cat) => (
                      <SelectItem
                        key={cat}
                        value={cat}
                        className="font-mono text-[#c8d6e5] focus:bg-[#1e293b] focus:text-[#00ff41]"
                      >
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-xs text-[#4a5568] uppercase tracking-wider">
                  Level
                </label>
                <Select
                  value={interactiveLevel}
                  onValueChange={setInteractiveLevel}
                >
                  <SelectTrigger className="font-mono w-full bg-[#111827] border-[#1e293b] text-[#c8d6e5] focus:ring-[#00ff41]/20">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="font-mono bg-[#111827] border-[#1e293b]">
                    {LEVELS.map((lvl) => (
                      <SelectItem
                        key={lvl.value}
                        value={lvl.value}
                        className="font-mono text-[#c8d6e5] focus:bg-[#1e293b] focus:text-[#00ff41]"
                      >
                        {lvl.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-[#4a5568] uppercase tracking-wider">
                Tags <span className="text-[#2d3748]">(comma-separated)</span>
              </label>
              <Input
                placeholder="e.g. device-search, iot, scanner"
                value={interactiveTags}
                onChange={(e) => setInteractiveTags(e.target.value)}
                className="font-mono bg-[#111827] border-[#1e293b] text-[#c8d6e5] placeholder:text-[#2d3748] focus-visible:border-[#00ff41] focus-visible:ring-[#00ff41]/20"
              />
              {interactiveTags.trim() && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {interactiveTags
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="font-mono text-[10px] bg-[#00ff41]/10 text-[#00ff41] border-[#00ff41]/30"
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
              )}
            </div>

            {/* Preview */}
            {interactiveName.trim() && interactiveUrl.trim() && (
              <div className="rounded-md border border-[#1e293b] bg-[#0d1117] p-3 space-y-2">
                <p className="font-mono text-[10px] text-[#4a5568] uppercase tracking-widest">
                  Preview
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm text-[#e2e8f0] font-semibold">
                    {interactiveName}
                  </span>
                  <Badge
                    variant="outline"
                    className={`font-mono text-[10px] ${levelColor(interactiveLevel || 'L1')}`}
                  >
                    {interactiveLevel || 'L1'}
                  </Badge>
                  {interactiveCategory && (
                    <Badge
                      variant="outline"
                      className={`font-mono text-[10px] ${categoryColor(interactiveCategory)}`}
                    >
                      {interactiveCategory}
                    </Badge>
                  )}
                </div>
                <p className="font-mono text-xs text-[#4a5568] truncate">
                  {interactiveUrl}
                </p>
              </div>
            )}

            {/* Actions */}
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetInteractive}
                className="font-mono border-[#1e293b] text-[#4a5568] hover:bg-[#1e293b] hover:text-[#c8d6e5]"
              >
                Clear
              </Button>
              <Button
                type="button"
                onClick={handleInteractiveSubmit}
                disabled={!interactiveName.trim() || !interactiveUrl.trim()}
                className="font-mono bg-[#00ff41] text-[#0a0e17] hover:bg-[#00cc33] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Upload className="size-4 mr-1.5" />
                Add Link
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* ================================================================ */}
          {/* INJECT TAB                                                      */}
          {/* ================================================================ */}
          <TabsContent value="inject" className="mt-4 space-y-4">
            {/* Syntax Reference (collapsible) */}
            <Collapsible open={syntaxOpen} onOpenChange={setSyntaxOpen}>
              <div className="rounded-md border border-[#1e293b] bg-[#0d1117] overflow-hidden">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center justify-between w-full px-3 py-2.5 font-mono text-xs text-[#4a5568] hover:text-[#00ff41] transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Terminal className="size-3.5" />
                      Syntax Reference
                    </span>
                    {syntaxOpen ? (
                      <ChevronUp className="size-3.5" />
                    ) : (
                      <ChevronDown className="size-3.5" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-3 pb-3 space-y-2">
                    <pre className="font-mono text-[11px] text-[#00ff41] bg-[#0a0e17] rounded p-2.5 whitespace-pre-wrap border border-[#1e293b]">
                      {SYNTAX_TEMPLATE}
                    </pre>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCopyTemplate}
                      className="font-mono text-[10px] h-7 border-[#1e293b] text-[#4a5568] hover:bg-[#1e293b] hover:text-[#00ff41]"
                    >
                      {copied ? (
                        <>
                          <Check className="size-3 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="size-3 mr-1" />
                          Copy Template
                        </>
                      )}
                    </Button>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Inject textarea */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-[#4a5568] uppercase tracking-wider">
                Batch Inject
              </label>
              <Textarea
                placeholder={`# Paste links below (lines starting with # are comments)\nShodan | https://shodan.io | Device search engine | osint | L1 | device-search,iot\nCensys | https://censys.io | Internet-wide scanning | osint | L1 | scanner,tls`}
                value={injectText}
                onChange={(e) => {
                  setInjectText(e.target.value);
                  // Reset validation when text changes
                  if (hasValidated) {
                    setHasValidated(false);
                    setParsedResults([]);
                  }
                }}
                className="font-mono bg-[#111827] border-[#1e293b] text-[#c8d6e5] placeholder:text-[#2d3748] min-h-[180px] focus-visible:border-[#00ff41] focus-visible:ring-[#00ff41]/20 text-xs"
              />
            </div>

            {/* Validate button */}
            <Button
              type="button"
              onClick={handleValidate}
              disabled={!injectText.trim()}
              className="font-mono w-full bg-[#1e293b] text-[#00ff41] hover:bg-[#2d3b4f] border border-[#00ff41]/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Terminal className="size-4 mr-1.5" />
              Validate Input
            </Button>

            {/* Validation results */}
            {hasValidated && (
              <div className="space-y-3">
                {/* Summary badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  >
                    <CheckCircle2 className="size-3 mr-1" />
                    {validCount} valid
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] bg-red-500/10 text-red-400 border-red-500/30"
                    >
                      <AlertCircle className="size-3 mr-1" />
                      {invalidCount} invalid
                    </Badge>
                  )}
                  {validCount + invalidCount === 0 && (
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] bg-gray-500/10 text-gray-400 border-gray-500/30"
                    >
                      No parseable lines found
                    </Badge>
                  )}
                </div>

                {/* Line-by-line results */}
                {parsedResults.length > 0 && (
                  <div className="max-h-64 overflow-y-auto space-y-1.5 julius-scroll pr-1">
                    {parsedResults.map((result, idx) => (
                      <div
                        key={idx}
                        className={`rounded-md border p-2 text-[11px] font-mono ${
                          result.valid
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : 'bg-red-500/5 border-red-500/20'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {result.valid ? (
                            <CheckCircle2 className="size-3.5 mt-0.5 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertCircle className="size-3.5 mt-0.5 text-red-400 shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-[#c8d6e5] truncate">
                              <span className="text-[#4a5568]">L{result.lineIndex}:</span>{' '}
                              {result.raw}
                            </p>
                            {result.errors.length > 0 && (
                              <div className="mt-1 space-y-0.5">
                                {result.errors.map((err, eIdx) => (
                                  <p
                                    key={eIdx}
                                    className={`text-[10px] ${
                                      err.includes('defaulting')
                                        ? 'text-amber-400'
                                        : 'text-red-400'
                                    }`}
                                  >
                                    → {err}
                                  </p>
                                ))}
                              </div>
                            )}
                            {result.valid && result.link && (
                              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                <Badge
                                  variant="outline"
                                  className={`font-mono text-[9px] h-4 ${levelColor(result.link.level)}`}
                                >
                                  {result.link.level}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`font-mono text-[9px] h-4 ${categoryColor(result.link.category)}`}
                                >
                                  {result.link.category}
                                </Badge>
                                {result.link.tags.slice(0, 3).map((tag, tIdx) => (
                                  <Badge
                                    key={tIdx}
                                    variant="outline"
                                    className="font-mono text-[9px] h-4 bg-[#00ff41]/10 text-[#00ff41] border-[#00ff41]/30"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {result.link.tags.length > 3 && (
                                  <span className="text-[9px] text-[#4a5568]">
                                    +{result.link.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetInject}
                className="font-mono border-[#1e293b] text-[#4a5568] hover:bg-[#1e293b] hover:text-[#c8d6e5]"
              >
                Clear
              </Button>
              <Button
                type="button"
                onClick={handleBatchUpload}
                disabled={validCount === 0}
                className="font-mono bg-[#00ff41] text-[#0a0e17] hover:bg-[#00cc33] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Upload className="size-4 mr-1.5" />
                Inject {validCount > 0 ? `${validCount} Link${validCount !== 1 ? 's' : ''}` : 'Links'}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
