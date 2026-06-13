// J.U.L.I.U.S - Data Module
// All data for the J.U.L.I.U.S dashboard

export interface ResourceCard {
  id: string;
  name: string;
  description: string;
  url: string;
  tags: string[];
  level: string;
}

export interface LevelData {
  level: string;
  name: string;
  color: string;
  colorHex: string;
  description: string;
  warning?: string;
  resources: ResourceCard[];
}

export interface ToolData {
  id: string;
  name: string;
  description: string;
  level: string;
  url: string;
  category: string;
}

export interface AIToolData {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  url: string;
}

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  description: string;
  icon: string;
}

export interface OPSECGuide {
  level: string;
  name: string;
  browser: string;
  vpn: string;
  tools: string[];
  practices: string[];
  codeSnippet: string;
}

export interface LinkItem {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  level: string;
  tags: string[];
  starred: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "security" | "warning" | "update" | "alert";
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  read: boolean;
  actionUrl: string | null;
  actionLabel: string | null;
  createdAt: string;
}

export interface BlockedResource {
  id: string;
  domain: string;
  reason: string;
  hits: number;
  addedAt: string;
}

export interface SecurityLogEntry {
  id: string;
  timestamp: string;
  eventType: string;
  details: string;
  riskLevel: "info" | "low" | "medium" | "high" | "critical";
}

// ============================================
// LEVELS DATA
// ============================================
export const LEVELS_DATA: LevelData[] = [
  {
    level: "L1",
    name: "Surface Web",
    color: "green",
    colorHex: "#00ff41",
    description: "Publicly indexed resources and tools for open-source intelligence gathering. Safe for general research with no special access requirements.",
    resources: [
      {
        id: "r001",
        name: "Shodan",
        description: "Search engine for internet-connected devices. Find exposed services, open ports, and industrial control systems across the global internet.",
        url: "https://www.shodan.io",
        tags: ["device-search", "port-scanning", "iot", "osint"],
        level: "L1",
      },
      {
        id: "r002",
        name: "Censys",
        description: "Internet asset discovery and attack surface monitoring. Maps TLS certificates, open services, and host configurations worldwide.",
        url: "https://search.censys.io",
        tags: ["certificate", "host-discovery", "attack-surface"],
        level: "L1",
      },
      {
        id: "r003",
        name: "Have I Been Pwned",
        description: "Check if email addresses or passwords have been exposed in known data breaches. Essential credential monitoring tool.",
        url: "https://haveibeenpwned.com",
        tags: ["breach-check", "credential", "osint"],
        level: "L1",
      },
      {
        id: "r004",
        name: "VirusTotal",
        description: "Multi-engine file and URL analysis platform. Scans with 70+ AV engines and provides behavioral analysis reports.",
        url: "https://www.virustotal.com",
        tags: ["malware", "scanning", "threat-intel"],
        level: "L1",
      },
      {
        id: "r005",
        name: "DNSDumpster",
        description: "DNS reconnaissance and domain research tool. Enumerates subdomains, DNS records, and related infrastructure.",
        url: "https://dnsdumpster.com",
        tags: ["dns", "recon", "subdomain"],
        level: "L1",
      },
      {
        id: "r006",
        name: "URLScan.io",
        description: "Website screenshot and analysis service for detecting malicious content, tracking resources, and security headers.",
        url: "https://urlscan.io",
        tags: ["scanning", "analysis", "phishing"],
        level: "L1",
      },
    ],
  },
  {
    level: "L2",
    name: "Deep Web",
    color: "orange",
    colorHex: "#ff6b35",
    description: "Non-indexed resources requiring authentication or special access. Includes vulnerability databases, security forums, and research archives.",
    warning: "VPN recommended for accessing these resources.",
    resources: [
      {
        id: "r007",
        name: "Exploit-DB",
        description: "Offensive Security's official exploit and vulnerability archive with CVE-indexed proof-of-concept exploits.",
        url: "https://www.exploit-db.com",
        tags: ["exploit", "poc", "cve", "offsec"],
        level: "L2",
      },
      {
        id: "r008",
        name: "MITRE CVE",
        description: "Standardized identifier system for publicly known cybersecurity vulnerabilities with severity assessments.",
        url: "https://cve.mitre.org",
        tags: ["cve", "vulnerability", "standard"],
        level: "L2",
      },
      {
        id: "r009",
        name: "NVD NIST",
        description: "National Vulnerability Database. CVSS scoring, severity ratings, and patch information for all known vulnerabilities.",
        url: "https://nvd.nist.gov",
        tags: ["cve", "cvss", "vulnerability", "nist"],
        level: "L2",
      },
      {
        id: "r010",
        name: "Nuclei Templates",
        description: "12,000+ YAML templates covering CVEs, misconfigurations, and exposure checks for automated scanning.",
        url: "https://github.com/projectdiscovery/nuclei-templates",
        tags: ["scanning", "automation", "templates"],
        level: "L2",
      },
      {
        id: "r011",
        name: "Hack The Box",
        description: "Online cybersecurity training platform with vulnerable machines, challenges, and professional labs.",
        url: "https://www.hackthebox.com",
        tags: ["training", "practice", "ctf"],
        level: "L2",
      },
      {
        id: "r012",
        name: "TryHackMe",
        description: "Learn cybersecurity through guided, gamified lessons and hands-on labs for all skill levels.",
        url: "https://tryhackme.com",
        tags: ["training", "learning", "beginner"],
        level: "L2",
      },
    ],
  },
  {
    level: "L3",
    name: "Threat Intel",
    color: "yellow",
    colorHex: "#ffd700",
    description: "Threat intelligence platforms and IOC sharing communities. Access requires vetting and often NDA agreements.",
    warning: "Verify authorization before accessing. NDA may be required.",
    resources: [
      {
        id: "r013",
        name: "MISP Threat Sharing",
        description: "Open-source threat intelligence platform for sharing, storing, and correlating indicators of compromise.",
        url: "https://www.misp-project.org",
        tags: ["threat-intel", "sharing", "ioc"],
        level: "L3",
      },
      {
        id: "r014",
        name: "AlienVault OTX",
        description: "Open Threat Exchange - community-driven threat intelligence with pulses, IOCs, and correlation data.",
        url: "https://otx.alienvault.com",
        tags: ["threat-intel", "community", "ioc"],
        level: "L3",
      },
      {
        id: "r015",
        name: "Abuse.ch",
        description: "Multiple threat intelligence projects including URLhaus, MalwareBazaar, and SSLBL for tracking malicious infrastructure.",
        url: "https://abuse.ch",
        tags: ["malware", "tracking", "infrastructure"],
        level: "L3",
      },
      {
        id: "r016",
        name: "ThreatConnect",
        description: "Threat intelligence platform that aggregates, analyzes, and acts on threat data from multiple sources.",
        url: "https://threatconnect.com",
        tags: ["threat-intel", "analysis", "automation"],
        level: "L3",
      },
      {
        id: "r017",
        name: "OpenCTI",
        description: "Open-source threat intelligence platform for managing cyber threat knowledge with STIX2 support.",
        url: "https://www.opencti.io",
        tags: ["threat-intel", "stix", "knowledge"],
        level: "L3",
      },
    ],
  },
  {
    level: "L4",
    name: "Dark Web",
    color: "red",
    colorHex: "#ff4444",
    description: "Dark web research resources accessed via Tor. For legitimate security research and threat monitoring only.",
    warning: "CRITICAL: Full OPSEC required. Use Tor + VPN. Never use personal accounts.",
    resources: [
      {
        id: "r018",
        name: "Ahmia Search",
        description: "Tor search engine for discovering .onion services. Focused on legitimate research content.",
        url: "https://ahmia.fi",
        tags: ["tor", "dark-web", "search"],
        level: "L4",
      },
      {
        id: "r019",
        name: "Dread Forum",
        description: "Tor-based discussion forum for security research and threat intelligence community discussions.",
        url: "https://dreadforum.com",
        tags: ["forum", "community", "discussion"],
        level: "L4",
      },
      {
        id: "r020",
        name: "DarkOwl Vision",
        description: "Dark web data platform for monitoring and analyzing threat actor activities and leaked credentials.",
        url: "https://www.darkowl.com",
        tags: ["monitoring", "threat-actors", "credentials"],
        level: "L4",
      },
      {
        id: "r021",
        name: "Flashpoint Intelligence",
        description: "Threat intelligence from illicit communities, providing actionable insights on threat actors and operations.",
        url: "https://www.flashpoint.io",
        tags: ["intelligence", "threat-actors", "illicit"],
        level: "L4",
      },
    ],
  },
  {
    level: "L5",
    name: "Restricted",
    color: "purple",
    colorHex: "#a855f7",
    description: "Offensive security and exploitation resources. Strict authorization and rules of engagement required at all times.",
    warning: "RESTRICTED: Written authorization (ROE) mandatory. Legal review required before use.",
    resources: [
      {
        id: "r022",
        name: "Metasploit Framework",
        description: "Penetration testing framework with thousands of exploits. Use only with written authorization and defined scope.",
        url: "https://www.metasploit.com",
        tags: ["pentest", "framework", "exploitation"],
        level: "L5",
      },
      {
        id: "r023",
        name: "Cobalt Strike",
        description: "Adversary simulation tool for red team operations. Requires valid license and authorization documentation.",
        url: "https://www.cobaltstrike.com",
        tags: ["red-team", "adversary-sim", "c2"],
        level: "L5",
      },
      {
        id: "r024",
        name: "Core Impact",
        description: "Enterprise penetration testing software with automated exploitation and reporting capabilities.",
        url: "https://www.coresecurity.com",
        tags: ["pentest", "enterprise", "automated"],
        level: "L5",
      },
      {
        id: "r025",
        name: "Canvas Exploitation Framework",
        description: "Exploitation framework with hundreds of exploits and automated exploitation capabilities.",
        url: "https://www.immunityinc.com",
        tags: ["exploitation", "framework", "automated"],
        level: "L5",
      },
    ],
  },
];

// ============================================
// TOOLS DATA
// ============================================
export const TOOLS_DATA: ToolData[] = [
  {
    id: "t001",
    name: "Nmap",
    description: "Network exploration and security auditing tool. The industry standard for port scanning and service detection.",
    level: "L2",
    url: "https://nmap.org",
    category: "recon",
  },
  {
    id: "t002",
    name: "Burp Suite",
    description: "Web application security testing platform. Industry-leading proxy and scanner for web vuln assessment.",
    level: "L2",
    url: "https://portswigger.net/burp",
    category: "web",
  },
  {
    id: "t003",
    name: "Wireshark",
    description: "Network protocol analyzer for capturing and inspecting network traffic in real-time.",
    level: "L1",
    url: "https://www.wireshark.org",
    category: "network",
  },
  {
    id: "t004",
    name: "Metasploit",
    description: "Penetration testing framework with exploit development, payload generation, and post-exploitation modules.",
    level: "L5",
    url: "https://www.metasploit.com",
    category: "exploitation",
  },
  {
    id: "t005",
    name: "BloodHound",
    description: "Active Directory analysis tool that maps attack paths and privilege escalation routes in AD environments.",
    level: "L3",
    url: "https://github.com/BloodHoundAD/BloodHound",
    category: "ad",
  },
  {
    id: "t006",
    name: "Nuclei",
    description: "Fast vulnerability scanner using YAML templates. Detects CVEs, misconfigurations, and exposed services.",
    level: "L2",
    url: "https://github.com/projectdiscovery/nuclei",
    category: "scanning",
  },
  {
    id: "t007",
    name: "Sliver",
    description: "Open-source cross-platform adversary emulation framework. Modern alternative to Cobalt Strike.",
    level: "L4",
    url: "https://github.com/BishopFox/sliver",
    category: "c2",
  },
  {
    id: "t008",
    name: "Ligolo-ng",
    description: "Tunneling/pivoting tool for penetration testers. Create tunnel proxies through compromised hosts.",
    level: "L3",
    url: "https://github.com/nicocha30/ligolo-ng",
    category: "tunneling",
  },
  {
    id: "t009",
    name: "SQLMap",
    description: "Automated SQL injection detection and exploitation tool. Supports multiple database management systems.",
    level: "L3",
    url: "https://sqlmap.org",
    category: "web",
  },
  {
    id: "t010",
    name: "Gobuster",
    description: "Directory/file/DNS busting tool using brute-force with wordlists to find hidden resources.",
    level: "L2",
    url: "https://github.com/OJ/gobuster",
    category: "recon",
  },
];

// ============================================
// AI TOOLS DATA
// ============================================
export const AI_TOOLS_DATA: AIToolData[] = [
  {
    id: "ai001",
    name: "Security Copilot",
    description: "AI-powered security assistant that helps analyze threats, interpret scan results, and recommend remediation strategies.",
    capabilities: ["Threat Analysis", "Remediation Guidance", "Scan Interpretation", "Security Q&A"],
    url: "#",
  },
  {
    id: "ai002",
    name: "Threat Intelligence AI",
    description: "Machine learning-driven threat intelligence aggregator that correlates IOCs across multiple feeds and predicts emerging threats.",
    capabilities: ["IOC Correlation", "Threat Prediction", "Feed Aggregation", "Trend Analysis"],
    url: "#",
  },
  {
    id: "ai003",
    name: "Code Analysis AI",
    description: "Static and dynamic code analysis engine that identifies vulnerabilities in source code with AI-powered false positive reduction.",
    capabilities: ["SAST/DAST", "Vulnerability Detection", "False Positive Reduction", "Code Review"],
    url: "#",
  },
  {
    id: "ai004",
    name: "Vulnerability Scanner AI",
    description: "Intelligent vulnerability scanner that adapts scanning strategies based on target behavior and prior findings.",
    capabilities: ["Adaptive Scanning", "CVE Matching", "Exploit Prediction", "Risk Scoring"],
    url: "#",
  },
  {
    id: "ai005",
    name: "Phishing Detector AI",
    description: "AI system for detecting and analyzing phishing campaigns, emails, and fraudulent websites in real-time.",
    capabilities: ["Email Analysis", "URL Inspection", "Brand Impersonation", "Campaign Tracking"],
    url: "#",
  },
  {
    id: "ai006",
    name: "Network Monitor AI",
    description: "AI-enhanced network monitoring that detects anomalies, unauthorized access, and lateral movement in network traffic.",
    capabilities: ["Anomaly Detection", "Traffic Analysis", "Lateral Movement Detection", "Alert Correlation"],
    url: "#",
  },
];

// ============================================
// SOCIAL LINKS DATA
// ============================================
export const SOCIAL_LINKS_DATA: SocialLink[] = [
  {
    id: "s001",
    name: "GitHub",
    url: "https://github.com/zero-one-community",
    description: "Open source code and project contributions",
    icon: "github",
  },
  {
    id: "s002",
    name: "Discord",
    url: "https://discord.gg/zero-one",
    description: "Real-time community discussions and support",
    icon: "message-circle",
  },
  {
    id: "s003",
    name: "Matrix",
    url: "https://matrix.to/#/#zero-one:matrix.org",
    description: "Encrypted and decentralized community chat",
    icon: "shield",
  },
  {
    id: "s004",
    name: "Reddit",
    url: "https://reddit.com/r/zero-one",
    description: "Community forum for discussions and sharing",
    icon: "message-square",
  },
  {
    id: "s005",
    name: "Twitter/X",
    url: "https://twitter.com/zero_one_sec",
    description: "Latest updates and security news",
    icon: "at-sign",
  },
  {
    id: "s006",
    name: "Blog",
    url: "https://blog.zero-one.io",
    description: "In-depth articles, tutorials, and research",
    icon: "file-text",
  },
];

// ============================================
// OPSEC GUIDES DATA
// ============================================
export const OPSEC_GUIDES_DATA: OPSECGuide[] = [
  {
    level: "L1",
    name: "Basic OPSEC",
    browser: "Firefox with uBlock Origin + Privacy Badger",
    vpn: "Any reputable VPN (Mullvad, ProtonVPN)",
    tools: ["uBlock Origin", "Privacy Badger", "HTTPS Everywhere", "Cookie AutoDelete"],
    practices: [
      "Always use HTTPS connections",
      "Clear cookies and browser data regularly",
      "Use a password manager with unique passwords",
      "Enable 2FA on all accounts",
      "Keep software and OS updated",
    ],
    codeSnippet: `# L1 Basic OPSEC Setup
sudo apt install firefox ublock-origin
# Enable VPN before browsing
mullvad connect
# Verify IP is masked
curl ifconfig.me
# Expected: VPN exit IP, NOT your real IP`,
  },
  {
    level: "L2",
    name: "Enhanced OPSEC",
    browser: "Firefox hardened about:config + Arkenfox user.js",
    vpn: "Mullvad/ProtonVPN with Kill Switch enabled",
    tools: ["Arkenfox user.js", "TOR Browser", "VirtualBox", "WireShark", "Burp Suite Community"],
    practices: [
      "Use hardened Firefox with Arkenfox user.js",
      "Enable VPN kill switch to prevent leaks",
      "Use separate browser profiles for different activities",
      "Run security tools in isolated VMs",
      "Monitor DNS queries for leaks",
    ],
    codeSnippet: `# L2 Enhanced OPSEC Setup
git clone https://github.com/arkenfox/user.js
cp user.js/prefsCleaner.js ~/.mozilla/firefox/<profile>/
# Setup isolated VM
vboxmanage createvm --name "sec-research" --register
# Enable kill switch
mullvad auto-connect on
mullvad lockdown-mode on`,
  },
  {
    level: "L3",
    name: "Advanced OPSEC",
    browser: "Tor Browser + Whonix Workstation",
    vpn: "VPN → Tor (Multi-hop) with dedicated entry node",
    tools: ["Whonix", "Qubes OS", "Tails OS", "KeePassXC", "Signal"],
    practices: [
      "Use Whonix for Tor-routed activities",
      "Separate identities with different VMs",
      "Use Qubes OS for compartmentalization",
      "Never mix personal and research identities",
      "Use end-to-end encrypted communications only",
    ],
    codeSnippet: `# L3 Advanced OPSEC Setup
# Install Whonix on VirtualBox
vboxmanage import Whonix-Gateway.ova
vboxmanage import Whonix-Workstation.ova
# Configure VPN -> Tor chain
# On host: connect VPN
mullvad connect
# In Whonix Gateway: Tor auto-configured
# In Whonix Workstation: All traffic -> Tor
# Verify circuit
torsocks curl https://check.torproject.org`,
  },
  {
    level: "L4",
    name: "Operational OPSEC",
    browser: "Tails OS (amnesic) on dedicated hardware",
    vpn: "Bridges + Obfs4 + VPN over Tor",
    tools: ["Tails OS", "YubiKey", "Encrypted USB", "Faraday bag", "Burner device"],
    practices: [
      "Boot from Tails USB - leaves no trace on host",
      "Use Tor bridges with pluggable transports",
      "Physical security: Faraday bags for devices",
      "Rotate identities and circuits regularly",
      "Use air-gapped systems for sensitive data",
      "Never access resources from personal devices",
    ],
    codeSnippet: `# L4 Operational OPSEC Setup
# Flash Tails OS to USB
dd if=tails.img of=/dev/sdX bs=4M status=progress
# Boot from USB (disable internal HDD in BIOS)
# Configure Tor bridges:
# Edit /etc/tor/torrc
Bridge obfs4 <bridge-ip>:<port> <fingerprint> cert=<cert> iat-mode=0
UseBridges 1
# Enable MAC spoofing on all interfaces
# All traffic routed through Tor by default`,
  },
  {
    level: "L5",
    name: "Maximum OPSEC",
    browser: "Custom hardened OS + Hardware isolation",
    vpn: "Multi-layer: Dedicated hardware VPN → Tor → Proxy chain",
    tools: ["Qubes OS (max compartmentalization)", "HSM", "Air-gapped systems", "Custom firmware", "SIGINT mitigation"],
    practices: [
      "Full compartmentalization with Qubes OS",
      "Hardware Security Modules for key storage",
      "Custom compiled software from verified source",
      "Physical isolation between operation levels",
      "TEMPEST-grade physical security measures",
      "Regular counter-surveillance sweeps",
      "Assume all communications are monitored",
      "Use steganography for sensitive data transfer",
    ],
    codeSnippet: `# L5 Maximum OPSEC Setup
# Install Qubes OS on dedicated hardware
# Create isolated compartments:
#   - sys-net (network)
#   - sys-firewall (firewall)
#   - sys-whonix (Tor gateway)
#   - work-sec (security research)
#   - work-isolated (air-gapped)
#   - personal (never used for research)
# Each compartment has its own:
#   - VM, filesystem, network, identity
# Use hardware switches for network isolation
# All sensitive work in disposable VMs
qvm-create --label red --template whonix-ws target-compartment`,
  },
];

// ============================================
// LINKS DATA
// ============================================
export const LINKS_DATA: LinkItem[] = [
  { id: "l001", name: "Shodan", url: "https://www.shodan.io", description: "Search engine for internet-connected devices.", category: "osint", level: "L1", tags: ["device-search", "osint"], starred: true },
  { id: "l002", name: "Censys", url: "https://search.censys.io", description: "Internet asset discovery and attack surface monitoring.", category: "osint", level: "L1", tags: ["host-discovery", "attack-surface"], starred: false },
  { id: "l003", name: "Have I Been Pwned", url: "https://haveibeenpwned.com", description: "Check if credentials have been exposed in data breaches.", category: "osint", level: "L1", tags: ["breach-check", "credential"], starred: true },
  { id: "l004", name: "VirusTotal", url: "https://www.virustotal.com", description: "Multi-engine file and URL analysis platform.", category: "security", level: "L1", tags: ["malware", "scanning"], starred: true },
  { id: "l005", name: "Exploit-DB", url: "https://www.exploit-db.com", description: "Official exploit and vulnerability archive with CVE-indexed PoCs.", category: "security", level: "L2", tags: ["exploit", "poc", "cve"], starred: false },
  { id: "l006", name: "NVD NIST", url: "https://nvd.nist.gov", description: "National Vulnerability Database with CVSS scoring.", category: "security", level: "L2", tags: ["cve", "cvss", "vulnerability"], starred: false },
  { id: "l007", name: "Nuclei Templates", url: "https://github.com/projectdiscovery/nuclei-templates", description: "12,000+ YAML templates for automated scanning.", category: "tools", level: "L2", tags: ["scanning", "automation"], starred: false },
  { id: "l008", name: "MISP", url: "https://www.misp-project.org", description: "Open-source threat intelligence sharing platform.", category: "osint", level: "L3", tags: ["threat-intel", "ioc"], starred: false },
  { id: "l009", name: "AlienVault OTX", url: "https://otx.alienvault.com", description: "Community-driven threat intelligence exchange.", category: "osint", level: "L3", tags: ["threat-intel", "community"], starred: false },
  { id: "l010", name: "Mullvad VPN", url: "https://mullvad.net", description: "Privacy-focused VPN with kill-switch and WireGuard.", category: "privacy", level: "L1", tags: ["vpn", "privacy", "wireguard"], starred: true },
  { id: "l011", name: "ProtonVPN", url: "https://protonvpn.com", description: "Secure VPN with Secure Core architecture.", category: "privacy", level: "L1", tags: ["vpn", "privacy", "secure-core"], starred: true },
  { id: "l012", name: "Tor Project", url: "https://www.torproject.org", description: "Anonymous communication network for privacy research.", category: "privacy", level: "L2", tags: ["tor", "anonymity"], starred: true },
  { id: "l013", name: "DuckDuckGo", url: "https://duckduckgo.com", description: "Privacy-focused search engine. No tracking.", category: "privacy", level: "L1", tags: ["search", "privacy"], starred: false },
  { id: "l014", name: "Hack The Box", url: "https://www.hackthebox.com", description: "Online cybersecurity training platform.", category: "tools", level: "L2", tags: ["training", "ctf"], starred: false },
  { id: "l015", name: "TryHackMe", url: "https://tryhackme.com", description: "Gamified cybersecurity learning platform.", category: "tools", level: "L2", tags: ["training", "learning"], starred: false },
  { id: "l016", name: "Ahmia Search", url: "https://ahmia.fi", description: "Tor search engine for .onion services.", category: "security", level: "L4", tags: ["tor", "dark-web"], starred: false },
  { id: "l017", name: "Metasploit Framework", url: "https://www.metasploit.com", description: "Penetration testing framework. ROE required.", category: "tools", level: "L5", tags: ["pentest", "exploitation"], starred: false },
  { id: "l018", name: "Zero One Discord", url: "https://discord.gg/zero-one", description: "Community discussions and support.", category: "community", level: "L1", tags: ["community", "chat"], starred: true },
  { id: "l019", name: "Zero One GitHub", url: "https://github.com/zero-one-community", description: "Open source contributions and projects.", category: "community", level: "L1", tags: ["community", "code"], starred: true },
  { id: "l020", name: "DNSDumpster", url: "https://dnsdumpster.com", description: "DNS reconnaissance and domain research tool.", category: "osint", level: "L1", tags: ["dns", "recon"], starred: false },
];

// ============================================
// NOTIFICATIONS DATA
// ============================================
export const NOTIFICATIONS_DATA: Notification[] = [
  {
    id: "n001",
    title: "Welcome to J.U.L.I.U.S",
    message: "Project J.U.L.I.U.S v2.0 is now operational. Your secure web surfing environment is ready.",
    type: "info",
    priority: "medium",
    category: "system",
    read: false,
    actionUrl: null,
    actionLabel: null,
    createdAt: "2025-01-15T00:00:00Z",
  },
  {
    id: "n002",
    title: "Security: IP Exposure Detected",
    message: "Your real IP address has been detected. We strongly recommend enabling VPN protection.",
    type: "security",
    priority: "high",
    category: "privacy",
    read: false,
    actionUrl: "#security",
    actionLabel: "Open Security Center",
    createdAt: "2025-01-15T00:01:00Z",
  },
  {
    id: "n003",
    title: "New Resources Indexed",
    message: "47 new security research resources have been indexed across all 5 operational levels.",
    type: "update",
    priority: "medium",
    category: "update",
    read: false,
    actionUrl: "#levels",
    actionLabel: "View Levels",
    createdAt: "2025-01-14T12:00:00Z",
  },
  {
    id: "n004",
    title: "Ad Blocker Active",
    message: "The integrated ad and tracker blocker is now active. Known tracking domains are being filtered.",
    type: "info",
    priority: "low",
    category: "privacy",
    read: false,
    actionUrl: null,
    actionLabel: null,
    createdAt: "2025-01-14T10:00:00Z",
  },
  {
    id: "n005",
    title: "OPSEC Level Upgrade Available",
    message: "We recommend upgrading your OPSEC configuration to Level 2 (Enhanced). Includes VM isolation and VPN kill-switch.",
    type: "warning",
    priority: "medium",
    category: "security",
    read: false,
    actionUrl: "#opsec",
    actionLabel: "Review OPSEC Config",
    createdAt: "2025-01-13T18:00:00Z",
  },
  {
    id: "n006",
    title: "Community Charter Updated",
    message: "The Zero One community charter v2.1 includes new guidelines for AI-assisted security research.",
    type: "info",
    priority: "low",
    category: "community",
    read: true,
    actionUrl: "#community",
    actionLabel: "View Charter",
    createdAt: "2025-01-12T09:00:00Z",
  },
  {
    id: "n007",
    title: "Threat Intelligence Feed Updated",
    message: "1,247 new indicators of compromise added to the threat database from OTX and Abuse.ch.",
    type: "update",
    priority: "medium",
    category: "update",
    read: true,
    actionUrl: "#levels",
    actionLabel: "View Threat Intel",
    createdAt: "2025-01-11T14:30:00Z",
  },
  {
    id: "n008",
    title: "Privacy Alert: DNS Leak Possible",
    message: "A potential DNS leak has been detected. Enable DNS-over-HTTPS (DoH) to prevent DNS query exposure.",
    type: "alert",
    priority: "critical",
    category: "privacy",
    read: false,
    actionUrl: "#security",
    actionLabel: "Fix Now",
    createdAt: "2025-01-10T22:00:00Z",
  },
];

// ============================================
// INITIAL BLOCKED RESOURCES
// ============================================
export const INITIAL_BLOCKED_RESOURCES: BlockedResource[] = [
  { id: "b001", domain: "doubleclick.net", reason: "Ad Tracking", hits: 147, addedAt: "2025-01-10T08:00:00Z" },
  { id: "b002", domain: "google-analytics.com", reason: "Analytics Tracking", hits: 89, addedAt: "2025-01-10T08:00:00Z" },
  { id: "b003", domain: "facebook.com/tr", reason: "Social Tracking", hits: 56, addedAt: "2025-01-11T10:00:00Z" },
  { id: "b004", domain: "adservice.google.com", reason: "Ad Network", hits: 203, addedAt: "2025-01-10T08:00:00Z" },
  { id: "b005", domain: "hotjar.com", reason: "Session Recording", hits: 34, addedAt: "2025-01-12T14:00:00Z" },
];

// ============================================
// INITIAL SECURITY LOG
// ============================================
export const INITIAL_SECURITY_LOG: SecurityLogEntry[] = [
  { id: "log001", timestamp: "2025-01-15T08:32:14Z", eventType: "IP_CHECK", details: "IP address geolocation check performed", riskLevel: "info" },
  { id: "log002", timestamp: "2025-01-15T08:30:00Z", eventType: "DNS_QUERY", details: "DNS leak test completed - no leaks detected", riskLevel: "info" },
  { id: "log003", timestamp: "2025-01-15T08:25:33Z", eventType: "BLOCK", details: "Blocked connection to doubleclick.net (Ad Tracking)", riskLevel: "low" },
  { id: "log004", timestamp: "2025-01-15T08:20:00Z", eventType: "WEBRTC", details: "WebRTC local IP address detected - potential leak", riskLevel: "high" },
  { id: "log005", timestamp: "2025-01-15T08:15:22Z", eventType: "FINGERPRINT", details: "Canvas fingerprint attempt blocked", riskLevel: "medium" },
  { id: "log006", timestamp: "2025-01-15T08:10:00Z", eventType: "TUNNEL", details: "SOCKS5 tunnel connection established", riskLevel: "info" },
  { id: "log007", timestamp: "2025-01-15T08:05:44Z", eventType: "COOKIE", details: "Auto-deleted 23 tracking cookies", riskLevel: "low" },
  { id: "log008", timestamp: "2025-01-15T08:00:00Z", eventType: "STARTUP", details: "J.U.L.I.U.S security subsystem initialized", riskLevel: "info" },
];

// ============================================
// HELPER: Get level color class
// ============================================
export function getLevelColor(level: string): string {
  switch (level) {
    case "L1": return "#00ff41";
    case "L2": return "#ff6b35";
    case "L3": return "#ffd700";
    case "L4": return "#ff4444";
    case "L5": return "#a855f7";
    default: return "#7a9a7b";
  }
}

export function getLevelName(level: string): string {
  switch (level) {
    case "L1": return "Surface Web";
    case "L2": return "Deep Web";
    case "L3": return "Threat Intel";
    case "L4": return "Dark Web";
    case "L5": return "Restricted";
    default: return "Unknown";
  }
}

export const LINK_CATEGORIES = ["All", "OSINT", "Security", "Tools", "Privacy", "Community"] as const;
export const LEVEL_FILTERS = ["All", "L1", "L2", "L3", "L4", "L5"] as const;
