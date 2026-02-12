import { useState } from 'react';
import { Calculator, DollarSign, HardHat, Home, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { LocaleSEO } from '@/components/LocaleSEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Calculator Components

function MortgageCalculator() {
  const { t } = useTranslation();
  const [price, setPrice] = useState<number>(500000);
  const [downPayment, setDownPayment] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(7.5);
  const [termYears, setTermYears] = useState<number>(30);

  const loanAmount = price * (1 - downPayment / 100);
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = termYears * 12;
  
  const monthlyPayment = monthlyRate > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : loanAmount / numPayments;

  return (
    <Card className="border-border rounded">
      <CardHeader>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
            <Calculator className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="font-serif">{t('tools.mortgage.title')}</CardTitle>
        </div>
        <CardDescription>{t('tools.mortgage.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">{t('tools.mortgage.price')}</label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            min={0}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">{t('tools.mortgage.downPayment')}</label>
          <Input
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            min={0}
            max={100}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">{t('tools.mortgage.interestRate')}</label>
          <Input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            min={0}
            step={0.1}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">{t('tools.mortgage.term')}</label>
          <Select value={termYears.toString()} onValueChange={(v) => setTermYears(Number(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 {t('tools.mortgage.years')}</SelectItem>
              <SelectItem value="20">20 {t('tools.mortgage.years')}</SelectItem>
              <SelectItem value="25">25 {t('tools.mortgage.years')}</SelectItem>
              <SelectItem value="30">30 {t('tools.mortgage.years')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground mb-1">{t('tools.mortgage.monthlyPayment')}</div>
          <div className="font-serif text-3xl font-semibold text-foreground">
            ${isFinite(monthlyPayment) ? monthlyPayment.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '---'}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {t('tools.mortgage.loanAmount')}: ${loanAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{t('tools.mortgage.disclaimer')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ClosingCostCalculator() {
  const { t } = useTranslation();
  const [price, setPrice] = useState<number>(500000);

  // Costa Rica closing costs (estimates)
  const transferTax = price * 0.015; // 1.5%
  const registrationFee = price * 0.005; // 0.5%
  const legalFees = price * 0.0125; // 1-1.5%
  const notaryFees = price * 0.01; // ~1%
  const stampDuties = price * 0.003; // 0.3%

  const totalMin = transferTax + registrationFee + (price * 0.01) + (price * 0.008) + stampDuties;
  const totalMax = transferTax + registrationFee + (price * 0.015) + (price * 0.012) + stampDuties;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-gold" />
          </div>
          <CardTitle className="font-serif">{t('tools.closing.title')}</CardTitle>
        </div>
        <CardDescription>{t('tools.closing.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">{t('tools.mortgage.price')}</label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            min={0}
          />
        </div>

        <div className="pt-4 border-t border-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('tools.closing.transferTax')}</span>
            <span className="font-medium">${transferTax.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('tools.closing.registrationFee')}</span>
            <span className="font-medium">${registrationFee.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('tools.closing.legalFees')}</span>
            <span className="font-medium">${legalFees.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('tools.closing.notaryFees')}</span>
            <span className="font-medium">${notaryFees.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('tools.closing.stampDuties')}</span>
            <span className="font-medium">${stampDuties.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground mb-1">{t('tools.closing.totalRange')}</div>
          <div className="font-serif text-2xl font-semibold text-foreground">
            ${totalMin.toLocaleString('en-US', { maximumFractionDigits: 0 })} - ${totalMax.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            ({((totalMin / price) * 100).toFixed(1)}% - {((totalMax / price) * 100).toFixed(1)}% {t('tools.closing.ofPurchase')})
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{t('tools.closing.disclaimer')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function RemodelingCalculator() {
  const { t } = useTranslation();
  const [tier, setTier] = useState<string>('mid');
  const [sqm, setSqm] = useState<number>(100);

  const rates: Record<string, { min: number; max: number }> = {
    mid: { min: 400, max: 600 },
    high_end: { min: 700, max: 1000 },
    ultra_luxury: { min: 1200, max: 2000 },
  };

  const rate = rates[tier];
  const costMin = sqm * rate.min;
  const costMax = sqm * rate.max;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <Home className="w-5 h-5 text-accent" />
          </div>
          <CardTitle className="font-serif">{t('tools.remodeling.title')}</CardTitle>
        </div>
        <CardDescription>{t('tools.remodeling.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">{t('tools.remodeling.qualityTier')}</label>
          <Select value={tier} onValueChange={setTier}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mid">{t('tools.remodeling.midRange')}</SelectItem>
              <SelectItem value="high_end">{t('tools.remodeling.highEnd')}</SelectItem>
              <SelectItem value="ultra_luxury">{t('tools.remodeling.ultraLuxury')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">{t('tools.remodeling.areaToRemodel')}</label>
          <Input
            type="number"
            value={sqm}
            onChange={(e) => setSqm(Number(e.target.value))}
            min={0}
          />
        </div>

        <div className="pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground mb-1">{t('tools.remodeling.costRange')}</div>
          <div className="font-serif text-2xl font-semibold text-foreground">
            ${costMin.toLocaleString('en-US')} - ${costMax.toLocaleString('en-US')}
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{t('tools.remodeling.disclaimer')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ConstructionCalculator() {
  const { t } = useTranslation();
  const [tier, setTier] = useState<string>('mid');
  const [sqm, setSqm] = useState<number>(200);

  const rates: Record<string, { min: number; max: number }> = {
    mid: { min: 800, max: 1200 },
    high_end: { min: 1400, max: 2000 },
    ultra_luxury: { min: 2500, max: 4000 },
  };

  const rate = rates[tier];
  const costMin = sqm * rate.min;
  const costMax = sqm * rate.max;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-ocean/20 flex items-center justify-center">
            <HardHat className="w-5 h-5 text-ocean" />
          </div>
          <CardTitle className="font-serif">{t('tools.construction.title')}</CardTitle>
        </div>
        <CardDescription>{t('tools.construction.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">{t('tools.remodeling.qualityTier')}</label>
          <Select value={tier} onValueChange={setTier}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mid">{t('tools.construction.midRange')}</SelectItem>
              <SelectItem value="high_end">{t('tools.construction.highEnd')}</SelectItem>
              <SelectItem value="ultra_luxury">{t('tools.construction.ultraLuxury')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">{t('tools.construction.constructionSize')}</label>
          <Input
            type="number"
            value={sqm}
            onChange={(e) => setSqm(Number(e.target.value))}
            min={0}
          />
        </div>

        <div className="pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground mb-1">{t('tools.remodeling.costRange')}</div>
          <div className="font-serif text-2xl font-semibold text-foreground">
            ${costMin.toLocaleString('en-US')} - ${costMax.toLocaleString('en-US')}
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{t('tools.construction.disclaimer')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ToolsPage() {
  const { t } = useTranslation();

  return (
    <Layout>
      <LocaleSEO titleKey="seo.tools.title" descriptionKey="seo.tools.description" />
      {/* Header */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">{t('tools.title')}</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            {t('tools.description')}
          </p>
        </div>
      </section>

      {/* Calculators Grid */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <MortgageCalculator />
            <ClosingCostCalculator />
            <RemodelingCalculator />
            <ConstructionCalculator />
          </div>

          <div className="mt-14 p-8 bg-secondary rounded text-center">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
              {t('tools.needGuidance')}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              {t('tools.needGuidanceDesc')}
            </p>
            <Button asChild>
              <a href="/contact">{t('common.scheduleConsultation')}</a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
