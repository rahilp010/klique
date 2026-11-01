import React, { useState } from 'react';
import {
    AlertCircle,
    CheckCircle2,
    Download,
    FileKey2,
    FileText,
    LockKeyhole,
    ShieldCheck,
    UnlockKeyhole,
    Upload,
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Navbar from '../Navbar';
import SEO from '../SEO';

const MAGIC = new TextEncoder().encode('KLQENC01');
const ITERATIONS = 310000;
const encoder = new TextEncoder();

const toBase64 = (bytes) => {
    let binary = '';
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return window.btoa(binary);
};

const fromBase64 = (value) =>
    Uint8Array.from(window.atob(value), (character) => character.charCodeAt(0));

const fromHex = (value) => {
    const hex = value.replace(/\s|:/g, '').replace(/^0x/i, '');
    if (!/^(?:[\da-f]{2})+$/i.test(hex)) {
        throw new Error('Enter the key and IV as even-length hexadecimal bytes.');
    }
    return Uint8Array.from(hex.match(/.{2}/g), (byte) => Number.parseInt(byte, 16));
};

const getCryptoParams = (algorithm, iv, counterLength = 64) =>
    algorithm === 'AES-CTR'
        ? { name: algorithm, counter: iv, length: counterLength }
        : { name: algorithm, iv };

const joinBytes = (...arrays) => {
    const result = new Uint8Array(
        arrays.reduce((total, array) => total + array.length, 0),
    );
    let offset = 0;
    arrays.forEach((array) => {
        result.set(array, offset);
        offset += array.length;
    });
    return result;
};

const deriveKeys = async (password, salt, algorithm) => {
    const material = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits'],
    );
    const bits = await window.crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt,
            iterations: ITERATIONS,
            hash: 'SHA-256',
        },
        material,
        512,
    );
    const keyBytes = new Uint8Array(bits);
    const encryptionKey = await window.crypto.subtle.importKey(
        'raw',
        keyBytes.slice(0, 32),
        algorithm,
        false,
        ['encrypt', 'decrypt'],
    );
    const authenticationKey = await window.crypto.subtle.importKey(
        'raw',
        keyBytes.slice(32),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify'],
    );
    return { encryptionKey, authenticationKey };
};

const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

const parseEncryptedFile = async (file) => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const prefixLength = MAGIC.length + 4;
    if (
        bytes.length < prefixLength ||
        !MAGIC.every((byte, index) => bytes[index] === byte)
    ) {
        throw new Error('This is not a Klique encrypted file.');
    }

    const headerLength = new DataView(
        bytes.buffer,
        bytes.byteOffset + MAGIC.length,
        4,
    ).getUint32(0, false);
    const headerStart = prefixLength;
    const contentStart = headerStart + headerLength;
    if (headerLength === 0 || headerLength > 65536 || contentStart >= bytes.length) {
        throw new Error('The encrypted file header is invalid.');
    }

    let header;
    try {
        header = JSON.parse(
            new TextDecoder().decode(bytes.subarray(headerStart, contentStart)),
        );
    } catch {
        throw new Error('The encrypted file header is invalid.');
    }

    if (
        header.version !== 1 ||
        !['AES-GCM', 'AES-CBC', 'AES-CTR'].includes(header.algorithm) ||
        header.iterations !== ITERATIONS ||
        typeof header.mac !== 'string' ||
        typeof header.name !== 'string' ||
        (header.algorithm === 'AES-CTR' &&
            (!Number.isInteger(header.counterLength) ||
                header.counterLength < 1 ||
                header.counterLength > 128))
    ) {
        throw new Error('This encrypted file uses an unsupported format.');
    }

    return {
        header,
        headerBytes: encoder.encode(
            JSON.stringify({
                version: header.version,
                algorithm: header.algorithm,
                iterations: header.iterations,
                salt: header.salt,
                iv: header.iv,
                name: header.name,
                type: header.type,
                ...(header.counterLength ? { counterLength: header.counterLength } : {}),
            }),
        ),
        ciphertext: bytes.subarray(contentStart),
    };
};

const FileEncryption = () => {
    const [mode, setMode] = useState('encrypt');
    const [algorithm, setAlgorithm] = useState('AES-GCM');
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState('');
    const [externalKey, setExternalKey] = useState('');
    const [externalIv, setExternalIv] = useState('');
    const [externalCounterLength, setExternalCounterLength] = useState('64');
    const [showPassword, setShowPassword] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [notice, setNotice] = useState(null);

    const handleFile = (event) => {
        setFile(event.target.files?.[0] || null);
        setNotice(null);
        event.target.value = '';
    };

    const handleProcess = async () => {
        if (!file || (mode === 'encrypt' && !password)) {
            setNotice({
                type: 'error',
                text: mode === 'encrypt'
                    ? 'Choose a file and enter a password.'
                    : 'Choose a file to decrypt.',
            });
            return;
        }
        if (!window.crypto?.subtle) {
            setNotice({
                type: 'error',
                text: 'Secure encryption requires HTTPS or localhost in a supported browser.',
            });
            return;
        }

        setProcessing(true);
        setNotice(null);
        try {
            if (mode === 'encrypt') {
                const salt = window.crypto.getRandomValues(new Uint8Array(16));
                const iv = window.crypto.getRandomValues(
                    new Uint8Array(algorithm === 'AES-GCM' ? 12 : 16),
                );
                const { encryptionKey, authenticationKey } = await deriveKeys(
                    password,
                    salt,
                    algorithm,
                );
                const ciphertext = new Uint8Array(
                    await window.crypto.subtle.encrypt(
                        getCryptoParams(algorithm, iv),
                        encryptionKey,
                        await file.arrayBuffer(),
                    ),
                );
                const metadata = {
                    version: 1,
                    algorithm,
                    iterations: ITERATIONS,
                    salt: toBase64(salt),
                    iv: toBase64(iv),
                    name: file.name,
                    type: file.type || 'application/octet-stream',
                    ...(algorithm === 'AES-CTR' ? { counterLength: 64 } : {}),
                };
                const metadataBytes = encoder.encode(JSON.stringify(metadata));
                const mac = await window.crypto.subtle.sign(
                    'HMAC',
                    authenticationKey,
                    joinBytes(metadataBytes, ciphertext),
                );
                const headerBytes = encoder.encode(
                    JSON.stringify({ ...metadata, mac: toBase64(new Uint8Array(mac)) }),
                );
                const length = new Uint8Array(4);
                new DataView(length.buffer).setUint32(0, headerBytes.length, false);
                const encryptedFile = joinBytes(MAGIC, length, headerBytes, ciphertext);
                downloadBlob(
                    new Blob([encryptedFile], { type: 'application/octet-stream' }),
                    `${file.name}.klqenc`,
                );
                setNotice({ type: 'success', text: `Encrypted ${file.name}.` });
            } else {
                const prefix = new Uint8Array(await file.slice(0, MAGIC.length).arrayBuffer());
                const isKliqueFile = prefix.length === MAGIC.length &&
                    MAGIC.every((byte, index) => prefix[index] === byte);

                if (isKliqueFile) {
                    if (!password) {
                        throw new Error('Enter the password used to encrypt this Klique file.');
                    }
                    const { header, headerBytes, ciphertext } = await parseEncryptedFile(file);
                    const { encryptionKey, authenticationKey } = await deriveKeys(
                        password,
                        fromBase64(header.salt),
                        header.algorithm,
                    );
                    const validMac = await window.crypto.subtle.verify(
                        'HMAC',
                        authenticationKey,
                        fromBase64(header.mac),
                        joinBytes(headerBytes, ciphertext),
                    );
                    if (!validMac) {
                        throw new Error('Wrong password or encrypted file has been changed.');
                    }
                    const plaintext = await window.crypto.subtle.decrypt(
                        getCryptoParams(header.algorithm, fromBase64(header.iv), header.counterLength),
                        encryptionKey,
                        ciphertext,
                    );
                    downloadBlob(
                        new Blob([plaintext], { type: header.type || 'application/octet-stream' }),
                        header.name || 'decrypted-file',
                    );
                    setNotice({ type: 'success', text: `Decrypted ${header.name}.` });
                } else {
                    const rawKey = fromHex(externalKey);
                    const iv = fromHex(externalIv);
                    if (![16, 24, 32].includes(rawKey.length)) {
                        throw new Error('AES keys must be 16, 24, or 32 bytes (128, 192, or 256 bits).');
                    }
                    if (algorithm !== 'AES-GCM' && iv.length !== 16) {
                        throw new Error(`${algorithm} requires a 16-byte IV or counter.`);
                    }
                    if (algorithm === 'AES-GCM' && iv.length === 0) {
                        throw new Error('AES-GCM requires a non-empty nonce.');
                    }
                    const key = await window.crypto.subtle.importKey(
                        'raw',
                        rawKey,
                        algorithm,
                        false,
                        ['decrypt'],
                    );
                    const plaintext = await window.crypto.subtle.decrypt(
                        getCryptoParams(algorithm, iv, Number(externalCounterLength)),
                        key,
                        await file.arrayBuffer(),
                    );
                    downloadBlob(
                        new Blob([plaintext], { type: 'application/octet-stream' }),
                        `decrypted-${file.name}`,
                    );
                    setNotice({ type: 'success', text: `Decrypted ${file.name}.` });
                }
            }
        } catch (error) {
            setNotice({
                type: 'error',
                text: error.message || 'Could not process this file. Check the password, key, and encryption settings.',
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="relative min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto bg-[#09090b] px-3 py-6 font-sans text-zinc-100 sm:px-6 sm:py-8 md:px-10 customScrollbar before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_45%)] after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.04),transparent_45%)]">
            <SEO
                title="File Encryption & Decryption | Klique"
                description="Encrypt files locally or decrypt AES-encrypted files using the matching key and settings. Files are processed in your browser."
                keywords="file encryption, file decryption, AES-GCM, AES-CBC, AES-CTR, encrypt files locally"
                canonicalUrl="https://klique.netlify.app/fileencryption"
                jsonLd={{
                    '@context': 'https://schema.org',
                    '@type': 'SoftwareApplication',
                    name: 'File Encryption & Decryption',
                    url: 'https://klique.netlify.app/fileencryption',
                    applicationCategory: 'SecurityApplication',
                    operatingSystem: 'Web',
                    offers: {
                        '@type': 'Offer',
                        price: '0',
                        priceCurrency: 'USD',
                    },
                    description: 'Encrypt files locally and decrypt compatible AES-encrypted files using the required key and parameters.',
                    author: {
                        '@type': 'Organization',
                        name: 'Klique',
                    },
                    featureList: [
                        'Local file encryption with AES-GCM, AES-CBC, and AES-CTR',
                        'Password-derived encryption keys for Klique encrypted files',
                        'Decryption of compatible AES files with a supplied key and parameters',
                        'Client-side file processing',
                    ],
                }}
            />

            {/* Static ambient backdrop layers */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_62%)]" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(113,113,122,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_50%)]" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]" />

            <div className="relative z-[100] w-full mb-6">
                <Navbar />
            </div>

            <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-6xl flex-col pb-28 pt-14 sm:pb-24 sm:pt-10 lg:pl-20">
                {/* Header / Title Section */}
                <div className="mb-8 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
                    <Motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center sm:text-left">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 backdrop-blur-md">
                            <FileKey2 size={14} className="text-[#daf4aa]" />
                            <span>Security Suite</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                            File Encryption
                        </h1>
                        <p className="mt-1 text-sm text-zinc-400">
                            Encrypt files locally or decrypt AES files when you have the matching key and parameters. Processing stays in this browser.
                        </p>
                    </Motion.div>

                    {/* Mode Switcher Tabs */}
                    <div className="flex items-center gap-1 rounded-full backdrop-blur-xl py-1">
                        <button
                            onClick={() => { setMode('encrypt'); setNotice(null); }}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-semibold transition-all md:px-4 ${mode === 'encrypt'
                                ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                                : 'bg-zinc-800/20 text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                                }`}>
                            <LockKeyhole size={15} />
                            <span>Encrypt</span>
                        </button>
                        <button
                            onClick={() => { setMode('decrypt'); setNotice(null); }}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-semibold transition-all md:px-4 ${mode === 'decrypt'
                                ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                                : 'bg-zinc-800/20 text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                                }`}>
                            <UnlockKeyhole size={15} />
                            <span>Decrypt</span>
                        </button>
                    </div>
                </div>

                {/* Main Application Body */}
                <section className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-2xl sm:p-8">

                    <label className="mb-2 block text-sm font-bold text-zinc-300">
                        {mode === 'encrypt' ? 'File to encrypt' : 'File to decrypt'}
                    </label>
                    <label className="mb-6 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-5 text-center transition-all hover:border-[#daf4aa]/60 hover:bg-[#daf4aa]/[0.03]">
                        <input type="file" onChange={handleFile} className="sr-only" />
                        {file ? (
                            <>
                                <FileText size={24} className="mb-2 text-[#daf4aa]" />
                                <span className="max-w-full break-all text-sm font-bold text-zinc-200">{file.name}</span>
                                <span className="mt-1 text-xs text-zinc-500 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </>
                        ) : (
                            <>
                                <Upload size={22} className="mb-2 text-zinc-400" />
                                <span className="text-sm font-semibold text-zinc-300">Choose a file</span>
                                <span className="mt-1 text-xs text-zinc-500">Any file type supported</span>
                            </>
                        )}
                    </label>

                    {mode === 'encrypt' && (
                        <div className="mb-6">
                            <label htmlFor="encryption-algorithm" className="mb-2 block text-sm font-bold text-zinc-300">
                                Encryption algorithm
                            </label>
                            <select
                                id="encryption-algorithm"
                                value={algorithm}
                                onChange={(event) => setAlgorithm(event.target.value)}
                                className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-sm text-zinc-200 outline-none focus:border-[#daf4aa]/70 transition-colors">
                                <option value="AES-GCM">AES-GCM (Recommended)</option>
                                <option value="AES-CBC">AES-CBC (Compatibility)</option>
                                <option value="AES-CTR">AES-CTR</option>
                            </select>
                        </div>
                    )}

                    {mode === 'decrypt' && (
                        <div className="mb-6 space-y-4">
                            <div>
                                <label htmlFor="decryption-algorithm" className="mb-2 block text-sm font-bold text-zinc-300">
                                    External file AES mode
                                </label>
                                <select
                                    id="decryption-algorithm"
                                    value={algorithm}
                                    onChange={(event) => setAlgorithm(event.target.value)}
                                    className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-sm text-zinc-200 outline-none focus:border-[#daf4aa]/70 transition-colors">
                                    <option value="AES-GCM">AES-GCM</option>
                                    <option value="AES-CBC">AES-CBC</option>
                                    <option value="AES-CTR">AES-CTR</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="external-aes-key" className="mb-2 block text-sm font-bold text-zinc-300">
                                    External AES key (hex)
                                </label>
                                <input
                                    id="external-aes-key"
                                    type="text"
                                    value={externalKey}
                                    onChange={(event) => setExternalKey(event.target.value)}
                                    autoCapitalize="off"
                                    autoComplete="off"
                                    spellCheck="false"
                                    placeholder="16, 24, or 32 bytes as hexadecimal"
                                    className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-[#daf4aa]/70"
                                />
                            </div>
                            <div>
                                <label htmlFor="external-aes-iv" className="mb-2 block text-sm font-bold text-zinc-300">
                                    External IV / nonce (hex)
                                </label>
                                <input
                                    id="external-aes-iv"
                                    type="text"
                                    value={externalIv}
                                    onChange={(event) => setExternalIv(event.target.value)}
                                    autoCapitalize="off"
                                    autoComplete="off"
                                    spellCheck="false"
                                    placeholder={algorithm === 'AES-GCM' ? 'Usually 12 bytes' : '16 bytes'}
                                    className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-[#daf4aa]/70"
                                />
                            </div>
                            {algorithm === 'AES-CTR' && (
                                <div>
                                    <label htmlFor="external-counter-length" className="mb-2 block text-sm font-bold text-zinc-300">
                                        AES-CTR counter length
                                    </label>
                                    <select
                                        id="external-counter-length"
                                        value={externalCounterLength}
                                        onChange={(event) => setExternalCounterLength(event.target.value)}
                                        className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-sm text-zinc-200 outline-none focus:border-[#daf4aa]/70">
                                        {[32, 64, 96, 128].map((length) => (
                                            <option key={length} value={length}>{length} bits</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    <label htmlFor="encryption-password" className="mb-2 block text-sm font-bold text-zinc-300">
                        {mode === 'encrypt' ? 'Password' : 'Klique password (for Klique files only)'}
                    </label>
                    <div className="mb-3 flex h-11 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 focus-within:border-[#daf4aa]/70 transition-colors">
                        <input
                            id="encryption-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="new-password"
                            placeholder="Use a strong, memorable password"
                            className="min-w-0 flex-1 bg-transparent px-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((visible) => !visible)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="px-4 text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors">
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <p className="mb-6 text-xs leading-relaxed text-zinc-500">
                        {mode === 'encrypt'
                            ? 'Keep this password somewhere safe. It cannot be recovered, and you will need it to decrypt the file.'
                            : 'Klique files include their settings. Other AES files use the mode, raw key, IV/nonce, and counter length above; passphrase-based formats may also require their original key-derivation settings.'}
                    </p>

                    <AnimatePresence>
                        {notice && (
                            <Motion.div
                                initial={{ opacity: 0, y: -5, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`mb-5 flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium ${notice.type === 'success'
                                    ? 'border-[#daf4aa]/20 bg-[#daf4aa]/[0.06] text-[#daf4aa]'
                                    : 'border-red-400/20 bg-red-400/[0.06] text-red-300'
                                    }`} role="status">
                                {notice.type === 'success' ? (
                                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                                ) : (
                                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                )}
                                <span className="leading-snug">{notice.text}</span>
                            </Motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="button"
                        onClick={handleProcess}
                        disabled={processing}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#daf4aa] px-4 text-sm font-bold text-zinc-950 shadow-md shadow-[#daf4aa]/10 transition hover:bg-[#c9e894] disabled:cursor-wait disabled:opacity-60">
                        {mode === 'encrypt' ? <LockKeyhole size={17} /> : <Download size={17} />}
                        {processing
                            ? 'Processing...'
                            : mode === 'encrypt'
                                ? 'Encrypt & Download'
                                : 'Decrypt & Download'}
                    </button>

                    <div className="mt-6 flex items-start gap-2.5 border-t border-zinc-800/80 pt-5 text-[11px] sm:text-xs leading-relaxed text-zinc-500">
                        <ShieldCheck size={16} className="mt-[1px] shrink-0 text-[#daf4aa]" />
                        <span>
                            Supports AES-GCM, AES-CBC, and AES-CTR. External AES files need the original raw key and IV/nonce; AES-GCM data must include its authentication tag. Other algorithms and container formats require their own compatible tools.
                        </span>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default FileEncryption;