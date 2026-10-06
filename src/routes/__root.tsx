import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error("Runtime error:", error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong while loading the 3D scene. You can try refreshing or heading back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no, maximum-scale=1" },
      { name: "theme-color", content: "#05070f" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },

      /* Primary Meta Tags */
      { title: "Inside the Human Brain — 3D Interactive Atlas" },
      { name: "title", content: "Inside the Human Brain — 3D Interactive Atlas" },
      { name: "description", content: "A cinematic, interactive 3D journey through the anatomy and neural structures of the human brain. Scroll to explore the cerebrum, thalamus, hippocampus, cerebellum, and brainstem." },
      { name: "keywords", content: "human brain, 3D brain, neuroscience, anatomy, 3D atlas, cerebrum, hippocampus, thalamus, interactive education" },
      { name: "author", content: "Inside the Human Brain" },

      /* Open Graph Protocol / Facebook / WhatsApp / LinkedIn / Discord */
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://human-brain-rouge.vercel.app/" },
      { property: "og:site_name", content: "Inside the Human Brain" },
      { property: "og:title", content: "Inside the Human Brain — 3D Interactive Atlas" },
      { property: "og:description", content: "A cinematic, interactive 3D journey through the anatomy and neural structures of the human brain. Scroll to explore the cerebrum, thalamus, hippocampus, cerebellum, and brainstem." },
      { property: "og:image", content: "https://human-brain-rouge.vercel.app/preview.jpg" },
      { property: "og:image:secure_url", content: "https://human-brain-rouge.vercel.app/preview.jpg" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Inside the Human Brain 3D Interactive Atlas Preview" },

      /* Twitter Card */
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:url", content: "https://human-brain-rouge.vercel.app/" },
      { name: "twitter:title", content: "Inside the Human Brain — 3D Interactive Atlas" },
      { name: "twitter:description", content: "A cinematic, interactive 3D journey through the anatomy and neural structures of the human brain. Scroll to explore the cerebrum, thalamus, hippocampus, cerebellum, and brainstem." },
      { name: "twitter:image", content: "https://human-brain-rouge.vercel.app/preview.jpg" },
      { name: "twitter:image:alt", content: "Inside the Human Brain 3D Interactive Atlas Preview" },
    ],
    links: [
      { rel: "canonical", href: "https://human-brain-rouge.vercel.app/" },
      { rel: "image_src", href: "https://human-brain-rouge.vercel.app/preview.jpg" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "alternate icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=JetBrains+Mono:wght@400;500&family=Manrope:wght@400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
