import { createResource } from "frappe-ui";

type Posthog = {
        init: (projectToken: string, options: any) => void;
        identify: (userId: string) => void;
        startSessionRecording: () => void;
        capture: (eventName: string, data?: any) => void;
};

declare global {
        interface Window {
                posthog?: Posthog;
        }
}

type PosthogSettings = {
        posthog_project_id: string;
        posthog_host: string;
        enable_telemetry: boolean;
        telemetry_site_age: number;
        record_session: boolean;
        posthog_identify: string;
};

let posthog: Posthog = {
        init: () => {},
        identify: () => {},
        startSessionRecording: () => {},
        capture: () => {},
};

let posthogLoader: Promise<Posthog> | null = null;

function ensurePosthogLoaded(host: string) {
        if (window.posthog) {
                return Promise.resolve(window.posthog);
        }

        if (posthogLoader) {
                return posthogLoader;
        }

        const scriptUrl = host.endsWith("/") ? `${host}static/array.js` : `${host}/static/array.js`;

        posthogLoader = new Promise<Posthog>((resolve, reject) => {
                const script = document.createElement("script");
                script.async = true;
                script.src = scriptUrl;
                script.onload = () => {
                        if (window.posthog) {
                                resolve(window.posthog);
                        } else {
                                posthogLoader = null;
                                reject(new Error("Posthog script loaded without exposing window.posthog"));
                        }
                };
                script.onerror = () => {
                        posthogLoader = null;
                        reject(new Error(`Failed to load Posthog script from ${scriptUrl}`));
                };
                document.head.appendChild(script);
        });

        return posthogLoader;
}

createResource({
        url: "builder.api.get_posthog_settings",
        method: "GET",
        auto: true,
        onSuccess: (posthogSettings: PosthogSettings) => {
                if (!posthogSettings.enable_telemetry || !posthogSettings.posthog_project_id) {
                        return;
                }

                ensurePosthogLoaded(posthogSettings.posthog_host)
                        .then((loadedPosthog) => {
                                loadedPosthog.init(posthogSettings.posthog_project_id, {
                                        api_host: posthogSettings.posthog_host,
                                        person_profiles: "identified_only",
                                        autocapture: false,
                                        capture_pageview: false,
                                        capture_pageleave: false,
                                        enable_heatmaps: false,
                                        disable_session_recording: true,
                                        loaded: (ph: Posthog) => {
                                                ph.identify(
                                                        posthogSettings?.posthog_identify || window.location.host,
                                                );
                                                posthog = ph;
                                                if (posthogSettings.record_session) {
                                                        ph.startSessionRecording();
                                                }
                                        },
                                });
                        })
                        .catch(() => {
                                // Posthog is optional; ignore failures silently.
                        });
        },
});

export { posthog };
