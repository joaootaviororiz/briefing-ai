import { motion } from "framer-motion";
import { Copy, Check, FileText, Lightbulb, MessageSquare, Share2, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BriefingResultProps {
  briefing: string;
}

const sectionIcons: Record<string, React.ReactNode> = {
  "resumo": <FileText className="h-5 w-5 text-primary" />,
  "ideia": <Lightbulb className="h-5 w-5 text-accent" />,
  "abordagem": <Share2 className="h-5 w-5 text-primary" />,
  "copy": <MessageSquare className="h-5 w-5 text-accent" />,
  "canais": <LayoutGrid className="h-5 w-5 text-primary" />,
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
      current = { title: headerMatch[1].replace(/\*\*/g, ""), content: "" };
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground font-display">Briefing Gerado</h2>
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado!" : "Copiar"}
        </Button>
      </div>

      <div className="space-y-4">
        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className="rounded-xl border border-border bg-card p-5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              {getIcon(section.title)}
              <h3 className="font-semibold text-card-foreground font-display">{section.title}</h3>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {section.content.trim()}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
