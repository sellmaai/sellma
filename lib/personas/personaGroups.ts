export const personaGroups = {
  fitness: {
    label: 'Fitness & Wellness',
    color: '#22c55e',
    description: 'Health-conscious consumers focused on exercise, nutrition, and recovery.',
  },
  tech: {
    label: 'Tech Enthusiasts',
    color: '#3b82f6',
    description: 'Early adopters excited by gadgets, software, and emerging tech.',
  },
  beauty: {
    label: 'Beauty & Skincare',
    color: '#ec4899',
    description: 'Shoppers who value self-care, skincare routines, and cosmetics.',
  },
  home: {
    label: 'Home & Lifestyle',
    color: '#a855f7',
    description: 'People invested in home improvement, décor, and daily living.',
  },
  outdoors: {
    label: 'Outdoors & Adventure',
    color: '#f59e0b',
    description: 'Hobbyists into hiking, camping, and outdoor gear.',
  },
} as const;

export type PersonaGroup = keyof typeof personaGroups;

export const personaGroupLabels = Object.fromEntries(
  Object.entries(personaGroups).map(([id, cfg]) => [id, cfg.label])
) as Record<PersonaGroup, string>;

export const personaGroupColors = Object.fromEntries(
  Object.entries(personaGroups).map(([id, cfg]) => [id, cfg.color])
) as Record<PersonaGroup, string>;

export const personaGroupDescriptions = Object.fromEntries(
  Object.entries(personaGroups).map(([id, cfg]) => [id, cfg.description])
) as Record<PersonaGroup, string>;

export const personaGroupIds = Object.keys(personaGroups) as PersonaGroup[];
export const personaGroupList = Object.entries(personaGroups).map(([id, cfg]) => ({
  id: id as PersonaGroup,
  label: cfg.label,
  color: cfg.color,
  description: cfg.description,
}));


