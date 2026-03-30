import { motion } from "framer-motion";
import { Copy, Check, FileText, Lightbulb, MessageSquare, Share2, MousePointerClick, Users, Heading, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BriefingResultProps {
  briefing: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

const sectionIcons: Record<string, React.ReactNode> = {
  "título": <Heading className="h-5 w-5 text-primary" />,
  "público": <Users className="h-5 w-5 text-accent" />,
  "ideia": <Lightbulb className="h-5 w-5 text-primary" />,
  "criativa": <Lightbulb className="h-5 w-5 text-primary" />,
  "copy": <MessageSquare className="h-5 w-5 text-accent" />,
  "canais": <Share2 className="h-5 w-5 text-primary" />,
  "call": <MousePointerClick className="h-5 w-5 text-accent" />,
};

function getIcon(title: string) {
  const lower = title.toLowerCase();
  for (const [key, icon] of Object.entries(sectionIcons)) {
    if (lower.includes(key)) return icon;
  }
  return <FileText className="h-5 w-5 text-primary" />;
}

function parseSections(text: string) {
  const lines = text.split("\n");
  const sections: { title: string; content: string }[] = [];
  let current: { title: string; content: string } | null = null;

  for (const line of lines) {
    const headerMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headerMatch) {
      if (current) sections.push(current);
      current = { title: headerMatch[1].replace(/\*\*/g, "").trim(), content: "" };
    } else if (current) {
      current.content += line + "\n";
    } else {
      if (line.trim()) {
        current = { title: "Briefing", content: line + "\n" };
      }
    }
  }
  if (current) sections.push(current);
  return sections;
}

function renderContent(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return null;

  return trimmed.split("\n").map((line, i) => {
    const boldMatch = line.match(/^\*\*(.+?)\*\*:?\s*(.*)/);
    const numberedMatch = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*:?\s*(.*)/);
    const bulletMatch = line.match(/^[-•]\s+(.*)/);

    if (numberedMatch) {
      return (
        <div key={i} className="mb-3 last:mb-0">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold mr-2">
            {numberedMatch[1]}
          </span>
          <span className="font-semibold text-card-foreground">{numberedMatch[2]}</span>
          {numberedMatch[3] && <span className="text-muted-foreground"> {numberedMatch[3]}</span>}
        </div>
      );
    }

    if (boldMatch) {
      return (
        <div key={i} className="mb-2 last:mb-0">
          <span className="font-semibold text-card-foreground">{boldMatch[1]}</span>
          {boldMatch[2] && <span className="text-muted-foreground"> {boldMatch[2]}</span>}
        </div>
      );
    }

    if (bulletMatch) {
      return (
        <div key={i} className="mb-1.5 last:mb-0 flex gap-2">
          <span className="text-primary mt-1">•</span>
          <span className="text-muted-foreground">{bulletMatch[1]}</span>
        </div>
      );
    }

    if (!line.trim()) return null;

    return (
      <p key={i} className="text-muted-foreground mb-1.5 last:mb-0">{line}</p>
    );
  });
}

export default function BriefingResult({ briefing }: BriefingResultProps) {
  const [copied, setCopied] = useState(false);
  const sections = parseSections(briefing);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(briefing);
    setCopied(true);
    toast.success("Briefing copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground font-display">Briefing Gerado</h2>
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado!" : "Copiar tudo"}
        </Button>
      </div>

      <div className="space-y-4">
        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className="rounded-xl border border-border bg-card p-5 sm:p-6"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
              {getIcon(section.title)}
              <h3 className="font-semibold text-card-foreground font-display text-base">
                {section.title}
              </h3>
            </div>
            <div className="text-sm leading-relaxed">
              {renderContent(section.content)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Impacto da Ferramenta */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: sections.length * 0.08 }}
        className="rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6 mt-4"
      >
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-primary/20">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-card-foreground font-display text-base">
            Impacto da Ferramenta
          </h3>
        </div>
        <div className="text-sm leading-relaxed space-y-3">
          <div className="flex gap-2">
            <span className="text-primary font-bold">⏱</span>
            <div>
              <span className="font-semibold text-card-foreground">Tempo economizado:</span>
              <span className="text-muted-foreground"> Redução de até 70% no tempo de criação de briefings — de horas para minutos.</span>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="text-primary font-bold">🚀</span>
            <div>
              <span className="font-semibold text-card-foreground">Benefícios para o time:</span>
              <span className="text-muted-foreground"> Mais tempo para estratégia e criatividade, menos retrabalho e maior produtividade nas entregas de campanhas.</span>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="text-primary font-bold">🤝</span>
            <div>
              <span className="font-semibold text-card-foreground">Alinhamento entre equipes:</span>
              <span className="text-muted-foreground"> Briefings padronizados garantem que todos — criativos, mídia e gestores — partam da mesma base de informação, reduzindo ruídos e retrabalho.</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
