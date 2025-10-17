'use client';

import { Canvas } from '@/components/ai-elements/canvas';
import { Connection } from '@/components/ai-elements/connection';
import { Controls } from '@/components/ai-elements/controls';
import { Edge } from '@/components/ai-elements/edge';
import {
  Node,
  NodeContent,
  NodeDescription,
  NodeFooter,
  NodeHeader,
  NodeTitle,
} from '@/components/ai-elements/node';
import { Panel } from '@/components/ai-elements/panel';
import { Toolbar } from '@/components/ai-elements/toolbar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AvatarGroup } from '@/components/ui/shadcn-io/avatar-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

const nodeIds = {
  start: 'start',
  process1: 'process1',
  process2: 'process2',
  decision: 'decision',
  output1: 'output1',
  output2: 'output2',
};

const nodes = [
  {
    id: nodeIds.start,
    type: 'workflow',
    position: { x: 0, y: 0 },
    data: {
      label: 'Start',
      description: 'Initialize workflow',
      handles: { target: false, source: true },
      content: 'Triggered by user action at 09:30 AM',
      footer: 'Status: Ready',
    },
  },
  {
    id: nodeIds.process1,
    type: 'workflow',
    position: { x: 500, y: 0 },
    data: {
      label: 'Process Data',
      description: 'Transform input',
      handles: { target: true, source: true },
      content: 'Validating 1,234 records and applying business rules',
      footer: 'Duration: ~2.5s',
    },
  },
  {
    id: nodeIds.decision,
    type: 'workflow',
    position: { x: 1000, y: 0 },
    data: {
      label: 'Decision Point',
      description: 'Route based on conditions',
      handles: { target: true, source: true },
      content: "Evaluating: data.status === 'valid' && data.score > 0.8",
      footer: 'Confidence: 94%',
    },
  },
  {
    id: nodeIds.output1,
    type: 'workflow',
    position: { x: 1500, y: -300 },
    data: {
      label: 'Success Path',
      description: 'Handle success case',
      handles: { target: true, source: true },
      content: '1,156 records passed validation (93.7%)',
      footer: 'Next: Send to production',
    },
  },
  {
    id: nodeIds.output2,
    type: 'workflow',
    position: { x: 1500, y: 300 },
    data: {
      label: 'Error Path',
      description: 'Handle error case',
      handles: { target: true, source: true },
      content: '78 records failed validation (6.3%)',
      footer: 'Next: Queue for review',
    },
  },
  {
    id: nodeIds.process2,
    type: 'workflow',
    position: { x: 2000, y: 0 },
    data: {
      label: 'Complete',
      description: 'Finalize workflow',
      handles: { target: true, source: false },
      content: 'All records processed and routed successfully',
      footer: 'Total time: 4.2s',
    },
  },
];

const edges = [
  {
    id: 'edge1',
    source: nodeIds.start,
    target: nodeIds.process1,
    type: 'animated',
  },
  {
    id: 'edge2',
    source: nodeIds.process1,
    target: nodeIds.decision,
    type: 'animated',
  },
  {
    id: 'edge3',
    source: nodeIds.decision,
    target: nodeIds.output1,
    type: 'animated',
  },
  {
    id: 'edge4',
    source: nodeIds.decision,
    target: nodeIds.output2,
    type: 'temporary',
  },
  {
    id: 'edge5',
    source: nodeIds.output1,
    target: nodeIds.process2,
    type: 'animated',
  },
  {
    id: 'edge6',
    source: nodeIds.output2,
    target: nodeIds.process2,
    type: 'temporary',
  },
];

const nodeTypes = {
  workflow: ({
    data,
  }: {
    data: {
      label: string;
      description: string;
      handles: { target: boolean; source: boolean };
      content: string;
      footer: string;
    };
  }) => (
    <Node handles={data.handles}>
      <NodeHeader>
        <NodeTitle>{data.label}</NodeTitle>
        <NodeDescription>{data.description}</NodeDescription>
      </NodeHeader>
      <NodeContent>
        <p className="text-sm">{data.content}</p>
      </NodeContent>
      <NodeFooter>
        <p className="text-muted-foreground text-xs">{data.footer}</p>
      </NodeFooter>
      <Toolbar>
        <Button size="sm" variant="ghost">
          Edit
        </Button>
        <Button size="sm" variant="ghost">
          Delete
        </Button>
      </Toolbar>
    </Node>
  ),
};

const edgeTypes = {
  animated: Edge.Animated,
  temporary: Edge.Temporary,
};

const Example = () => (
  <Canvas
    edges={edges}
    edgeTypes={edgeTypes}
    fitView
    nodes={nodes}
    nodeTypes={nodeTypes}
    connectionLineComponent={Connection}
  >
    <Controls />
    <Panel position="top-left">
      <Button size="sm" variant="secondary">
        Export
      </Button>
    </Panel>
  </Canvas>
);

export default function WorkflowPage() {
  const personas = useQuery((api as any).personas.listByGroup, { group: 'fitness', limit: 16 }) ?? [];

  return (
    <div className="flex flex-col gap-8">
      <Example />
      <section className="px-6">
        <h2 className="text-lg font-medium mb-3">Personas</h2>
        <TooltipProvider delayDuration={0}>
          <AvatarGroup variant="stack" size={48} animate className="-space-x-3">
            {personas.map((p: any) => (
              <Tooltip key={p.persona_id}>
                <TooltipTrigger asChild>
                  <Avatar>
                    <AvatarFallback>
                      {p.profile.firstName?.[0]}
                      {p.profile.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={16}>
                  <div className="max-w-xs">
                    <div className="font-medium">
                      {p.profile.firstName} {p.profile.lastName} · {p.profile.age}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.profile.occupation} · {p.profile.location.city}, {p.profile.location.state}
                    </div>
                    <div className="mt-2 text-sm">
                      {p.personality.ocean_summary}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </AvatarGroup>
        </TooltipProvider>
      </section>
    </div>
  );
}

// Below: example grid of persona orbs (to be used when wiring personas data)
// import { Orb } from '@/components/ui/orb';
// import { api } from '@/convex/_generated/api';
// import { fetchQuery } from 'convex/nextjs';
//
// export default async function WorkflowWithOrbs() {
//   const personas = await fetchQuery(api.personas.listByGroup, { group: 'fitness', limit: 16 });
//   return (
//     <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
//       {personas.map((p) => (
//         <div key={p.persona_id} className="aspect-square">
//           <Orb colors={["#ffffff", "#87ceeb"]} />
//           <div className="mt-2 text-sm">
//             <div className="font-medium">{p.profile.firstName} {p.profile.lastName}</div>
//             <div className="text-muted-foreground text-xs">{p.personaGroup}</div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }


