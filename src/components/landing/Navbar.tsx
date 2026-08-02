"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Menu, X } from "lucide-react";
import { Button } from "./Button";
import { Container } from "./Container";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Sécurité", href: "#impact" },
    { label: "Spots", href: "#features" },
    { label: "Tarifs", href: "#comparison" }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#F4F4EE]/90 backdrop-blur-md py-3.5 border-b border-black/5 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <Container className="max-w-[1200px] flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/logo.png"
            alt="CAPTEN"
            className="h-8 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#666562]">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="hover:text-[#1A1918] transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA Button */}
        <div className="hidden sm:flex items-center gap-4">
          <Button href="/login?mode=signup" variant="primary" size="sm">
            LANCER UN RUN +
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 text-[#1A1918] focus:outline-none cursor-pointer rounded-lg hover:bg-black/5"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </Container>

      {/* Mobile Animated Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden bg-[#F4F4EE] border-b border-black/5 px-6 py-6 space-y-4 shadow-xl"
          >
            <nav className="flex flex-col gap-4 text-sm font-bold text-[#666562]">
              {navLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#1A1918] py-1 border-b border-black/5"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="pt-2">
              <Button href="/login?mode=signup" variant="primary" size="md" fullWidth>
                LANCER UN RUN +
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
