'use client'

import { useState } from 'react'
import { Calculator, DollarSign, HardHat, AlertCircle } from 'lucide-react'

export default function HerramientasPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">
            Herramientas y Calculadoras
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            Calcule pagos de hipoteca, rendimiento de alquiler y más.
            Herramientas gratuitas para tomar decisiones inmobiliarias informadas.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MortgageCalculator />
            <RentalROICalculator />
          </div>

          {/* Disclaimer */}
          <div className="mt-10 p-4 rounded border border-border bg-secondary flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Los cálculos son estimados con fines informativos únicamente. Consulte con un
              asesor financiero antes de tomar decisiones de inversión.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

function MortgageCalculator() {
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
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
          <Calculator className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground">Calculadora de Hipoteca</h2>
          <p className="text-sm text-muted-foreground">Estime su pago mensual</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <CalcField
          label="Precio de la Propiedad ($)"
          value={price}
          onChange={setPrice}
          min={0}
          step={10000}
        />
        <CalcField
          label="Pago Inicial (%)"
          value={downPayment}
          onChange={setDownPayment}
          min={0}
          max={100}
          step={1}
        />
        <CalcField
          label="Tasa de Interés Anual (%)"
          value={interestRate}
          onChange={setInterestRate}
          min={0}
          step={0.1}
        />
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Plazo</label>
          <select
            value={termYears}
            onChange={(e) => setTermYears(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          >
            {[15, 20, 25, 30].map((y) => (
              <option key={y} value={y}>{y} años</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-primary/5 rounded p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Pago Mensual Estimado</p>
        <p className="font-serif text-3xl font-semibold text-primary">{fmt(monthlyPayment)}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Monto del préstamo</p>
            <p className="font-medium text-foreground">{fmt(loanAmount)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total a pagar</p>
            <p className="font-medium text-foreground">{fmt(monthlyPayment * numPayments)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function RentalROICalculator() {
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
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground">ROI de Alquiler</h2>
          <p className="text-sm text-muted-foreground">Calcule el retorno de su inversión</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <CalcField
          label="Precio de Compra ($)"
          value={purchasePrice}
          onChange={setPurchasePrice}
          min={0}
          step={10000}
        />
        <CalcField
          label="Alquiler Mensual ($)"
          value={monthlyRent}
          onChange={setMonthlyRent}
          min={0}
          step={100}
        />
        <CalcField
          label="Gastos Anuales ($)"
          value={annualExpenses}
          onChange={setAnnualExpenses}
          min={0}
          step={500}
        />
        <CalcField
          label="Tasa de Vacancia (%)"
          value={vacancyRate}
          onChange={setVacancyRate}
          min={0}
          max={100}
          step={1}
        />
      </div>

      <div className="bg-primary/5 rounded p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Cap Rate</p>
            <p className="font-serif text-2xl font-semibold text-primary">{capRate.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Rendimiento Bruto</p>
            <p className="font-serif text-2xl font-semibold text-foreground">{grossYield.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Ingreso neto anual</p>
            <p className="font-medium text-foreground">{fmt(noi)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Ingreso bruto anual</p>
            <p className="font-medium text-foreground">{fmt(annualRent)}</p>
          </div>
        </div>
      </div>
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
