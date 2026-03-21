import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Badge,
  EmptyState,
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
  let language: Language = 'en';
  try {
    const settings = await prisma.shopSettings.findUnique({ where: { shop } });
    if (settings) language = settings.language as Language;
  } catch (e) {
    console.error("Language loading error (History):", e);
  }

  return { schedules, shop, language };
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
  const { schedules, shop, language } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const lang = getTranslations(language as Language);
  
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
        
        {/* Futuristic Stats Header */}
        <div className="hero-stats animate-fade-in">
          <div className="stat-item">
            <span className="stat-label">{lang.historyPage.successRate}</span>
            <span className="stat-value neon-text">{successRate}%</span>
          </div>
          <div className="stat-item" style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '40px' }}>
            <span className="stat-label">{lang.historyPage.totalPublishes}</span>
            <span className="stat-value white-text">{stats.total}</span>
          </div>
          <div className="stat-item" style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '40px' }}>
            <span className="stat-label">{lang.historyPage.failedAttempts}</span>
            <span className="stat-value" style={{ color: 'var(--p-color-neon-pink)' }}>{stats.failed}</span>
          </div>
        </div>

        <div className="animate-fade-in">
          <Card padding="0">
            <div className="futuristic-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                <span className="neon-text">
                  <Text as="h2" variant="headingMd">{lang.historyPage.detailedLog}</Text>
                </span>
              </div>

              {schedules.length === 0 ? (
                <div style={{ padding: '100px 0' }}>
                  <EmptyState
                    heading={lang.historyPage.noHistory}
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <p>Schedule your first theme publish to see data here.</p>
                  </EmptyState>
                </div>
              ) : (
                <div className="history-grid-container">
                  <div className="history-grid">
                    {/* Grid Header */}
                    <div className="grid-header">
                      <div>{lang.historyPage.theme}</div>
                      <div>{lang.historyPage.publisher}</div>
                      <div>{lang.historyPage.updateNotes}</div>
                      <div>{lang.historyPage.publishedAt}</div>
                      <div>{lang.historyPage.status}</div>
                      <div style={{ textAlign: 'right' }}>{lang.historyPage.actions}</div>
                    </div>
                    
                    {/* Grid Body */}
                    <div className="grid-body">
                      {schedules.map((schedule: any) => (
                        <div key={schedule.id} className="grid-row">
                          <div className="cell-theme">
                            <span className="white-text" style={{ fontWeight: '600' }}>{schedule.themeName}</span>
                            <Button variant="plain" size="slim" url={`shopify:admin/themes/${schedule.themeId}`}>
                              {lang.historyPage.preview}
                            </Button>
                          </div>
                          <div className="cell-publisher">
                            <span className="neon-text" style={{ fontSize: '13px' }}>{schedule.userName}</span>
                          </div>
                          <div className="cell-notes">
                             <span style={{ fontSize: '12px', opacity: 0.6 }}>{schedule.notes || "No notes"}</span>
                          </div>
                          <div className="cell-date">
                            {new Date(schedule.scheduledAt).toLocaleString()}
                          </div>
                          <div className="cell-status">
                            <Badge tone={
                              schedule.status === "completed" ? "success" : 
                              schedule.status === "failed" ? "critical" : "attention"
                            }>
                              {schedule.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="cell-actions" style={{ textAlign: 'right' }}>
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
                              {lang.historyPage.delete}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </BlockStack>
    </Page>
  );
}
