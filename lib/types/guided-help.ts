export interface GuidedHelpPrompt {
  question_id: string
  label: string
  response_template: string
}

export interface GuidedHelpCategory {
  category_id: string
  label: string
  questions: GuidedHelpPrompt[]
}

export interface GuidedHelpCatalog {
  version: string
  categories: GuidedHelpCategory[]
}
