import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, BarChart3, Target, FileDown, Shield, 
  TrendingUp, Bell, Sparkles, Check, CreditCard
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';

const features = [
  {
    icon: BarChart3,
    title: 'Tableau de bord complet',
    description: 'Visualisez vos finances en un coup d\'œil avec des graphiques clairs et intuitifs'
  },
  {
    icon: Target,
    title: 'Objectifs et alertes',
    description: 'Définissez des limites budgétaires et recevez des alertes avant de les dépasser'
  },
  {
    icon: TrendingUp,
    title: 'Analyse mensuelle',
    description: 'Comprenez vos habitudes de dépenses avec des analyses détaillées par catégorie'
  },
  {
    icon: FileDown,
    title: 'Export PDF & Excel',
    description: 'Exportez vos données financières pour une analyse approfondie ou l\'archivage'
  },
  {
    icon: Shield,
    title: 'Données sécurisées',
    description: 'Vos informations financières sont protégées et jamais partagées avec des tiers'
  },
  {
    icon: Bell,
    title: 'Notifications intelligentes',
    description: 'Restez informé de vos dépenses importantes et de l\'atteinte de vos objectifs'
  }
];

const freePlan = [
  'Suivi manuel des dépenses',
  'Tableau de bord et graphiques',
  'Analyse mensuelle des dépenses',
  'Objectifs budgétaires de base',
  'Export PDF'
];

const premiumPlan = [
  'Tout du plan gratuit',
  'Synchronisation bancaire automatique',
  'Analyse IA des dépenses',
  'Recommandations personnalisées',
  'Alertes avancées et insights',
  'Export Excel avancé',
  'Support prioritaire'
];

export default function Landing() {
  const handleGetStarted = async () => {
    const isAuthenticated = await base44.auth.isAuthenticated();
    
    if (isAuthenticated) {
      // Redirect to plan selection or dashboard
      window.location.href = createPageUrl('PlanSelection');
    } else {
      // Redirect to login, then to plan selection after signup
      base44.auth.redirectToLogin(createPageUrl('PlanSelection'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-6 py-2 rounded-full mb-8 shadow-lg">
              <Wallet className="w-5 h-5" />
              <span className="font-bold text-lg">FamilyBudget+</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Gestion budgétaire <br />
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                éthique et responsable
              </span>
            </h1>

            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Prenez le contrôle de vos finances familiales avec une application simple, 
              transparente et sans endettement
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all"
              >
                Commencer gratuitement
              </Button>
              
              <Button 
                onClick={() => window.location.href = createPageUrl('SignIn')}
                size="lg"
                variant="outline"
                className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 text-lg px-8 py-6 rounded-xl"
              >
                Se connecter
              </Button>
            </div>

            <p className="text-sm text-slate-500 mt-4">
              Aucune carte bancaire requise • Configuration en 2 minutes
            </p>
          </motion.div>

          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-100"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 text-center">
              Une gestion financière à la portée de tous
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed text-center mb-4">
              <strong>FamilyBudget+</strong> aide les familles marocaines à gérer leur budget de manière 
              responsable et transparente. Suivez vos dépenses, planifiez vos achats et évitez 
              l'endettement grâce à des outils simples et efficaces.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed text-center">
              Notre mission : rendre la gestion budgétaire accessible, éthique et sans complexité. 
              Pas de crédits, pas de dettes, juste une vision claire de vos finances.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-slate-600">
              Des outils puissants pour une gestion financière simplifiée
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-slate-200">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-xl text-slate-600">
              Commencez gratuitement, évoluez à votre rythme
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full border-2 border-slate-200 hover:shadow-xl transition-all">
                <CardHeader>
                  <CardTitle className="text-2xl">Gratuit</CardTitle>
                  <CardDescription className="text-lg">
                    Pour démarrer votre gestion budgétaire
                  </CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold text-slate-900">0 DH</span>
                    <span className="text-slate-500"> / mois</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {freePlan.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={handleGetStarted}
                    variant="outline" 
                    className="w-full mt-6 border-2 border-teal-600 text-teal-600 hover:bg-teal-50"
                  >
                    Commencer gratuitement
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="h-full border-2 border-teal-500 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0">
                  <Badge className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-none rounded-bl-lg px-4 py-1">
                    Populaire
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    Premium
                    <Sparkles className="w-5 h-5 text-teal-600" />
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Pour une gestion avancée et automatisée
                  </CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                      29 DH
                    </span>
                    <span className="text-slate-500"> / mois</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {premiumPlan.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={handleGetStarted}
                    className="w-full mt-6 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white"
                  >
                    Passer à Premium
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Payment Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 text-center"
          >
            <Card className="inline-block bg-gradient-to-br from-slate-50 to-white border-slate-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <CreditCard className="w-5 h-5 text-slate-600" />
                  <span className="font-semibold text-slate-900">Paiement sécurisé</span>
                </div>
                <p className="text-slate-600 text-sm">
                  Cartes bancaires, virements • Aucun frais caché • Résiliable à tout moment
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-500 to-emerald-600">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Prêt à prendre le contrôle de votre budget ?
          </h2>
          <p className="text-xl text-teal-50 mb-8">
            Rejoignez des centaines de familles qui gèrent déjà leurs finances avec FamilyBudget+
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-white text-teal-600 hover:bg-slate-50 text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all"
          >
            Créer mon compte gratuit
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white text-lg">FamilyBudget+</span>
              </div>
              <p className="text-sm text-slate-400">
                Gestion budgétaire éthique et responsable pour les familles marocaines
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Liens rapides</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-teal-400 transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Conditions d'utilisation</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Notre engagement</h3>
              <div className="bg-gradient-to-br from-teal-900/30 to-emerald-900/30 rounded-lg p-4 border border-teal-700/30">
                <p className="text-sm">
                  💚 <strong className="text-teal-400">Finance éthique</strong><br />
                  Pas de crédits, pas de dettes. Juste une gestion responsable de votre budget familial.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>&copy; 2025 FamilyBudget+. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}