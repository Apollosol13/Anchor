import { json, error, requireSession, checkRateLimit } from '@/lib/api-helpers';
import { sendTestNotification } from '@/server/services/notificationService';

export async function POST(request: Request) {
  try {
    await checkRateLimit(request);
    const session = await requireSession(request);
    const success = await sendTestNotification(session.user.id);

    return json({
      success,
      message: success ? 'Test notification sent' : 'Failed to send test notification',
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return error('Failed to send test notification');
  }
}
