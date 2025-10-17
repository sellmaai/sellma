export const audienceGroups = {
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

export type AudienceGroup = keyof typeof audienceGroups;

export const audienceGroupLabels = Object.fromEntries(
  Object.entries(audienceGroups).map(([id, cfg]) => [id, cfg.label])
) as Record<AudienceGroup, string>;

export const audienceGroupColors = Object.fromEntries(
  Object.entries(audienceGroups).map(([id, cfg]) => [id, cfg.color])
) as Record<AudienceGroup, string>;

export const audienceGroupDescriptions = Object.fromEntries(
  Object.entries(audienceGroups).map(([id, cfg]) => [id, cfg.description])
) as Record<AudienceGroup, string>;

export const audienceGroupIds = Object.keys(audienceGroups) as AudienceGroup[];
export const audienceGroupList = Object.entries(audienceGroups).map(([id, cfg]) => ({
  id: id as AudienceGroup,
  label: cfg.label,
  color: cfg.color,
  description: cfg.description,
}));


