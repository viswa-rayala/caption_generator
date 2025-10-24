import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Copy, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const CaptionGenerator = () => {
  const [description, setDescription] = useState("");
  const [captions, setCaptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateCaptions = async () => {
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please describe your travel moment first!",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-captions", {
        body: { description },
      });

      if (error) throw error;

      setCaptions(data.captions || []);
      toast({
        title: "Captions generated!",
        description: "Your travel captions are ready.",
      });
    } catch (error) {
      console.error("Error generating captions:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate captions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Caption copied to clipboard.",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8">
      <Card className="p-6 space-y-4 bg-card/80 backdrop-blur">
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Describe your travel moment
          </label>
          <Textarea
            id="description"
            placeholder="E.g., Sunset at Santorini with white buildings and blue domes, feeling peaceful and inspired..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>
        <Button
          onClick={generateCaptions}
          disabled={loading}
          size="lg"
          className="w-full"
          variant="hero"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles />
              Generate Captions
            </>
          )}
        </Button>
      </Card>

      {captions.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-xl font-semibold">Your Travel Captions</h3>
          <div className="grid gap-4">
            {captions.map((caption, index) => (
              <Card
                key={index}
                className="p-4 space-y-3 hover:shadow-[var(--shadow-warm)] transition-[var(--transition-smooth)]"
              >
                <p className="text-foreground leading-relaxed">{caption}</p>
                <Button
                  onClick={() => copyToClipboard(caption)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Copy />
                  Copy Caption
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
