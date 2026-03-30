import { useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import BriefingForm, { type BriefingFormData } from "@/components/BriefingForm";
import BriefingResult from "@/components/BriefingResult";

export default function Index() {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFormData, setLastFormData] = useState<BriefingFormData | null>(null);

  const handleGenerate = async (data: BriefingFormData) => {
    setIsLoading(true);
    setBriefing(null);
    setLastFormData(data);

    try {
      const { data: result, error } = await supabase.functions.invoke("generate-briefing", {
        body: data,
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);

      setBriefing(result.briefing);
      toast.success("Briefing gerado com sucesso!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao gerar briefing. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (lastFormData) handleGenerate(lastFormData);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground font-display leading-tight">
              AI Briefing Generator
            </h1>
            <p className="text-xs text-muted-foreground">Crie briefings de campanha em segundos</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="py-10 sm:py-14 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-display mb-3">
            Briefings inteligentes para suas campanhas
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
            Preencha as informações da campanha e deixe a IA criar um briefing
            completo e profissional para seu time de marketing.
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        <BriefingForm onSubmit={handleGenerate} isLoading={isLoading} />

        {briefing && <BriefingResult briefing={briefing} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Feito com IA · AI Briefing Generator
        </p>
      </footer>
    </div>
  );
}
