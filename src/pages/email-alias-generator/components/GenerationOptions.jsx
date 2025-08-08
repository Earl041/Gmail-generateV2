import React from 'react';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const GenerationOptions = ({ 
  options, 
  onChange, 
  estimatedCount,
  maxLimit = 50000,
  className = "" 
}) => {
  const handleOptionChange = (optionKey, checked) => {
    onChange({
      ...options,
      [optionKey]: checked
    });
  };

  const handleLimitChange = (e) => {
    const value = Math.min(parseInt(e?.target?.value) || 100, maxLimit);
    onChange({
      ...options,
      limit: value
    });
  };

  const getPerformanceWarning = () => {
    if (estimatedCount <= 1000) return null;
    if (estimatedCount <= 10000) return 'warning';
    return 'error';
  };

  const warningLevel = getPerformanceWarning();

  return (
    <div className={`generation-options space-y-6 ${className}`}>
      {/* Generation Methods */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Icon name="Settings" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">Variation Types</h3>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <Checkbox
            label="Dot Trick Variations"
            description="Insert dots between username characters (dot OR plus per position)"
            checked={options?.dotTrick}
            onChange={(e) => handleOptionChange('dotTrick', e?.target?.checked)}
          />
          
          <Checkbox
            label="Plus Trick Variations"
            description="Add + symbol variations to username (dot OR plus per position)"
            checked={options?.plusTrick}
            onChange={(e) => handleOptionChange('plusTrick', e?.target?.checked)}
          />
        </div>
        
        <div className="p-4 border border-border rounded-lg bg-muted/30">
          <Checkbox
            label="All Mixed Combinations (Advanced)"
            description="Generate every possible combination where each position uses dot OR plus (not both) - uses 2^(n-1) algorithm"
            checked={options?.combined}
            onChange={(e) => handleOptionChange('combined', e?.target?.checked)}
            disabled={!options?.dotTrick || !options?.plusTrick}
          />
          {(!options?.dotTrick || !options?.plusTrick) && (
            <p className="text-xs text-text-secondary mt-2 ml-6">
              Enable both Dot and Plus tricks to unlock mixed combinations
            </p>
          )}
        </div>
      </div>

      {/* Optional Variation Limit with improved messaging */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Icon name="Gauge" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">Limit Control & Sampling</h3>
        </div>
        
        <div className="p-4 border border-border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-text-primary">
                Maximum Variations Limit
              </label>
              <p className="text-xs text-text-secondary mt-1">
                For large sets (>50k), random sampling will be used automatically
              </p>
            </div>
            <span className="text-sm text-text-secondary">
              Max: {maxLimit?.toLocaleString()}
            </span>
          </div>
          
          <div className="space-y-3">
            <input
              type="range"
              min="100"
              max={maxLimit}
              step="100"
              value={options?.limit}
              onChange={handleLimitChange}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">100</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="100"
                  max={maxLimit}
                  value={options?.limit}
                  onChange={handleLimitChange}
                  className="w-24 px-3 py-1.5 text-center border border-border rounded text-sm bg-background"
                  placeholder="Custom limit"
                />
                <span className="text-text-secondary">variations</span>
              </div>
              <span className="text-text-secondary">{maxLimit?.toLocaleString()}</span>
            </div>
            
            <div className="text-xs text-text-secondary">
              <Icon name="Info" size={12} className="inline mr-1" />
              Large variation sets use intelligent sampling and chunked processing for optimal performance
            </div>
          </div>
        </div>
      </div>

      {/* Updated Estimated Count with corrected formula explanation */}
      {estimatedCount > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Icon name="Calculator" size={16} className="text-primary" />
              <div>
                <span className="text-sm font-medium text-primary">Estimated Variations:</span>
                <p className="text-xs text-primary/70 mt-1">
                  {options?.combined ? '2^(n-1) mixed combinations' : 'Individual variations mode'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-primary">
                {Math.min(estimatedCount, options?.limit || estimatedCount)?.toLocaleString()}
              </span>
              {options?.limit && options?.limit < estimatedCount && (
                <p className="text-xs text-primary/70 mt-1">
                  (Limited from {estimatedCount?.toLocaleString()})
                </p>
              )}
            </div>
          </div>
          
          {warningLevel && (
            <div className={`flex items-start gap-3 p-4 border rounded-lg ${
              warningLevel === 'warning' ? 'bg-warning/10 border-warning/20 text-warning-foreground' : 'bg-error/10 border-error/20 text-error-foreground'
            }`}>
              <Icon 
                name={warningLevel === 'warning' ? 'AlertTriangle' : 'AlertCircle'} 
                size={16} 
                className={warningLevel === 'warning' ? 'text-warning' : 'text-error'}
              />
              <div className="text-sm">
                <p className="font-medium mb-1">
                  {warningLevel === 'warning' ? 'Performance Notice' : 'Large Set Warning'}
                </p>
                <ul className="space-y-1 text-xs opacity-90">
                  <li>• Web Workers handle background processing</li>
                  <li>• Results delivered in 500-item chunks</li>
                  <li>• Virtualized rendering prevents DOM overload</li>
                  {warningLevel === 'error' && (
                    <>
                      <li>• Random sampling used for sets &gt;50k</li>
                      <li>• Consider using limit control for faster results</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}
          
          {/* Updated Formula Explanation */}
          {options?.combined && options?.dotTrick && options?.plusTrick && (
            <div className="p-3 bg-muted/50 border border-border rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="BookOpen" size={16} className="text-text-secondary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-text-secondary">
                  <p className="font-medium mb-1">Corrected Algorithm (2^(n-1)):</p>
                  <p className="text-xs">
                    Each position between characters can be: <strong>original OR dot OR plus</strong> (not both symbols). 
                    Using 2^(n-1) where each position has 2 states, then multiplied by 2 for dot/plus choice = <strong>{estimatedCount?.toLocaleString()}</strong> combinations.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GenerationOptions;