import { HelpCircle, X, Lightbulb, Target, ShieldCheck } from 'lucide-react';

export interface Explanation {
  /** Apa parameter ini sebenarnya. */
  what: string;
  /** Apa yang dihasilkannya pada keluaran simulator. */
  produces: string[];
  /** Cara memakainya untuk menekan susut pembusukan. */
  avoid: string[];
}

/**
 * Tombol tanya pada baris parameter.
 *
 * Sengaja dipisah dari panelnya: tombol hidup di dalam baris flex yang sempit,
 * sedangkan panel harus melebar penuh di bawah baris tersebut.
 */
export function ExplainToggle({
  open,
  onToggle,
  label,
}: {
  open: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={`${open ? 'Tutup' : 'Buka'} penjelasan ${label}`}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
        open ? 'bg-[#1B5E20] text-white' : 'bg-[#E8F5E9] text-[#1B5E20] hover:bg-[#A5D6A7]'
      }`}
    >
      <HelpCircle className="h-3.5 w-3.5" />
      {open ? 'Tutup' : 'Apa ini?'}
    </button>
  );
}

/**
 * Panel penjelasan satu parameter simulator: apa parameternya, apa yang
 * dihasilkannya pada keluaran, dan bagaimana menekan susut lewat parameter itu.
 */
export function ExplainPanel({
  open,
  title,
  explanation,
  onClose,
}: {
  open: boolean;
  title: string;
  explanation: Explanation;
  onClose: () => void;
}) {
  return (
    <div
      className={`overflow-hidden transition-all duration-500 ${
        open ? 'mt-3 max-h-[760px] opacity-100' : 'max-h-0 opacity-0'
      }`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
      aria-hidden={!open}
    >
      <div className="rounded-3xl border border-[#1B5E20]/20 bg-gradient-to-br from-[#F3FAF4] to-[#E8F5E9] p-5">
        <div className="flex items-start justify-between gap-3">
          <h4 className="flex items-center gap-2 font-display text-base font-bold text-[#0D3311]">
            <Lightbulb className="h-4 w-4 shrink-0 text-[#B9A24F]" />
            {title}
          </h4>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup penjelasan"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-[#4B6149] transition-colors hover:bg-[#A5D6A7]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[#31462F]">{explanation.what}</p>

        <div className="mt-4 rounded-2xl bg-white/70 p-4">
          <h5 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1B5E20]">
            <Target className="h-3.5 w-3.5" />
            Menggerakkan angka ini
          </h5>
          <ul className="mt-2 space-y-1.5">
            {explanation.produces.map((p) => (
              <li key={p} className="flex gap-2 text-sm leading-relaxed text-[#31462F]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#66BB6A]" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3 rounded-2xl border border-[#D3BE6D]/50 bg-[#FBF6E4] p-4">
          <h5 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8A7420]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Cara menekan susut lewat parameter ini
          </h5>
          <ul className="mt-2 space-y-1.5">
            {explanation.avoid.map((p) => (
              <li key={p} className="flex gap-2 text-sm leading-relaxed text-[#6B5A1E]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D3BE6D]" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
