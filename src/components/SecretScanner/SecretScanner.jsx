import React, { useState } from 'react';
import {
    AlertCircle,
    Check,
    Clipboard,
    Download,
    FileSearch,
    ShieldCheck,
    Trash2,
    Upload,
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Navbar from '../Navbar';
import SEO from '../SEO';

const SECRET_RULES = [
    {
        name: 'Private key',
        severity: 'High',
        pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
    },
    {
        name: 'GitHub token',
        severity: 'High',
        pattern: /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g,
    },
    {
        name: 'Slack token',
        severity: 'High',
        pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g,
    },
    {
        name: 'Google API key',
        severity: 'High',
        pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g,
    },
    {
        name: 'Stripe secret key',
        severity: 'High',
        pattern: /\b(?:sk|rk)_(?:live|test)_[0-9A-Za-z]{16,}\b/g,
    },
    {
        name: 'AWS access key ID',
        severity: 'High',
        pattern: /\bAKIA[0-9A-Z]{16}\b/g,
    },
    {
        name: 'Credential assignment',
        severity: 'Review',
        pattern: /(?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|secret[_-]?key|password)\s*["']?\s*[:=]\s*["']?([A-Za-z0-9_./+=-]{12,})/gi,
        captureGroup: 1,
    },
];

const PLACEHOLDER_VALUE = /^(?:your|example|sample|changeme|change_me|replace|placeholder|redacted|xxx+)[\w-]*$/i;

const getLineNumber = (lineStarts, position) => {
    let low = 0;
    let high = lineStarts.length;
    while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (lineStarts[middle] <= position) low = middle + 1;
        else high = middle;
    }
    return low;
};

const scanText = (text) => {
    const lineStarts = [0];
    for (let index = 0; index < text.length; index += 1) {
        if (text[index] === '\n') lineStarts.push(index + 1);
    }

    const findings = [];
    for (const rule of SECRET_RULES) {
        rule.pattern.lastIndex = 0;
        let match;
        while ((match = rule.pattern.exec(text)) !== null) {
            const value = rule.captureGroup ? match[rule.captureGroup] : match[0];
            if (!value || PLACEHOLDER_VALUE.test(value)) continue;

            const relativeStart = rule.captureGroup
                ? match[0].indexOf(value)
                : 0;
            const start = match.index + relativeStart;
            const end = start + value.length;
            if (findings.some((finding) => start < finding.end && end > finding.start)) {
                continue;
            }

            const lineNumber = getLineNumber(lineStarts, start);
            const lineStart = lineStarts[lineNumber - 1];
            const lineEnd = text.indexOf('\n', lineStart);
            const line = text.slice(lineStart, lineEnd === -1 ? text.length : lineEnd);
            const localStart = Math.max(start, lineStart) - lineStart;
            const localEnd = Math.min(end, lineStart + line.length) - lineStart;
            const preview = `${line.slice(0, localStart)}[REDACTED]${line.slice(localEnd)}`;

            findings.push({
                name: rule.name,
                severity: rule.severity,
                start,
                end,
                line: lineNumber,
                preview,
            });
            if (match[0].length === 0) rule.pattern.lastIndex += 1;
        }
    }

    return findings.sort((left, right) => left.start - right.start);
};

const redactText = (text, findings) => {
    let redacted = text;
    [...findings]
        .sort((left, right) => right.start - left.start)
        .forEach((finding) => {
            redacted = `${redacted.slice(0, finding.start)}[REDACTED ${finding.name}]${redacted.slice(finding.end)}`;
        });
    return redacted;
};

const SecretScanner = () => {
    const [text, setText] = useState('');
    const [filename, setFilename] = useState('');
    const [findings, setFindings] = useState([]);
    const [scanned, setScanned] = useState(false);
    const [showRedacted, setShowRedacted] = useState(false);
    const [notice, setNotice] = useState('');

    const updateText = (value) => {
        setText(value);
        setFindings([]);
        setScanned(false);
        setShowRedacted(false);
        setNotice('');
    };

    const handleFile = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        try {
            updateText(await file.text());
            setFilename(file.name);
        } catch {
            setNotice('This file could not be read as text.');
        }
    };

    const handleScan = () => {
        const results = scanText(text);
        setFindings(results);
        setScanned(true);
        setShowRedacted(false);
        setNotice(
            results.length
                ? `Found ${results.length} possible ${results.length === 1 ? 'secret' : 'secrets'}.`
                : 'No matching patterns found.',
        );
    };

    const handleCopyRedacted = async () => {
        try {
            await navigator.clipboard.writeText(redactText(text, findings));
            setNotice('Redacted text copied.');
        } catch {
            setNotice('Clipboard access is unavailable in this browser context.');
        }
    };

    const handleDownloadRedacted = () => {
        const blob = new Blob([redactText(text, findings)], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename ? `redacted-${filename}` : 'redacted-text.txt';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setNotice('Redacted file downloaded.');
    };

    const clearInput = () => {
        setText('');
        setFilename('');
        setFindings([]);
        setScanned(false);
        setShowRedacted(false);
        setNotice('');
    };

    const redactedText = redactText(text, findings);

    return (
        <div className="relative min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto bg-[#09090b] px-3 py-6 font-sans text-zinc-100 customScrollbar sm:px-6 sm:py-8 md:px-10 before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_45%)] after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.04),transparent_45%)]">
            <SEO
                title="Text Secret Scanner | Klique"
                description="Scan pasted text and code locally for common API keys, access tokens, passwords, and private keys. Review and export redacted text."
                keywords="secret scanner, API key scanner, token scanner, redact secrets, local secret detection"
                canonicalUrl="https://klique.netlify.app/secretscanner"
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@type': 'SoftwareApplication',
                    name: 'Text Secret Scanner',
                    url: 'https://klique.netlify.app/secretscanner',
                    applicationCategory: 'SecurityApplication',
                    operatingSystem: 'Web',
                    offers: {
                        '@type': 'Offer',
                        price: '0',
                        priceCurrency: 'USD',
                    },
                    description: 'Scan text and source code locally for common credentials and export redacted content.',
                    author: {
                        '@type': 'Organization',
                        name: 'Klique',
                    },
                    featureList: [
                        'Detect common API keys and provider tokens',
                        'Identify private key blocks and likely credential assignments',
                        'Show finding type, severity, and line number',
                        'Preview, copy, and download redacted text',
                        'Client-side scanning without uploading input text',
                    ],
                }}
            />

            {/* Static ambient backdrop layers */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_62%)]" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(113,113,122,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_50%)]" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]" />

            <div className="relative z-[100] mb-6 w-full">
                <Navbar />
            </div>

            <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-6xl flex-col pb-28 pt-14 sm:pb-24 sm:pt-10 lg:pl-20">
                <Motion.header
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 backdrop-blur-md">
                            <ShieldCheck size={14} className="text-[#daf4aa]" /> Local Security Tool
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">Text Secret Scanner</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                            Find common credentials in text or code, then review a redacted copy before sharing.
                        </p>
                    </div>
                </Motion.header>

                <div className="grid w-full min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">

                    {/* Left Section: Input */}
                    <Motion.section
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="min-w-0 rounded-2xl border border-zinc-800 bg-[#121215] p-4 shadow-2xl sm:p-6">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-200">
                                <FileSearch size={16} className="text-[#daf4aa]" />
                                {filename || 'Text or source code'}
                            </h2>
                            <div className="flex items-center gap-2">
                                <label className="flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs font-semibold text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white">
                                    <Upload size={14} /> Upload
                                    <input
                                        type="file"
                                        accept="text/*,.env,.json,.js,.jsx,.ts,.tsx,.py,.yml,.yaml,.toml,.sh,.properties,.xml,.md"
                                        onChange={handleFile}
                                        className="sr-only"
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={clearInput}
                                    disabled={!text}
                                    title="Clear text"
                                    aria-label="Clear text"
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <textarea
                            value={text}
                            onChange={(event) => {
                                updateText(event.target.value);
                                setFilename('');
                            }}
                            placeholder={'Paste code or text here...\n\nExample: API_KEY = "replace-this-with-a-real-key"'}
                            spellCheck="false"
                            className="min-h-[320px] w-full resize-y rounded-xl border border-zinc-800 bg-zinc-900 p-4 font-mono text-sm leading-relaxed text-zinc-200 outline-none placeholder:text-zinc-600 transition-colors focus:border-[#daf4aa]/60 customScrollbar"
                            aria-label="Text to scan"
                        />

                        <div className="mt-4 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <span className="text-xs text-zinc-500 font-mono">
                                {text.length.toLocaleString()} characters · {text ? text.split('\n').length : 0} lines
                            </span>
                            <button
                                type="button"
                                onClick={handleScan}
                                disabled={!text.trim()}
                                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#daf4aa] px-5 text-sm font-bold text-zinc-950 shadow-md shadow-[#daf4aa]/10 transition-colors hover:bg-[#c9e894] disabled:cursor-not-allowed disabled:opacity-40">
                                <FileSearch size={16} /> Scan text
                            </button>
                        </div>
                    </Motion.section>

                    {/* Right Section: Output */}
                    <Motion.section
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="min-w-0 rounded-2xl border border-zinc-800 bg-[#121215] p-4 shadow-2xl sm:p-6">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="text-sm font-bold text-zinc-200">Scan results</h2>
                            {scanned && (
                                <span className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold ${findings.length ? 'border-amber-400/20 bg-amber-400/10 text-amber-300' : 'border-[#daf4aa]/20 bg-[#daf4aa]/10 text-[#daf4aa]'}`}>
                                    {findings.length} found
                                </span>
                            )}
                        </div>

                        {!scanned ? (
                            <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 px-5 text-center">
                                <ShieldCheck size={24} className="mb-3 text-zinc-600" />
                                <p className="text-sm font-semibold text-zinc-300">No scan run yet</p>
                                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                                    Findings will show the type and line number. Secret values are redacted in the report.
                                </p>
                            </div>
                        ) : findings.length === 0 ? (
                            <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-[#daf4aa]/20 bg-[#daf4aa]/[0.03] px-5 text-center">
                                <Check size={22} className="mb-3 text-[#daf4aa]" />
                                <p className="text-sm font-bold text-[#daf4aa]">No matching patterns found</p>
                                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                                    This is not a guarantee that the text contains no secrets.
                                </p>
                            </div>
                        ) : (
                            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2 customScrollbar">
                                {findings.map((finding, index) => (
                                    <article key={`${finding.start}-${index}`} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5">
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <span className="truncate text-xs font-bold text-zinc-200">{finding.name}</span>
                                            <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase ${finding.severity === 'High' ? 'border-red-500/20 bg-red-500/10 text-red-400' : 'border-amber-500/20 bg-amber-500/10 text-amber-400'}`}>
                                                {finding.severity}
                                            </span>
                                        </div>
                                        <p className="mb-1.5 text-[11px] font-mono text-zinc-500">Line {finding.line}</p>
                                        <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-zinc-400">{finding.preview}</pre>
                                    </article>
                                ))}
                            </div>
                        )}

                        {scanned && text && (
                            <div className="mt-5 border-t border-zinc-800/80 pt-5">
                                <div className="mb-4 flex flex-wrap gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setShowRedacted((shown) => !shown)}
                                        className="flex h-9 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-white">
                                        <FileSearch size={14} /> {showRedacted ? 'Hide redacted' : 'Preview redacted'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCopyRedacted}
                                        disabled={!findings.length}
                                        className="flex h-9 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
                                        <Clipboard size={14} /> Copy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDownloadRedacted}
                                        disabled={!findings.length}
                                        className="flex h-9 items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
                                        <Download size={14} /> Download
                                    </button>
                                </div>
                                <AnimatePresence>
                                    {showRedacted && (
                                        <Motion.textarea
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            readOnly
                                            value={redactedText}
                                            aria-label="Redacted text preview"
                                            className="min-h-36 w-full resize-y rounded-xl border border-zinc-800 bg-zinc-900 p-3.5 font-mono text-xs leading-relaxed text-zinc-300 outline-none customScrollbar"
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {notice && (
                            <p role="status" className="mt-3 text-[11px] text-zinc-400">{notice}</p>
                        )}
                    </Motion.section>
                </div>

                <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 text-xs leading-relaxed text-zinc-400">
                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-200" />
                    <p>
                        Scanning happens locally in this browser. Detection uses common patterns and can produce false positives or miss secrets; review the full text before sharing. Upload only text files you trust.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default SecretScanner;