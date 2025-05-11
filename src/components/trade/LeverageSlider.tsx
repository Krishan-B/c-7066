
import { Slider } from "@/components/ui/slider";

interface LeverageSliderProps {
  leverage: number[];
  onLeverageChange: (value: number[]) => void;
}

const LeverageSlider = ({ leverage, onLeverageChange }: LeverageSliderProps) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <label className="text-sm text-muted-foreground">Leverage</label>
        <span className="text-sm font-medium">{leverage[0]}x</span>
      </div>
      <Slider
        defaultValue={[1]}
        max={25}
        min={1}
        step={1}
        value={leverage}
        onValueChange={onLeverageChange}
      />
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>1x</span>
        <span>10x</span>
        <span>25x</span>
      </div>
    </div>
  );
};

export default LeverageSlider;
