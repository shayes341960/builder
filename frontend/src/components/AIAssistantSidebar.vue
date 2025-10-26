<template>
        <aside
                class="ai-sidebar absolute bottom-0 right-0 top-[var(--toolbar-height)] z-30 border-l border-outline-gray-2 bg-surface-white shadow-sm"
                :style="{ width: `${builderStore.aiSidebarWidth}px` }">
                <div class="relative flex h-full flex-col">
                        <PanelResizer
                                side="left"
                                :dimension="builderStore.aiSidebarWidth"
                                :min-dimension="280"
                                :max-dimension="420"
                                @resize="(width) => (builderStore.aiSidebarWidth = width)" />
                        <header class="flex items-start justify-between gap-3 border-b border-outline-gray-2 px-4 py-3">
                                <div>
                                        <p class="text-xs font-semibold uppercase tracking-wide text-ink-gray-5">AI Assistant</p>
                                        <h2 class="text-sm font-semibold text-ink-gray-9">Smart layout & content suggestions</h2>
                                        <p class="text-xs text-ink-gray-5">Recommendations update as you edit the page.</p>
                                </div>
                                <div class="flex items-center gap-2">
                                        <Tooltip text="Refresh suggestions" :hoverDelay="0.6">
                                                <button
                                                        type="button"
                                                        class="rounded border border-outline-gray-2 p-1 text-ink-gray-6 transition hover:bg-surface-gray-2"
                                                        @click="refreshKey++">
                                                        <FeatherIcon name="refresh-cw" class="h-4 w-4" />
                                                </button>
                                        </Tooltip>
                                        <Tooltip text="Close AI assistant" :hoverDelay="0.6">
                                                <button
                                                        type="button"
                                                        class="rounded border border-outline-gray-2 p-1 text-ink-gray-6 transition hover:bg-surface-gray-2"
                                                        @click="builderStore.showAISidebar = false">
                                                        <FeatherIcon name="x" class="h-4 w-4" />
                                                </button>
                                        </Tooltip>
                                </div>
                        </header>
                        <section class="flex-1 overflow-y-auto px-4 py-3">
                                <div class="space-y-6">
                                        <div class="space-y-2">
                                                <div class="flex items-center justify-between">
                                                        <h3 class="text-sm font-semibold text-ink-gray-8">Layout opportunities</h3>
                                                        <span class="text-xs uppercase tracking-wide text-ink-gray-4">{{ layoutInsights.summaryLabel }}</span>
                                                </div>
                                                <p class="text-xs text-ink-gray-5">
                                                        {{ layoutInsights.description }}
                                                </p>
                                                <ul class="space-y-2">
                                                        <li
                                                                v-for="suggestion in layoutSuggestions"
                                                                :key="suggestion.title"
                                                                class="rounded-md border border-outline-gray-2 bg-surface-white px-3 py-2">
                                                                <div class="flex items-start justify-between gap-3">
                                                                        <div>
                                                                                <p class="text-sm font-semibold text-ink-gray-8">
                                                                                        {{ suggestion.title }}
                                                                                </p>
                                                                                <p class="text-xs text-ink-gray-5">
                                                                                        {{ suggestion.detail }}
                                                                                </p>
                                                                        </div>
                                                                        <span class="mt-1 text-lg">✨</span>
                                                                </div>
                                                        </li>
                                                </ul>
                                        </div>
                                        <div class="space-y-2">
                                                <div class="flex items-center justify-between">
                                                        <h3 class="text-sm font-semibold text-ink-gray-8">Color palettes</h3>
                                                        <span class="text-xs uppercase tracking-wide text-ink-gray-4">{{ paletteLabel }}</span>
                                                </div>
                                                <p class="text-xs text-ink-gray-5">
                                                        Based on your current typography and accent colors, try these mixes.
                                                </p>
                                                <div class="space-y-3">
                                                        <div
                                                                v-for="palette in colorPalettes"
                                                                :key="palette.name"
                                                                class="rounded-md border border-outline-gray-2 bg-surface-white p-3">
                                                                <div class="flex items-center justify-between">
                                                                        <div>
                                                                                <p class="text-sm font-semibold text-ink-gray-8">{{ palette.name }}</p>
                                                                                <p class="text-xs text-ink-gray-5">{{ palette.description }}</p>
                                                                        </div>
                                                                        <button
                                                                                type="button"
                                                                                class="text-xs font-medium text-ink-gray-6 underline decoration-dashed underline-offset-4"
                                                                                @click="copyPalette(palette.colors)">
                                                                                Copy HEX
                                                                        </button>
                                                                </div>
                                                                <div class="mt-3 flex gap-2">
                                                                        <div
                                                                                v-for="color in palette.colors"
                                                                                :key="color"
                                                                                class="flex-1 rounded-md border border-outline-gray-2"
                                                                                :style="{ backgroundColor: color }">
                                                                                <span class="sr-only">{{ color }}</span>
                                                                        </div>
                                                                </div>
                                                                <div class="mt-2 flex flex-wrap gap-1 text-[10px] text-ink-gray-5">
                                                                        <span v-for="color in palette.colors" :key="color + '-label'">{{ color }}</span>
                                                                </div>
                                                        </div>
                                                </div>
                                        </div>
                                        <div class="space-y-2">
                                                <h3 class="text-sm font-semibold text-ink-gray-8">Placeholder copy</h3>
                                                <p class="text-xs text-ink-gray-5">
                                                        Use these snippets to quickly fill empty sections or CTA blocks.
                                                </p>
                                                <ul class="space-y-2">
                                                        <li
                                                                v-for="copy in copySuggestions"
                                                                :key="copy.id"
                                                                class="rounded-md border border-outline-gray-2 bg-surface-white p-3">
                                                                <div class="flex items-start justify-between gap-3">
                                                                        <div>
                                                                                <p class="text-xs font-semibold uppercase tracking-wide text-ink-gray-4">
                                                                                        {{ copy.tone }}
                                                                                </p>
                                                                                <p class="text-sm text-ink-gray-8">
                                                                                        {{ copy.text }}
                                                                                </p>
                                                                        </div>
                                                                        <Tooltip text="Copy to clipboard" :hoverDelay="0.4">
                                                                                <button
                                                                                        type="button"
                                                                                        class="rounded border border-outline-gray-2 p-1 text-ink-gray-6 transition hover:bg-surface-gray-2"
                                                                                        @click="copyText(copy.text)">
                                                                                        <FeatherIcon name="copy" class="h-4 w-4" />
                                                                                </button>
                                                                        </Tooltip>
                                                                </div>
                                                                <p v-if="copied && lastCopied === copy.text" class="mt-2 text-[11px] font-medium text-ink-green-5">
                                                                        Copied!
                                                                </p>
                                                        </li>
                                                </ul>
                                        </div>
                                </div>
                        </section>
                </div>
        </aside>
</template>

<script setup lang="ts">
import type Block from "@/block";
import useBuilderStore from "@/stores/builderStore";
import usePageStore from "@/stores/pageStore";
import { useClipboard } from "@vueuse/core";
import { computed, ref } from "vue";
import { Tooltip } from "frappe-ui";
import PanelResizer from "./PanelResizer.vue";

const builderStore = useBuilderStore();
const pageStore = usePageStore();

const refreshKey = ref(0);
const lastCopied = ref("");
const { copy: copyToClipboard, copied, isSupported } = useClipboard({ legacy: true });

const activeRootBlock = computed(() => pageStore.pageBlocks[0]);

const pageSummary = computed(() => {
        const summary = {
                sections: 0,
                headings: 0,
                buttons: 0,
                images: 0,
                heroLikely: false,
                backgroundColor: normalizeColor(activeRootBlock.value?.getStyle("backgroundColor")),
                textColor: normalizeColor(activeRootBlock.value?.getStyle("color")),
                accentColor: null as string | null,
        };
        const root = activeRootBlock.value;
        if (!root) {
                return summary;
        }
        const traverse = (block: Block, depth = 0) => {
                const element = (block.element || "").toLowerCase();
                if (["section", "header", "main", "footer"].includes(element)) {
                        summary.sections += 1;
                        if (depth === 1) {
                                summary.heroLikely = true;
                        }
                }
                if (/^h[1-6]$/.test(element)) {
                        summary.headings += 1;
                }
                if (element === "button") {
                        summary.buttons += 1;
                        if (!summary.accentColor) {
                                summary.accentColor = normalizeColor(block.getStyle("backgroundColor"));
                        }
                }
                if (element === "img") {
                        summary.images += 1;
                }
                block.children?.forEach((child) => traverse(child, depth + 1));
        };
        traverse(root);
        if (!summary.accentColor) {
                        summary.accentColor = findFirstColor(root);
        }
        return summary;
});

const layoutInsights = computed(() => {
        const summary = pageSummary.value;
        const sectionLabel = summary.sections === 1 ? "Single section" : `${summary.sections} sections`;
        let description = "Add supporting sections for testimonials, pricing, or FAQs.";
        if (summary.sections > 3) {
                description = "Balance visual weight with breathing space between sections.";
        } else if (summary.sections === 0) {
                description = "Start with a hero or header section to anchor the layout.";
        }
        return {
                summaryLabel: sectionLabel,
                description,
        };
});

const layoutSuggestions = computed(() => {
        refreshKey.value;
        const summary = pageSummary.value;
        const pageName = pageStore.activePage?.page_title || "your page";
        const suggestions: Array<{ title: string; detail: string }> = [];
        if (summary.sections < 2) {
                suggestions.push({
                        title: "Add supporting sections",
                        detail: pickVariant([
                                `Introduce testimonials or feature highlights below the hero so ${pageName} feels complete.`,
                                `Stack a feature grid or testimonials under your hero to round out ${pageName}.`,
                                `Layer in supporting content (features, social proof) to help ${pageName} tell a fuller story.`,
                        ]),
                });
        }
        if (summary.images === 0) {
                suggestions.push({
                        title: "Drop in a visual anchor",
                        detail: pickVariant([
                                "Use a hero image or illustration to draw attention to your primary message.",
                                "Pair your headline with a product screenshot or lifestyle photo to ground the experience.",
                                "Reinforce the page story with imagery that supports your main call to action.",
                        ]),
                });
        }
        if (summary.buttons === 0) {
                suggestions.push({
                        title: "Add a clear call-to-action",
                        detail: pickVariant([
                                "Guide visitors with a prominent button that stands out from surrounding content.",
                                "Add a contrasting CTA button so readers know the next step right away.",
                                "Place a primary button near your hero text to convert interest into action.",
                        ]),
                });
        }
        if (summary.headings <= 1) {
                suggestions.push({
                        title: "Create a hierarchy",
                        detail: pickVariant([
                                "Layer headings (H1, H2) to break content into digestible pieces and improve readability.",
                                "Use subheadings to organize information so scanners can find what they need fast.",
                                "Add supporting headings to clarify sections and improve the overall rhythm of the page.",
                        ]),
                });
        }
        if (suggestions.length === 0) {
                suggestions.push({
                        title: "Looks balanced!",
                        detail: pickVariant([
                                "Fine-tune spacing and alignments to keep the layout polished as you add content.",
                                "Keep refining micro-interactions like hover states and consistent padding.",
                                "Consider variations of your sections for alternate states or personalized content.",
                        ]),
                });
        }
        return suggestions;
});

const paletteLabel = computed(() => {
        const paletteBase = pageSummary.value.backgroundColor || "auto";
        return paletteBase === "auto" ? "Adaptive" : paletteBase.toUpperCase();
});

const colorPalettes = computed(() => {
        const rotation = refreshKey.value % 3;
        const summary = pageSummary.value;
        const base = summary.backgroundColor || "#f4f4f5";
        const accent = summary.accentColor || "#2563eb";
        const text = summary.textColor || "#111827";
        const accentSoft = mixColors(accent, "#ffffff", 0.45);
        const accentBold = adjustColor(accent, -25);
        const palettes = [
                {
                        name: "Modern contrast",
                        description: "Pair a soft neutral base with a bold CTA tint.",
                        colors: [lightenColor(base, 12), base, accent, accentBold],
                },
                {
                        name: "Editorial calm",
                        description: "Muted background with supportive accents for long-form sections.",
                        colors: [mixColors(base, text, 0.1), mixColors(base, accent, 0.2), accentSoft, text],
                },
                {
                        name: "Vibrant split",
                        description: "High-energy duo-tone to spotlight hero and CTA blocks.",
                        colors: [accent, adjustColor(accent, 20), mixColors(accent, "#f97316", 0.5), "#0f172a"],
                },
        ];
        return rotateArray(palettes, rotation);
});

const copySuggestions = computed(() => {
        refreshKey.value;
        const summary = pageSummary.value;
        const title = pageStore.activePage?.page_title || "Your product";
        const suggestions = [
                {
                        id: "hero",
                        tone: "Hero",
                        text: pickVariant([
                                `Design your next experience with ${title}. Build sections visually, adjust styles instantly, and publish with confidence.`,
                                `${title} helps teams ship polished pages fast — drag, refine, and publish without touching code.`,
                                `Shape your next launch on ${title}. Craft layouts visually, tweak styles in seconds, and go live when it feels right.`,
                        ]),
                },
                {
                        id: "benefit",
                        tone: "Benefit",
                        text: pickVariant([
                                `Why teams choose ${title}: intuitive drag & drop, responsive defaults, and ready-to-launch templates.`,
                                `${title} keeps your team focused on ideas with collaborative editing, responsive previews, and reusable components.`,
                                `Stay in flow with ${title} — instant feedback, smart defaults, and launch-ready components built in.`,
                        ]),
                },
        ];
        if (summary.buttons === 0) {
                suggestions.push({
                        id: "cta",
                        tone: "CTA",
                        text: pickVariant([
                                `Get started in minutes — launch ${title} today and keep iterating with live previews.`,
                                `Start building with ${title}. Create your first page now and refine it with instant previews.`,
                                `Launch faster with ${title}. Spin up your next page, publish confidently, and keep improving in real time.`,
                        ]),
                });
        }
        if (summary.images === 0) {
                suggestions.push({
                        id: "visual",
                        tone: "Visual caption",
                        text: pickVariant([
                                `Showcase a product screenshot or hero illustration to reinforce how ${title} works at a glance.`,
                                `Drop in a crisp product shot to help visitors connect with what ${title} delivers.`,
                                `Pair your message with an illustration or screenshot so readers grasp ${title} instantly.`,
                        ]),
                });
        }
        if (summary.sections < 2) {
                suggestions.push({
                        id: "structure",
                        tone: "Structure",
                        text: pickVariant([
                                `Add sections for testimonials, pricing, and FAQs so visitors can trust ${title} before they convert.`,
                                `Round out ${title} with social proof, pricing, and FAQ blocks to answer key objections.`,
                                `Include testimonials, pricing, or FAQs to help visitors commit to ${title}.`,
                        ]),
                });
        }
        return suggestions;
});

function copyText(text: string) {
        if (isSupported) {
                copyToClipboard(text);
        } else if (navigator?.clipboard) {
                navigator.clipboard.writeText(text);
        } else {
                const textarea = document.createElement("textarea");
                textarea.value = text;
                textarea.setAttribute("readonly", "");
                textarea.style.position = "absolute";
                textarea.style.left = "-9999px";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
        }
        lastCopied.value = text;
}

function copyPalette(colors: string[]) {
        copyText(colors.join(", "));
}

function normalizeColor(color: unknown): string | null {
        if (!color || typeof color !== "string") {
                return null;
        }
        const trimmed = color.trim();
        if (!trimmed || trimmed.startsWith("var(")) {
                return null;
        }
        if (trimmed.startsWith("#")) {
                        if (trimmed.length === 4) {
                                return (
                                        "#" +
                                        trimmed
                                                .slice(1)
                                                .split("")
                                                .map((char) => char + char)
                                                .join("")
                                ).toLowerCase();
                        }
                        return trimmed.toLowerCase();
        }
        const rgbMatch = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
        if (rgbMatch) {
                const [r, g, b] = rgbMatch.slice(1, 4).map((value) => clampColor(Number(value)));
                return rgbToHex(r, g, b);
        }
        return null;
}

function findFirstColor(block: Block): string | null {
        if (!block) {
                return null;
        }
        const color = normalizeColor(block.getStyle("color") || block.getStyle("backgroundColor"));
        if (color) {
                return color;
        }
        for (const child of block.children || []) {
                const childColor = findFirstColor(child);
                if (childColor) {
                        return childColor;
                }
        }
        return null;
}

function clampColor(value: number) {
        return Math.min(255, Math.max(0, Math.round(value)));
}

function rgbToHex(r: number, g: number, b: number) {
        const toHex = (value: number) => clampColor(value).toString(16).padStart(2, "0");
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(color: string) {
        const hex = color.replace("#", "");
        const bigint = parseInt(hex, 16);
        return {
                r: (bigint >> 16) & 255,
                g: (bigint >> 8) & 255,
                b: bigint & 255,
        };
}

function adjustColor(color: string, amount: number) {
        const normalized = normalizeColor(color) || "#2563eb";
        const { r, g, b } = hexToRgb(normalized);
        const delta = (amount * 255) / 100;
        return rgbToHex(r + delta, g + delta, b + delta);
}

function lightenColor(color: string, amount: number) {
        return adjustColor(color, amount);
}

function mixColors(first: string, second: string, ratio: number) {
        const colorA = hexToRgb(normalizeColor(first) || "#2563eb");
        const colorB = hexToRgb(normalizeColor(second) || "#111827");
        const mix = (a: number, b: number) => clampColor(a * (1 - ratio) + b * ratio);
        return rgbToHex(mix(colorA.r, colorB.r), mix(colorA.g, colorB.g), mix(colorA.b, colorB.b));
}

function rotateArray<T>(items: T[], steps: number) {
        if (!items.length) {
                return [];
        }
        const normalizedSteps = ((steps % items.length) + items.length) % items.length;
        return items.slice(normalizedSteps).concat(items.slice(0, normalizedSteps));
}

function pickVariant(options: string[]) {
        if (!options.length) {
                return "";
        }
        const index = refreshKey.value % options.length;
        return options[index];
}
</script>

<style scoped>
.ai-sidebar {
        width: 20rem;
}
</style>
