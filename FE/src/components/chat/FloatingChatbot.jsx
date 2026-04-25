import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Bot, Sparkles, User, Terminal, Camera, Image, Mic } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../utils/api';

export default function FloatingChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'ai', text: 'Chào mừng bạn đến với FinFlow AI! Gõ "guide" hoặc "hướng dẫn" để xem chi tiết cách nhập liệu giao dịch.' }
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
        
        // Push user message
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

            const res = await axios.post(`${API_BASE_URL}/api/chatbot/ask`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const responseText = res.data;
            setChatHistory(prev => [...prev, { role: 'ai', text: responseText }]);
            
            // Trigger automatic dashboard resync
            if (responseText.includes('Hệ thống đã ghi nhận giao dịch') || responseText.includes('Đã xóa giao dịch') || responseText.includes('Đã cập nhật giao dịch')) {
                window.dispatchEvent(new CustomEvent('transactionRefresh'));
                
                if (responseText.includes('⚠️')) {
                    toast(responseText.split('⚠️')[1].trim(), {
                        icon: '⚠️',
                        duration: 4000,
                        style: {
                            borderRadius: '20px',
                            background: '#333',
                            color: '#fff',
                        },
                    });
                }
            }
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'ai', text: 'Xin lỗi, tôi đang bận xử lý dữ liệu khác. Thử lại sau nhé!' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[1000]">
            {isOpen ? (
                <div className="bg-white/95 backdrop-blur-2xl w-[420px] h-[580px] rounded-[32px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
                    {/* Header */}
                    <div className="p-5 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden">
                        <div className="absolute right-0 top-0 size-32 bg-orange-600/20 blur-3xl rounded-full"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="size-10 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                                <Bot size={20} className="text-orange-400" />
                            </div>
                            <div>
                                <h3 className="font-black text-base tracking-tight uppercase">FinFlow Agent</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="size-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Architecture</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all relative z-10"><X size={18}/></button>
                    </div>

                    {/* Body */}
                    <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-3.5 scrollbar-hide">
                        {chatHistory.map((chat, i) => (
                            <div key={i} className={`flex items-start gap-3 ${chat.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in duration-300`}>
                                <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${chat.role === 'ai' ? 'bg-slate-50 text-slate-900 border border-slate-100' : 'bg-orange-600 text-white shadow-orange-100'}`}>
                                    {chat.role === 'ai' ? <Sparkles size={14} /> : <User size={14} />}
                                </div>
                                <div className={`max-w-[85%] p-3 rounded-xl text-[13px] font-medium leading-relaxed shadow-sm ${
                                    chat.role === 'ai' ? 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100' : 'bg-slate-900 text-white rounded-tr-none'
                                }`}>
                                    {chat.imageUrl && (
                                        <img src={chat.imageUrl} alt="Uploaded text request" className="w-full rounded-xl mb-2.5 object-cover shadow-sm border border-slate-700/50" />
                                    )}
                                    <div className={`prose prose-slate max-w-none prose-p:leading-relaxed prose-p:my-0.5 prose-headings:my-1 prose-ul:my-1 prose-li:my-0 text-inherit ${chat.role === 'user' ? 'prose-invert' : ''}`}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {chat.text}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex items-center gap-3">
                                <div className="size-9 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100"><Sparkles size={14} className="animate-spin text-orange-500" /></div>
                                <div className="px-4 py-3 bg-slate-50 rounded-[24px] rounded-tl-none"><div className="flex gap-1.5"><span className="size-1 bg-slate-200 rounded-full animate-bounce"></span><span className="size-1 bg-slate-200 rounded-full animate-bounce delay-100"></span><span className="size-1 bg-slate-200 rounded-full animate-bounce delay-200"></span></div></div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-3.5 border-t border-slate-50 bg-slate-50/30">
                        {previewUrl && (
                            <div className="mb-2 relative inline-block animate-in fade-in zoom-in duration-300">
                                <img src={previewUrl} alt="Preview" className="h-14 w-auto rounded-xl object-cover shadow-md border-2 border-white" />
                                <button type="button" onClick={() => { setSelectedImage(null); setPreviewUrl(null); }} className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white rounded-full p-1 shadow-lg hover:bg-orange-600 transition-colors">
                                    <X size={10}/>
                                </button>
                            </div>
                        )}
                        <div className="relative flex items-center gap-2">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="shrink-0 p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:text-orange-500 hover:border-orange-100 transition-all shadow-sm">
                                <Camera size={16} />
                            </button>
                            <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleImageChange} />
                            
                            <div className="relative flex-1 group">
                                <input 
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    className="w-full pl-4 pr-20 py-3 bg-white rounded-xl border border-slate-100 focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-medium text-sm text-slate-700 placeholder:text-slate-300 shadow-sm group-hover:border-orange-100 transition-all"
                                    placeholder={isListening ? "Đang nghe..." : "Nhập yêu cầu..."}
                                />
                                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <button type="button" onClick={toggleListening} className={`p-2 rounded-lg transition-all ${isListening ? 'bg-red-500 text-white shadow-lg animate-pulse' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}>
                                        <Mic size={14} />
                                    </button>
                                    <button ref={sendBtnRef} type="submit" disabled={loading || (!message.trim() && !selectedImage)} className="p-2 bg-slate-900 text-white rounded-lg hover:bg-orange-600 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-slate-900/10">
                                        <Send size={14} />
                                    </button>
                                </div>
                            </div>
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
