import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText, Database, TrendingUp, Users, Mail, ChevronRight, CheckCircle, ChevronLeft } from 'lucide-react';

const sections = [
  {
    id: 'introduction',
    icon: Shield,
    title: '1. Introduction',
    content: 'Studio TASKup est une plateforme de mise en relation de talents et d\'offres. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.'
  },
  {
    id: 'app-type',
    icon: TrendingUp,
    title: '2. Type d\'Application',
    content: 'Studio TASKup est un réseau professionnel et un gestionnaire de tâches. Il facilite la publication d\'annonces et la recherche de profils qualifiés.',
    highlight: true
  },
  {
    id: 'data-collected',
    icon: Database,
    title: '3. Données Collectées',
    content: 'Nous pouvons collecter les données suivantes :',
    list: [
      'Informations de profil (nom, email, photo)',
      'Préférences de l\'application (thème, langue)',
      'Données de localisation (pour la carte et les offres à proximité)',
      'Historique des missions et transactions (via les services sécurisés)'
    ]
  },
  {
    id: 'data-usage',
    icon: Eye,
    title: '4. Utilisation des Données',
    content: 'Les données collectées sont utilisées pour :',
    list: [
      'Fournir les fonctionnalités de base de l\'application',
      'Personnaliser votre expérience (recommandations de profils)',
      'Améliorer nos services et la sécurité',
      'Faciliter la communication dans les salles de chat'
    ]
  },
  {
    id: 'security',
    icon: Lock,
    title: '5. Sécurité',
    content: 'Mesures de sécurité mises en place :',
    list: [
      'Vos données personnelles sont stockées sur des serveurs sécurisés',
      'Les communications sont chiffrées de bout en bout',
      'L\'accès biométrique ou par mot de passe reste confidentiel'
    ]
  },
  {
    id: 'data-sharing',
    icon: Users,
    title: '6. Partage des Données',
    content: 'Nous ne vendons ni ne partageons vos données personnelles à des tiers à des fins de marketing sans votre consentement explicite.'
  },
  {
    id: 'your-rights',
    icon: FileText,
    title: '7. Vos Droits',
    content: 'En tant qu\'utilisateur de Studio TASKup, vous avez les droits suivants :',
    list: [
      'Accéder à vos données',
      'Mettre à jour vos informations',
      'Supprimer votre compte et vos données',
      'Gérer vos préférences de notification'
    ]
  },
  {
    id: 'contact',
    icon: Mail,
    title: '8. Contact',
    content: 'Pour toute question concernant cette politique, n\'hésitez pas à nous contacter :',
    contact: 'contact@studiotaskup.com'
  }
];

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBack }) => {
  const [lastUpdated, setLastUpdated] = useState('');
  const [activeSection, setActiveSection] = useState('introduction');

  useEffect(() => {
    setLastUpdated(
      new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    );

    const handleScroll = () => {
      const scrollContainer = document.getElementById('privacy-scroll-area');
      if (!scrollContainer) return;

      const sectionElements = sections.map(s => document.getElementById(s.id));
      let currentActive = sections[0].id;
      
      for (const el of sectionElements) {
        if (el && scrollContainer.scrollTop >= el.offsetTop - 250) {
          currentActive = el.id;
        }
      }
      setActiveSection(currentActive);
    };

    const scrollContainer = document.getElementById('privacy-scroll-area');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    const scrollContainer = document.getElementById('privacy-scroll-area');
    if (el && scrollContainer) {
      scrollContainer.scrollTo({
        top: el.offsetTop - 120,
        behavior: 'smooth'
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 z-[100] h-full bg-gradient-to-br from-sky-50 via-white to-sky-100 font-sans antialiased text-slate-800 overflow-hidden"
    >
      {/* Glassmorphic Elegant Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDQwIEwgNDAgNDAgNDAgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsMCwwLDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        
        {/* Soft glowing orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-300/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-300/30 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-blue-300/20 rounded-full blur-[90px]" />
        
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
      </div>

      {/* Header (Fixed) */}
      <div className="absolute top-0 left-0 right-0 pt-14 pb-4 px-6 flex items-center justify-between z-20 bg-white/40 backdrop-blur-md border-b border-white/60 shadow-sm">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-white/80 backdrop-blur-md border border-white/50 shadow-sm rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-10"
        >
          <ChevronLeft size={22} className="text-gray-800" />
        </button>
        <h1 className="text-[18px] font-bold text-gray-900 tracking-tight absolute left-0 right-0 text-center truncate px-12">Confidentialité</h1>
        <div className="w-10 z-10"></div>
      </div>

      {/* Scrollable Content Area */}
      <div id="privacy-scroll-area" className="relative z-10 h-full overflow-y-auto hide-scrollbar pt-32 pb-24 flex flex-col items-center">
        
        <main className="w-full max-w-[1200px] px-6 lg:px-8">
          {/* Main Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 md:mb-16 mt-4"
          >
            <div className="inline-flex items-center gap-2 bg-white/60 border border-white/50 shadow-sm rounded-full px-4 py-1.5 mb-6 backdrop-blur-md">
              <Shield className="w-4 h-4 text-[#0ea5e9]" />
              <span className="text-xs font-bold text-[#0ea5e9] tracking-wide uppercase">Légal & Confidentialité</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-slate-800 drop-shadow-sm">
              Politique de Confidentialité
            </h1>
            
            <p className="text-base text-slate-600 max-w-2xl font-medium">
              Nous nous engageons à protéger votre vie privée et à sécuriser vos données. 
              Dernière mise à jour le <span className="text-slate-800 font-bold">{lastUpdated || '—'}</span>.
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 relative">
            
            {/* Left Sidebar - Table of Contents (Hidden on mobile) */}
            <div className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-8 bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-4">
                <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-4 px-3">
                  Sommaire
                </h4>
                <div className="flex flex-col space-y-1">
                  {sections.map((section) => {
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`text-left px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 flex items-center gap-2 ${
                          isActive 
                            ? 'bg-white shadow-sm text-[#0ea5e9]' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                        }`}
                      >
                        {isActive && <motion.div layoutId="activeIndicator" className="w-1.5 h-4 bg-[#0ea5e9] rounded-full" />}
                        {!isActive && <div className="w-1.5 h-4 bg-transparent" />}
                        {section.title.split('. ')[1]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="flex-1 max-w-3xl">
              <div className="space-y-10">
                {sections.map((section, index) => {
                  const Icon = section.icon;
                  return (
                    <motion.section
                      id={section.id}
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5 }}
                      className="scroll-mt-32 bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-6 sm:p-8"
                    >
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-[#0ea5e9]" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                          {section.title}
                        </h2>
                      </div>
                      
                      <div className="prose prose-slate max-w-none">
                        <p className={`text-[15px] sm:text-base leading-relaxed ${section.highlight ? 'text-slate-800 font-bold' : 'text-slate-600'}`}>
                          {section.content}
                        </p>

                        {section.list && (
                          <ul className="mt-5 space-y-3 pl-2">
                            {section.list.map((item, i) => (
                              <li key={i} className="flex items-start gap-3 text-slate-600 text-[14px] sm:text-[15px] font-medium">
                                <div className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-[#0ea5e9]/70" />
                                <span className="leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {section.contact && (
                          <div className="mt-6 p-5 rounded-2xl bg-white/70 border border-white shadow-sm">
                            <p className="text-sm font-semibold text-slate-500 mb-2">Contactez notre équipe de confidentialité :</p>
                            <a
                              href={`mailto:${section.contact}`}
                              className="text-[#0ea5e9] hover:text-sky-600 font-bold transition-colors inline-flex items-center gap-2 group"
                            >
                              {section.contact}
                              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                          </div>
                        )}
                      </div>
                    </motion.section>
                  );
                })}

                {/* Info Banner Appended */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-12 p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-white/80 to-white/40 border border-white shadow-lg relative overflow-hidden backdrop-blur-xl"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <CheckCircle className="w-48 h-48 text-[#0ea5e9]" />
                  </div>
                  
                  <div className="relative z-10 w-full md:w-4/5">
                    <div className="inline-flex items-center gap-2 mb-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase">Information Importante</span>
                    </div>
                    
                    <h3 className="text-2xl font-extrabold text-slate-800 mb-4 tracking-tight">
                      Votre Confiance Avant Tout
                    </h3>
                    
                    <p className="text-slate-600 font-medium leading-relaxed mb-8">
                      Studio TASKup a été conçu pour offrir un environnement sûr et transparent. Nous ne vendrons jamais vos données personnelles et mettons tout en oeuvre pour vous garantir une expérience professionnelle de haute qualité.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {['Sécurisé', 'Transparent', 'Professionnel'].map((tag, i) => (
                        <div key={i} className="px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 text-sm font-bold text-slate-700">
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>
            
          </div>
        </main>
      </div>
    </motion.div>
  );
}
