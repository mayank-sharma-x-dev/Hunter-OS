import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Beef, Fish, Egg, Leaf, Wheat, Milk, Star, 
  ChevronDown, ChevronUp, Sparkles, Target, Zap
} from "lucide-react";
import { soundManager } from "@/lib/sounds";

interface ProteinSource {
  name: string;
  protein: number; // per 100g
  calories: number;
  category: 'meat' | 'fish' | 'dairy' | 'plant' | 'supplement';
  quality: 'complete' | 'incomplete';
  tips: string;
  icon: React.ElementType;
  color: string;
}

const PROTEIN_SOURCES: ProteinSource[] = [
  { 
    name: 'Chicken Breast', 
    protein: 31, 
    calories: 165, 
    category: 'meat', 
    quality: 'complete',
    tips: 'Best lean protein. Grill or bake for optimal results.',
    icon: Beef,
    color: 'destructive'
  },
  { 
    name: 'Salmon', 
    protein: 20, 
    calories: 208, 
    category: 'fish', 
    quality: 'complete',
    tips: 'Rich in omega-3. Aim for 2-3 servings per week.',
    icon: Fish,
    color: 'secondary'
  },
  { 
    name: 'Eggs', 
    protein: 13, 
    calories: 155, 
    category: 'dairy', 
    quality: 'complete',
    tips: 'Complete protein with all amino acids. Eat whole eggs.',
    icon: Egg,
    color: 'gold'
  },
  { 
    name: 'Greek Yogurt', 
    protein: 10, 
    calories: 59, 
    category: 'dairy', 
    quality: 'complete',
    tips: 'Great for snacks. Choose plain, add fruit yourself.',
    icon: Milk,
    color: 'primary'
  },
  { 
    name: 'Tuna', 
    protein: 29, 
    calories: 132, 
    category: 'fish', 
    quality: 'complete',
    tips: 'High protein, low fat. Limit to 2-3 cans/week.',
    icon: Fish,
    color: 'secondary'
  },
  { 
    name: 'Lentils', 
    protein: 9, 
    calories: 116, 
    category: 'plant', 
    quality: 'incomplete',
    tips: 'Combine with rice for complete protein.',
    icon: Leaf,
    color: 'accent'
  },
  { 
    name: 'Quinoa', 
    protein: 4.4, 
    calories: 120, 
    category: 'plant', 
    quality: 'complete',
    tips: 'Rare complete plant protein. Great rice substitute.',
    icon: Wheat,
    color: 'gold'
  },
  { 
    name: 'Cottage Cheese', 
    protein: 11, 
    calories: 98, 
    category: 'dairy', 
    quality: 'complete',
    tips: 'Slow-digesting casein. Perfect before bed.',
    icon: Milk,
    color: 'primary'
  },
  { 
    name: 'Turkey Breast', 
    protein: 29, 
    calories: 135, 
    category: 'meat', 
    quality: 'complete',
    tips: 'Leaner than chicken. Great for meal prep.',
    icon: Beef,
    color: 'destructive'
  },
  { 
    name: 'Tofu', 
    protein: 8, 
    calories: 76, 
    category: 'plant', 
    quality: 'complete',
    tips: 'Press well before cooking for better texture.',
    icon: Leaf,
    color: 'accent'
  },
  { 
    name: 'Whey Protein', 
    protein: 80, 
    calories: 400, 
    category: 'supplement', 
    quality: 'complete',
    tips: 'Fast absorbing. Best post-workout.',
    icon: Zap,
    color: 'primary'
  },
  { 
    name: 'Beef (Lean)', 
    protein: 26, 
    calories: 250, 
    category: 'meat', 
    quality: 'complete',
    tips: 'High in creatine and iron. Choose 93% lean or higher.',
    icon: Beef,
    color: 'destructive'
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Star },
  { id: 'meat', label: 'Meat', icon: Beef },
  { id: 'fish', label: 'Fish', icon: Fish },
  { id: 'dairy', label: 'Dairy', icon: Milk },
  { id: 'plant', label: 'Plant', icon: Leaf },
];

export const ProteinFoodGuide = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const filteredSources = selectedCategory === 'all' 
    ? PROTEIN_SOURCES 
    : PROTEIN_SOURCES.filter(s => s.category === selectedCategory);

  const toggleExpand = (name: string) => {
    soundManager.playClick();
    setExpandedItem(expandedItem === name ? null : name);
  };

  return (
    <Card className="relative overflow-hidden border-accent/30 bg-gradient-to-br from-card/95 via-card/90 to-accent/5 backdrop-blur-xl shadow-2xl">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-primary/10 rounded-full blur-2xl animate-pulse-glow [animation-delay:2s]" />
      </div>

      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="font-game text-lg flex items-center gap-2 text-accent">
          <div className="p-2 rounded-lg bg-accent/20 border border-accent/30">
            <Beef className="w-5 h-5" />
          </div>
          PROTEIN GUIDE
          <Sparkles className="w-4 h-4 text-gold ml-auto animate-pulse" />
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {/* Category Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => {
                soundManager.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`text-xs shrink-0 ${
                selectedCategory === cat.id 
                  ? 'bg-accent text-accent-foreground' 
                  : 'border-accent/20 hover:border-accent/40'
              }`}
            >
              <cat.icon className="w-3 h-3 mr-1" />
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Protein Goal Indicator */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-accent" />
            <span className="font-ui text-xs text-muted-foreground">Daily Protein Target</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-game text-2xl text-accent">1.6-2.2g</span>
            <span className="text-xs text-muted-foreground">per kg bodyweight for muscle building</span>
          </div>
        </div>

        {/* Protein Sources List */}
        <ScrollArea className="h-[280px] pr-2">
          <div className="space-y-2">
            {filteredSources.map((source) => (
              <div 
                key={source.name}
                className={`p-3 rounded-xl border backdrop-blur-sm transition-all cursor-pointer hover:shadow-lg ${
                  expandedItem === source.name 
                    ? `bg-${source.color}/10 border-${source.color}/40 shadow-${source.color}/20` 
                    : 'bg-background/40 border-border/30 hover:border-border/60'
                }`}
                onClick={() => toggleExpand(source.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${source.color}/20 border border-${source.color}/30`}>
                      <source.icon className={`w-4 h-4 text-${source.color}`} />
                    </div>
                    <div>
                      <p className="font-ui text-sm font-medium text-foreground">{source.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {source.protein}g protein / 100g • {source.calories} kcal
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={source.quality === 'complete' ? 'default' : 'secondary'}
                      className={`text-[9px] ${source.quality === 'complete' ? 'bg-accent' : ''}`}
                    >
                      {source.quality}
                    </Badge>
                    {expandedItem === source.name ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                {expandedItem === source.name && (
                  <div className="mt-3 pt-3 border-t border-border/50 animate-slide-up">
                    <p className="text-xs text-muted-foreground">
                      💡 <span className="text-foreground">{source.tips}</span>
                    </p>
                    <div className="flex gap-4 mt-2">
                      <div className="text-center">
                        <span className="font-game text-lg text-destructive">{source.protein}g</span>
                        <p className="text-[9px] text-muted-foreground">Protein</p>
                      </div>
                      <div className="text-center">
                        <span className="font-game text-lg text-gold">{source.calories}</span>
                        <p className="text-[9px] text-muted-foreground">Calories</p>
                      </div>
                      <div className="text-center">
                        <span className="font-game text-lg text-secondary">
                          {(source.protein / (source.calories / 100)).toFixed(1)}g
                        </span>
                        <p className="text-[9px] text-muted-foreground">Per 100 kcal</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Pro Tip */}
        <div className="p-3 rounded-xl bg-gold/10 border border-gold/20">
          <p className="text-xs text-foreground flex items-start gap-2">
            <Star className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <span>
              <strong className="text-gold">Pro Tip:</strong> Spread protein intake across 4-5 meals 
              (25-40g each) for optimal muscle protein synthesis.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
