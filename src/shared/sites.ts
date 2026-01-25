export interface Contact {
  name: string;
  role?: string;
  email?: string;
  linkedin?: string;
}

export interface BlockedSite {
  name: string; // The display name and asset filename
  domain: string;
  contacts: Contact[];
}

export const blockedSites: BlockedSite[] = [
  {
    name: "OpenAI",
    domain: "openai.com",
    contacts: [
      {
        name: "Anna Makanju",
        role: "Vice President, Global Impact",
        email: "amakanju@openai.com",
        linkedin: "https://www.linkedin.com/in/anna-makanju-6388453a/",
      },
      {
        name: "Chris Lehane",
        role: "Chief Global Affairs Officer",
        email: "chris.lehane@openai.com",
        linkedin: "https://www.linkedin.com/in/chris-lehane-2562535/",
      },
      {
        name: "Ann O'Leary",
        role: "Vice President, Global Policy",
        email: "ann@openai.com",
        linkedin: "https://www.linkedin.com/in/ann-o-leary-2a6a6b6/",
      },
    ],
  },
  {
    name: "ChatGPT",
    domain: "chatgpt.com",
    contacts: [
      {
        name: "Anna Makanju",
        role: "Vice President, Global Impact",
        email: "amakanju@openai.com",
        linkedin: "https://www.linkedin.com/in/anna-makanju-6388453a/",
      },
      {
        name: "Chris Lehane",
        role: "Chief Global Affairs Officer",
        email: "chris.lehane@openai.com",
        linkedin: "https://www.linkedin.com/in/chris-lehane-2562535/",
      },
      {
        name: "Ann O'Leary",
        role: "Vice President, Global Policy",
        email: "ann@openai.com",
        linkedin: "https://www.linkedin.com/in/ann-o-leary-2a6a6b6/",
      },
    ],
  },
  {
    name: "Figma",
    domain: "figma.com",
    contacts: [
      {
        name: "Dylan Field",
        role: "CEO",
        email: "dylan@figma.com",
        linkedin: "https://linkedin.com/in/dylanfield",
      },
      {
        name: "Yuhki Yamashita",
        role: "CPO",
        email: "yuhki@figma.com",
        linkedin: "https://linkedin.com/in/yuhki",
      },
    ],
  },
  {
    name: "Gemini",
    domain: "gemini.google.com",
    contacts: [
      {
        name: "Kent Walker",
        role: "President",
        email: "kentwalker@google.com",
        linkedin: "https://www.linkedin.com/in/kent-walker-5963bb198",
      },
      {
        name: "Karan Bhatia",
        role: "Data Engineer",
        email: "bhatiakaran@google.com",
        linkedin: "https://www.linkedin.com/in/krnbhatia",
      },
      {
        name: "Wilson White",
        role: "Vice President of Government Affairs",
        email: "wilsonw@google.com",
        linkedin: "https://www.linkedin.com/in/wilsonlwhite",
      },
      {
        name: "Karen Dahut",
        role: "CEO of Google Public Sector",
        email: "karendahut@google.com",
        linkedin: "https://www.linkedin.com/in/karen-dahut-24135811/",
      },
    ],
  },
  {
    name: "PayPal",
    domain: "paypal.com",
    contacts: [
      {
        name: "Richard Nash",
        role: "Vice President, Head of Global Government Relations",
        email: "richardn@paypal.com",
        linkedin: "https://www.linkedin.com/in/nashrichard/",
      },
      {
        name: "Bimal Patel",
        role: "Executive Vice President and Chief Legal Officer",
        email: "patelbimal@paypal.com",
        linkedin: "https://www.linkedin.com/in/letaplamib/ ",
      },
      {
        name: "Otto Williams",
        role: "Senior Vice President, Regional Head and GM Middle East and Africa",
        email: "oabasi-williams@paypal.com",
        linkedin: "https://www.linkedin.com/in/ottowilliams/",
      },
      {
        name: "Andrea Donkor",
        role: "Senior Vice President, Global Chief Compliance Officer",
        email: "adonkor@paypal.com",
        linkedin: "https://www.linkedin.com/in/andrea-donkor-3631689/",
      },
    ],
  },
  {
    name: "Anthropic",
    domain: "anthropic.com",
    contacts: [
      {
        name: "Michael Sellitto",
        role: "Global Affairs Director",
        email: "michael@anthropic.com",
        linkedin: "https://www.linkedin.com/in/michael-sellitto-1898a95",
      },
      {
        name: "Chomnan Loth",
        role: "Head of Risk Management",
        email: "chomnan@anthropic.com",
        linkedin: "https://www.linkedin.com/in/chomnanloth",
      },
    ],
  },
  {
    name: "Claude",
    domain: "claude.ai",
    contacts: [
      {
        name: "Michael Sellitto",
        role: "Global Affairs Director",
        email: "michael@anthropic.com",
        linkedin: "https://www.linkedin.com/in/michael-sellitto-1898a95",
      },
      {
        name: "Chomnan Loth",
        role: "Head of Risk Management",
        email: "chomnan@anthropic.com",
        linkedin: "https://www.linkedin.com/in/chomnanloth",
      },
    ],
  },
  {
    name: "Slack",
    domain: "slack.com",
    contacts: [
      {
        name: "Hugh Gamble",
        role: "Vice President, Government Affairs",
        email: "hgamble@salesforce.com",
        linkedin: "https://www.linkedin.com/in/hugh-gamble-059ba09",
      },
      {
        name: "Sabastian Niles",
        role: "Chief Legal Officer",
        email: "sniles@salesforce.com",
        linkedin: "https://www.linkedin.com/in/sabastianvniles",
      },
    ],
  },
  {
    name: "Udemy",
    domain: "udemy.com",
    contacts: [
      {
        name: "Jewel Hefner",
        role: "Senior Manager, Governance Risk and Compliance",
        email: "jewel.hefner@udemy.com",
        linkedin: "https://www.linkedin.com/in/jewelhefner",
      },
      {
        name: "Sonya Saunder",
        role: "Vice President, Strategy, Biz Ops & Chief of Staff",
        email: "sonya.saunder@udemy.com",
        linkedin: "https://www.linkedin.com/in/ssaunder/",
      },
    ],
  },
  {
    name: "Apple App Store",
    domain: "apps.apple.com",
    contacts: [
      {
        name: "Kamal Mouhcine",
        role: "Head of MENA",
        email: "kmouhcine@apple.com",
        linkedin: "https://www.linkedin.com/in/kamouhci",
      },
      {
        name: "Tim Powderly",
        role: "Senior Director of Government Affairs",
        email: "tpowderly@apple.com",
        linkedin: "https://www.linkedin.com/in/tim-powderly-7b72025",
      },
      {
        name: "Heba Hamouda",
        role: "Chief Compliance Officer",
        email: "hhamouda@apple.com",
        linkedin: "https://www.linkedin.com/in/heba-hamouda-2613bb9",
      },
    ],
  },
  {
    name: "Coursera",
    domain: "coursera.org",
    contacts: [
      {
        name: "Alan Cardenas",
        role: "Senior Vice President, General Counsel",
        email: "acardenas@coursera.org",
        linkedin: "https://www.linkedin.com/in/alan-cardenas",
      },
      {
        name: "Greg Hart",
        role: "Chief Executive Officer ",
        email: "ghart@coursera.org",
        linkedin: "https://www.linkedin.com/in/whoisgreghart/",
      },
    ],
  },
  {
    name: "GitLab",
    domain: "gitlab.com",
    contacts: [
      {
        name: "John Coghlan",
        role: "Director of Developer Advocacy",
        email: "jcoghlan@gitlab.com",
        linkedin: "https://www.linkedin.com/in/johnwcoghlan",
      },
      {
        name: "Rachel Pack",
        role: "Director of Legal Affairs",
        email: "rpack@gitlab.com",
        linkedin: "https://www.linkedin.com/in/rachel-pack-91ba7857",
      },
    ],
  },
];
