import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BriefingFormProps {
  onSubmit: (data: BriefingFormData) => void;
  isLoading: boolean;
}

export interface BriefingFormData {
  productName: string;
  targetAudience: string;
  campaignObjective: string;
  toneOfVoice: string;
  mainChannel: string;
}

const tones = ["Formal", "Jovem", "Descontraído", "Inspirador", "Técnico", "Divertido"];
const channels = ["Instagram", "Google Ads", "Email Marketing", "TikTok", "LinkedIn", "YouTube", "Facebook Ads"];

export default function BriefingForm({ onSubmit, isLoading }: BriefingFormProps) {
  const [form, setForm] = useState<BriefingFormData>({
    productName: "",
    targetAudience: "",
    campaignObjective: "",
    toneOfVoice: "",
    mainChannel: "",
  });

  const isValid = Object.values(form).every((v) => v.trim() !== "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onSubmit(form);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-6 sm:p-8"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-card-foreground font-display">Dados da Campanha</h2>
        <p className="text-sm text-muted-foreground mt-1">Preencha os campos para gerar seu briefing com IA</p>
      </div>

      <div className="space-y-5">
        <div>
          <Label htmlFor="product" className="text-card-foreground">Produto ou Serviço</Label>
          <Input
            id="product"
            placeholder="Ex: App de meditação"
            value={form.productName}
            onChange={(e) => setForm({ ...form, productName: e.target.value })}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="audience" className="text-card-foreground">Público-alvo</Label>
          <Input
            id="audience"
            placeholder="Ex: Mulheres de 25-40 anos interessadas em bem-estar"
            value={form.targetAudience}
            onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="objective" className="text-card-foreground">Objetivo da Campanha</Label>
          <Input
            id="objective"
            placeholder="Ex: Aumentar downloads do app em 30%"
            value={form.campaignObjective}
            onChange={(e) => setForm({ ...form, campaignObjective: e.target.value })}
            className="mt-1.5"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <Label className="text-card-foreground">Tom de Voz</Label>
            <Select value={form.toneOfVoice} onValueChange={(v) => setForm({ ...form, toneOfVoice: v })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {tones.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-card-foreground">Canal Principal</Label>
            <Select value={form.mainChannel} onValueChange={(v) => setForm({ ...form, mainChannel: v })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {channels.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full mt-8 h-12 text-base font-semibold font-display"
        style={{ background: isValid && !isLoading ? "var(--gradient-primary)" : undefined }}
      >
        {isLoading ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Gerando briefing...</>
        ) : (
          <><Sparkles className="mr-2 h-5 w-5" /> Gerar Briefing</>
        )}
      </Button>
    </motion.form>
  );
}
