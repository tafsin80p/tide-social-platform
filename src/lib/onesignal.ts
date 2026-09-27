export async function sendPushNotification(userIds: string[], heading: string, content: string, url?: string) {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!appId || !apiKey) {
    console.warn("OneSignal credentials are not set. Skipping push notification.");
    return false;
  }

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${apiKey}`
      },
      body: JSON.stringify({
        app_id: appId,
        include_aliases: {
          external_id: userIds
        },
        target_channel: "push",
        headings: { en: heading },
        contents: { en: content },
        url: url || process.env.NEXT_PUBLIC_APP_URL || "https://tido.vercel.app"
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}
