import React, { createContext, ReactNode, useContext, useState } from 'react';

interface Agent {
  $id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  agency?: string;
  rating?: number;
  location?: string;
  isOnline?: boolean;
  bio?: string;
  experience?: string;
  specialties?: string[];
  totalSales?: number;
}

interface AgentsContextType {
  agents: Record<string, Agent>;
  setAgent: (agentId: string, agent: Agent) => void;
  getAgent: (agentId: string) => Agent | null;
  clearAgents: () => void;
}

const AgentsContext = createContext<AgentsContextType | undefined>(undefined);

export const AgentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Record<string, Agent>>({});

  const setAgent = (agentId: string, agent: Agent) => {
    setAgents(prev => ({
      ...prev,
      [agentId]: agent
    }));
  };

  const getAgent = (agentId: string): Agent | null => {
    return agents[agentId] || null;
  };

  const clearAgents = () => {
    setAgents({});
  };

  return (
    <AgentsContext.Provider value={{
      agents,
      setAgent,
      getAgent,
      clearAgents
    }}>
      {children}
    </AgentsContext.Provider>
  );
};

export const useAgents = () => {
  const context = useContext(AgentsContext);
  if (context === undefined) {
    throw new Error('useAgents must be used within an AgentsProvider');
  }
  return context;
};