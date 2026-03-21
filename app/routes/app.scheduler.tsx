import { useState, useEffect } from "react";
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
  TextField,
  Modal,
  Badge,
  Banner,
  EmptyState,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import {
  getAllSchedules,
  createSchedule,
  deleteSchedule,
  executeSchedule,
  revertSchedule,
} from "../models/scheduler.server";
import { getTranslations, Language } from "../utils/translations";
import "../styles/custom.css";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop.toLowerCase().replace('https://', '').split('/')[0];

  const response = await admin.graphql(
    `#graphql
    query getData {
      shop {
        ianaTimezone
      }
      themes(first: 20) {
        edges {
          node {
            id
            name
            role
          }
        }
      }
    }`
  );

  const graphqlData: any = await response.json();
  const ianaTimezone = graphqlData.data.shop?.ianaTimezone || "UTC";
  const themes = graphqlData.data.themes.edges.map((edge: any) => ({
    id: edge.node.id.split("/").pop(), // Extract ID from GID
    name: edge.node.name,
    role: edge.node.role.toLowerCase(),
  }));

  themes.sort((a: any, b: any) => (a.role === 'main' ? -1 : b.role === 'main' ? 1 : 0));

  const schedules = await getAllSchedules(shop);
  schedules.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  let language: Language = 'en';
  try {
    const settings = await prisma.shopSettings.findUnique({ where: { shop } });
    if (settings) language = settings.language as Language;
  } catch (e) {
    console.error("Language loading error (Scheduler):", e);
  }

  return { themes, schedules, shop, language, ianaTimezone };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "schedule") {
    const themeId = formData.get("themeId") as string;
    const themeName = formData.get("themeName") as string;
    const userName = formData.get("userName") as string;
    const notes = formData.get("notes") as string;
    const scheduledAtStr = formData.get("scheduledAt") as string;
    const storeTimezone = formData.get("storeTimezone") as string || "UTC";
    
    // Parse using the physically correct store timezone before committing to the database as UTC Date
    const scheduledAt = dayjs.tz(scheduledAtStr, storeTimezone).toDate();

    if (!userName) return { error: "Publisher name is required." };
    if (isNaN(scheduledAt.getTime())) return { error: "Invalid date provided." };

    const tenMinutesBefore = new Date(scheduledAt.getTime() - 10 * 60000);
    const tenMinutesAfter = new Date(scheduledAt.getTime() + 10 * 60000);
    const conflicts = await prisma.themeSchedule.findMany({
      where: {
        shop,
        scheduledAt: { gte: tenMinutesBefore, lte: tenMinutesAfter },
        status: "pending",
      },
    });

    if (conflicts.length > 0) return { error: "Another theme is already scheduled within 10 minutes." };

    await createSchedule({ themeId, themeName, userName, notes, scheduledAt, shop });
    return { success: true, message: "Theme scheduled successfully!" };
  }

  if (intent === "delete") {
    const id = parseInt(formData.get("id") as string, 10);
    const cleanShop = session.shop.toLowerCase().replace('https://', '').split('/')[0];
    await deleteSchedule(id, cleanShop);
    return { success: true, message: "Schedule deleted successfully!" };
  }

  if (intent === "publish_now") {
    const themeId = formData.get("themeId") as string;
    const themeName = formData.get("themeName") as string;
    const idStr = formData.get("id");

    if (idStr) {
      const id = parseInt(idStr as string, 10);
      await executeSchedule(admin, id);
    } else {
      const schedule = await createSchedule({ themeId, themeName, userName: "Admin", notes: "Instant publish", scheduledAt: new Date(), shop });
      await executeSchedule(admin, schedule.id);
    }
    return { success: true, message: "Theme published successfully!" };
  }

  if (intent === "revert") {
    const id = parseInt(formData.get("id") as string, 10);
    await revertSchedule(admin, id);
    return { success: true, message: "Theme reverted successfully!" };
  }

  return null;
};

export default function SchedulerPage() {
  const { themes, schedules, shop, language, ianaTimezone } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<any>();
  const lang = getTranslations(language as Language);
  const shopify = useAppBridge();

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<{ id: string; name: string } | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [userName, setUserName] = useState("");
  const [notes, setNotes] = useState("");

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTheme(null);
    setScheduledAt("");
    setUserName("");
    setNotes("");
  };

  const handleScheduleSubmit = () => {
    if (!selectedTheme || !scheduledAt || !userName) {
      shopify.toast.show("Please fill all required fields", { isError: true });
      return;
    }
    fetcher.submit({ intent: "schedule", themeId: selectedTheme.id, themeName: selectedTheme.name, userName, notes, scheduledAt, storeTimezone: ianaTimezone }, { method: "POST" });
    handleModalClose();
  };

  const stats = {
    total: schedules.length,
    pending: schedules.filter((s: any) => s.status === "pending").length,
    completed: schedules.filter((s: any) => s.status === "completed").length,
  };

  return (
    <Page fullWidth>
      <TitleBar title={lang.dashboard} />
      <BlockStack gap="600">
        <Layout>
          <Layout.Section variant="oneThird">
            <div className="futuristic-card metric-card-info" style={{ padding: '24px' }}>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">{lang.stats.total}</Text>
                  <span style={{ fontSize: '20px' }}>📊</span>
                </InlineStack>
                <Text as="p" variant="heading3xl">{stats.total.toString()}</Text>
              </BlockStack>
            </div>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <div className="futuristic-card metric-card-pending" style={{ padding: '24px' }}>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">{lang.stats.pending}</Text>
                  <span style={{ fontSize: '20px' }}>🕐</span>
                </InlineStack>
                <Text as="p" variant="heading3xl">{stats.pending.toString()}</Text>
              </BlockStack>
            </div>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <div className="futuristic-card metric-card-success" style={{ padding: '24px' }}>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">{lang.stats.successRate}</Text>
                  <span style={{ fontSize: '20px' }}>✅</span>
                </InlineStack>
                <Text as="p" variant="heading3xl">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</Text>
              </BlockStack>
            </div>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section>
            <div className="quick-actions-bar animate-fade-in">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingMd">{lang.quickActions.label}</Text>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Button variant="secondary" url="/app/history">{lang.history}</Button>
                  <Button tone="critical" variant="secondary" onClick={() => {
                    const lastCompleted = schedules.find((s: any) => s.status === "completed" && s.id);
                    if (lastCompleted) fetcher.submit({ intent: "revert", id: lastCompleted.id }, { method: "POST" });
                    else shopify.toast.show(lang.quickActions.noHistory, { isError: true });
                  }}>{lang.quickActions.revert}</Button>
                  <Button onClick={() => window.location.reload()}>{lang.quickActions.refresh}</Button>
                  <Button variant="primary" url="shopify:admin/themes">{lang.quickActions.shopify}</Button>
                </div>
              </InlineStack>
            </div>
          </Layout.Section>
        </Layout>

        <Layout>
          {/* Themes Section (Now First/Left) */}
          <Layout.Section variant="oneHalf">
            <Card padding="0">
              <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Text as="h2" variant="headingMd">{lang.themes.title}</Text>
              </div>
              <div className="theme-list-scroll" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {themes.map((theme: any) => (
                    <div key={theme.id} className="futuristic-card" style={{ margin: '10px 20px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <BlockStack gap="100">
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className="white-text"><Text as="span" variant="bodyMd" fontWeight="bold">{theme.name}</Text></span>
                          {theme.role === 'main' && <Badge tone="success" progress="complete">{lang.themes.live}</Badge>}
                        </div>
                        <Text as="p" variant="bodySm" tone="subdued">ID: {theme.id}</Text>
                      </BlockStack>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button size="slim" variant="secondary" onClick={() => { setSelectedTheme(theme); setIsModalOpen(true); }}>{lang.themes.schedule}</Button>
                        <Button size="slim" variant="primary" onClick={() => fetcher.submit({ intent: "publish_now", themeId: theme.id, themeName: theme.name }, { method: "POST" })}>{lang.themes.publishNow}</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Layout.Section>

          {/* Activity Section (Now Second/Right) */}
          <Layout.Section variant="oneHalf">
            <Card padding="0">
              <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text as="h2" variant="headingMd">{lang.activity.title}</Text>
                <Button variant="plain" url="/app/history">{lang.historyPage.detailedLog} →</Button>
              </div>
              <div className="theme-list-scroll" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {schedules.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <Text as="p" tone="subdued">{lang.activity.noActivity}</Text>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {schedules.map((schedule: any) => (
                      <div key={schedule.id} className="activity-item" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <BlockStack gap="100">
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className="white-text"><Text as="span" variant="bodyMd" fontWeight="bold">{schedule.themeName}</Text></span>
                            <Badge tone={schedule.status === "completed" ? "success" : schedule.status === "failed" ? "critical" : "attention"}>{schedule.status.toUpperCase()}</Badge>
                          </div>
                          <Text as="p" variant="bodySm" tone="subdued">
                            {lang.modal.time}: {formatStoreTime(schedule.scheduledAt)}
                          </Text>
                          {schedule.executedAt && (
                            <Text as="p" variant="bodySm" tone="subdued">
                              {lang.historyPage.publishedAt}: {formatStoreTime(schedule.executedAt)}
                            </Text>
                          )}
                          <Text as="p" variant="bodySm" tone="subdued">{lang.activity.by} <span className="neon-text">{schedule.userName}</span></Text>
                          {schedule.notes && <Text as="p" variant="bodySm" tone="subdued"><i>"{schedule.notes}"</i></Text>}
                          {schedule.backupThemeName && (
                            <Text as="p" variant="bodySm" tone="success">
                              <Badge size="small" tone="success">Backup Creation</Badge> {schedule.backupThemeName}
                            </Text>
                          )}
                          {schedule.errorDetail && (
                            <Banner tone="critical">
                              <p>{schedule.errorDetail}</p>
                            </Banner>
                          )}
                        </BlockStack>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {schedule.status === "pending" && (
                            <>
                              <Button size="slim" variant="primary" onClick={() => fetcher.submit({ intent: "publish_now", id: schedule.id.toString(), themeId: schedule.themeId, themeName: schedule.themeName }, { method: "POST" })}>{lang.themes.publishNow}</Button>
                              <Button size="slim" tone="critical" onClick={() => fetcher.submit({ intent: "delete", id: schedule.id.toString() }, { method: "POST" })}>{lang.activity.clear}</Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>

      <Modal open={isModalOpen} onClose={handleModalClose} title={lang.modal.title} primaryAction={{ content: lang.modal.schedule, onAction: handleScheduleSubmit }} secondaryActions={[{ content: lang.modal.cancel, onAction: handleModalClose }]}>
        <Modal.Section>
          <BlockStack gap="400">
            <TextField label={lang.modal.theme} value={selectedTheme?.name || ""} readOnly autoComplete="off" />
            <TextField label={lang.modal.publisher} value={userName} onChange={setUserName} placeholder="e.g. John Doe" autoComplete="off" />
            <TextField label={lang.modal.notes} value={notes} onChange={setNotes} placeholder={lang.modal.notesPlaceholder} multiline={3} autoComplete="off" />
            <TextField label={lang.modal.time} type="datetime-local" value={scheduledAt} onChange={setScheduledAt} autoComplete="off" />
            <Text as="p" variant="bodySm" tone="subdued">Store Timezone: {ianaTimezone}</Text>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
