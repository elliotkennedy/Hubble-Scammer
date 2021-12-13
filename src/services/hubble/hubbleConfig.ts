const hubbleConfig = {
    ...window.runtimeConfig.hubbleConfig,
}

declare global {
    interface Window {
        runtimeConfig: any;
    }
}

interface HubbleBorrowConfig {
    programId: string;
}

interface HubbleEnvConfig {
    borrowing: HubbleBorrowConfig;
}

// eslint-disable-next-line
interface HubbleConfig {
    [key: string]: HubbleEnvConfig;
}

export default hubbleConfig
