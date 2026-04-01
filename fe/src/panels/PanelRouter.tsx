import React from 'react';
import type { Capture } from '../types';
import { IdeaPanel } from './IdeaPanel';
import { WorkTaskPanel } from './WorkTaskPanel';
import { HomeTaskPanel } from './HomeTaskPanel';
import { ShoppingPanel } from './ShoppingPanel';
import { ReadWatchPanel } from './ReadWatchPanel';
import { FinancePanel } from './FinancePanel';
import { TravelPanel } from './TravelPanel';
import { FallbackPanel } from './FallbackPanel';

interface PanelRouterProps {
  capture: Capture;
  onUpdate: (c: Capture) => void;
}

export function PanelRouter({ capture, onUpdate }: PanelRouterProps): React.ReactElement {
  switch (capture.category) {
    case 'idea':       return <IdeaPanel     capture={capture} onUpdate={onUpdate} />;
    case 'work-task':  return <WorkTaskPanel  capture={capture} onUpdate={onUpdate} />;
    case 'home-task':  return <HomeTaskPanel  capture={capture} onUpdate={onUpdate} />;
    case 'shopping':   return <ShoppingPanel  capture={capture} onUpdate={onUpdate} />;
    case 'read-watch': return <ReadWatchPanel capture={capture} onUpdate={onUpdate} />;
    case 'finance':    return <FinancePanel   capture={capture} onUpdate={onUpdate} />;
    case 'travel':     return <TravelPanel    capture={capture} onUpdate={onUpdate} />;
    default:           return <FallbackPanel  capture={capture} onUpdate={onUpdate} />;
  }
}
