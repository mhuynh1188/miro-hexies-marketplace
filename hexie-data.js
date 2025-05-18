// hexie-data.js - All hexie data including expanded anti-patterns

export const HEXIE_DATA = {
    methods: [
      {
        id: 'methods-1',
        title: 'Retrospective',
        category: 'methods',
        icon: '🔍',
        summary: 'Reflect and improve team processes',
        details: 'A collaborative session to discuss what went well, what didn\'t, and how to improve in the next iteration. Essential for continuous improvement.',
        reference: 'https://www.atlassian.com/team-playbook/plays/retrospective',
        free: true,
        tags: ['agile', 'continuous-improvement', 'team-building']
      },
      {
        id: 'methods-2',
        title: 'Design Thinking',
        category: 'methods',
        icon: '💡',
        summary: 'Human-centered problem solving',
        details: 'A methodology for creative problem solving that focuses on understanding users and reframing problems. Includes empathize, define, ideate, prototype, and test phases.',
        reference: 'https://designthinking.ideo.com/',
        free: false,
        tags: ['innovation', 'user-centered', 'creativity']
      },
      {
        id: 'methods-3',
        title: 'Lean Canvas',
        category: 'methods',
        icon: '📋',
        summary: 'One-page business model canvas',
        details: 'A simplified business model canvas that focuses on problem, solution, key metrics, and unique value proposition.',
        reference: 'https://leanstack.com/lean-canvas',
        free: false,
        tags: ['business-model', 'startup', 'validation']
      },
      {
        id: 'methods-4',
        title: 'SWOT Analysis',
        category: 'methods',
        icon: '⚖️',
        summary: 'Analyze strengths, weaknesses, opportunities, threats',
        details: 'Strategic planning tool to evaluate internal and external factors affecting an organization or project.',
        reference: 'https://www.mindtools.com/pages/article/newTMC_05.htm',
        free: true,
        tags: ['strategy', 'analysis', 'planning']
      },
      {
        id: 'methods-5',
        title: 'OKRs Framework',
        category: 'methods',
        icon: '🎯',
        summary: 'Objectives and Key Results planning',
        details: 'Goal-setting framework to define and track objectives and their key measurable results.',
        reference: 'https://www.whatmatters.com/faqs/okr-meaning-definition-example',
        free: false,
        tags: ['goals', 'measurement', 'alignment']
      }
    ],
  
    teams: [
      {
        id: 'teams-1',
        title: 'Team Charter',
        category: 'teams',
        icon: '🤝',
        summary: 'Define team purpose and ways of working',
        details: 'Establish clear expectations, values, and collaboration guidelines for your team. Includes mission, vision, roles, and communication protocols.',
        reference: 'https://rework.withgoogle.com/guides/teams-create-charter/steps/introduction/',
        free: false,
        tags: ['alignment', 'expectations', 'collaboration']
      },
      {
        id: 'teams-2',
        title: 'Tuckman Stages',
        category: 'teams',
        icon: '🌱',
        summary: 'Team development lifecycle',
        details: 'Understand and navigate through Forming, Storming, Norming, and Performing stages of team development.',
        reference: 'https://en.wikipedia.org/wiki/Tuckman%27s_stages_of_group_development',
        free: true,
        tags: ['development', 'psychology', 'leadership']
      },
      {
        id: 'teams-3',
        title: 'RACI Matrix',
        category: 'teams',
        icon: '📊',
        summary: 'Clarify roles and responsibilities',
        details: 'Define who is Responsible, Accountable, Consulted, and Informed for each task or decision.',
        reference: 'https://www.teamgantt.com/blog/raci-chart-definition-tips-and-example',
        free: false,
        tags: ['responsibility', 'clarity', 'governance']
      },
      {
        id: 'teams-4',
        title: 'Team Health Check',
        category: 'teams',
        icon: '🏥',
        summary: 'Assess team performance and wellbeing',
        details: 'Regular assessment tool to evaluate team dynamics, performance, and identify areas for improvement.',
        reference: 'https://dzone.com/articles/team-health-check-a-powerful-tool',
        free: true,
        tags: ['assessment', 'wellbeing', 'improvement']
      }
    ],
  
    product: [
      {
        id: 'product-1',
        title: 'User Story Mapping',
        category: 'product',
        icon: '🗺️',
        summary: 'Visualize user journey and features',
        details: 'Create a shared understanding of the user experience and prioritize features based on user value and journey flow.',
        reference: 'https://www.jpattonassociates.com/user-story-mapping/',
        free: true,
        tags: ['user-experience', 'prioritization', 'journey']
      },
      {
        id: 'product-2',
        title: 'Product Roadmap',
        category: 'product',
        icon: '🛣️',
        summary: 'Strategic product development timeline',
        details: 'Visual timeline showing product evolution, feature releases, and strategic initiatives over time.',
        reference: 'https://www.productplan.com/guide/product-roadmap/',
        free: false,
        tags: ['strategy', 'planning', 'communication']
      },
      {
        id: 'product-3',
        title: 'Value Proposition Canvas',
        category: 'product',
        icon: '💎',
        summary: 'Match products to customer needs',
        details: 'Visualize how your product creates value by addressing customer jobs, pains, and gains.',
        reference: 'https://www.strategyzer.com/canvas/value-proposition-canvas',
        free: false,
        tags: ['value', 'customer-needs', 'fit']
      },
      {
        id: 'product-4',
        title: 'Feature Prioritization',
        category: 'product',
        icon: '🏆',
        summary: 'Prioritize features using frameworks',
        details: 'Apply frameworks like RICE, MoSCoW, or Kano model to objectively prioritize product features.',
        reference: 'https://blog.productboard.com/feature-prioritization-techniques/',
        free: true,
        tags: ['prioritization', 'decision-making', 'frameworks']
      }
    ],
  
    leadership: [
      {
        id: 'leadership-1',
        title: 'Leadership Canvas',
        category: 'leadership',
        icon: '👑',
        summary: 'Map leadership vision and strategy',
        details: 'A visual tool to define and communicate leadership direction, values, and strategic initiatives.',
        reference: 'https://www.strategyzer.com/leadership-canvas',
        free: false,
        tags: ['vision', 'strategy', 'communication']
      },
      {
        id: 'leadership-2',
        title: 'Situational Leadership',
        category: 'leadership',
        icon: '🎭',
        summary: 'Adapt leadership style to situation',
        details: 'Framework for adjusting leadership approach based on team maturity and task complexity.',
        reference: 'https://www.kenblanchard.com/Products/Situational-Leadership',
        free: false,
        tags: ['adaptability', 'development', 'styles']
      },
      {
        id: 'leadership-3',
        title: 'Delegation Matrix',
        category: 'leadership',
        icon: '🎯',
        summary: 'Effective task delegation framework',
        details: 'Structure for deciding what to delegate, to whom, and how to ensure successful completion.',
        reference: 'https://www.mindtools.com/pages/article/delegation.htm',
        free: true,
        tags: ['delegation', 'empowerment', 'efficiency']
      },
      {
        id: 'leadership-4',
        title: 'Feedback Models',
        category: 'leadership',
        icon: '💬',
        summary: 'Structured approaches to giving feedback',
        details: 'Learn SBI, COIN, and other models for delivering effective, constructive feedback.',
        reference: 'https://www.ccl.org/articles/leading-effectively-articles/provide-feedback-using-situation-behavior-impact/',
        free: true,
        tags: ['feedback', 'communication', 'development']
      }
    ],
  
    'anti-patterns': [
      {
        id: 'anti-1',
        title: 'Confirmation Bias',
        category: 'anti-patterns',
        icon: '🚫',
        summary: 'Seeking only confirming information',
        details: 'The tendency to search for or interpret information that confirms preexisting beliefs, leading to poor decisions.',
        reference: 'https://en.wikipedia.org/wiki/Confirmation_bias',
        free: true,
        tags: ['bias', 'decision-making', 'critical-thinking']
      },
      {
        id: 'anti-2',
        title: 'Analysis Paralysis',
        category: 'anti-patterns',
        icon: '🔄',
        summary: 'Over-analyzing instead of acting',
        details: 'Spending excessive time analyzing options without making decisions or taking action, often due to fear of making the wrong choice.',
        reference: 'https://www.psychologytoday.com/us/blog/stretching-theory/201903/analysis-paralysis',
        free: true,
        tags: ['decision-making', 'perfectionism', 'action']
      },
      {
        id: 'anti-3',
        title: 'Micromanagement',
        category: 'anti-patterns',
        icon: '🔍',
        summary: 'Excessive control over team members',
        details: 'Over-supervising employees\' work, making decisions they should make, and failing to trust team capabilities.',
        reference: 'https://www.indeed.com/career-advice/career-development/what-is-micromanagement',
        free: false,
        tags: ['management', 'trust', 'autonomy']
      },
      {
        id: 'anti-4',
        title: 'Groupthink',
        category: 'anti-patterns',
        icon: '🐑',
        summary: 'Conformity over critical thinking',
        details: 'When desire for harmony results in irrational or dysfunctional decision-making, suppressing dissent and critical evaluation.',
        reference: 'https://www.psychologytoday.com/us/basics/groupthink',
        free: false,
        tags: ['group-dynamics', 'decision-making', 'diversity']
      },
      {
        id: 'anti-5',
        title: 'Meeting Overload',
        category: 'anti-patterns',
        icon: '📅',
        summary: 'Too many unproductive meetings',
        details: 'Scheduling excessive meetings without clear agendas or outcomes, reducing actual productive work time.',
        reference: 'https://hbr.org/2022/03/the-curse-of-the-endless-meeting',
        free: true,
        tags: ['productivity', 'time-management', 'efficiency']
      },
      {
        id: 'anti-6',
        title: 'Sunk Cost Fallacy',
        category: 'anti-patterns',
        icon: '💸',
        summary: 'Continuing bad investments',
        details: 'Continuing a project or decision based on previously invested resources rather than future value.',
        reference: 'https://thedecisionlab.com/biases/the-sunk-cost-fallacy',
        free: false,
        tags: ['economics', 'decision-making', 'investment']
      },
      {
        id: 'anti-7',
        title: 'Feature Creep',
        category: 'anti-patterns',
        icon: '🔧',
        summary: 'Excessive feature additions',
        details: 'Continuously adding features without considering user needs or product focus, leading to bloated solutions.',
        reference: 'https://www.productplan.com/glossary/feature-creep/',
        free: true,
        tags: ['product-management', 'scope', 'focus']
      },
      {
        id: 'anti-8',
        title: 'Blame Culture',
        category: 'anti-patterns',
        icon: '👆',
        summary: 'Focusing on blame over solutions',
        details: 'Organizational culture that prioritizes finding fault over learning from mistakes and improving processes.',
        reference: 'https://www.blamelesshq.com/blog/what-is-blame-culture',
        free: false,
        tags: ['culture', 'learning', 'improvement']
      },
      {
        id: 'anti-9',
        title: 'Not Invented Here',
        category: 'anti-patterns',
        icon: '🏠',
        summary: 'Rejecting external solutions',
        details: 'Refusing to use existing external solutions and insisting on building everything in-house, often inefficiently.',
        reference: 'https://en.wikipedia.org/wiki/Not_invented_here',
        free: true,
        tags: ['innovation', 'efficiency', 'pride']
      },
      {
        id: 'anti-10',
        title: 'Hero Syndrome',
        category: 'anti-patterns',
        icon: '🦸',
        summary: 'Single person saving the day',
        details: 'Over-reliance on one individual to solve problems, creating bottlenecks and knowledge silos.',
        reference: 'https://www.atlassian.com/blog/productivity/what-is-hero-culture',
        free: false,
        tags: ['dependency', 'knowledge-sharing', 'sustainability']
      },
      {
        id: 'anti-11',
        title: 'Perfectionism',
        category: 'anti-patterns',
        icon: '✨',
        summary: 'Delaying progress for perfection',
        details: 'Setting unrealistic standards that prevent completion and delivery of valuable solutions.',
        reference: 'https://hbr.org/2018/12/how-perfectionism-can-hurt-your-productivity',
        free: true,
        tags: ['productivity', 'completion', 'iteration']
      },
      {
        id: 'anti-12',
        title: 'Communication Silos',
        category: 'anti-patterns',
        icon: '🏢',
        summary: 'Isolated team communication',
        details: 'Teams working in isolation without sharing information, leading to duplicated effort and misalignment.',
        reference: 'https://www.inc.com/peter-economy/how-to-break-down-silos-and-build-a-more-collaborative-workplace.html',
        free: false,
        tags: ['communication', 'collaboration', 'alignment']
      }
    ]
  };
  
  export const CATEGORY_CONFIG = {
    methods: {
      color: '#4285f4',
      name: 'Methods',
      description: 'Proven frameworks and methodologies'
    },
    teams: {
      color: '#34a853',
      name: 'Teams',
      description: 'Team building and collaboration tools'
    },
    product: {
      color: '#fbbc04',
      name: 'Product',
      description: 'Product management and strategy'
    },
    leadership: {
      color: '#ea4335',
      name: 'Leadership',
      description: 'Leadership and management frameworks'
    },
    'anti-patterns': {
      color: '#9c27b0',
      name: 'Anti-patterns',
      description: 'Common pitfalls to avoid'
    }
  };
  
  export const SUBSCRIPTION_PLANS = {
    free: {
      name: 'Free',
      price: 0,
      maxHexies: 5,
      features: ['Basic hexies', 'Limited anti-patterns'],
      hexieAccess: ['free']
    },
    premium: {
      name: 'Premium',
      price: 9.99,
      billing: 'monthly',
      maxHexies: 25,
      features: ['All hexies', 'Advanced frameworks', 'Priority support'],
      hexieAccess: ['free', 'premium']
    },
    enterprise: {
      name: 'Enterprise', 
      price: 49.99,
      billing: 'monthly',
      maxHexies: -1, // unlimited
      features: ['Unlimited hexies', 'Custom hexies', 'Team management', 'Advanced analytics'],
      hexieAccess: ['free', 'premium', 'enterprise']
    }
  };