'use client'

import { useState } from 'react'
import { Calculator, DollarSign, FileText, RefreshCw, AlertCircle } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

// ─── Costa Rica transfer tax rates (2025) ──────────────────────────────────
// Base: 1.5% of fiscal value
// Fiscal stamps: 0.5% (approx)
// National Registry: ~$400 flat
// Notary fees: 1–1.25% typically
const TRANSFER_TAX_RATE   = 0.015  // 1.5%
const FISCAL_STAMP_RATE   = 0.005  // 0.5%
const NOTARY_RATE         = 0.0125 // 1.25%
const REGISTRY_FEE_USD    = 450    // flat

// ─── Static CRC exchange rate (update periodically) ────────────────────────
const USD_TO_CRC = 519.50

export default function HerramientasPage() {
  const { t, lang } = useI18n()

  return (
    <>
      {/* Header */}
      <section className="bg-[#2C2C2C] text-white py-16">
        <div className="container-wide">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">
            {lang === 'en' ? 'Tools & Calculators' : 'Herramientas y Calculadoras'}
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            {lang === 'en'
              ? 'Free tools to make informed real estate decisions in Costa Rica.'
              : 'Herramientas gratuitas para tomar decisiones inmobiliarias informadas en Costa Rica.'}
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MortgageCalculator lang={lang} />
            <RentalROICalculator lang={lang} />
            <TransferTaxCalculator lang={lang} />
            <CurrencyConverter lang={lang} />
          </div>

          {/* Disclaimer */}
          <div className="mt-10 p-4 rounded border border-border bg-secondary flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {lang === 'en'
                ? 'All calculations are estimates for informational purposes only. Consult a financial advisor before making investment decisions.'
                : 'Los cálculos son estimados con fines informativos únicamente. Consulte con un asesor financiero antes de tomar decisiones de inversión.'}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

// ─── Mortgage Calculator ────────────────────────────────────────────────────
function MortgageCalculator({ lang }: { lang: string }) {
  const [price, setPrice] = useState(500000)
  const [downPayment, setDownPayment] = useState(20)
  const [interestRate, setInterestRate] = useState(7.5)
  const [termYears, setTermYears] = useState(30)

  const loanAmount = price * (1 - downPayment / 100)
  const monthlyRate = interestRate / 100 / 12
  const numPayments = termYears * 12
  const monthlyPayment =
    monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1)
      : loanAmount / numPayments

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="card-elevated p-8">
      <CardHeader
        icon={<Calculator className="w-6 h-6 text-primary" />}
        title={lang === 'en' ? 'Mortgage Calculator' : 'Calculadora de Hipoteca'}
        subtitle={lang === 'en' ? 'Estimate your monthly payment' : 'Estime su pago mensual'}
      />
      <div className="space-y-4 mb-6">
        <CalcField label={lang === 'en' ? 'Property Price ($)' : 'Precio de la Propiedad ($)'} value={price} onChange={setPrice} step={10000} />
        <CalcField label={lang === 'en' ? 'Down Payment (%)' : 'Pago Inicial (%)'} value={downPayment} onChange={setDownPayment} min={0} max={100} step={1} />
        <CalcField label={lang === 'en' ? 'Annual Interest Rate (%)' : 'Tasa de Interés Anual (%)'} value={interestRate} onChange={setInterestRate} step={0.1} />
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {lang === 'en' ? 'Term' : 'Plazo'}
          </label>
          <select
            value={termYears}
            onChange={(e) => setTermYears(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          >
            {[10, 15, 20, 25, 30].map((y) => (
              <option key={y} value={y}>{y} {lang === 'en' ? 'years' : 'años'}</option>
            ))}
          </select>
        </div>
      </div>
      <ResultBox>
        <ResultRow label={lang === 'en' ? 'Monthly Payment' : 'Pago Mensual'} value={fmt(monthlyPayment)} large />
        <ResultRow label={lang === 'en' ? 'Loan Amount' : 'Monto del Préstamo'} value={fmt(loanAmount)} />
        <ResultRow label={lang === 'en' ? 'Total Interest' : 'Interés Total'} value={fmt(monthlyPayment * numPayments - loanAmount)} />
        <ResultRow label={lang === 'en' ? 'Total to Pay' : 'Total a Pagar'} value={fmt(monthlyPayment * numPayments)} />
      </ResultBox>
    </div>
  )
}

// ─── Rental ROI Calculator ──────────────────────────────────────────────────
function RentalROICalculator({ lang }: { lang: string }) {
  const [purchasePrice, setPurchasePrice] = useState(300000)
  const [monthlyRent, setMonthlyRent] = useState(2000)
  const [annualExpenses, setAnnualExpenses] = useState(5000)
  const [vacancyRate, setVacancyRate] = useState(10)

  const annualRent = monthlyRent * 12 * (1 - vacancyRate / 100)
  const noi = annualRent - annualExpenses
  const capRate = purchasePrice > 0 ? (noi / purchasePrice) * 100 : 0
  const grossYield = purchasePrice > 0 ? ((monthlyRent * 12) / purchasePrice) * 100 : 0

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="card-elevated p-8">
      <CardHeader
        icon={<DollarSign className="w-6 h-6 text-primary" />}
        title={lang === 'en' ? 'Rental ROI' : 'ROI de Alquiler'}
        subtitle={lang === 'en' ? 'Calculate your investment return' : 'Calcule el retorno de su inversión'}
      />
      <div className="space-y-4 mb-6">
        <CalcField label={lang === 'en' ? 'Purchase Price ($)' : 'Precio de Compra ($)'} value={purchasePrice} onChange={setPurchasePrice} step={10000} />
        <CalcField label={lang === 'en' ? 'Monthly Rent ($)' : 'Alquiler Mensual ($)'} value={monthlyRent} onChange={setMonthlyRent} step={100} />
        <CalcField label={lang === 'en' ? 'Annual Expenses ($)' : 'Gastos Anuales ($)'} value={annualExpenses} onChange={setAnnualExpenses} step={500} />
        <CalcField label={lang === 'en' ? 'Vacancy Rate (%)' : 'Tasa de Vacancia (%)'} value={vacancyRate} onChange={setVacancyRate} min={0} max={100} step={1} />
      </div>
      <ResultBox>
        <ResultRow label="Cap Rate" value={`${capRate.toFixed(2)}%`} large />
        <ResultRow label={lang === 'en' ? 'Gross Yield' : 'Rendimiento Bruto'} value={`${grossYield.toFixed(2)}%`} />
        <ResultRow label={lang === 'en' ? 'Annual Net Income' : 'Ingreso Neto Anual'} value={fmt(noi)} />
        <ResultRow label={lang === 'en' ? 'Annual Gross Income' : 'Ingreso Bruto Anual'} value={fmt(annualRent)} />
      </ResultBox>
    </div>
  )
}

// ─── Transfer Tax Calculator ────────────────────────────────────────────────
function TransferTaxCalculator({ lang }: { lang: string }) {
  const [salePrice, setSalePrice] = useState(400000)

  const transferTax  = salePrice * TRANSFER_TAX_RATE
  const fiscalStamps = salePrice * FISCAL_STAMP_RATE
  const notaryFees   = salePrice * NOTARY_RATE
  const total        = transferTax + fiscalStamps + notaryFees + REGISTRY_FEE_USD

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
  const pct = (n: number, of: number) =>
    of > 0 ? ` (${((n / of) * 100).toFixed(2)}%)` : ''

  return (
    <div className="card-elevated p-8">
      <CardHeader
        icon={<FileText className="w-6 h-6 text-primary" />}
        title={lang === 'en' ? 'Transfer Tax Calculator' : 'Calculadora de Traspaso'}
        subtitle={lang === 'en' ? 'Costa Rica property transfer costs' : 'Costos de traspaso en Costa Rica'}
      />
      <div className="space-y-4 mb-6">
        <CalcField
          label={lang === 'en' ? 'Sale Price ($)' : 'Precio de Venta ($)'}
          value={salePrice}
          onChange={setSalePrice}
          step={10000}
        />
        <div className="p-3 rounded bg-secondary text-xs text-muted-foreground space-y-1">
          <p>{lang === 'en' ? '• Transfer tax: 1.5% of sale value' : '• Impuesto de traspaso: 1.5% del valor de venta'}</p>
          <p>{lang === 'en' ? '• Fiscal stamps: 0.5%' : '• Timbres fiscales: 0.5%'}</p>
          <p>{lang === 'en' ? '• Notary fees: ~1.25%' : '• Honorarios notariales: ~1.25%'}</p>
          <p>{lang === 'en' ? '• Registry fees: ~$450 (flat)' : '• Gastos de registro: ~$450 (fijo)'}</p>
        </div>
      </div>
      <ResultBox>
        <ResultRow label={lang === 'en' ? 'Total Closing Costs' : 'Total Costos de Cierre'} value={`${fmt(total)}${pct(total, salePrice)}`} large />
        <ResultRow label={lang === 'en' ? 'Transfer Tax (1.5%)' : 'Imp. Traspaso (1.5%)'} value={fmt(transferTax)} />
        <ResultRow label={lang === 'en' ? 'Fiscal Stamps (0.5%)' : 'Timbres Fiscales (0.5%)'} value={fmt(fiscalStamps)} />
        <ResultRow label={lang === 'en' ? 'Notary Fees (~1.25%)' : 'Honorarios Notariales (~1.25%)'} value={fmt(notaryFees)} />
        <ResultRow label={lang === 'en' ? 'Registry Fees' : 'Gastos de Registro'} value={fmt(REGISTRY_FEE_USD)} />
      </ResultBox>
    </div>
  )
}

// ─── Currency Converter ─────────────────────────────────────────────────────
function CurrencyConverter({ lang }: { lang: string }) {
  const [amount, setAmount] = useState(100000)
  const [direction, setDirection] = useState<'usd_to_crc' | 'crc_to_usd'>('usd_to_crc')

  const result = direction === 'usd_to_crc'
    ? amount * USD_TO_CRC
    : amount / USD_TO_CRC

  const fmtUSD = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)
  const fmtCRC = (n: number) =>
    new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="card-elevated p-8">
      <CardHeader
        icon={<RefreshCw className="w-6 h-6 text-primary" />}
        title={lang === 'en' ? 'Currency Converter' : 'Convertidor de Moneda'}
        subtitle={lang === 'en' ? 'USD ↔ Costa Rican Colón' : 'Dólar ↔ Colón Costarricense'}
      />
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {lang === 'en' ? 'Direction' : 'Dirección'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['usd_to_crc', 'crc_to_usd'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDirection(d)}
                className={`py-2 rounded text-sm font-medium transition-colors ${
                  direction === d
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}
              >
                {d === 'usd_to_crc' ? 'USD → CRC' : 'CRC → USD'}
              </button>
            ))}
          </div>
        </div>
        <CalcField
          label={direction === 'usd_to_crc'
            ? (lang === 'en' ? 'Amount in USD ($)' : 'Monto en USD ($)')
            : (lang === 'en' ? 'Amount in CRC (₡)' : 'Monto en CRC (₡)')}
          value={amount}
          onChange={setAmount}
          step={direction === 'usd_to_crc' ? 1000 : 100000}
        />
        <p className="text-xs text-muted-foreground">
          {lang === 'en' ? `Reference rate: $1 USD = ₡${USD_TO_CRC.toFixed(2)} CRC` : `Tipo de cambio referencial: $1 USD = ₡${USD_TO_CRC.toFixed(2)} CRC`}
        </p>
      </div>
      <ResultBox>
        <ResultRow
          label={lang === 'en' ? 'Converted Amount' : 'Monto Convertido'}
          value={direction === 'usd_to_crc' ? fmtCRC(result) : fmtUSD(result)}
          large
        />
        <ResultRow
          label={lang === 'en' ? 'Input' : 'Entrada'}
          value={direction === 'usd_to_crc' ? fmtUSD(amount) : fmtCRC(amount)}
        />
      </ResultBox>
    </div>
  )
}

// ─── Shared sub-components ──────────────────────────────────────────────────
function CardHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="font-serif text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}

function ResultBox({ children }: { children: React.ReactNode }) {
  return <div className="bg-primary/5 rounded-lg p-4 grid grid-cols-2 gap-3">{children}</div>
}

function ResultRow({ label, value, large }: { label: string; value: string; large?: boolean }) {
  return (
    <div className={large ? 'col-span-2 border-b border-primary/10 pb-3 mb-1' : ''}>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`font-semibold ${large ? 'font-serif text-2xl text-primary' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  )
}

function CalcField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full px-4 py-2.5 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
      />
    </div>
  )
}
