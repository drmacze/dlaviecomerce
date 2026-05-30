import { Component, ErrorInfo, ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export class DlavieErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || 'Terjadi error pada halaman.' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dlavie-alert', { detail: { tone: 'error', title: 'Page Error', message: error.message || 'Komponen gagal dimuat.' } }));
      console.error('[DLAVIE_ERROR_BOUNDARY]', error, info.componentStack);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="min-h-screen bg-[#f4f8ed] p-4 text-slate-950">
        <section className="mx-auto grid min-h-[90vh] max-w-3xl place-items-center">
          <article className="overflow-hidden rounded-[2rem] bg-white p-6 text-center shadow-[0_28px_85px_rgba(15,23,42,.16)] ring-1 ring-black/5">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-500 text-2xl font-black text-white">!</div>
            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.28em] text-red-500">DLAVIE RECOVERY</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Halaman perlu dimuat ulang.</h1>
            <p className="mt-3 text-sm font-bold leading-6 text-slate-500">{this.state.message || 'Terjadi kesalahan tak terduga. Data aman, silakan refresh.'}</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button onClick={() => window.location.reload()} className="rounded-full bg-[#dfff4f] px-5 py-3 text-sm font-black text-slate-950">Refresh Halaman</button>
              <a href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">Ke Dashboard</a>
            </div>
          </article>
        </section>
      </main>
    );
  }
}
