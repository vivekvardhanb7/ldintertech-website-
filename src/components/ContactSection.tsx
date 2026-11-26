import { useEffect, useState } from 'react';
import { CheckCircle2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { LD_INTERTECH_BRAND } from '../data/vendingCatalog';
import {
  PRODUCT_CATEGORIES,
  type ProductCategoryOption,
  type ValidationErrors,
  validateConsultationInput,
} from '../utils/validation';

interface ContactSectionProps {
  preselectedCategory: ProductCategoryOption;
}

interface SubmissionReceipt {
  referenceId: string;
  submittedAt: string;
  productCategory: string;
}

export function ContactSection({ preselectedCategory }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [productCategory, setProductCategory] =
    useState<ProductCategoryOption>(preselectedCategory);
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(null);

  useEffect(() => {
    setProductCategory(preselectedCategory);
  }, [preselectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const check = validateConsultationInput({
      name,
      company,
      email,
      phone,
      productCategory,
      location,
      message,
    });

    if (!check.valid) {
      setErrors(check.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(check.sanitized),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        if (data.errors) setErrors(data.errors);
        setServerError(
          data.error || 'Could not process your request. Please check your entries and retry.'
        );
        return;
      }

      setReceipt({
        referenceId: data.referenceId,
        submittedAt: data.submittedAt,
        productCategory: data.productCategory,
      });
    } catch {
      setServerError(
        'Network error reaching the consultation server. Please try again or email info@ldintertech.com.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-28 bg-[#10100F] border-b border-white/10">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Headline & Verified Official Contact Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#9ECFFA] font-medium">
                Contact & Consultation
              </p>
              <h2
                className="font-display text-3xl sm:text-5xl font-semibold text-[#FCFCFC] leading-tight"
                style={{ textWrap: 'balance' }}
              >
                Let’s Build the Next Generation of Vending.
              </h2>
              <p className="text-base text-[#B8B8B4] leading-relaxed">
                Looking for smarter vending solutions for your business? Let’s discuss your requirements.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#161615] border border-white/10 space-y-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#A374FF]">
                Official LD InterTech Innovation Contact
              </div>

              <div className="space-y-4 text-sm">
                <a
                  href={`mailto:${LD_INTERTECH_BRAND.email}`}
                  className="flex items-start gap-3 text-[#FCFCFC] hover:text-[#A374FF] transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#A374FF] shrink-0 mt-1" />
                  <span>{LD_INTERTECH_BRAND.email}</span>
                </a>

                <a
                  href={`tel:${LD_INTERTECH_BRAND.phone.replace(/\s+/g, '')}`}
                  className="flex items-start gap-3 text-[#FCFCFC] hover:text-[#A374FF] transition-colors font-mono-tabular"
                >
                  <Phone className="w-4 h-4 text-[#A374FF] shrink-0 mt-1" />
                  <span>{LD_INTERTECH_BRAND.phone}</span>
                </a>

                <div className="flex items-start gap-3 text-[#B8B8B4]">
                  <MapPin className="w-4 h-4 text-[#A374FF] shrink-0 mt-1" />
                  <span className="leading-relaxed">{LD_INTERTECH_BRAND.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Validated Lead Capture Form */}
          <div className="lg:col-span-7">
            {receipt ? (
              <div
                className="p-8 sm:p-10 rounded-2xl bg-[#161615] border border-[#7CE3B4]/50 space-y-5"
                data-testid="consultation-receipt"
              >
                <div className="inline-flex items-center gap-2 text-[#7CE3B4] font-medium text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Consultation Request Logged</span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-[#FCFCFC]">
                  Thank you. Our team has received your inquiry.
                </h3>
                <p className="text-sm text-[#B8B8B4] leading-relaxed">
                  Your inquiry for <strong className="text-[#FCFCFC]">{receipt.productCategory}</strong> has been recorded on our server. Keep your reference ID for follow-up communication.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#10100F] border border-white/10 text-xs">
                  <div>
                    <div className="text-[#8C8C88]">Reference ID</div>
                    <div className="font-mono-tabular text-sm font-semibold text-[#FCFCFC] mt-1">
                      {receipt.referenceId}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#8C8C88]">Recorded Timestamp</div>
                    <div className="font-mono-tabular text-sm text-[#FCFCFC] mt-1">
                      {new Date(receipt.submittedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReceipt(null);
                    setName('');
                    setCompany('');
                    setEmail('');
                    setPhone('');
                    setLocation('');
                    setMessage('');
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-[#FCFCFC] border border-white/20 hover:border-[#A374FF] rounded-lg cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="p-6 sm:p-10 rounded-2xl bg-[#161615] border border-white/10 space-y-5"
              >
                {serverError && (
                  <div
                    role="alert"
                    className="p-4 rounded-lg bg-red-950/60 border border-red-400/50 text-sm text-red-200"
                  >
                    {serverError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-medium text-[#D0D0CC] mb-2">
                      Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="w-full px-4 py-3 rounded-lg bg-[#10100F] border border-white/15 text-sm text-[#FCFCFC] placeholder:text-[#666662] focus:outline-none focus:border-[#A374FF]"
                    />
                    {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-company" className="block text-xs font-medium text-[#D0D0CC] mb-2">
                      Company *
                    </label>
                    <input
                      id="contact-company"
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Organization or venue name"
                      className="w-full px-4 py-3 rounded-lg bg-[#10100F] border border-white/15 text-sm text-[#FCFCFC] placeholder:text-[#666662] focus:outline-none focus:border-[#A374FF]"
                    />
                    {errors.company && <p className="mt-1.5 text-xs text-red-400">{errors.company}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-medium text-[#D0D0CC] mb-2">
                      Email *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full px-4 py-3 rounded-lg bg-[#10100F] border border-white/15 text-sm text-[#FCFCFC] placeholder:text-[#666662] focus:outline-none focus:border-[#A374FF]"
                    />
                    {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-medium text-[#D0D0CC] mb-2">
                      Phone
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98480 00000"
                      className="w-full px-4 py-3 rounded-lg bg-[#10100F] border border-white/15 text-sm text-[#FCFCFC] placeholder:text-[#666662] focus:outline-none focus:border-[#A374FF]"
                    />
                    {errors.phone && <p className="mt-1.5 text-xs text-red-400">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-category" className="block text-xs font-medium text-[#D0D0CC] mb-2">
                      Product Category *
                    </label>
                    <select
                      id="contact-category"
                      value={productCategory}
                      onChange={(e) =>
                        setProductCategory(e.target.value as ProductCategoryOption)
                      }
                      className="w-full px-4 py-3 rounded-lg bg-[#10100F] border border-white/15 text-sm text-[#FCFCFC] focus:outline-none focus:border-[#A374FF]"
                    >
                      {PRODUCT_CATEGORIES.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {errors.productCategory && (
                      <p className="mt-1.5 text-xs text-red-400">{errors.productCategory}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contact-location" className="block text-xs font-medium text-[#D0D0CC] mb-2">
                      Location *
                    </label>
                    <input
                      id="contact-location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                      className="w-full px-4 py-3 rounded-lg bg-[#10100F] border border-white/15 text-sm text-[#FCFCFC] placeholder:text-[#666662] focus:outline-none focus:border-[#A374FF]"
                    />
                    {errors.location && (
                      <p className="mt-1.5 text-xs text-red-400">{errors.location}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-medium text-[#D0D0CC] mb-2">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your venue type, estimated number of units, and deployment timeline..."
                    className="w-full px-4 py-3 rounded-lg bg-[#10100F] border border-white/15 text-sm text-[#FCFCFC] placeholder:text-[#666662] focus:outline-none focus:border-[#A374FF]"
                  />
                  {errors.message && (
                    <p className="mt-1.5 text-xs text-red-400">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-[#10100F] bg-[#A374FF] hover:bg-[#FCFCFC] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting Inquiry...' : 'Request a Consultation'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
