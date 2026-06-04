export type AiMode = 'ai' | 'agent';

export type FeatureCard = {
  title: string;
  description: string;
  meta: string;
  accent: string;
};

export type ModeContent = {
  id: AiMode;
  label: string;
  eyebrow: string;
  headline: string;
  subcopy: string;
  consoleLabel: string;
  prompt: string;
  answer: string;
  featureIntro: string;
  features: FeatureCard[];
};

export type Connector = {
  name: string;
  detail: string;
  state: 'Live' | 'Guarded' | 'Preview';
};

export type UseCase = {
  title: string;
  description: string;
  signal: string;
};

export type AccessPlan = {
  name: string;
  description: string;
  price: string;
  badge: string;
  features: string[];
};

export type InsightCard = {
  title: string;
  description: string;
  metric: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const thinkingStages = [
  'Reading DLavie context',
  'Planning response',
  'Checking account access',
  'Preparing answer',
] as const;

export const modeContent: Record<AiMode, ModeContent> = {
  ai: {
    id: 'ai',
    label: 'DLavie AI',
    eyebrow: 'DLavie Intelligence Workspace',
    headline: 'AI support and operating agents for the DLavie ecosystem.',
    subcopy:
      'DLavie AI connects account identity, product guidance, commerce operations, and agent workflows in one cinematic workspace.',
    consoleLabel: 'DLavie AI conversation',
    prompt: 'Help me choose the right DLavie path for product support, PPOB commerce, and automation.',
    answer:
      'I mapped your request into support, commerce, and workflow signals. Start with DLavie AI for guided answers, then unlock DLavieOS Agent when the task needs dashboard action or PPOB operations.',
    featureIntro: 'Conversation-first intelligence for customers, operators, and product discovery.',
    features: [
      {
        title: 'AI Customer Support',
        description: 'Resolve user questions with account-aware guidance, product context, and polished support language.',
        meta: 'Support layer',
        accent: '01',
      },
      {
        title: 'Context Memory',
        description: 'Keep answers aligned with prior intent, workspace state, DLavie documentation, and customer signals.',
        meta: 'Memory fabric',
        accent: '02',
      },
      {
        title: 'Multi-language Response',
        description: 'Serve Indonesian and global users with clear responses prepared for commerce and onboarding flows.',
        meta: 'Language routing',
        accent: '03',
      },
      {
        title: 'Commerce-Aware Answers',
        description: 'Explain product paths, account access, PPOB options, and checkout expectations without generic replies.',
        meta: 'Commerce context',
        accent: '04',
      },
    ],
  },
  agent: {
    id: 'agent',
    label: 'DLavieOS Agent',
    eyebrow: 'DLavieOS Agent Runtime',
    headline: 'Operating agents for workflows, commerce, and tools.',
    subcopy:
      'DLavieOS Agent turns intent into structured action, preparing workflows, tool calls, commerce tasks, and secure operational routes.',
    consoleLabel: 'Agent execution preview',
    prompt: 'Create a safe agent plan for a PPOB order issue, dashboard update, and customer follow-up.',
    answer:
      'Agent mode prepared a guarded workflow: verify account scope, inspect PPOB status, draft the customer update, and queue dashboard actions behind approval checkpoints.',
    featureIntro: 'Action-oriented automation for operators who need safe execution, not just answers.',
    features: [
      {
        title: 'Workflow Automation',
        description: 'Translate user goals into staged workflows for onboarding, support, commerce, and operations.',
        meta: 'Agent runtime',
        accent: 'A1',
      },
      {
        title: 'Tool Orchestration',
        description: 'Coordinate future connectors, dashboards, account context, and business tools from one command surface.',
        meta: 'Tool graph',
        accent: 'A2',
      },
      {
        title: 'PPOB & Commerce Operations',
        description: 'Prepare order checks, PPOB handling, commerce routing, and operational notes with traceable state.',
        meta: 'Commerce rail',
        accent: 'A3',
      },
      {
        title: 'Action Safety Layer',
        description: 'Expose confidence, required approvals, protected data boundaries, and human handoff moments.',
        meta: 'Guardrails',
        accent: 'A4',
      },
    ],
  },
};

export const connectors: Connector[] = [
  { name: 'Account identity', detail: 'Supabase Auth + access state', state: 'Live' },
  { name: 'Product guidance', detail: 'Docs, commerce, onboarding', state: 'Live' },
  { name: 'PPOB operations', detail: 'Orders, payments, status checks', state: 'Guarded' },
  { name: 'Agent tools', detail: 'Dashboards and workflows', state: 'Preview' },
];

export const useCases: UseCase[] = [
  {
    title: 'Customer support cockpit',
    description: 'Turn fragmented account, product, and commerce questions into fast, brand-safe responses.',
    signal: 'Support velocity',
  },
  {
    title: 'Commerce operations desk',
    description: 'Coordinate PPOB, checkout, order status, and escalation details from one operator surface.',
    signal: 'Ops clarity',
  },
  {
    title: 'Founder command layer',
    description: 'Summarize roadmap decisions, product feedback, launch tasks, and ecosystem priorities.',
    signal: 'Executive focus',
  },
];

export const accessPlans: AccessPlan[] = [
  {
    name: 'Starter',
    description: 'For early DLavie AI exploration and account-gated previews.',
    price: 'Rp0',
    badge: 'Preview',
    features: ['AI landing access', 'Local console preview', 'Account-ready CTA'],
  },
  {
    name: 'Operator',
    description: 'For active teams preparing AI support and workflow orchestration.',
    price: 'Rp29k',
    badge: 'Popular',
    features: ['Priority AI workspace', 'Agent mode preview', 'Commerce workflow surface'],
  },
  {
    name: 'Enterprise',
    description: 'For protected operations, private routing, and advanced integrations.',
    price: 'Custom',
    badge: 'Scale',
    features: ['Private model routing', 'Team access controls', 'Advanced tool integrations'],
  },
];

export const insights: InsightCard[] = [
  {
    title: 'Memory-aware guidance',
    description: 'Roadmap layer for retrieving account, product, and knowledge signals before the answer is generated.',
    metric: 'RAG-ready',
  },
  {
    title: 'Guarded agent execution',
    description: 'Every future tool action is designed around approval checkpoints and observable state transitions.',
    metric: 'Safety-first',
  },
  {
    title: 'Cinematic operator UX',
    description: 'The workspace uses motion, hierarchy, and live context to make AI feel trustworthy and premium.',
    metric: 'Premium OS',
  },
];

export const faqItems: FaqItem[] = [
  {
    question: 'What is DLavie AI?',
    answer:
      'DLavie AI is the conversational intelligence surface for support, product guidance, writing, search, and customer intent inside the DLavie ecosystem.',
  },
  {
    question: 'How is DLavieOS Agent different?',
    answer:
      'DLavieOS Agent is the action layer for workflows, tools, commerce tasks, PPOB operations, and dashboard automation with safety checkpoints.',
  },
  {
    question: 'Does it connect to my DLavie Account?',
    answer:
      'The production endpoint requires authenticated DLavie Account access. This page is designed to detect that boundary and keep the public preview safe.',
  },
  {
    question: 'Is the console a real AI integration?',
    answer:
      'The console can call the stable authenticated chat endpoint when a bearer session is available, and falls back to a polished local preview for public visitors.',
  },
];
