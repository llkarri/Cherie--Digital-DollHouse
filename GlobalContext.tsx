
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ClosetAnalysisResult, BodyFitAnalysisResult, Message, TravelPackingList, ClosetItem, Category, VibeMood } from './types';

interface StyleMyClosetState {
  files: File[];
  selectedClosetItemIds: string[];
  context: string;
  userHeight: string;
  selectedVibe: VibeMood;
  result: ClosetAnalysisResult | null;
}

interface TravelPackerState {
  destination: string;
  duration: string;
  tripType: string;
  selectedVibe: VibeMood;
  files: File[];
  selectedClosetIds: string[];
  result: TravelPackingList | null;
  selectedItems: Set<string>; // For checklists
  packingMode: 'closet' | 'inspiration';
}

interface BodyTypeFitState {
  file: File | null;
  description: string;
  result: BodyFitAnalysisResult | null;
}

interface LuxuryInvestmentsState {
  messages: Message[];
  budget: number;
  userAge: string;
  userSize: string;
}

interface GlobalContextType {
  styleMyCloset: StyleMyClosetState;
  setStyleMyCloset: React.Dispatch<React.SetStateAction<StyleMyClosetState>>;
  
  travelPacker: TravelPackerState;
  setTravelPacker: React.Dispatch<React.SetStateAction<TravelPackerState>>;
  
  bodyTypeFit: BodyTypeFitState;
  setBodyTypeFit: React.Dispatch<React.SetStateAction<BodyTypeFitState>>;
  
  luxuryInvestments: LuxuryInvestmentsState;
  setLuxuryInvestments: React.Dispatch<React.SetStateAction<LuxuryInvestmentsState>>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Style My Closet State
  const [styleMyCloset, setStyleMyCloset] = useState<StyleMyClosetState>({
    files: [],
    selectedClosetItemIds: [],
    context: '',
    userHeight: '5\'3"',
    selectedVibe: 'Coquette Cute',
    result: null
  });

  // Travel Packer State
  const [travelPacker, setTravelPacker] = useState<TravelPackerState>({
    destination: '',
    duration: '',
    tripType: 'Leisure',
    selectedVibe: 'Sophisticated',
    files: [],
    selectedClosetIds: [],
    result: null,
    selectedItems: new Set<string>(),
    packingMode: 'closet'
  });

  // Body Type Fit State
  const [bodyTypeFit, setBodyTypeFit] = useState<BodyTypeFitState>({
    file: null,
    description: '',
    result: null
  });

  // Luxury Investments State
  const [luxuryInvestments, setLuxuryInvestments] = useState<LuxuryInvestmentsState>({
    messages: [{ role: 'model', text: 'Hello darling! Are we discussing pearls, vintage Chanel, or perhaps a dreamy new investment piece today?' }],
    budget: 1,
    userAge: '25',
    userSize: 'M / US 6'
  });

  return (
    <GlobalContext.Provider value={{
      styleMyCloset, setStyleMyCloset,
      travelPacker, setTravelPacker,
      bodyTypeFit, setBodyTypeFit,
      luxuryInvestments, setLuxuryInvestments
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalProvider");
  }
  return context;
};
