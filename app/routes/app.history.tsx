import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Page,
  Layout,
  Card,
  DataTable,
  Badge,
  Text,
  BlockStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getAllSchedules } from "../models/scheduler.server";
import { getTranslations, Language } from "../utils/translations";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop.toLowerCase().replace('https://', '').split('/')[0];

  const schedules = await getAllSchedules(shop);

  let language: Language = 'en';
  try {
    const settings = await prisma.shopSettings.findUnique({ where: { shop } });
    if (settings) language = settings.language as Language;
  } catch (e) {
    console.error("Language loading error (History):", e);
  }

  return { schedules, language };
};

export default function HistoryPage() {
  const { schedules, language } = useLoaderData<typeof loader>();
  const lang = getTranslations(language as Language);

  const rows = schedules.map((schedule: any) => [
    schedule.themeName,
    schedule.userName,
    schedule.notes || "-",
    new Date(schedule.scheduledAt).toLocaleString(),
    schedule.executedAt ? new Date(schedule.executedAt).toLocaleString() : "-",
    <Badge tone={schedule.status === "completed" ? "success" : schedule.status === "failed" ? "critical" : "attention"}>
      {schedule.status.toUpperCase()}
    </Badge>,
  ]);

  return (
    <Page>
      <TitleBar title={lang.historyPage.detailedLog} />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <DataTable
                columnContentTypes={[
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                ]}
                headings={[
                  lang.historyPage.theme,
                  lang.historyPage.publisher,
                  lang.historyPage.updateNotes,
                  lang.modal.time,
                  lang.historyPage.publishedAt,
                  lang.historyPage.status,
                ]}
                rows={rows}
              />
              {schedules.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <Text as="p" tone="subdued">{lang.historyPage.noHistory}</Text>
                </div>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
