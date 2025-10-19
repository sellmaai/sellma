"use client";

import type { DataUIPart } from "ai";
import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";
import type { Persona } from "@/lib/personas/types";

type CustomUIDataTypes = {
  "audience-start": {
    audienceId: string;
    audienceDescription: string;
    audienceName: string | null;
    totalPersonas: number;
  };
  "persona-generating": {
    audienceId: string;
    personaNumber: number;
    totalPersonas: number;
  };
  "persona-generated": {
    audienceId: string;
    persona: Persona;
    personaNumber: number;
    totalPersonas: number;
  };
  "audience-complete": {
    audienceId: string;
  };
};
type DataStreamContextValue = {
  dataStream: DataUIPart<CustomUIDataTypes>[];
  setDataStream: React.Dispatch<
    React.SetStateAction<DataUIPart<CustomUIDataTypes>[]>
  >;
};

const DataStreamContext = createContext<DataStreamContextValue | null>(null);

export function DataStreamProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dataStream, setDataStream] = useState<DataUIPart<CustomUIDataTypes>[]>(
    []
  );

  const value = useMemo(() => ({ dataStream, setDataStream }), [dataStream]);

  return (
    <DataStreamContext.Provider value={value}>
      {children}
    </DataStreamContext.Provider>
  );
}

export function useDataStream() {
  const context = useContext(DataStreamContext);
  if (!context) {
    throw new Error("useDataStream must be used within a DataStreamProvider");
  }
  return context;
}
