import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Box,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getAllSchedules } from "../models/scheduler.server";
import "../styles/custom.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop.toLowerCase().replace('https://', '').split('/')[0];
  
  // Fetch themes
  const response = await admin.graphql(
    `#graphql
    query getThemes {
      themes(first: 50) {
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
  const themesData: any = await response.json();
  const totalThemes = themesData.data.themes.edges.length;
  const mainTheme = themesData.data.themes.edges.find((edge: any) => edge.node.role.toLowerCase() === 'main')?.node;

  // Fetch schedules
  const schedules = await getAllSchedules(shop);
  schedules.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

  const completedTasks = schedules.filter(s => s.status === 'completed').length;
  const pendingTasks = schedules.filter(s => s.status === 'pending').length;
  const failedTasks = schedules.filter(s => s.status === 'failed').length;
  
  const recentActivity = schedules.slice(0, 5); // Just top 5

  return { 
    totalThemes, 
    mainThemeName: mainTheme?.name || 'Unknown',
    completedTasks, 
    pendingTasks, 
    failedTasks, 
    recentActivity 
  };
};

export default function DashboardPage() {
  const { 
    totalThemes, 
    mainThemeName,
    completedTasks, 
    pendingTasks, 
    failedTasks, 
    recentActivity 
  } = useLoaderData<typeof loader>();
  
  const navigate = useNavigate();

  return (
    <Page fullWidth>
      <TitleBar title="Theme Scheduler Dashboard" />
      
      <BlockStack gap="600">
        
        {/* Header Section */}
        <div className="futuristic-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="100">
               <Text as="h1" variant="headingXl">Dashboard Overview</Text>
               <Text as="p" variant="bodyMd" tone="subdued">Track your theme publication activity and metrics in real-time.</Text>
            </BlockStack>
            <InlineStack gap="300">
               <Button onClick={() => navigate("/app/scheduler")}>Go to Scheduler</Button>
               <Button variant="primary" onClick={() => navigate("/app/scheduler")}>Schedule Theme</Button>
            </InlineStack>
          </InlineStack>
        </div>

        {/* Top Metric Cards */}
        <Layout>
          <Layout.Section variant="oneThird">
            <div className="futuristic-card metric-card-success" style={{ padding: '24px' }}>
                <BlockStack gap="400">
                  <InlineStack align="space-between">
                    <Text as="h2" variant="headingMd">Completed Publish Tasks</Text>
                    <span style={{ fontSize: '20px' }}>✅</span>
                  </InlineStack>
                  <Text as="p" variant="heading3xl">{completedTasks.toString()}</Text>
                </BlockStack>
            </div>
          </Layout.Section>
          
          <Layout.Section variant="oneThird">
            <div className="futuristic-card metric-card-pending" style={{ padding: '24px' }}>
                <BlockStack gap="400">
                  <InlineStack align="space-between">
                    <Text as="h2" variant="headingMd">Pending Schedules</Text>
                    <span style={{ fontSize: '20px' }}>🕐</span>
                  </InlineStack>
                  <Text as="p" variant="heading3xl">{pendingTasks.toString()}</Text>
                </BlockStack>
            </div>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <div className="futuristic-card metric-card-info" style={{ padding: '24px' }}>
                <BlockStack gap="400">
                  <InlineStack align="space-between">
                    <Text as="h2" variant="headingMd">Total Store Themes</Text>
                    <span style={{ fontSize: '20px' }}>🎨</span>
                  </InlineStack>
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="p" variant="heading3xl">{totalThemes.toString()}</Text>
                    <Badge tone="info">{`Active: ${mainThemeName}`}</Badge>
                  </InlineStack>
                </BlockStack>
            </div>
          </Layout.Section>
        </Layout>

        <Layout>
          {/* Main Activity Area */}
          <Layout.Section>
            <div className="futuristic-card">
              <Card padding="0">
                <Box padding="500">
                  <div style={{ borderBottom: '1px solid var(--p-color-border)' }}>
                  <InlineStack align="space-between">
                    <Text as="h2" variant="headingLg">Recent Scheduling Activity</Text>
                    {recentActivity.length > 0 && <Button variant="plain" onClick={() => navigate("/app/scheduler")}>View All</Button>}
                  </InlineStack>
                  </div>
                </Box>
                
                {recentActivity.length === 0 ? (
                  <Box padding="800">
                     <BlockStack align="center" inlineAlign="center" gap="400">
                       <Text as="p" variant="bodyLg" tone="subdued">No schedule activity recorded yet.</Text>
                       <Button onClick={() => navigate("/app/scheduler")}>Create your first schedule</Button>
                     </BlockStack>
                  </Box>
                ) : (
                  <div style={{ padding: '0 20px 20px 20px' }}>
                    {recentActivity.map((activity: any, i: number) => (
                      <div key={activity.id} style={{ 
                        padding: '16px 0', 
                        borderBottom: i === recentActivity.length - 1 ? 'none' : '1px solid var(--p-color-border-subdued)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                         <BlockStack gap="100">
                            <Text as="span" variant="bodyMd" fontWeight="bold">{activity.themeName}</Text>
                            <Text as="span" variant="bodySm" tone="subdued">
                               By {activity.userName} • {new Date(activity.scheduledAt).toLocaleString()}
                            </Text>
                         </BlockStack>
                         <Badge tone={
                           activity.status === 'completed' ? 'success' : 
                           activity.status === 'failed' ? 'critical' : 'attention'
                         }>
                           {activity.status.toUpperCase()}
                         </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </Layout.Section>

          {/* Quick Info & Support */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
               {failedTasks > 0 && (
                 <div className="futuristic-card">
                   <Card padding="500">
                     <BlockStack gap="300">
                       <InlineStack align="space-between">
                          <Text as="h3" variant="headingMd" tone="critical">Failed Tasks</Text>
                          <span style={{ fontSize: '20px' }}>⚠️</span>
                       </InlineStack>
                       <Text as="p" variant="headingXl" tone="critical">{failedTasks}</Text>
                       <Text as="p" variant="bodySm" tone="subdued">Some scheduled tasks failed to execute. Please go to the Scheduler to review and clear them.</Text>
                       <Button tone="critical" onClick={() => navigate("/app/scheduler")}>Review Failures</Button>
                     </BlockStack>
                   </Card>
                 </div>
               )}

               <div className="futuristic-card">
                 <Card padding="500">
                   <BlockStack gap="400">
                     <Text as="h3" variant="headingMd">Need Help?</Text>
                     <Text as="p" variant="bodyMd" tone="subdued">Our dedicated support team is available immediately to assist you with any questions.</Text>
                     <Button 
                        variant="secondary" 
                        onClick={() => {
                           if ((window as any).Tawk_API && typeof (window as any).Tawk_API.maximize === 'function') {
                             (window as any).Tawk_API.maximize();
                           }
                        }}
                      >
                        Start Live Chat
                      </Button>
                   </BlockStack>
                 </Card>
               </div>
            </BlockStack>
          </Layout.Section>
        </Layout>

      </BlockStack>
    </Page>
  );
}
