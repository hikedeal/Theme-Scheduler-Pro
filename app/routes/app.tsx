import { useEffect } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import customStyles from "../styles/custom.css?url";

import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { getTranslations, Language } from "../utils/translations";



export const links = () => [
  { rel: "stylesheet", href: polarisStyles },
  { rel: "stylesheet", href: customStyles },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop.toLowerCase().replace('https://', '').split('/')[0];
  
  let language: Language = 'en';
  try {
    const settings = await prisma.shopSettings.findUnique({ where: { shop } });
    console.log("App Loader: Shop:", shop, "Settings:", settings);
    if (settings) language = settings.language as Language;
  } catch (e) {
    console.error("Language loading error (App):", e);
  }

  return { apiKey: process.env.SHOPIFY_API_KEY || "", language, shop };
};

export default function App() {
  const { apiKey, language } = useLoaderData<typeof loader>();
  const lang = getTranslations(language as Language);

  useEffect(() => {
    // Only inject if it doesn't already exist to prevent duplicates in React Strict Mode
    if (!document.getElementById("tawk-script")) {
      var s1 = document.createElement("script");
      s1.id = "tawk-script";
      s1.async = true;
      s1.src = 'https://embed.tawk.to/69be5ab72273861c39a78c62/1jk7p4npl';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      document.head.appendChild(s1);
    }
  }, []);

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      
      <NavMenu>
        <Link typeof="button" to="/app" rel="home">Dashboard</Link>
        <Link typeof="button" to="/app/scheduler">Theme Scheduler</Link>
        <Link typeof="button" to="/app/additional">History</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
