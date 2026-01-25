export interface Contact {
    name: string;
    role?: string;
    email?: string;
    linkedin?: string;
}

export interface BlockedSite {
    domain: string;
    contacts: Contact[];
}

export const blockedSites: BlockedSite[] = [
    {
        domain: 'openai.com',
        contacts: [
            {
                name: 'Sam Altman',
                role: 'CEO',
                email: 'sam@openai.com',
                linkedin: 'https://linkedin.com/in/samaltman'
            },
            {
                name: 'Greg Brockman',
                role: 'President',
                email: 'greg@openai.com',
                linkedin: 'https://linkedin.com/in/gregbrockman'
            }
        ]
    },
    {
        domain: 'chatgpt.com',
        contacts: [
            {
                name: 'Sam Altman',
                role: 'CEO',
                email: 'sam@openai.com',
                linkedin: 'https://linkedin.com/in/samaltman'
            },
            {
                name: 'Greg Brockman',
                role: 'President',
                email: 'greg@openai.com',
                linkedin: 'https://linkedin.com/in/gregbrockman'
            }
        ]
    },
    {
        domain: 'figma.com',
        contacts: [
            {
                name: 'Dylan Field',
                role: 'CEO',
                email: 'dylan@figma.com',
                linkedin: 'https://linkedin.com/in/dylanfield'
            },
            {
                name: 'Yuhki Yamashita',
                role: 'CPO',
                email: 'yuhki@figma.com',
                linkedin: 'https://linkedin.com/in/yuhki'
            }
        ]
    },
    {
        domain: 'aws.amazon.com',
        contacts: [
            {
                name: 'Adam Selipsky',
                role: 'CEO',
                email: 'adam@amazon.com',
                linkedin: 'https://linkedin.com/in/adamselipsky'
            },
            {
                name: 'Werner Vogels',
                role: 'CTO',
                email: 'werner@amazon.com',
                linkedin: 'https://linkedin.com/in/wernervogels'
            }
        ]
    },
];
