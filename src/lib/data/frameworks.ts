export interface FrameworkDefinition {
  name: string
  steps: string[]
}

export const frameworks: FrameworkDefinition[] = [
  { name: 'Purpose Framework', steps: ['Identity', 'Calling', 'Assignment', 'Responsibility', 'Legacy'] },
  { name: 'Relationship Framework', steps: ['Identity', 'Character', 'Compatibility', 'Communication', 'Covenant'] },
  { name: 'Manhood Framework', steps: ['Identity', 'Responsibility', 'Discipline', 'Leadership', 'Legacy'] },
  { name: 'Business Framework', steps: ['Problem', 'Value', 'Customer', 'System', 'Profit', 'Scale'] },
]
