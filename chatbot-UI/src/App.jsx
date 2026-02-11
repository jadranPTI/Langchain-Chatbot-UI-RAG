import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  // Shuru mein messages empty rakhein taake welcome screen dikhe
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', text: input, time: userTime };
    
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:8000/chat', {
        query: currentInput,
        device_id: "user_123" 
      });

      const botMsg = { 
        role: 'bot', 
        text: res.data.response || "No response from server", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: "Error connecting to server.", 
        time: "Error" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-0 md:p-4 font-sans">
      <div className="w-full h-screen md:w-[400px] md:h-[750px] bg-white md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border-[6px] border-[#19295d] relative">
        
        {/* Header */}
        <div className="bg-[#19295d] p-6 pt-10 text-white shadow-lg z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="text-[#19295d] font-bold text-xl uppercase">GF</span>
            </div>
            <div>
              <h1 className="font-bold text-xl leading-tight">Hello, Fareed!</h1>
              <p className="text-xs opacity-90">We are here to help you.</p>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 relative">
          
          {/* Welcome Screen (Only shows if no messages) */}
          {messages.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
               <div className="bg-white border-2 border-[#19295d] rounded-[2rem] p-8 shadow-xl">
                  <h2 className="text-[#9CCC65] text-4xl font-bold mb-4">Hello, Fareed!</h2>
                  <div className="border border-[#19295d] rounded-full py-2 px-6 inline-block text-gray-700 font-medium">
                    JARVIS is here to help you!
                  </div>
               </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div 
                style={{ backgroundColor: msg.role === 'user' ? '#19295d' : '#dddddd' }}
                className={`max-w-[85%] p-4 rounded-[1.5rem] text-sm md:text-base shadow-sm ${
                  msg.role === 'user' ? 'text-white rounded-br-none' : 'text-black rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 px-2">{msg.time}</span>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex flex-col items-start">
               <div className="bg-[#dddddd] p-3 rounded-[1.5rem] rounded-bl-none shadow-sm animate-pulse text-xs">
                 JARVIS is typing...
               </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Field */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center bg-gray-50 rounded-full px-5 py-3 border border-gray-200 shadow-inner">
            <input 
              type="text" 
              placeholder="Write your message..."
              className="flex-1 bg-transparent outline-none text-gray-700"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend} 
              className={`ml-2 font-bold ${!input.trim() ? 'text-gray-300' : 'text-[#19295d]'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 rotate-90">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;








// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';

// function App() {
//   const [messages, setMessages] = useState([
//     { role: 'bot', text: "Hi! I'm the OZ Chatbot!", time: '6:41 PM' }
//   ]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   // Auto-scroll logic taake naya message niche dikhayi de
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSend = async () => {
//   if (!input.trim() || isLoading) return;

//   const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   const userMsg = { role: 'user', text: input, time: userTime };
  
//   setMessages(prev => [...prev, userMsg]);
//   const currentInput = input;
//   setInput('');
//   setIsLoading(true);

//   try {
//     const res = await axios.post('http://localhost:8000/chat', {
//       query: currentInput,
//       device_id: "user_123" 
//     });

//     // CAUTION: res.data is an OBJECT {status, response, etc.}
//     // React cannot render an object. We MUST extract the string.
//     const botText = res.data.response; 

//     const botMsg = { 
//       role: 'bot', 
//       text: String(botText), // Ensuring it is a string
//       time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
//     };
    
//     setMessages(prev => [...prev, botMsg]);
//   } catch (error) {
//     console.error("Connection Error:", error);
//     setMessages(prev => [...prev, { 
//       role: 'bot', 
//       text: "Connection error. Is FastAPI running?", 
//       time: "Error" 
//     }]);
//   } finally {
//     setIsLoading(false);
//   }
// };

//   return (
//     <div className="min-h-screen bg-gray-200 flex items-center justify-center p-0 md:p-4 font-sans">
//       <div className="w-full h-screen md:w-[400px] md:h-[750px] bg-white md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border-[6px] border-[#E91E63]">
        
//         {/* Header - Wahi perfect design jo aapne banaya */}
//         <div className="bg-[#E91E63] p-6 pt-10 text-white shadow-lg">
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
//               <span className="text-[#E91E63] font-bold text-xl">GF</span>
//             </div>
//             <div>
//               <h1 className="font-bold text-xl leading-tight">Hello, Fareed!</h1>
//               <p className="text-xs opacity-90">We are here to help you</p>
//             </div>
//           </div>
//         </div>

//         {/* Chat Bubbles Area */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
//           {messages.map((msg, i) => (
//             <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
//               <div className={`max-w-[85%] p-4 rounded-[2rem] text-sm md:text-base shadow-sm ${
//                 msg.role === 'user' 
//                 ? 'bg-[#E91E63] text-white rounded-br-none' 
//                 : 'bg-[#9CCC65] text-black rounded-bl-none font-medium'
//               }`}>
//                 {msg.text}
//               </div>
//               <span className="text-[10px] text-gray-400 mt-1 px-2">{msg.time}</span>
//             </div>
//           ))}
//           {isLoading && <div className="text-xs text-pink-500 animate-pulse px-2 italic">Jarvis is thinking...</div>}
//           <div ref={chatEndRef} />
//         </div>

//         {/* Input Field - Rounded Bottom */}
//         <div className="p-4 bg-white border-t border-gray-100">
//           <div className="flex items-center bg-gray-100 rounded-full px-5 py-3 border border-gray-200 shadow-inner">
//             <input 
//               type="text" 
//               placeholder={isLoading ? "Waiting..." : "Write your message..."}
//               className="flex-1 bg-transparent outline-none text-gray-700"
//               value={input}
//               disabled={isLoading}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyPress={(e) => e.key === 'Enter' && handleSend()}
//             />
//             <button onClick={handleSend} disabled={isLoading} className={`ml-2 font-bold ${isLoading ? 'text-gray-400' : 'text-[#E91E63]'}`}>
//               Send
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;