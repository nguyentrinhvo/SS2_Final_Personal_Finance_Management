import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Bot, Sparkles, User, Terminal, Camera, Image, Mic } from 'lucide-react';

export default function FloatingChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'ai', text: 'Chào mừng bạn đến với FinFlow AI! Tôi có thể giúp bạn tổng hợp chi tiêu, thêm giao dịch hoặc phân tích tài chính. Bạn cần trợ giúp gì không?' }
    ]);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const fileInputRef = useRef(null);
    const scrollRef = useRef(null);
    const recognitionRef = useRef(null);
    const sendBtnRef = useRef(null);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecogniton = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecogniton) {
             alert("Trình duyệt của bạn không hỗ trợ tính năng nhận diện giọng nói (Speech Recognition). Vui lòng dùng Chrome hoặc Edge.");
             return;
        }

        recognitionRef.current = new SpeechRecogniton();
        recognitionRef.current.lang = 'vi-VN';
        recognitionRef.current.continuous = false; // Stop after a pause
        recognitionRef.current.interimResults = true; // Show text while speaking

        recognitionRef.current.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            setMessage(transcript);
        };

        recognitionRef.current.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
            // Automatically click the send button to submit the voice text after silence
            setTimeout(() => {
                if (sendBtnRef.current) {
                    sendBtnRef.current.click();
                }
            }, 300);
        };

        recognitionRef.current.start();
        setIsListening(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() && !selectedImage || !userId) return;

        const userMsg = message;
        setMessage('');
        const imgUrl = previewUrl;
        setSelectedImage(null);
        setPreviewUrl(null);
        
        // Push user message (we can optionally show "Đã gửi hình ảnh" if empty message)
        const displayMsg = userMsg.trim() ? userMsg : "Đã tải lên một hình ảnh.";
        setChatHistory(prev => [...prev, { role: 'user', text: displayMsg, imageUrl: imgUrl }]);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('message', userMsg);
            formData.append('userId', userId);
            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            const res = await axios.post('http://localhost:8080/api/chatbot/ask', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const responseText = res.data;
            setChatHistory(prev => [...prev, { role: 'ai', text: responseText }]);
            
            // Trigger automatic dashboard resync if transaction was added/deleted
            if (responseText.includes('Hệ thống đã ghi nhận giao dịch') || responseText.includes('Đã xóa giao dịch')) {
                window.dispatchEvent(new CustomEvent('transactionRefresh'));
            }
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'ai', text: 'Xin lỗi, tôi đang bận xử lý dữ liệu khác. Thử lại sau nhé!' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-10 right-10 z-[1000]">
            {isOpen ? (
                <div className="bg-white/95 backdrop-blur-2xl w-[400px] h-[600px] rounded-[40px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
                    {/* Header */}
                    <div className="p-8 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden">
                        <div className="absolute right-0 top-0 size-32 bg-orange-600/20 blur-3xl rounded-full"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                                <Bot size={24} className="text-orange-400" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg tracking-tight uppercase">FinFlow Agent</h3>
                                <div className="flex items-center gap-2">
                                    <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Architecture</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all relative z-10"><X size={20}/></button>
                    </div>

                    {/* Body */}
                    <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6 scrollbar-hide">
                        {chatHistory.map((chat, i) => (
                            <div key={i} className={`flex items-start gap-4 ${chat.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in duration-300`}>
                                <div className={`size-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${chat.role === 'ai' ? 'bg-slate-50 text-slate-900 border border-slate-100' : 'bg-orange-600 text-white shadow-orange-100'}`}>
                                    {chat.role === 'ai' ? <Sparkles size={16} /> : <User size={16} />}
                                </div>
                                <div className={`max-w-[85%] p-5 rounded-[28px] text-[13px] font-bold leading-relaxed shadow-sm whitespace-pre-wrap ${
                                    chat.role === 'ai' ? 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100' : 'bg-slate-900 text-white rounded-tr-none'
                                }`}>
                                    {chat.imageUrl && (
                                        <img src={chat.imageUrl} alt="Uploaded text request" className="w-full rounded-xl mb-3 object-cover shadow-sm border border-slate-700/50" />
                                    )}
                                    {chat.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100"><Sparkles size={16} className="animate-spin text-orange-500" /></div>
                                <div className="px-5 py-4 bg-slate-50 rounded-[28px] rounded-tl-none"><div className="flex gap-1.5"><span className="size-1.5 bg-slate-200 rounded-full animate-bounce"></span><span className="size-1.5 bg-slate-200 rounded-full animate-bounce delay-100"></span><span className="size-1.5 bg-slate-200 rounded-full animate-bounce delay-200"></span></div></div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-8 border-t border-slate-50 bg-slate-50/30">
                        {previewUrl && (
                            <div className="mb-4 relative inline-block animate-in fade-in zoom-in duration-300">
                                <img src={previewUrl} alt="Preview" className="h-20 w-auto rounded-2xl object-cover shadow-md border-2 border-white" />
                                <button type="button" onClick={() => { setSelectedImage(null); setPreviewUrl(null); }} className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1.5 shadow-lg hover:bg-orange-600 transition-colors">
                                    <X size={14}/>
                                </button>
                            </div>
                        )}
                        <div className="relative flex items-center gap-3">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="shrink-0 p-4 bg-white border border-slate-100 text-slate-400 rounded-3xl hover:text-orange-500 hover:border-orange-100 transition-all shadow-sm">
                                <Camera size={20} />
                            </button>
                            <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleImageChange} />
                            
                            <div className="relative flex-1 group">
                                <input 
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    className="w-full pl-6 pr-24 py-5 bg-white rounded-3xl border border-slate-100 focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-700 placeholder:text-slate-200 shadow-sm group-hover:border-orange-100 transition-all"
                                    placeholder={isListening ? "Đang nghe..." : "Hoặc gửi hóa đơn..."}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <button type="button" onClick={toggleListening} className={`p-3.5 rounded-2xl transition-all ${isListening ? 'bg-red-500 text-white shadow-lg animate-pulse' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}>
                                        <Mic size={18} />
                                    </button>
                                    <button ref={sendBtnRef} type="submit" disabled={loading || (!message.trim() && !selectedImage)} className="p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-orange-600 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-slate-900/10">
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-2">
                             <Terminal size={10} className="text-slate-300" />
                             <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center">Gemini AI Enhanced • High Precision Control</p>
                        </div>
                    </form>
                </div>
            ) : (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="size-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all relative group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <MessageCircle className="relative z-10 group-hover:rotate-12 transition-transform" size={24} />
                    <Sparkles className="absolute -top-1 -right-1 text-orange-400 z-20 group-hover:animate-pulse" size={14} />
                </button>
            )}
        </div>
    );
}
