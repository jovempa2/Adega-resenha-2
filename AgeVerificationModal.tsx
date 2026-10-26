import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

export const AgeVerificationModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('adega_resenha_age_verified');
    if (!verified) {
      setIsOpen(true);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem('adega_resenha_age_verified', 'true');
    setIsOpen(false);
  };

  const handleReject = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/70 border border-rose-800/80 flex items-center justify-center mx-auto text-rose-500 shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-500 block mb-1">
            Verificação de Idade Legal
          </span>
          <h3 className="text-2xl font-extrabold text-white font-['Outfit']">
            VOCÊ TEM MAIS DE 18 ANOS?
          </h3>
          <p className="mt-3 text-xs sm:text-sm text-zinc-400 leading-relaxed">
            O conteúdo deste site destina-se exclusivamente a maiores de 18 anos. A venda e o consumo de bebidas alcoólicas e produtos fumígenos são proibidos para menores (Lei 8.069/1990).
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleConfirm}
            className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-xl shadow-rose-950/60 active:scale-[0.99]"
          >
            SIM, TENHO 18 ANOS OU MAIS
          </button>

          <button
            onClick={handleReject}
            className="w-full py-3 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 transition-colors"
          >
            NÃO, SOU MENOR DE IDADE
          </button>
        </div>
      </div>
    </div>
  );
};
