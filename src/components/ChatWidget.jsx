import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Minimize2, 
  Maximize2, 
  Trash2, 
  Key, 
  Check, 
  ShoppingCart, 
  ExternalLink, 
  ArrowRight,
  ShieldCheck,
  Bot,
  User,
  ShoppingBag,
  Info
} from 'lucide-react';
import { streamAdvisorResponse } from '../services/aiAdvisorService';
import { getUserMemory, clearUserMemory } from '../services/userMemoryService';
import SafeImage from './SafeImage';

// Lightweight Markdown Formatter
function formatInline(text) {
  if (!text) return '';
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const tokens = text.split(regex);
  return tokens.map((token, i) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={i} className="font-bold text-slate-900">{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return <em key={i} className="italic text-slate-700">{token.slice(1, -1)}</em>;
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={i} className="px-1 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-brand-600">{token.slice(1, -1)}</code>;
    }
    return token;
  });
}

function FormattedMarkdown({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let tableRows = [];
  let listItems = [];
  let isOrderedList = false;

  const flushList = (key) => {
    if (listItems.length > 0) {
      if (isOrderedList) {
        elements.push(
          <ol key={`ol-${key}`} className="list-decimal pl-5 space-y-1 my-1.5 text-slate-700">
            {listItems.map((item, idx) => (
              <li key={idx}>{formatInline(item)}</li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${key}`} className="list-disc pl-5 space-y-1 my-1.5 text-slate-700">
            {listItems.map((item, idx) => (
              <li key={idx}>{formatInline(item)}</li>
            ))}
          </ul>
        );
      }
      listItems = [];
      isOrderedList = false;
    }
  };

  const flushTable = (key) => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1);
      const headers = headerRow.split('|').map(c => c.trim()).filter(Boolean);
      elements.push(
        <div key={`tbl-${key}`} className="my-2 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-[11px] text-left divide-y divide-slate-200">
            <thead className="bg-slate-100 font-bold text-slate-800">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-2.5 py-1.5">{formatInline(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {bodyRows.map((row, rIdx) => {
                const cells = row.split('|').map(c => c.trim()).filter(Boolean);
                return (
                  <tr key={rIdx} className="hover:bg-slate-50">
                    {cells.map((cell, cIdx) => (
                      <td key={cIdx} className="px-2.5 py-1 text-slate-600">{formatInline(cell)}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Image detection (e.g. ![Alt](url))
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      flushList(index);
      flushTable(index);
      elements.push(
        <div key={`img-${index}`} className="my-2.5 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
          <img 
            src={imgMatch[2]} 
            alt={imgMatch[1]} 
            className="w-full h-auto max-h-60 object-cover" 
            loading="lazy" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80';
            }}
          />
          {imgMatch[1] && (
            <p className="text-[10px] text-slate-500 font-semibold px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1">
              <span>📷</span>
              <span>{imgMatch[1]}</span>
            </p>
          )}
        </div>
      );
      return;
    }

    // Table detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList(index);
      if (!trimmed.includes('---')) {
        tableRows.push(trimmed);
      }
      return;
    } else {
      flushTable(index);
    }

    // Numbered list detection (e.g. "1. ", "2. ")
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      if (!isOrderedList) flushList(index);
      isOrderedList = true;
      listItems.push(numMatch[2]);
      return;
    }

    // Bullet list detection
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (isOrderedList) flushList(index);
      isOrderedList = false;
      listItems.push(trimmed.slice(2));
      return;
    } else {
      flushList(index);
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(<h4 key={`h3-${index}`} className="font-bold text-slate-900 mt-2 mb-1 text-[12px]">{formatInline(trimmed.slice(4))}</h4>);
      return;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(<h3 key={`h2-${index}`} className="font-bold text-slate-900 mt-2.5 mb-1 text-xs">{formatInline(trimmed.slice(3))}</h3>);
      return;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(<h2 key={`h1-${index}`} className="font-extrabold text-slate-900 mt-3 mb-1 text-sm">{formatInline(trimmed.slice(2))}</h2>);
      return;
    }

    // Horizontal Divider
    if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={`hr-${index}`} className="my-2 border-slate-200" />);
      return;
    }

    // Empty paragraph
    if (!trimmed) {
      elements.push(<div key={`empty-${index}`} className="h-1.5" />);
      return;
    }

    // Regular line
    elements.push(
      <p key={`p-${index}`} className="leading-relaxed">
        {formatInline(line)}
      </p>
    );
  });

  flushList('end');
  flushTable('end');

  return <div className="space-y-1">{elements}</div>;
}

export default function ChatWidget({
  isOpen,
  onToggle,
  cartItems,
  onAddToCart,
  onSelectProduct,
  pendingPrompt,
  onClearPendingPrompt
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 **Hi there! I'm your ApexGear AI Personal Shopper.**\n\nTell me what you're looking for, your budget, or your work setup, and I'll find the perfect gear from our catalog!`,
      products: [],
      suggestedChips: [
        "Wireless mechanical keyboard under $100",
        "Best headphones for long flights",
        "Ergonomic desk accessories",
        "What's your return policy?"
      ]
    }
  ]);

  const DEFAULT_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    const saved = localStorage.getItem('apex_gemini_key');
    if (saved && saved.length > 15) return saved;
    return DEFAULT_KEY;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [isMinimized, setIsMinimized] = useState(false);
  const [userMemory, setUserMemory] = useState(getUserMemory);
  const [showMemoryDrawer, setShowMemoryDrawer] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  // Handle prompts triggered externally
  useEffect(() => {
    if (pendingPrompt) {
      setIsMinimized(false);
      handleSendMessage(pendingPrompt);
      onClearPendingPrompt?.();
    }
  }, [pendingPrompt]);

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    const cleanKey = tempApiKey.replace(/['"\s]/g, '').trim();
    setApiKey(cleanKey);
    setTempApiKey(cleanKey);
    if (cleanKey) {
      localStorage.setItem('apex_gemini_key', cleanKey);
    } else {
      localStorage.removeItem('apex_gemini_key');
    }
    setShowSettings(false);
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsgId = 'msg-' + Date.now();
    const botMsgId = 'bot-' + Date.now();
    const newMessages = [
      ...messages,
      { id: userMsgId, role: 'user', content: text }
    ];

    setInputValue('');
    setIsLoading(true);

    // Append user message AND an active streaming bot message placeholder
    setMessages([
      ...newMessages,
      {
        id: botMsgId,
        role: 'assistant',
        content: '',
        products: [],
        suggestedChips: [],
        isStreaming: true
      }
    ]);

    try {
      const response = await streamAdvisorResponse({
        apiKey,
        messages: newMessages,
        cartItems,
        onChunk: (chunkText) => {
          setMessages(prev => prev.map(m => 
            m.id === botMsgId ? { ...m, content: chunkText } : m
          ));
        }
      });

      const dynamicChips = response.suggestedChips && response.suggestedChips.length > 0
        ? response.suggestedChips
        : [
            "How do I apply code STUDENT15?",
            "Show tech gear under $100",
            "What is your return policy?"
          ];

      setMessages(prev => prev.map(m => 
        m.id === botMsgId ? {
          ...m,
          content: response.reply,
          products: response.recommendedProducts || [],
          suggestedChips: dynamicChips.slice(0, 3),
          isStreaming: false
        } : m
      ));
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.map(m => 
        m.id === botMsgId ? {
          ...m,
          content: "Sorry, I had trouble reaching the AI service. Please check your connection or try again!",
          products: [],
          suggestedChips: ["Show best sellers", "Keyboard for Mac"],
          isStreaming: false
        } : m
      ));
    } finally {
      setIsLoading(false);
      setUserMemory(getUserMemory());
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: `Chat history cleared. What kind of gear or setup can I help you find today?`,
        products: [],
        suggestedChips: [
          "Wireless mechanical keyboard under $100",
          "Best headphones for long flights",
          "Active discount codes"
        ]
      }
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {!isOpen && (
          <div 
            onClick={onToggle}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white shadow-xl border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer hover:border-brand-300 hover:text-brand-600 transition animate-in fade-in slide-in-from-right-4"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Need advice? Ask AI Shopper</span>
          </div>
        )}

        <button
          onClick={onToggle}
          className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
          aria-label="Toggle AI Shopping Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Sparkles className="w-6 h-6 animate-pulse-slow" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
            </>
          )}
        </button>
      </div>

      {/* Slide-up Chat Window */}
      {isOpen && (
        <div 
          className={`fixed bottom-24 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[440px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col transition-all duration-300 ${
            isMinimized ? 'h-16' : 'h-[620px] max-h-[82vh]'
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center shadow-md shadow-brand-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight">ApexAI Shopper</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-300">
                  {apiKey ? 'Powered by Gemini AI (Live Reasoning)' : 'Smart Catalog Grounded Mode'}
                </p>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={() => {
                  setShowMemoryDrawer(!showMemoryDrawer);
                  setShowSettings(false);
                }}
                className={`p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition flex items-center gap-1 ${
                  showMemoryDrawer ? 'text-purple-300 bg-white/20' : ''
                }`}
                title="AI Personalized Memory Profile"
              >
                <span className="text-xs">🧠</span>
                {userMemory.isStudent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  setShowMemoryDrawer(false);
                }}
                className={`p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition ${showSettings ? 'text-brand-300 bg-white/15' : ''}`}
                title="AI Settings & API Key"
              >
                <Key className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition"
                title="Clear Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Memory Drawer (Interactive User Profile & Learned Facts) */}
          {showMemoryDrawer && !isMinimized && (
            <div className="p-4 bg-purple-50/95 border-b border-purple-200 text-xs animate-in slide-in-from-top-2 duration-200 text-purple-950">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold flex items-center gap-1.5 text-purple-900">
                  <span>🧠</span>
                  <span>Personalized AI Memory</span>
                </h4>
                <button 
                  onClick={() => setShowMemoryDrawer(false)}
                  className="text-purple-400 hover:text-purple-700 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-purple-800 text-[11px] mb-2.5 leading-relaxed">
                ApexAI continuously personalizes every recommendation by remembering your profile, devices, and preferences:
              </p>

              <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-purple-200/80 text-[11px] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Student Status:</span>
                  <span className="font-bold text-emerald-700">
                    {userMemory.isStudent ? '🎓 Verified Student (15% Off)' : 'Regular Shopper (10% Off)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Active Promo:</span>
                  <span className="font-mono font-bold text-brand-600">
                    {userMemory.isStudent ? 'STUDENT15 (15%)' : 'APEX10 (10%)'}
                  </span>
                </div>
                {userMemory.devices && userMemory.devices.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Known Devices:</span>
                    <span className="font-semibold text-slate-800">{userMemory.devices.join(', ')}</span>
                  </div>
                )}
                {userMemory.learnedFacts && userMemory.learnedFacts.length > 0 && (
                  <div className="pt-1.5 border-t border-slate-100">
                    <span className="text-slate-400 text-[10px] block mb-1 font-semibold uppercase tracking-wider">Learned Preferences:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-700 text-[10px]">
                      {userMemory.learnedFacts.map((fact, idx) => (
                        <li key={idx}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-purple-600">Live multi-turn memory</span>
                <button
                  type="button"
                  onClick={() => {
                    clearUserMemory();
                    setUserMemory(getUserMemory());
                    setShowMemoryDrawer(false);
                  }}
                  className="text-[10px] text-red-500 hover:text-red-700 underline font-semibold"
                >
                  Reset Memory
                </button>
              </div>
            </div>
          )}

          {/* Settings Drawer (Compact & Dismissible) */}
          {showSettings && !isMinimized && (
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-brand-600" />
                  <span>AI Engine Settings</span>
                </h4>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-slate-500 mb-2.5 text-[11px] leading-relaxed">
                Currently connected to <strong>Gemini AI (Live Reasoning Engine)</strong>. You can change your Google AI Studio API key at any time:
              </p>

              <form onSubmit={handleSaveApiKey} className="space-y-2">
                <input
                  type="password"
                  placeholder="Enter Gemini API Key (AIzaSy...)"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-brand-500 font-mono"
                />
                <div className="flex justify-between items-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTempApiKey('');
                      setApiKey('');
                      localStorage.removeItem('apex_gemini_key');
                      setShowSettings(false);
                    }}
                    className="text-[10px] text-slate-400 hover:text-red-500 underline"
                  >
                    Reset to Local Mode
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition"
                  >
                    Save & Close
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Chat Messages Body */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50">
                
                {messages.map((msg) => (
                  <div key={msg.id} className="space-y-2.5">
                    {/* Message Bubble */}
                    <div className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-slate-900 text-white rounded-br-none'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                        }`}
                      >
                        {/* Rich Markdown Formatter */}
                        {msg.content ? (
                          <div className="relative">
                            <FormattedMarkdown text={msg.content} />
                            {msg.isStreaming && (
                              <span className="inline-block w-1.5 h-3 ml-1 bg-brand-600 animate-pulse align-middle" />
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 py-1 text-slate-500">
                            <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-spin" />
                            <span className="text-[11px] font-semibold text-brand-700">ApexAI is analyzing specs...</span>
                          </div>
                        )}
                      </div>

                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Interactive Embedded Product Cards */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="pl-9 space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Recommended Gear
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.products.map((prod) => {
                            const inCart = cartItems.some(c => c.id === prod.id);
                            return (
                              <div
                                key={prod.id}
                                className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-brand-200 transition-all flex items-center gap-3"
                              >
                                <SafeImage
                                  src={prod.image}
                                  alt={prod.title}
                                  category={prod.category}
                                  className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                                />

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-brand-600">
                                      {prod.brand || 'ApexGear'}
                                    </span>
                                    {prod.badge && (
                                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                        {prod.badge}
                                      </span>
                                    )}
                                  </div>

                                  <h4 
                                    onClick={() => onSelectProduct(prod)}
                                    className="text-xs font-bold text-slate-900 truncate hover:text-brand-600 cursor-pointer"
                                  >
                                    {prod.title}
                                  </h4>

                                  <div className="flex items-baseline gap-2 mt-0.5">
                                    <span className="text-xs font-extrabold text-slate-900">
                                      ${prod.price.toFixed(2)}
                                    </span>
                                    {prod.rating && (
                                      <span className="text-[10px] text-amber-500 font-semibold">
                                        ★ {prod.rating}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Direct Action */}
                                <div className="flex flex-col gap-1 shrink-0">
                                  <button
                                    onClick={() => onAddToCart(prod)}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition ${
                                      inCart
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                        : 'bg-slate-900 hover:bg-brand-600 text-white shadow-sm'
                                    }`}
                                  >
                                    {inCart ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>In Cart</span>
                                      </>
                                    ) : (
                                      <>
                                        <ShoppingCart className="w-3 h-3" />
                                        <span>Add</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => onSelectProduct(prod)}
                                    className="text-[10px] text-slate-400 hover:text-brand-600 font-medium text-center"
                                  >
                                    Specs
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Suggested Prompt Chips */}
                    {msg.suggestedChips && msg.suggestedChips.length > 0 && (
                      <div className="pl-9 flex flex-wrap gap-1.5 pt-0.5">
                        {msg.suggestedChips.map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(chip)}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-slate-600 hover:text-brand-700 transition shadow-2xs"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading state indicator */}
                {isLoading && !messages.some(m => m.isStreaming) && (
                  <div className="flex gap-2.5 items-center pl-1">
                    <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Sparkles className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl rounded-bl-none text-xs text-slate-500 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-ping" />
                      <span>Consulting catalog & stock levels...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-200">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ask about budget, specs, ergonomics, or gifts..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 text-xs bg-slate-100 focus:bg-white border border-transparent focus:border-brand-500 rounded-2xl transition focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-105 active:scale-95 transition disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
                  <span>Grounded in active stock & prices</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    Verified Store Advisor
                  </span>
                </div>
              </div>
            </>
          )}

        </div>
      )}
    </>
  );
}
