import { Category } from "@/lib/timescore";

interface Props {
  category: Category;
  value: number;
  onChange: (v: number) => void;
}

export function HourSlider({ category, value, onChange }: Props) {
  const inIdeal = value >= category.ideal[0] && value <= category.ideal[1];
  return (
    <div className="glass rounded-2xl p-5 transition-all hover:border-primary/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>{category.emoji}</span>
          <div>
            <div className="font-medium text-foreground">{category.label}</div>
            <div className="text-xs text-muted-foreground">
              ideal {category.ideal[0]}–{category.ideal[1]}h
            </div>
          </div>
        </div>
        <div className={`tabular-nums text-2xl font-display font-semibold ${inIdeal ? "text-primary" : "text-foreground"}`}>
          {value.toFixed(1)}
          <span className="text-sm text-muted-foreground ml-0.5">h</span>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={16}
        step={0.5}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="ts-slider"
        aria-label={`${category.label} hours`}
      />
    </div>
  );
}
