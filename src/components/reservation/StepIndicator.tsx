import React from 'react';

interface Step {
    number: number;
    title: string;
}

interface StepIndicatorProps {
    currentStep: number;
    steps: Step[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
    return (
        <div className="mb-8">
            <div className="flex items-start justify-between">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        {/* Step Circle */}
                        <div className="flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
                            <div
                                className={`
                  flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold text-sm
                  ${currentStep >= step.number
                                        ? 'bg-brand-500 border-brand-500 text-white'
                                        : 'bg-white border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600'
                                    }
                  ${currentStep === step.number ? 'ring-4 ring-brand-100 dark:ring-brand-900/30' : ''}
                `}
                            >
                                {currentStep > step.number ? (
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                ) : (
                                    step.number
                                )}
                            </div>
                            <div
                                className={`
                  mt-2 text-[10px] sm:text-xs font-medium text-center line-clamp-2 px-1 min-h-[2rem]
                  ${currentStep >= step.number
                                        ? 'text-brand-600 dark:text-brand-400'
                                        : 'text-gray-500 dark:text-gray-400'
                                    }
                `}
                            >
                                {step.title}
                            </div>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div
                                className={`
                  flex-1 h-0.5 mx-2 -mt-8
                  ${currentStep > step.number
                                        ? 'bg-brand-500'
                                        : 'bg-gray-300 dark:bg-gray-600'
                                    }
                `}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default StepIndicator;
