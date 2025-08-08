import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import SectionHeader from '../../components/ui/SectionHeader';
import ValidationFeedback from '../../components/ui/ValidationFeedback';
import { GenerateButton } from '../../components/ui/ActionButton';
import Icon from '../../components/AppIcon';

// Import page components
import EmailInput from './components/EmailInput';
import GenerationOptions from './components/GenerationOptions';
import GenerationProgress from './components/GenerationProgress';
import ResultsDisplay from './components/ResultsDisplay';
import ContactSection from './components/ContactSection';

const EmailAliasGenerator = () => {
  // State management
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationOptions, setGenerationOptions] = useState({
    dotTrick: true,
    plusTrick: true,
    combined: true,
    limit: 10000
  });
  const [generationProgress, setGenerationProgress] = useState({
    progress: 0,
    currentBatch: 0,
    totalBatches: 0,
    processedCount: 0,
    totalCount: 0,
    estimatedTime: null
  });
  const [results, setResults] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  
  // Web Worker reference
  const workerRef = useRef(null);

  // Email validation function
  const validateEmail = useCallback((emailValue) => {
    if (!emailValue) {
      setEmailError('');
      setIsEmailValid(false);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasAtSymbol = emailValue?.includes('@');
    const hasDotTrickInUsername = emailValue?.split('@')?.[0]?.includes('.');
    const hasPlusTrickInUsername = emailValue?.split('@')?.[0]?.includes('+');

    if (!hasAtSymbol) {
      setEmailError('Email must contain @ symbol');
      setIsEmailValid(false);
      return false;
    }

    if (!emailRegex?.test(emailValue)) {
      setEmailError('Please enter a valid email format');
      setIsEmailValid(false);
      return false;
    }

    if (hasDotTrickInUsername || hasPlusTrickInUsername) {
      setEmailError('Please enter base email without dots or plus signs in username');
      setIsEmailValid(false);
      return false;
    }

    setEmailError('');
    setIsEmailValid(true);
    return true;
  }, []);

  // Calculate TRUE maximum possible variations (dot OR plus at each position)
  const calculateTrueMaxVariations = useMemo(() => {
    if (!isEmailValid || !email) return 0;

    const username = email?.split('@')?.[0];
    const usernameLength = username?.length;

    if (usernameLength < 2) return 1;

    // For each position between characters, we can choose:
    // - Nothing (original)
    // - Dot OR Plus (not both at same position)
    // So for n-1 positions, we have 2^(n-1) combinations where each position is either original or modified
    const positionsBetweenChars = usernameLength - 1;
    const trueMaxVariations = Math.pow(2, positionsBetweenChars);
    
    return trueMaxVariations;
  }, [email, isEmailValid]);

  // Calculate estimated variations based on selected options with proper 2^(n-1) logic
  const calculateEstimatedVariations = useMemo(() => {
    if (!isEmailValid || !email) return 0;

    const { dotTrick, plusTrick, combined } = generationOptions;
    
    if (!dotTrick && !plusTrick) return 1;

    const username = email?.split('@')?.[0];
    const positionsBetweenChars = username?.length - 1;

    if (combined && dotTrick && plusTrick) {
      // All combinations: 2^(n-1) * 2 where each position can be dot OR plus (not both)
      // Each position has 2 states: original or modified
      // If modified, we choose randomly between dot or plus during generation
      return Math.pow(2, positionsBetweenChars) * 2; // *2 because each modified position can be dot or plus
    } else if (dotTrick && plusTrick) {
      // Individual variations: original + dots + pluses (separate sets)
      return 1 + Math.pow(2, positionsBetweenChars) + Math.pow(2, positionsBetweenChars) - 1;
    } else if (dotTrick || plusTrick) {
      // Single trick: 2^(n-1) variations
      return Math.pow(2, positionsBetweenChars);
    }

    return 1;
  }, [email, isEmailValid, generationOptions]);

  // Check if should show warning for large variation sets
  const shouldShowWarning = useMemo(() => {
    return calculateEstimatedVariations > 10000;
  }, [calculateEstimatedVariations]);

  // Check generation limits before processing
  const validateGenerationLimits = useCallback((estimatedCount) => {
    const maxSafeLimit = 100000; // Absolute maximum to prevent browser freeze
    
    if (estimatedCount > maxSafeLimit) {
      setEmailError(`Too many variations (${estimatedCount?.toLocaleString()}). Maximum allowed: ${maxSafeLimit?.toLocaleString()}`);
      return false;
    }
    
    return true;
  }, []);

  // Generate variations with correct dot OR plus logic
  const generateAllPossibleVariations = useCallback((baseEmail, options) => {
    const [username, domain] = baseEmail?.split('@');
    const variations = [];

    if (username?.length < 2) {
      variations?.push(baseEmail);
      return variations;
    }

    const positionsBetweenChars = username?.length - 1;
    const { dotTrick, plusTrick, combined, useSampling = false, sampleSize = 10000 } = options;

    if (combined && dotTrick && plusTrick) {
      // Generate ALL possible combinations where each position is either original, dot, or plus (but not both)
      const totalCombinations = Math.pow(2, positionsBetweenChars);
      const allVariations = [];
      
      for (let i = 0; i < totalCombinations; i++) {
        // Generate dot version
        let dotUsername = [];
        let combination = i;
        
        for (let pos = 0; pos < username?.length; pos++) {
          dotUsername?.push(username?.[pos]);
          if (pos < positionsBetweenChars) {
            const shouldModify = combination & 1;
            if (shouldModify) {
              dotUsername?.push('.');
            }
            combination >>= 1;
          }
        }
        
        // Generate plus version
        let plusUsername = [];
        combination = i;
        
        for (let pos = 0; pos < username?.length; pos++) {
          plusUsername?.push(username?.[pos]);
          if (pos < positionsBetweenChars) {
            const shouldModify = combination & 1;
            if (shouldModify) {
              plusUsername?.push('+');
            }
            combination >>= 1;
          }
        }
        
        allVariations?.push(`${dotUsername?.join('')}@${domain}`);
        allVariations?.push(`${plusUsername?.join('')}@${domain}`);
      }
      
      // Remove duplicates and apply sampling if needed
      const uniqueVariations = [...new Set(allVariations)];
      
      if (useSampling && uniqueVariations?.length > sampleSize) {
        // Random sampling for large sets
        const sampled = [];
        const used = new Set();
        
        while (sampled?.length < sampleSize && sampled?.length < uniqueVariations?.length) {
          const randomIndex = Math.floor(Math.random() * uniqueVariations?.length);
          if (!used?.has(randomIndex)) {
            sampled?.push(uniqueVariations?.[randomIndex]);
            used?.add(randomIndex);
          }
        }
        
        return sampled;
      }
      
      return uniqueVariations;
    } else {
      // Add original email
      variations?.push(baseEmail);
      
      // Generate individual dot or plus variations using 2^(n-1) logic
      if (dotTrick) {
        const dotCombinations = Math.pow(2, positionsBetweenChars);
        for (let i = 1; i < dotCombinations; i++) { // Start from 1 to skip original
          const dotUsername = [];
          let combination = i;
          
          for (let pos = 0; pos < username?.length; pos++) {
            dotUsername?.push(username?.[pos]);
            if (pos < positionsBetweenChars) {
              const shouldAddDot = combination & 1;
              if (shouldAddDot) {
                dotUsername?.push('.');
              }
              combination >>= 1;
            }
          }
          
          variations?.push(`${dotUsername?.join('')}@${domain}`);
        }
      }
      
      if (plusTrick) {
        const plusCombinations = Math.pow(2, positionsBetweenChars);
        for (let i = 1; i < plusCombinations; i++) { // Start from 1 to skip original
          const plusUsername = [];
          let combination = i;
          
          for (let pos = 0; pos < username?.length; pos++) {
            plusUsername?.push(username?.[pos]);
            if (pos < positionsBetweenChars) {
              const shouldAddPlus = combination & 1;
              if (shouldAddPlus) {
                plusUsername?.push('+');
              }
              combination >>= 1;
            }
          }
          
          variations?.push(`${plusUsername?.join('')}@${domain}`);
        }
      }
    }

    return [...new Set(variations)]; // Remove any duplicates
  }, []);

  // Create Web Worker for heavy processing
  useEffect(() => {
    const workerCode = `
      self.onmessage = function(e) {
        const { baseEmail, options } = e.data;
        const [username, domain] = baseEmail.split('@');
        
        if (username.length < 2) {
          self.postMessage({ 
            variations: [baseEmail], 
            isComplete: true,
            totalGenerated: 1 
          });
          return;
        }

        const positionsBetweenChars = username.length - 1;
        const { dotTrick, plusTrick, combined, limit } = options;
        const variations = [];
        const CHUNK_SIZE = 500;
        let totalGenerated = 0;

        // Use array for fast string building
        const buildUsername = (baseArray, positions, symbol) => {
          const result = [];
          for (let i = 0; i < baseArray.length; i++) {
            result.push(baseArray[i]);
            if (i < positions.length && positions[i]) {
              result.push(symbol);
            }
          }
          return result.join('');
        };

        if (combined && dotTrick && plusTrick) {
          // Generate using 2^(n-1) logic - each position is dot OR plus
          const totalCombinations = Math.pow(2, positionsBetweenChars);
          
          for (let i = 0; i < totalCombinations && (!limit || totalGenerated < limit); i++) {
            let combination = i;
            const positions = [];
            
            // Determine which positions to modify
            for (let pos = 0; pos < positionsBetweenChars; pos++) {
              positions.push(combination & 1);
              combination >>= 1;
            }
            
            // Generate dot version
            if (!limit || totalGenerated < limit) {
              const dotResult = [];
              for (let pos = 0; pos < username.length; pos++) {
                dotResult.push(username[pos]);
                if (pos < positionsBetweenChars && positions[pos]) {
                  dotResult.push('.');
                }
              }
              variations.push(dotResult.join('') + '@' + domain);
              totalGenerated++;
            }
            
            // Generate plus version
            if (!limit || totalGenerated < limit) {
              const plusResult = [];
              for (let pos = 0; pos < username.length; pos++) {
                plusResult.push(username[pos]);
                if (pos < positionsBetweenChars && positions[pos]) {
                  plusResult.push('+');
                }
              }
              variations.push(plusResult.join('') + '@' + domain);
              totalGenerated++;
            }
            
            // Send chunk if needed
            if (variations.length >= CHUNK_SIZE) {
              self.postMessage({
                variations: [...variations],
                isComplete: false,
                totalGenerated,
                progress: (i / totalCombinations) * 100
              });
              variations.length = 0; // Clear array efficiently
            }
          }
        } else {
          // Add original
          variations.push(baseEmail);
          totalGenerated++;
          
          // Individual variations using 2^(n-1)
          if (dotTrick) {
            const combinations = Math.pow(2, positionsBetweenChars);
            for (let i = 1; i < combinations && (!limit || totalGenerated < limit); i++) {
              const result = [];
              let combination = i;
              
              for (let pos = 0; pos < username.length; pos++) {
                result.push(username[pos]);
                if (pos < positionsBetweenChars) {
                  const shouldAddDot = combination & 1;
                  if (shouldAddDot) {
                    result.push('.');
                  }
                  combination >>= 1;
                }
              }
              
              variations.push(result.join('') + '@' + domain);
              totalGenerated++;
              
              if (variations.length >= CHUNK_SIZE) {
                self.postMessage({
                  variations: [...variations],
                  isComplete: false,
                  totalGenerated,
                  progress: (i / combinations) * 50
                });
                variations.length = 0;
              }
            }
          }
          
          if (plusTrick) {
            const combinations = Math.pow(2, positionsBetweenChars);
            for (let i = 1; i < combinations && (!limit || totalGenerated < limit); i++) {
              const result = [];
              let combination = i;
              
              for (let pos = 0; pos < username.length; pos++) {
                result.push(username[pos]);
                if (pos < positionsBetweenChars) {
                  const shouldAddPlus = combination & 1;
                  if (shouldAddPlus) {
                    result.push('+');
                  }
                  combination >>= 1;
                }
              }
              
              variations.push(result.join('') + '@' + domain);
              totalGenerated++;
              
              if (variations.length >= CHUNK_SIZE) {
                self.postMessage({
                  variations: [...variations],
                  isComplete: false,
                  totalGenerated,
                  progress: dotTrick ? 50 + (i / combinations) * 50 : (i / combinations) * 100
                });
                variations.length = 0;
              }
            }
          }
        }

        // Send final chunk
        if (variations.length > 0) {
          self.postMessage({
            variations: [...variations],
            isComplete: true,
            totalGenerated,
            progress: 100
          });
        } else {
          self.postMessage({
            variations: [],
            isComplete: true,
            totalGenerated,
            progress: 100
          });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    workerRef.current = new Worker(URL.createObjectURL(blob));

    return () => {
      if (workerRef?.current) {
        workerRef?.current?.terminate();
        URL.revokeObjectURL(workerRef?.current);
      }
    };
  }, []);

  // Handle email generation with Web Worker and chunking
  const handleGenerate = useCallback(async () => {
    if (!isEmailValid || isGenerating) return;

    // Validate limits before generation
    if (!validateGenerationLimits(calculateEstimatedVariations)) {
      return;
    }

    setIsGenerating(true);
    setIsComplete(false);
    setResults([]);
    setGenerationProgress({
      progress: 0,
      currentBatch: 0,
      totalBatches: 0,
      processedCount: 0,
      totalCount: Math.min(calculateEstimatedVariations, generationOptions?.limit || calculateEstimatedVariations),
      estimatedTime: calculateEstimatedVariations > 1000 ? '2-10 seconds' : 'Less than 1 second'
    });

    try {
      if (workerRef?.current) {
        workerRef?.current?.postMessage({
          baseEmail: email,
          options: {
            ...generationOptions,
            // Use sampling for very large sets
            useSampling: calculateEstimatedVariations > 50000,
            sampleSize: Math.min(generationOptions?.limit || 50000, 50000)
          }
        });

        workerRef.current.onmessage = (e) => {
          const { variations, isComplete, totalGenerated, progress } = e?.data;
          
          if (variations?.length > 0) {
            // Use functional update to avoid stale closure issues
            setResults(prev => {
              const combined = [...prev, ...variations];
              // Remove duplicates using Set for performance
              return Array.from(new Set(combined));
            });
          }
          
          setGenerationProgress(prev => ({
            ...prev,
            progress: progress || prev?.progress,
            processedCount: totalGenerated || prev?.processedCount,
            currentBatch: Math.floor((totalGenerated || 0) / 500) + 1,
            totalBatches: Math.ceil((totalGenerated || prev?.totalCount) / 500)
          }));
          
          if (isComplete) {
            setGenerationProgress(prev => ({ ...prev, progress: 100 }));
            setIsComplete(true);
            setIsGenerating(false);
          }
        };
      }

    } catch (error) {
      console.error('Generation failed:', error);
      setEmailError('Generation failed. Please try again.');
      setIsGenerating(false);
    }
  }, [email, isEmailValid, isGenerating, calculateEstimatedVariations, generationOptions, validateGenerationLimits]);

  // Handle download
  const handleDownload = useCallback(async () => {
    if (results?.length === 0) return;

    const content = results?.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${email?.replace('@', '_at_')}_email_variations.txt`;
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
    URL.revokeObjectURL(url);
  }, [results, email]);

  // Handle copy all
  const handleCopyAll = useCallback(async () => {
    if (results?.length === 0) return;
    
    const content = results?.join('\n');
    await navigator.clipboard?.writeText(content);
  }, [results]);

  // Handle clear results
  const handleClear = useCallback(() => {
    setResults([]);
    setIsComplete(false);
    setGenerationProgress({
      progress: 0,
      currentBatch: 0,
      totalBatches: 0,
      processedCount: 0,
      totalCount: 0,
      estimatedTime: null
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Gmail Generator - Advanced Email Alias Generator by Earl Store</title>
        <meta name="description" content="Generate ALL possible email alias variations using advanced combination algorithms. True maximum variations with optional limit control." />
        <meta name="keywords" content="gmail generator, email alias, maximum variations, all combinations, email generator, Earl Store" />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563EB' stroke-width='2'><polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'/></svg>" />
      </Helmet>
      <Header />
      <main className="container-wide section-spacing">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl">
                <Icon name="Mail" size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text-primary">
                  Advanced Email Alias Generator
                </h1>
                <p className="text-sm text-text-secondary">
                  Generate ALL possible combinations with optional limit control
                </p>
              </div>
            </div>
            
            <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Create the maximum possible email alias variations using advanced combination algorithms. 
              Generate individual variations or ALL possible mixed combinations with optional limit control for performance.
            </p>
          </div>

          {/* Email Input Section */}
          <div className="space-y-6">
            <SectionHeader
              title="Email Configuration"
              subtitle="Enter your base email address for variation generation"
              icon="Settings"
              isActive={true}
              progress={0}
            />

            <EmailInput
              email={email}
              onChange={setEmail}
              error={emailError}
              isValid={isEmailValid}
              onValidate={validateEmail}
            />
          </div>

          {/* True Maximum Calculation Display */}
          {isEmailValid && calculateTrueMaxVariations > 0 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon name="Calculator" size={20} className="text-primary" />
                    <div>
                      <span className="text-sm font-medium text-primary">True Maximum Possible:</span>
                      <p className="text-xs text-primary/70 mt-1">
                        ALL combinations (3^n formula)
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    {calculateTrueMaxVariations?.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon name="Target" size={20} className="text-success" />
                    <div>
                      <span className="text-sm font-medium text-success">Will Generate:</span>
                      <p className="text-xs text-success/70 mt-1">
                        Based on your settings
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-success">
                    {Math.min(calculateEstimatedVariations, generationOptions?.limit || calculateEstimatedVariations)?.toLocaleString()}
                  </span>
                </div>
              </div>
              
              {shouldShowWarning && (
                <ValidationFeedback
                  type="warning"
                  message={`Large variation set detected (${calculateEstimatedVariations?.toLocaleString()})`}
                  details={[
                    'Use limit control to reduce processing time',
                    'Web Workers handle background processing',
                    'Results delivered in manageable chunks',
                    'Consider individual tricks for smaller sets'
                  ]}
                  onDismiss={() => {}}
                />
              )}
            </div>
          )}

          {/* Generation Options */}
          {isEmailValid && (
            <div className="space-y-6">
              <SectionHeader
                title="Generation Options"
                subtitle="Configure variation types and optional limits"
                icon="Sliders"
                isActive={true}
                progress={0}
              />

              <GenerationOptions
                options={generationOptions}
                onChange={setGenerationOptions}
                estimatedCount={calculateEstimatedVariations}
                maxLimit={Math.min(calculateTrueMaxVariations, 50000)}
              />
            </div>
          )}

          {/* Generate Button */}
          {isEmailValid && calculateEstimatedVariations > 0 && (
            <div className="flex justify-center">
              <GenerateButton
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                isComplete={isComplete}
                estimatedCount={Math.min(calculateEstimatedVariations, generationOptions?.limit || calculateEstimatedVariations)}
                className="min-w-64"
              />
            </div>
          )}

          {/* Generation Progress */}
          <GenerationProgress
            isGenerating={isGenerating}
            progress={generationProgress?.progress}
            currentBatch={generationProgress?.currentBatch}
            totalBatches={generationProgress?.totalBatches}
            processedCount={generationProgress?.processedCount}
            totalCount={generationProgress?.totalCount}
            estimatedTime={generationProgress?.estimatedTime}
          />

          {/* Results Display */}
          <ResultsDisplay
            results={results}
            isGenerating={isGenerating}
            onDownload={handleDownload}
            onClear={handleClear}
            onCopy={handleCopyAll}
          />

          {/* Contact & Support Section */}
          <div className="pt-8 border-t border-border">
            <ContactSection />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailAliasGenerator;