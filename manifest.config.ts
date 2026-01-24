import { defineManifest } from '@crxjs/vite-plugin'
import packageJson from './package.json'
import { blockedSites } from './src/shared/sites'

const { version } = packageJson

// Convert blocked sites to match patterns
const sitePatterns = blockedSites.map(site => `*://*.${site.domain}/*`)

export default defineManifest(async (_env) => ({
    manifest_version: 3,
    name: "Click for Syria",
    version: version,
    version_name: version,
    action: {
        default_popup: "index.html",
    },
    background: {
        service_worker: "src/background.ts",
        type: "module",
    },
    content_scripts: [
        {
            js: ["src/content.tsx"],
            matches: sitePatterns,
        }
    ],
    host_permissions: sitePatterns,
    permissions: ['tabs']
}))
