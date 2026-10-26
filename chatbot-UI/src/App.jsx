import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isStreaming]);

  // Extract citation badges (PDF/Doc name and Page)
  const extractCitations = (text) => {
    if (!text) return [];
    const regex = /(?:Source:\s*)?\*?([a-zA-Z0-9_\-.]+\.(?:pdf|txt|docx))\*?,?\s*(?:Page|page|p\.)\s*(\d+)/gi;
    const citations = [];
    const seen = new Set();
    let match;

    while ((match = regex.exec(text)) !== null) {
      const rawFile = match[1];
      const page = match[2];
      const key = `${rawFile}-${page}`;
      if (!seen.has(key)) {
        seen.add(key);
        // Format readable label
        let label = rawFile
          .replace(/-joseph-conrad\.pdf$/i, '')
          .replace(/-william-shakespeare\.pdf$/i, '')
          .replace(/-theron-q-dumont\.pdf$/i, '')
          .replace(/\.pdf$/i, '')
          .replace(/-/g, ' ');
        label = label.charAt(0).toUpperCase() + label.slice(1);
        citations.push({ label, rawFile, page });
      }
    }
    return citations;
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear this conversation?")) {
      setMessages([]);
    }
  };

  const handleSend = async (customQuery = null) => {
    const queryToSend = customQuery || input;
    if (!queryToSend.trim() || isLoading || isStreaming) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', text: queryToSend, time: userTime };

    setMessages(prev => [...prev, userMsg]);
    if (!customQuery) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryToSend,
          device_id: "user_123"
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let accumulatedText = "";
      let hasStartedStreaming = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        if (!hasStartedStreaming) {
          hasStartedStreaming = true;
          setIsLoading(false);
          setIsStreaming(true);
          setMessages(prev => [...prev, { role: 'bot', text: accumulatedText, time: botTime }]);
        } else {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              text: accumulatedText
            };
            return updated;
          });
        }
      }

      if (!hasStartedStreaming) {
        setIsLoading(false);
        setMessages(prev => [...prev, { role: 'bot', text: accumulatedText || "No response from server", time: botTime }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setIsLoading(false);
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "Error connecting to server. Please ensure the backend is running.",
        time: "Error"
      }]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const suggestedQuestions = [
    "What books and topics are available in your knowledge base?",
    "Can you summarize the main themes of the loaded documents?",
    "What are the key concepts explained in the machine learning file?"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-gray-100 to-slate-300 flex items-center justify-center p-0 md:p-4 font-sans">
      <div className="w-full h-screen md:w-[440px] md:h-[780px] bg-white md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border-[6px] border-[#19295d] relative">

        {/* Header */}
        <div className="bg-[#19295d] p-5 pt-8 text-white shadow-md z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm">
              <span className="text-[#19295d] font-black text-lg tracking-wider">GF</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight flex items-center gap-2">
                Hello, Fareed!
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </h1>
              <p className="text-[11px] text-blue-200">RAG AI Assistant &amp; Knowledge Base</p>
            </div>
          </div>

          {/* Clear Chat Button */}
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              title="Clear chat"
              className="p-2 rounded-full hover:bg-white/10 text-blue-200 hover:text-white transition-all cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 relative">

          {/* Welcome Screen */}
          {messages.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-white border border-[#19295d]/20 rounded-3xl p-6 shadow-lg max-w-xs w-full">
                <div className="w-14 h-14 mx-auto mb-3 bg-[#19295d]/10 text-[#19295d] rounded-2xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h2 className="text-[#19295d] text-xl font-bold mb-1">Book Explorer AI</h2>
                <p className="text-gray-500 text-xs mb-4">Ask any question grounded strictly in your loaded documents.</p>

                {/* Suggested Questions */}
                <div className="space-y-2 text-left">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Suggested Questions</p>
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="w-full text-left text-xs p-2.5 rounded-xl border border-gray-200 hover:border-[#19295d] bg-gray-50 hover:bg-blue-50/50 text-gray-700 hover:text-[#19295d] transition-all cursor-pointer font-medium flex items-center justify-between group"
                    >
                      <span className="line-clamp-1">{q}</span>
                      <span className="text-gray-400 group-hover:text-[#19295d] transition-colors ml-1">→</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            const citations = !isUser ? extractCitations(msg.text) : [];

            return (
              <div key={i} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[90%] p-4 rounded-2xl text-xs md:text-sm shadow-sm relative group ${isUser
                      ? 'bg-[#19295d] text-white rounded-br-xs'
                      : 'bg-white text-gray-800 border border-gray-200/80 rounded-bl-xs'
                    }`}
                >
                  {/* Message Content */}
                  {isUser ? (
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                  ) : (
                    <div className="markdown-content">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ ...props }) => (
                            <div className="my-3 overflow-x-auto rounded-lg border border-gray-200 shadow-xs">
                              <table className="w-full text-left border-collapse text-xs" {...props} />
                            </div>
                          ),
                          thead: ({ ...props }) => <thead className="bg-[#19295d] text-white" {...props} />,
                          th: ({ ...props }) => <th className="p-2 font-semibold border-b border-gray-300" {...props} />,
                          td: ({ ...props }) => <td className="p-2 border-b border-gray-100 bg-white" {...props} />,
                          p: ({ ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                          ul: ({ ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                          ol: ({ ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                          strong: ({ ...props }) => <strong className="font-semibold text-gray-950" {...props} />,
                          blockquote: ({ ...props }) => (
                            <blockquote className="border-l-3 border-[#19295d] pl-3 italic my-2 text-gray-700 bg-slate-50 py-1 rounded-r text-xs" {...props} />
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>

                      {/* Interactive Source Badges */}
                      {citations.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            📚 Sources:
                          </span>
                          {citations.map((cite, cIdx) => (
                            <span
                              key={cIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-[#19295d] border border-blue-200/60 shadow-2xs"
                            >
                              <span>📄</span>
                              <span>{cite.label}</span>
                              <span className="text-[#19295d]/60 font-semibold">• p. {cite.page}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Copy Button for Bot Messages */}
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.text, i)}
                      title="Copy response"
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
                    >
                      {copiedIdx === i ? (
                        <span className="text-emerald-600 font-semibold text-[10px] flex items-center gap-0.5">
                          ✓ Copied
                        </span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>

                <span className="text-[10px] text-gray-400 mt-1 px-2">{msg.time}</span>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex flex-col items-start">
              <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-2 text-xs text-[#19295d]">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#19295d] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#19295d] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#19295d] rounded-full animate-bounce"></span>
                </div>
                <span></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Field */}
        <div className="p-3 bg-white border-t border-gray-100">
          <div className="flex items-center bg-gray-50 rounded-2xl px-4 py-2.5 border border-gray-200 focus-within:border-[#19295d] focus-within:ring-1 focus-within:ring-[#19295d] transition-all shadow-inner">
            <input
              type="text"
              placeholder={isLoading || isStreaming ? "Jarvis is replying..." : "Ask anything about the books..."}
              disabled={isLoading || isStreaming}
              className="flex-1 bg-transparent outline-none text-xs md:text-sm text-gray-700 disabled:opacity-50"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading || isStreaming}
              className={`ml-2 p-1.5 rounded-xl transition-all cursor-pointer ${(!input.trim() || isLoading || isStreaming)
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-white bg-[#19295d] hover:bg-[#19295d]/90 shadow-sm'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0.926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405z" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;