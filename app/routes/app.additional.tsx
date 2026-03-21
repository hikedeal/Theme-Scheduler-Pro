import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Badge,
  EmptyState,
  Box,
  IndexTable,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { getAllSchedules, deleteSchedule } from "../models/scheduler.server";
import { getTranslations, Language } from "../utils/translations";
import "../styles/custom.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop.toLowerCase().replace('https://', '').split('/')[0];

  const schedules = await getAllSchedules(shop);

  let ianaTimezone = "UTC";
  try {
    const { admin } = await authenticate.admin(request);
    const tzResponse = await admin.graphql(
      `#graphql
      query { shop { ianaTimezone } }`
    );
    const tzData = await tzResponse.json();
    ianaTimezone = tzData.data.shop?.ianaTimezone || "UTC";
  } catch (e) {
    console.error("Timezone fetch error:", e);
  }

  let language: Language = 'en';
  try {
    const settings = await prisma.shopSettings.findUnique({ where: { shop } });
    if (settings) language = settings.language as Language;
  } catch (e) {
    console.error("Language loading error (History):", e);
  }

  return { schedules, shop, language, ianaTimezone };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop.toLowerCase().replace('https://', '').split('/')[0];
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const id = parseInt(formData.get("id") as string, 10);
    await deleteSchedule(id, shop);
    return { success: true };
  }

  return null;
};

export default function HistoryPage() {
  const { schedules, shop, language, ianaTimezone } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const lang = getTranslations(language as Language);
  
  const formatStoreTime = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', { 
        dateStyle: 'medium', 
        timeStyle: 'short', 
        timeZone: ianaTimezone 
      }).format(new Date(dateString));
    } catch {
      return new Date(dateString).toLocaleString();
    }
  };
  
  const stats = {
    total: schedules.length,
    completed: schedules.filter((s: any) => s.status === "completed").length,
    failed: schedules.filter((s: any) => s.status === "failed").length,
  };

  const successRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <Page fullWidth>
      <TitleBar title={lang.history} />
      
      <BlockStack gap="600">
        
        {/* Top Metric Cards */}
        <Layout>
          <Layout.Section variant="oneThird">
            <div className="futuristic-card metric-card-success" style={{ padding: '24px' }}>
              <BlockStack gap="100">
                <Text as="h2" variant="headingSm" fontWeight="medium">{lang.historyPage.successRate || "Overall Success Rate"}</Text>
                <Text as="p" variant="heading3xl" fontWeight="bold">{successRate}%</Text>
              </BlockStack>
            </div>
          </Layout.Section>
          
          <Layout.Section variant="oneThird">
            <div className="futuristic-card metric-card-info" style={{ padding: '24px' }}>
              <BlockStack gap="100">
                <Text as="h2" variant="headingSm" fontWeight="medium">{lang.historyPage.totalPublishes || "Total Records"}</Text>
                <Text as="p" variant="heading3xl" fontWeight="bold">{stats.total}</Text>
              </BlockStack>
            </div>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <div className="futuristic-card metric-card-pending" style={{ padding: '24px' }}>
              <BlockStack gap="100">
                <Text as="h2" variant="headingSm" fontWeight="medium">{lang.historyPage.failedAttempts || "Failed Attempts"}</Text>
                <Text as="p" variant="heading3xl" fontWeight="bold">{stats.failed}</Text>
              </BlockStack>
            </div>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section>
            <Card padding="0">
              <Box padding="400" paddingBlockEnd="0">
                <Text as="h3" variant="headingMd">{lang.historyPage.detailedLog}</Text>
              </Box>

              {schedules.length === 0 ? (
                <Box padding="800">
                  <EmptyState
                    heading={lang.historyPage.noHistory}
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <p>Schedule your first theme publish to see data here.</p>
                  </EmptyState>
                </Box>
              ) : (
                <Box paddingBlockStart="400">
                  <IndexTable
                    resourceName={{ singular: 'schedule', plural: 'schedules' }}
                    itemCount={schedules.length}
                    headings={[
                      { title: lang.historyPage.theme || 'Theme' },
                      { title: lang.historyPage.publisher || 'Publisher' },
                      { title: lang.historyPage.updateNotes || 'Update Notes' },
                      { title: lang.historyPage.publishedAt || 'Published At' },
                      { title: lang.historyPage.status || 'Status' },
                      { title: lang.historyPage.actions || 'Actions', alignment: 'end' },
                    ]}
                    selectable={false}
                  >
                    {schedules.map((schedule: any, index: number) => (
                      <IndexTable.Row id={schedule.id.toString()} key={schedule.id} position={index}>
                        <IndexTable.Cell>
                          <BlockStack gap="100">
                            <Text as="span" variant="bodyMd" fontWeight="bold">{schedule.themeName}</Text>
                            <InlineStack>
                              <Button variant="plain" size="slim" onClick={() => window.open(`https://admin.shopify.com/store/${shop}/themes/${schedule.themeId}/editor`, "_blank")}>
                                {lang.historyPage.preview || "Preview"}
                              </Button>
                            </InlineStack>
                          </BlockStack>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <Text as="span" variant="bodyMd">{schedule.userName}</Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <Text tone="subdued" as="span">{schedule.notes || "No notes"}</Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <Text as="span" variant="bodyMd">{formatStoreTime(schedule.scheduledAt)}</Text>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <Badge tone={
                            schedule.status === "completed" ? "success" : 
                            schedule.status === "failed" ? "critical" : "attention"
                          }>
                            {schedule.status.toUpperCase()}
                          </Badge>
                        </IndexTable.Cell>
                        <IndexTable.Cell>
                          <div style={{ textAlign: 'right' }}>
                            <Button
                              tone="critical"
                              variant="plain"
                              size="slim"
                              onClick={() => {
                                if (confirm("Are you sure?")) {
                                  fetcher.submit({ intent: "delete", id: schedule.id.toString() }, { method: "POST" });
                                }
                              }}
                            >
                              {lang.historyPage.delete || "Delete"}
                            </Button>
                          </div>
                        </IndexTable.Cell>
                      </IndexTable.Row>
                    ))}
                  </IndexTable>
                </Box>
              )}
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
