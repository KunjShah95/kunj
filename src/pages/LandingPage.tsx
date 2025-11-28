
import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    CheckCircle,
    Shield,
    Droplets,
    Zap,
    Layers,
    Users,
    FileText,
    Menu,
    X
} from 'lucide-react';

const landingHero = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80";

const LandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Droplets className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-900">Image Ink Studio</span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Features</a>
                            <a href="#workflow" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">How it Works</a>
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-slate-900 font-medium hover:text-blue-600 transition-colors">
                                    Log in
                                </Link>
                                <Link to="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30">
                                    Get Started
                                </Link>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 hover:text-slate-900 p-2">
                                {isMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-b border-slate-100">
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            <a href="#features" className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md">Features</a>
                            <a href="#workflow" className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md">How it Works</a>
                            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                                <Link to="/login" className="block w-full text-center px-4 py-2 text-slate-600 font-medium hover:text-slate-900 bg-slate-50 rounded-md">
                                    Log in
                                </Link>
                                <Link to="/register" className="block w-full text-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700">
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6 border border-blue-100">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                New: Enhanced PDF Export
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
                                Streamline your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    creative workflow
                                </span>
                            </h1>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                                Connect administrators and designers in one seamless platform. Manage tasks, review designs, and finalize assets with unprecedented speed and clarity.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/register" className="inline-flex justify-center items-center px-8 py-4 text-base font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-1">
                                    Start for free
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                                <Link to="/login" className="inline-flex justify-center items-center px-8 py-4 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all">
                                    View Demo
                                </Link>
                            </div>
                            <div className="mt-10 flex items-center gap-4 text-sm text-slate-500">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                                    ))}
                                </div>
                                <p>Trusted by 500+ creative teams</p>
                            </div>
                        </div>
                        <div className="relative lg:h-[600px] flex items-center justify-center">
                            <div className="relative w-full aspect-square max-w-lg lg:max-w-none">
                                {/* Abstract Background Blobs */}
                                <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                                <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

                                {/* Main Image Card */}
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-white/50 backdrop-blur-sm transform hover:scale-[1.02] transition-transform duration-500">
                                    <img
                                        src={landingHero}
                                        alt="Dashboard Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Floating UI Elements */}
                                    <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                <span className="text-sm font-medium text-slate-700">Design Approved</span>
                                            </div>
                                            <span className="text-xs text-slate-500">Just now</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full w-3/4 bg-blue-600 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">Powerful Features</h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to manage creative assets</h3>
                        <p className="text-lg text-slate-600">Built for speed and collaboration. Experience a workflow that adapts to your team's needs.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Shield className="w-6 h-6 text-blue-600" />,
                                title: "Admin Control Center",
                                description: "Centralized dashboard to assign tasks, monitor progress, and manage team permissions with granular control."
                            },
                            {
                                icon: <Users className="w-6 h-6 text-indigo-600" />,
                                title: "Team Collaboration",
                                description: "Real-time updates and feedback loops ensure designers and admins stay perfectly aligned on every project."
                            },
                            {
                                icon: <Layers className="w-6 h-6 text-purple-600" />,
                                title: "Version Management",
                                description: "Keep track of design iterations automatically. Never lose an old version or confuse a draft for a final."
                            },
                            {
                                icon: <CheckCircle className="w-6 h-6 text-green-600" />,
                                title: "Smart Approvals",
                                description: "One-click approval workflows. Mark designs as final and notify the entire team instantly."
                            },
                            {
                                icon: <FileText className="w-6 h-6 text-orange-600" />,
                                title: "Instant PDF Export",
                                description: "Generate professional, client-ready PDF reports of your design collections in seconds."
                            },
                            {
                                icon: <Zap className="w-6 h-6 text-yellow-600" />,
                                title: "Lightning Fast",
                                description: "Optimized for performance. Upload, view, and manage high-resolution assets without the lag."
                            }
                        ].map((feature, index) => (
                            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Workflow Section */}
            <section id="workflow" className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                                A workflow that just makes sense
                            </h2>
                            <p className="text-lg text-slate-600 mb-12">
                                Stop juggling emails and file transfers. Image Ink Studio provides a linear, logical path from concept to completion.
                            </p>

                            <div className="space-y-8">
                                {[
                                    {
                                        step: "01",
                                        title: "Create & Assign",
                                        desc: "Admins create tasks and assign them to specific designers."
                                    },
                                    {
                                        step: "02",
                                        title: "Upload & Iterate",
                                        desc: "Designers upload their work directly to the secure cloud storage."
                                    },
                                    {
                                        step: "03",
                                        title: "Review & Finalize",
                                        desc: "Admins review submissions, request changes, or mark as final."
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 text-blue-600 font-bold text-lg flex items-center justify-center border border-blue-100">
                                            {item.step}
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h4>
                                            <p className="text-slate-600">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-12 lg:mt-0 relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl transform rotate-3 opacity-10"></div>
                            <div className="relative bg-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-800">
                                {/* Code/UI Mockup */}
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-8 bg-slate-800 rounded w-1/3 animate-pulse"></div>
                                    <div className="h-32 bg-slate-800 rounded w-full animate-pulse"></div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="h-24 bg-slate-800 rounded animate-pulse"></div>
                                        <div className="h-24 bg-slate-800 rounded animate-pulse"></div>
                                        <div className="h-24 bg-slate-800 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to transform your design process?</h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Join hundreds of teams using Image Ink Studio to deliver better designs, faster.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-colors shadow-lg">
                            Get Started for Free
                        </Link>
                        <Link to="/contact" className="px-8 py-4 bg-blue-700 text-white font-bold rounded-full hover:bg-blue-800 transition-colors border border-blue-500">
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <Droplets className="w-6 h-6 text-blue-500" />
                                <span className="font-bold text-xl text-white">Image Ink Studio</span>
                            </div>
                            <p className="max-w-xs">
                                The complete solution for design management, review, and delivery.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Product</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p>&copy; 2024 Image Ink Studio. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
