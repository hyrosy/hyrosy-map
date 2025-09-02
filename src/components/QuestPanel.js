'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx'; // Utility for conditional classes

const QuestPanel = ({ isOpen, onClose, onStepSelect, quests , onQuestSelect, onAddToCart }) => {
  const [activeQuest, setActiveQuest] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepsData, setStepsData] = useState({ status: 'idle', data: [] });

  const handleSelectQuest = (quest) => {
    setActiveQuest(quest);
    setCurrentStepIndex(0);
  };
  
  useEffect(() => {
    if (!activeQuest) {
      setStepsData({ status: 'idle', data: [] });
      return;
    }

    const fetchQuestSteps = async () => {
      if (!activeQuest.acf.quest_steps || activeQuest.acf.quest_steps.length === 0) {
        setStepsData({ status: 'success', data: [] });
        return;
      }
      setStepsData({ status: 'loading', data: [] });
      
      const stepIds = activeQuest.acf.quest_steps.map(step => step.ID).join(',');
      const apiUrl = `https://data.hyrosy.com/wp-json/wp/v2/locations?acf_format=standard&include=${stepIds}&orderby=include`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch quest steps');
        const steps = await response.json();
        
        const orderedSteps = activeQuest.acf.quest_steps.map(stepRef => 
            steps.find(step => step.id === stepRef.ID)
        ).filter(Boolean);

        setStepsData({ status: 'success', data: orderedSteps });
        if (orderedSteps.length > 0) {
          onStepSelect(orderedSteps[0]);
        }
      } catch (error) {
        console.error("Error fetching quest steps:", error);
        setStepsData({ status: 'error', data: [] });
      }
    };

    fetchQuestSteps();
  }, [activeQuest, onStepSelect]);

  const handleStepClick = (step, index) => {
    setCurrentStepIndex(index);
    onStepSelect(step);
  };

  const handleBack = () => {
    setActiveQuest(null);
    onStepSelect(null);
  };

  const panelClasses = clsx(
  'fixed top-0 left-0 w-96 h-full bg-black/80 backdrop-blur-md text-white shadow-2xl z-[1001] flex flex-col transition-transform duration-500 ease-in-out',
  isOpen ? 'translate-x-0' : '-translate-x-full'
);

  return (
    <div className={panelClasses}>
      {/* Panel Header */}
      <div className="flex justify-between items-center p-4 bg-black/30 border-b border-gray-700">
        <h2 className="text-xl font-bold">{activeQuest ? activeQuest.title.rendered : 'Available Quests'}</h2>
        <button onClick={onClose} className="text-3xl">&times;</button>
      </div>

      {/* Panel Content */}
      <div className="flex-grow overflow-y-auto p-5">
        {!activeQuest ? (
          // Quest List View
          <div className="flex flex-col gap-4">
            {quests.map(quest => (
              <div key={quest.id} className="bg-white/10 p-4 rounded-lg cursor-pointer border border-gray-600 hover:bg-white/20 transition-colors" onClick={() => handleSelectQuest(quest)}>
                <h3 className="font-semibold text-lg">{quest.title.rendered}</h3>
                <p className="text-sm text-gray-300 my-1">{quest.acf.quest_description}</p>
                <span className="text-xs font-bold text-cyan-400">{quest.acf.quest_duration}</span>
              </div>
            ))}
          </div>
        ) : (
          // Quest Steps View
          <div>
            <button onClick={handleBack} className="mb-5 px-4 py-2 text-sm border border-gray-500 rounded-full hover:bg-gray-700 transition-colors">&larr; Back to Quests</button>
            {stepsData.status === 'loading' && <p>Loading quest steps...</p>}
            {stepsData.status === 'error' && <p>Could not load quest. Please try again.</p>}
            {stepsData.status === 'success' && (
              <div className="flex flex-col gap-4">
                {stepsData.data.map((step, index) => (
                  <div 
                    key={step.id} 
                    className={clsx('p-4 cursor-pointer transition-all border-l-4', {
                      'bg-blue-500/20 border-blue-500': index === currentStepIndex,
                      'border-gray-600 hover:bg-white/10': index !== currentStepIndex
                    })}
                    onClick={() => handleStepClick(step, index)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className={clsx('w-8 h-8 rounded-full flex items-center justify-center font-bold', {
                        'bg-blue-500 text-white': index === currentStepIndex,
                        'bg-gray-700 text-gray-200': index !== currentStepIndex
                      })}>
                        {index + 1}
                      </span>
                      <h4 className="font-semibold text-md">{step.title.rendered}</h4>
                    </div>
                    <p className="text-sm text-gray-300 pl-11">{step.acf.quest_step_description}</p>
                    {step.acf.is_bookable_activity && (
                      <button className="mt-3 ml-11 px-3 py-2 text-xs bg-blue-600 rounded hover:bg-blue-500 transition-colors">{step.acf.bookable_cta_text}</button>
                    )}
                    {step.acf.quest_tip && (
                      <p className="mt-3 ml-11 p-3 text-xs bg-yellow-500/10 border-l-4 border-yellow-400 rounded-r-md italic">💡 {step.acf.quest_tip}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestPanel;