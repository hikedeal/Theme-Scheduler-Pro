import prisma from "../db.server";

export async function getUpcomingSchedules(shop: string) {
  return await prisma.themeSchedule.findMany({
    where: {
      shop,
      status: "pending",
      scheduledAt: {
        lte: new Date(),
      },
    },
  });
}

export async function createSchedule(data: {
  themeId: string;
  themeName: string;
  userName: string;
  notes?: string;
  scheduledAt: Date;
  shop: string;
}) {
  return await prisma.themeSchedule.create({
    data,
  });
}

export async function deleteSchedule(id: number, shop: string) {
  return await prisma.themeSchedule.deleteMany({
    where: {
      id,
      shop,
    },
  });
}

export async function getAllSchedules(shop: string) {
  return await prisma.themeSchedule.findMany({
    where: {
      shop,
    },
    orderBy: {
      scheduledAt: "desc",
    },
  });
}

export async function pollSchedules() {
  const now = new Date();
  const dueSchedules = await prisma.themeSchedule.findMany({
    where: {
      status: "pending",
      scheduledAt: {
        lte: now,
      },
    },
  });

  if (dueSchedules.length === 0) return;

  console.log(`[Scheduler] Found ${dueSchedules.length} due schedules.`);

  for (const schedule of dueSchedules) {
    try {
      await executeSchedule(null, schedule.id);
      console.log(`[Scheduler] Executed schedule ${schedule.id} for theme ${schedule.themeName}`);
    } catch (error) {
      console.error(`[Scheduler] Failed to execute schedule ${schedule.id}:`, error);
    }
  }
}

export async function executeSchedule(admin: any, scheduleId: number) {
  const schedule = await prisma.themeSchedule.findUnique({
    where: { id: scheduleId },
  });

  if (!schedule || schedule.status !== "pending") return;

  try {
    const shop = schedule.shop;
    const session = await prisma.session.findFirst({ 
      where: { shop },
      orderBy: { expires: "desc" }
    });

    if (!session) throw new Error("No session found for shop");
    const accessToken = session.accessToken;

    // 1. Get current main theme to store for revert
    const themesResponse = await fetch(
      `https://${shop}/admin/api/2025-01/themes.json`,
      {
        headers: { "X-Shopify-Access-Token": accessToken },
      }
    );
    const themesData: any = await themesResponse.json();
    const currentMain = themesData.themes?.find((t: any) => t.role === "main");

    let backupThemeId = null;
    let backupThemeName = null;

    // 2. Create an Auto-Backup of the current main theme
    if (currentMain) {
      const dateStr = new Date().toLocaleString();
      backupThemeName = `[Backup] ${currentMain.name} (${dateStr})`;
      const backupResponse = await fetch(
        `https://${shop}/admin/api/2025-01/themes.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
          body: JSON.stringify({
            theme: {
              name: backupThemeName,
              source_theme_id: currentMain.id,
            },
          }),
        }
      );
      const backupResult: any = await backupResponse.json();
      if (backupResult.errors) {
        console.warn("Auto-backup failed, but proceeding with publish:", backupResult.errors);
      } else {
        backupThemeId = backupResult.theme?.id.toString();
      }
    }

    // 3. Publish new theme
    const response = await fetch(
      `https://${shop}/admin/api/2025-01/themes/${schedule.themeId}.json`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          theme: {
            id: parseInt(schedule.themeId, 10),
            role: "main",
          },
        }),
      }
    );

    const result: any = await response.json();

    if (result.errors) {
      const errorMsg = JSON.stringify(result.errors);
      console.error("Theme publish errors (REST):", errorMsg);
      await prisma.themeSchedule.update({
        where: { id: scheduleId },
        data: { 
          status: "failed",
          errorDetail: errorMsg,
          executedAt: new Date()
        },
      });
      return { success: false, errors: result.errors };
    }

    // 4. Update status and previous theme info
    await prisma.themeSchedule.update({
      where: { id: scheduleId },
      data: { 
        status: "completed",
        executedAt: new Date(),
        previousThemeId: currentMain?.id.toString(),
        previousThemeName: currentMain?.name,
        backupThemeId,
        backupThemeName
      },
    });

    return { success: true };
  } catch (error) {
    const errorMsg = (error as Error).message;
    console.error("Failed to execute theme schedule:", errorMsg);
    await prisma.themeSchedule.update({
      where: { id: scheduleId },
      data: { 
        status: "failed",
        errorDetail: errorMsg,
        executedAt: new Date()
      },
    });
    return { success: false, error: errorMsg };
  }
}

export async function revertSchedule(admin: any, scheduleId: number) {
  try {
    const schedule = await prisma.themeSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule || !schedule.previousThemeId) {
      throw new Error("No previous theme found to revert to.");
    }

    const shop = schedule.shop;
    const session = await prisma.session.findFirst({ 
      where: { shop },
      orderBy: { expires: "desc" }
    });
    
    if (!session) throw new Error("No session found for shop");
    const accessToken = session.accessToken;

    const response = await fetch(
      `https://${shop}/admin/api/2025-01/themes/${schedule.previousThemeId}.json`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          theme: {
            id: parseInt(schedule.previousThemeId, 10),
            role: "main",
          },
        }),
      }
    );

    const result: any = await response.json();

    if (result.errors) {
      throw new Error(JSON.stringify(result.errors));
    }

    // Create a NEW record to show that a Revert happened
    await prisma.themeSchedule.create({
      data: {
        themeId: schedule.previousThemeId,
        themeName: `[Reverted] ${schedule.previousThemeName || "Previous Theme"}`,
        userName: "Revert Action",
        notes: `Rollback of "${schedule.themeName}"`,
        scheduledAt: new Date(),
        status: "completed",
        shop: shop,
      }
    });

    return { success: true };
  } catch (error) {
    const errorMsg = (error as Error).message;
    console.error("Failed to revert theme:", errorMsg);
    await prisma.themeSchedule.update({
      where: { id: scheduleId },
      data: { errorDetail: `Revert failed: ${errorMsg}` },
    });
    throw error;
  }
}
