import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../utils/api';
import { ChatMessage } from '../types';

const SAMPLE_QUERIES = [
  "Find solar panels within 200m of Mula river",
  "Locate tin-roof buildings near Kothrud",
  "Show unpaved roads in Baner",
  "Find construction sites built after 2023",
  "What flood risk if Mula river rises 3m?",
];

export function SearchBar() {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastQueryId, setLastQueryId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    messages,
    addMessage,
    setCurrentQuery,
    isLoading,
    setIsLoading,
    isListening,
    setIsListening,
    setSimulation,
  } = useAppStore();

  const handleSubmit = async (queryText?: string) => {
    const text = queryText || input.trim();
    if (!text || isLoading) return;

    setInput('');
    setIsExpanded(false);

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    };
    addMessage(userMsg);
    setIsLoading(true);

    try {
      // Check if it's a simulation query
      if (text.toLowerCase().includes('flood') || text.toLowerCase().includes('simulate')) {
        const levelMatch = text.match(/(\d+)\s*(?:meter|m|ft)/i);
        const level = levelMatch ? parseFloat(levelMatch[1]) : 3.0;
        const simResult = await api.simulateFlood('mula_river', level);
        setSimulation(simResult);

        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `Flood simulation complete: ${simResult.summary.total_affected} buildings affected (${simResult.summary.high_risk} high risk)`,
          timestamp: new Date(),
        };
        addMessage(assistantMsg);
        setIsLoading(false);
        return;
      }

      // Check if it's a refinement
      let result;
      if (lastQueryId && (text.toLowerCase().startsWith('now ') || text.toLowerCase().startsWith('filter') || text.toLowerCase().startsWith('narrow'))) {
        result = await api.refineQuery(lastQueryId, text);
      } else {
        result = await api.submitQuery(text);
      }

      setCurrentQuery(result);
      setLastQueryId(result.query_id);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Found ${result.results.total_found} features in ${(result.processing_time_ms / 1000).toFixed(1)}s`,
        query_id: result.query_id,
        result,
        timestamp: new Date(),
      };
      addMessage(assistantMsg);
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Error: ${error.message || 'Failed to process query'}`,
        timestamp: new Date(),
      };
      addMessage(errorMsg);
    }

    setIsLoading(false);
  };

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSubmit(transcript);
    };

    recognition.start();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setIsExpanded(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      {/* Main Search Bar */}
      <div className={`glass-panel rounded-xl transition-all duration-300 ${isExpanded ? 'shadow-xl' : 'shadow-md'}`}>
        <div className="flex items-center gap-3 px-5 py-4">
          {/* Search Icon */}
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => !input && setIsExpanded(false)}
            onKeyDown={handleKeyDown}
            placeholder="Search infrastructure in natural language..."
            className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder-text-tertiary text-[15px] font-normal"
            disabled={isLoading}
          />

          {/* Voice Button */}
          <button
            onClick={handleVoice}
            className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-smooth ${
              isListening
                ? 'bg-status-error text-white animate-pulse'
                : 'bg-surface-primary hover:bg-border-subtle text-text-secondary'
            }`}
            title="Voice input"
          >
            {isListening ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 10-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {/* Send Button */}
          <button
            onClick={() => handleSubmit()}
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 w-9 h-9 rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-smooth"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </div>

        {/* Expanded Suggestions */}
        {isExpanded && !input && (
          <div className="px-5 pb-4 border-t border-border-subtle animate-fade-in">
            <p className="text-xs text-text-tertiary font-medium uppercase tracking-wide mt-3 mb-2">
              Try these queries
            </p>
            <div className="space-y-1">
              {SAMPLE_QUERIES.slice(0, 4).map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(q)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-primary hover:text-text-primary transition-smooth"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
