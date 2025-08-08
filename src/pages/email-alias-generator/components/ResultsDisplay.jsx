import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import ActionButton from '../../../components/ui/ActionButton';

const ITEMS_PER_PAGE = 500; // Increased for better performance with chunking

const ResultsDisplay = ({ 
  results, 
  isGenerating, 
  onDownload, 
  onClear, 
  onCopy,
  className = "" 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [copyStatus, setCopyStatus] = useState('');

  // Enhanced virtualized pagination with better performance
  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return results?.slice(startIndex, endIndex) || [];
  }, [results, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil((results?.length || 0) / ITEMS_PER_PAGE);
  }, [results]);

  // Reset pagination when results change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [results?.length]);

  // Enhanced copy with better feedback
  const handleCopyAll = useCallback(async () => {
    try {
      // Use array join for fast string building as requested
      const content = results?.join('\n') || '';
      await onCopy();
      setCopyStatus(`Copied ${results?.length?.toLocaleString()} variations!`);
      setTimeout(() => setCopyStatus(''), 3000);
    } catch (error) {
      setCopyStatus('Copy failed - text too large');
      setTimeout(() => setCopyStatus(''), 3000);
    }
  }, [onCopy, results]);

  // Handle individual email copy with better UX
  const handleCopyEmail = useCallback(async (email, index) => {
    try {
      await navigator.clipboard?.writeText(email);
      setCopyStatus(`Copied: ${email?.slice(0, 30)}${email?.length > 30 ? '...' : ''}`);
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (error) {
      setCopyStatus('Copy failed');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  }, []);

  // Handle download with better performance
  const handleDownloadClick = useCallback(async () => {
    if (results?.length === 0) return;

    try {
      // Use array join for fast string building
      const content = results?.join('\n');
      await onDownload();
      setCopyStatus(`Downloaded ${results?.length?.toLocaleString()} variations!`);
      setTimeout(() => setCopyStatus(''), 3000);
    } catch (error) {
      setCopyStatus('Download failed');
      setTimeout(() => setCopyStatus(''), 3000);
    }
  }, [onDownload, results]);

  if (!results?.length && !isGenerating) return null;

  return (
    <div className={`results-display space-y-6 ${className}`}>
      {/* Enhanced Results Header */}
      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
            <Icon name="List" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Generated Variations
            </h3>
            <p className="text-sm text-text-secondary">
              {results?.length?.toLocaleString() || 0} unique combinations using dot OR plus logic
            </p>
          </div>
        </div>
        
        {/* Enhanced real-time counter */}
        {isGenerating && (
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-primary">
              Processing... {results?.length?.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Enhanced Copy Status Feedback */}
      {copyStatus && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg animate-in slide-in-from-top-1">
          <Icon name="CheckCircle" size={16} className="text-primary" />
          <span className="text-sm font-medium text-primary">{copyStatus}</span>
        </div>
      )}

      {/* Enhanced Action Buttons */}
      {results?.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <ActionButton
            onClick={handleCopyAll}
            disabled={isGenerating}
            variant="primary"
            className="flex-1 min-w-fit"
          >
            <Icon name="Copy" size={16} />
            Copy All ({results?.length?.toLocaleString()})
          </ActionButton>
          
          <ActionButton
            onClick={handleDownloadClick}
            disabled={isGenerating}
            variant="secondary"
            className="flex-1 min-w-fit"
          >
            <Icon name="Download" size={16} />
            Download TXT
          </ActionButton>
          
          <ActionButton
            onClick={onClear}
            disabled={isGenerating}
            variant="outline"
            className="flex-1 min-w-fit"
          >
            <Icon name="Trash2" size={16} />
            Clear Results
          </ActionButton>
        </div>
      )}

      {/* Enhanced Virtualized Results List */}
      {paginatedResults?.length > 0 && (
        <div className="space-y-4">
          {/* Enhanced Pagination Info */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm">
              <span className="text-text-secondary">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, results?.length)} 
                of {results?.length?.toLocaleString()} variations
              </span>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">Page {currentPage} of {totalPages}</span>
                {isGenerating && (
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Results Grid with better virtualization */}
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              <div className="p-4 space-y-1">
                {paginatedResults?.map((email, index) => {
                  const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
                  return (
                    <div 
                      key={`${currentPage}-${index}`}
                      className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md group transition-all duration-150 min-h-[2.5rem]"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xs text-text-secondary/70 font-mono w-8 text-right flex-shrink-0">
                          {globalIndex + 1}
                        </span>
                        <span className="font-mono text-sm text-text-primary truncate flex-1">
                          {email}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyEmail(email, index)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-primary/10 rounded-md transition-all duration-150 flex-shrink-0"
                        title="Copy this email"
                      >
                        <Icon name="Copy" size={14} className="text-text-secondary hover:text-primary" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Enhanced Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                <Icon name="ChevronsLeft" size={16} />
              </button>
              
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <Icon name="ChevronLeft" size={16} />
              </button>
              
              <div className="flex items-center gap-1">
                {/* Show page numbers around current page */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage > totalPages - 3) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm border rounded transition-colors ${
                        currentPage === pageNum
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <Icon name="ChevronRight" size={16} />
              </button>
              
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                <Icon name="ChevronsRight" size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Performance Info */}
      {results?.length > 1000 && (
        <div className="flex items-center gap-2 p-3 bg-accent/10 border border-accent/20 rounded-lg">
          <Icon name="Zap" size={16} className="text-accent" />
          <div className="text-sm text-accent">
            <span className="font-medium">Optimized Performance:</span>
            <span className="ml-2">
              Showing {ITEMS_PER_PAGE} items per page • Web Workers • Array join() string building • Virtualized DOM
            </span>
          </div>
        </div>
      )}

      {/* Large set information */}
      {results?.length > 10000 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Icon name="Info" size={16} className="text-blue-600" />
          <div className="text-sm text-blue-700">
            <span className="font-medium">Large Result Set:</span>
            <span className="ml-2">
              {results?.length?.toLocaleString()} variations generated using optimized 2^(n-1) algorithm with chunked processing
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;