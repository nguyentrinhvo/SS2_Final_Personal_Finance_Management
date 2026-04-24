import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronUp, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Globe, 
  BarChart3, 
  Wallet, 
  PieChart 
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const startDemo = () => {
    localStorage.setItem('isDemoMode', 'true');
    navigate('/dashboard');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const faqs = [
    {
      question: "How secure is my financial data with FinFlow?",
      answer: "We use bank-level 256-bit AES encryption and multi-factor authentication to ensure your data stays private and secure. Your financial information is never shared with third parties."
    },
    {
      question: "Can I integrate my existing bank accounts?",
      answer: "Yes! FinFlow supports integration with over 10,000 financial institutions worldwide through our secure banking API partners."
    },
    {
      question: "What reporting formats are available?",
      answer: "You can export your data and reports in PDF, Excel (XLSX), and CSV formats, making it easy to share with your accountant or import into other tools."
    },
    {
      question: "Is there a mobile app for iOS and Android?",
      answer: "Our web platform is fully responsive and works perfectly on mobile browsers. We are currently developing native apps for both iOS and Android, coming later this year."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Absolutely. We offer a month-to-month subscription with no long-term contracts. You can cancel or change your plan at any time from your account settings."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Freelance Designer",
      content: "FinFlow changed how I see my money. The visual reports helped me cut unnecessary expenses by 30% in just two months.",
      avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    {
      name: "David Chen",
      role: "Tech Entrepreneur",
      content: "The bank syncing is seamless. I finally have a real-time view of my business cash flow without manual spreadsheets.",
      avatar: "https://i.pravatar.cc/150?u=david"
    },
    {
      name: "Elena Rodriguez",
      role: "Marketing Manager",
      content: "Clean, intuitive, and powerful. It's the first finance app I've actually enjoyed using every day.",
      avatar: "https://i.pravatar.cc/150?u=elena"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fff8f6] text-[#261813] font-['Inter'] antialiased">
      {/* Navbar */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm py-3' : 'bg-transparent py-5'
      }`}>
        <nav className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="text-2xl font-black tracking-tighter text-slate-900">FinFlow</div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-[#a33900] font-semibold">Home</a>
            <a href="#features" className="text-slate-600 font-medium hover:text-[#a33900] transition-colors">Features</a>
            <a href="#testimonials" className="text-slate-600 font-medium hover:text-[#a33900] transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-slate-600 font-medium hover:text-[#a33900]"
            >
              Log in
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="bg-[#a33900] text-white px-6 py-2.5 rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all"
            >
              Get Started
            </button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffdbce] text-[#a33900] font-bold text-xs uppercase tracking-wider">
                <Zap size={14} fill="currentColor" />
                Next Generation Finance
              </div>
              <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
                Take Control of Your <br/>
                <span className="text-[#a33900]">Financial Future</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                Streamline your personal and business finances with a high-fidelity platform designed for modern professionals. Precision tracking meet effortless agility.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-[#a33900] text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                  Get Started <ArrowRight size={20} />
                </button>
                <button className="border-2 border-[#a33900] text-[#a33900] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#a33900]/5 transition-all">
                  Explore Features
                </button>
              </div>
              <div className="pt-8 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <img key={i} className="w-10 h-10 rounded-full border-2 border-[#fff8f6]" src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  ))}
                </div>
                <p className="text-sm text-slate-500 font-medium">Trusted by 25K+ individuals worldwide</p>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute top-0 right-0 w-full h-[450px] bg-gradient-to-br from-[#ffdbce] to-white rounded-[2rem] shadow-2xl border border-white/50 rotate-3 scale-95 opacity-50"></div>
              <div className="relative bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100 -rotate-2 transform hover:rotate-0 transition-transform duration-700">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Balance</p>
                      <h2 className="text-3xl font-black">$45,280.50</h2>
                    </div>
                    <div className="w-12 h-12 bg-[#a33900] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#a33900]/20">
                      <BarChart3 size={24} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#fff8f6] p-4 rounded-2xl border border-[#fee2d9]">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Monthly Income</p>
                      <p className="text-lg font-black text-green-600">+$8,400</p>
                    </div>
                    <div className="bg-[#fff8f6] p-4 rounded-2xl border border-[#fee2d9]">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Monthly Spent</p>
                      <p className="text-lg font-black text-red-500">-$3,120</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Spending Categories</p>
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#a33900] w-[65%]"></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>LIFESTYLE</span>
                        <span>65%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">Powerful Features to Take <br/>Control of Your Finances</h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">Everything you need to manage assets, track cash flow, and forecast growth in one unified platform.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: <PieChart className="text-[#a33900]" />, 
                  title: "Expense Tracking", 
                  desc: "Automatically categorize and log every transaction across all business accounts with AI precision." 
                },
                { 
                  icon: <Wallet className="text-[#a33900]" />, 
                  title: "Budget Planning", 
                  desc: "Set complex multi-departmental budgets and receive real-time alerts before you overspend." 
                },
                { 
                  icon: <BarChart3 className="text-[#a33900]" />, 
                  title: "Financial Insights", 
                  desc: "Generate board-ready reports and visual data stories that highlight growth opportunities." 
                }
              ].map((f, i) => (
                <div key={i} className="p-8 bg-[#fff8f6] rounded-[2rem] border border-[#fee2d9] hover:shadow-xl hover:-translate-y-2 transition-all group">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 bg-[#fff8f6]">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black mb-4">Loved by Users Worldwide</h2>
              <div className="flex justify-center gap-1 text-yellow-500">
                {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="currentColor" />)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                  <p className="text-slate-600 italic mb-8">"{t.content}"</p>
                  <div className="flex items-center gap-4">
                    <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full" />
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-[#fff8f6] px-6 md:px-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-black text-center mb-16">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-3xl border border-[#fee2d9] overflow-hidden transition-all">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-[#fff8f6] transition-colors"
                  >
                    <span className="font-bold text-lg">{faq.question}</span>
                    <div className={`p-1 rounded-full transition-all ${openFaq === i ? 'bg-[#a33900] text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {openFaq === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </button>
                  <div className={`px-8 transition-all duration-300 ease-in-out ${
                    openFaq === i ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 px-6 md:px-12">
          <div className="max-w-5xl mx-auto bg-[#a33900] rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="relative z-10 space-y-10">
              <h2 className="text-4xl md:text-6xl font-black leading-[1.2]">Ready to master your <br className="hidden md:block"/>money today?</h2>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">Join over 25,000 users who are already taking control of their financial future with FinFlow. Experience the power of precision tracking.</p>
              <div className="flex flex-wrap justify-center gap-6">
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-white text-[#a33900] px-10 py-5 rounded-full font-black text-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                  Create Free Account
                </button>
                <button 
                  onClick={startDemo}
                  className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-10 py-5 rounded-full font-black text-xl hover:bg-white/20 active:scale-95 transition-all"
                >
                  Try Live Demo
                </button>
              </div>
              <div className="flex flex-wrap justify-center items-center gap-8 pt-4 text-white/60 font-bold text-sm">
                <div className="flex items-center gap-2"><ShieldCheck size={18} /> No credit card required</div>
                <div className="flex items-center gap-2"><Globe size={18} /> Available worldwide</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#fee2d9] py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1 space-y-6">
              <div className="text-3xl font-black tracking-tighter text-slate-900">FinFlow</div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Precision financial management for the modern professional. Track, plan, and grow your wealth with confidence.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><a href="#" className="hover:text-[#a33900]">Features</a></li>
                <li><a href="#" className="hover:text-[#a33900]">Integrations</a></li>
                <li><a href="#" className="hover:text-[#a33900]">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><a href="#" className="hover:text-[#a33900]">About Us</a></li>
                <li><a href="#" className="hover:text-[#a33900]">Careers</a></li>
                <li><a href="#" className="hover:text-[#a33900]">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#a33900]">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Connect</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><a href="#" className="hover:text-[#a33900]">Twitter</a></li>
                <li><a href="#" className="hover:text-[#a33900]">LinkedIn</a></li>
                <li><a href="#" className="hover:text-[#a33900]">Instagram</a></li>
                <li><a href="#" className="hover:text-[#a33900]">Contact Sales</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[#fee2d9] flex flex-col md:row justify-between items-center gap-4">
            <p className="text-slate-400 text-xs font-medium">© 2024 FinFlow Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
