'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, Users, Brain, Database, LayoutDashboard, Workflow, 
  ArrowRight, Play 
} from 'lucide-react';

export default function DLavieRedesigned() {
  const coreFeatures = [
    { icon: <Bot className="w-7 h-7" />, title: "AI Core", desc: "The intelligent foundation that powers reasoning, orchestration, and decision-making across the entire ecosystem." },
    { icon: <Users className="w-7 h-7" />, title: "Agents", desc: "Autonomous agents that execute complex workflows, handle commerce operations, and respond to real-time signals." },
    { icon: <Brain className="w-7 h-7" />, title: "Models", desc: "Flexible model routing with support for frontier models, fine-tuned agents, and local inference when needed." },
    { icon: <Database className="w-7 h-7" />, title: "Memory", desc: "Persistent, contextual memory layer that remembers conversations, transactions, and operational history." },
    { icon: <LayoutDashboard className="w-7 h-7" />, title: "Dashboards", desc: "Beautiful, real-time command surfaces for monitoring agents, commerce metrics, and system health." },
    { icon: <Workflow className="w-7 h-7" />, title: "Workflows", desc: "Visual and code-based orchestration of multi-step processes across AI, commerce, and automation layers." }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden font-sans">
      <div className="dlavie-landing">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#050505]/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <span className="text-[#050505] font-bold text-xl tracking-[-2px]">D</span>
              </div>
              <div className="font-semibold tracking-[-1.5px] text-2xl">DLavie</div>
            </div>

            <div className="hidden md:flex items-center gap-9 text-sm font-medium">
              <a href="#os" className="hover:text-white/70 transition-colors">DLavie OS</a>
              <a href="#ecosystem" className="hover:text-white/70 transition-colors">Ecosystem</a>
              <a href="#workspace" className="hover:text-white/70 transition-colors">AI Workspace</a>
              <a href="/ai" className="hover:text-white/70 transition-colors">Docs</a>
            </div>

            <div className="flex items-center gap-3">
              <a href="/ai" className="hidden sm:block px-5 py-2 text-sm font-medium border border-white/20 hover:bg-white/5 rounded-full transition-all">
                Open Workspace
              </a>
              <a href="#os" className="px-6 py-2.5 text-sm font-semibold bg-white text-[#050505] hover:bg-white/90 rounded-full flex items-center gap-2 transition-all active:scale-[0.985]">
                Launch DLavie OS
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-28 md:pt-32 pb-20 md:pb-24 px-6 md:px-8 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-white/10 text-xs tracking-[2px] mb-8 text-white/60">
            INTELLIGENT OPERATING SYSTEM
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-semibold tracking-[-4.5px] md:tracking-[-5.5px] leading-[0.92] mb-6">
            DLavie OS
          </h1>
          
          <p className="max-w-2xl mx-auto text-2xl md:text-3xl tracking-[-1px] text-white/80 mb-4">
            The cinematic command mesh for agents, models, memory, and intelligent operations.
          </p>

          <p className="max-w-md mx-auto text-lg text-white/50 mb-10">
            One parent brand. One unified ecosystem. Decisions, transactions, and workflows — perfectly aligned.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#os" className="inline-flex items-center justify-center gap-3 px-9 py-4 bg-white text-[#050505] rounded-2xl font-semibold text-lg hover:bg-white/90 active:bg-white transition-all active:scale-[0.985]">
              Explore DLavie OS
            </a>
            
            <a href="/ai" className="inline-flex items-center justify-center gap-3 px-9 py-4 border border-white/30 hover:bg-white/5 rounded-2xl font-medium text-lg transition-all active:scale-[0.985]">
              <Play className="w-5 h-5" />
              Open AI Workspace
            </a>
          </div>

          <div className="mt-14 text-xs tracking-[3px] text-white/40">
            BUILT FOR FOUNDERS • OPERATORS • INTELLIGENT SYSTEMS
          </div>
        </section>

        {/* Vision */}
        <section className="border-y border-white/10 py-16 md:py-20 px-6 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-xs tracking-[3px] text-white/50 mb-4">THE PHILOSOPHY</div>
            <h2 className="text-4xl md:text-5xl tracking-[-2px] font-semibold mb-6">
              One parent brand.<br />Connected intelligence.
            </h2>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              DLavie designs connected digital systems under one cohesive brand — from agent workspaces to transaction rails.
            </p>
          </div>
        </section>

        {/* DLavie OS Core */}
        <section id="os" className="max-w-7xl mx-auto px-6 md:px-8 pt-16 md:pt-20 pb-16">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 text-xs tracking-[2.5px] mb-4 border border-white/10">
              THE CORE
            </div>
            <h2 className="text-5xl md:text-6xl tracking-[-3px] font-semibold mb-4">DLavie OS</h2>
            <p className="max-w-md mx-auto text-lg text-white/60">
              Turns agents, models, memory, dashboards, and workflows into a single cinematic command mesh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="group relative rounded-3xl border border-white/10 bg-zinc-950/60 p-8 hover:border-white/25 transition-all flex flex-col"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 text-white group-hover:bg-white/10 transition-colors">
                  {item.icon}
                </div>
                
                <h3 className="text-3xl tracking-[-1.2px] font-semibold mb-4">{item.title}</h3>
                <p className="text-white/70 leading-relaxed flex-1 text-[15px]">{item.desc}</p>
                
                <div className="mt-auto pt-8 flex items-center text-sm font-medium text-white/60 group-hover:text-white transition-colors">
                  Learn more <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Unified Ecosystem */}
        <section id="ecosystem" className="border-y border-white/10 bg-zinc-950 py-16 md:py-20 px-6 md:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-xs tracking-[3px] text-white/50 mb-3">UNIFIED BY DESIGN</div>
              <h2 className="text-4xl md:text-5xl tracking-[-2px] font-semibold">One ecosystem.<br />Zero friction.</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "DLavie Commerce", desc: "PPOB products, storefront flows, transaction rails, and automated settlement — all connected." },
                { title: "Automation Layer", desc: "Triggers, agents, and commerce events stay synchronized from signal to final settlement." },
                { title: "DLavie OS", desc: "The intelligent command layer that orchestrates everything into one cinematic experience." }
              ].map((item, i) => (
                <div key={i} className="rounded-3xl border border-white/10 p-8 bg-[#050505]">
                  <div className="font-semibold text-2xl tracking-tight mb-4">{item.title}</div>
                  <p className="text-white/70 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Command Experience */}
        <section id="workspace" className="max-w-5xl mx-auto px-6 md:px-8 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-block px-5 py-1.5 rounded-full bg-white/5 text-xs tracking-[2px] mb-6 border border-white/10">
              THE WORKSPACE
            </div>
            
            <h2 className="text-5xl md:text-6xl tracking-[-2.5px] font-semibold mb-6">
              Experience the command layer.
            </h2>
            
            <p className="text-xl md:text-2xl text-white/70 mb-10">
              DLavie AI Workspace is where intelligence meets operations. Account-aware, context-rich, and built for real work.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/ai" className="inline-flex items-center justify-center gap-3 px-9 py-4 bg-white text-[#050505] rounded-2xl font-semibold text-lg hover:bg-white/90 active:bg-white transition-all">
                Open DLavie AI Workspace
              </a>
              <a href="#os" className="inline-flex items-center justify-center gap-3 px-9 py-4 border border-white/20 hover:bg-white/5 rounded-2xl font-medium text-lg transition-all">
                Learn about DLavie OS
              </a>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-white/10 py-16 md:py-20 px-6 md:px-8 bg-zinc-950">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl tracking-tight font-semibold mb-4">Ready to build with intelligence?</h3>
            <p className="text-white/60 mb-8">Start with DLavie OS or dive straight into the AI workspace.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#os" className="px-8 py-3.5 rounded-2xl bg-white text-[#050505] font-semibold hover:bg-white/90 transition">Explore DLavie OS</a>
              <a href="/ai" className="px-8 py-3.5 rounded-2xl border border-white/20 hover:bg-white/5 font-medium transition">Launch AI Workspace →</a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-10 px-6 md:px-8 text-sm text-white/50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-y-4">
            <div>© {new Date().getFullYear()} DLavie. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="https://github.com/drmacze/dlaviecomerce" className="hover:text-white transition">GitHub</a>
            </div>
            <div>Built with precision in Indonesia</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
