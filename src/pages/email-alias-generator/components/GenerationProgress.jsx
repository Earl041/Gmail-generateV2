import React from 'react';
import ProgressIndicator from '../../../components/ui/ProgressIndicator';
import Icon from '../../../components/AppIcon';

const GenerationProgress = ({ 
  isGenerating, 
  progress, 
  currentBatch, 
  totalBatches,
  processedCount,
  totalCount,
  estimatedTime,
  className = "" 
}) => {
  if (!isGenerating && progress === 0) return null;

  const getStatus = () => {
    if (progress >= 100) return 'completed';
    if (isGenerating) return 'processing';
    return 'idle';
  };

  const getMessage = () => {
    if (progress >= 100) return 'Generation completed successfully!';
    if (isGenerating) return 'Generating email variations...';
    return 'Ready to generate';
  };

  return (
    <div className={`generation-progress space-y-4 ${className}`}>
      <ProgressIndicator
        progress={progress}
        status={getStatus()}
        message={getMessage()}
        currentStep={currentBatch}
        totalSteps={totalBatches}
        estimatedTime={estimatedTime || 0}
        showPercentage={true}
      />
      {/* Detailed Progress Info */}
      {isGenerating && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Processed Count */}
          <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
              <Icon name="CheckCircle" size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Processed</p>
              <p className="text-lg font-semibold text-text-primary">
                {processedCount?.toLocaleString() || 0}
              </p>
            </div>
          </div>
          
          {/* Remaining Count */}
          <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-warning/10 rounded-lg">
              <Icon name="Clock" size={16} className="text-warning" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Remaining</p>
              <p className="text-lg font-semibold text-text-primary">
                {((totalCount || 0) - (processedCount || 0))?.toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Batch Progress */}
          <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-accent/10 rounded-lg">
              <Icon name="Layers" size={16} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Batch</p>
              <p className="text-lg font-semibold text-text-primary">
                {currentBatch || 0} / {totalBatches || 0}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Processing Status */}
      {isGenerating && (
        <div className="flex items-center justify-center gap-2 p-3 bg-primary/5 border border-primary/10 rounded-lg">
          <Icon name="Cpu" size={16} className="text-primary" />
          <span className="text-sm font-medium text-primary">
            Processing with Web Workers for optimal performance
          </span>
        </div>
      )}
    </div>
  );
};

export default GenerationProgress;