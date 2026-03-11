import { Router, Request, Response } from 'express';
import { notificationService } from '../services/notificationService';

const router = Router();

/**
 * Send daily verse notifications
 * This should be called by a cron job every minute
 */
router.post('/send-daily-verse', async (req: Request, res: Response) => {
  try {
    console.log('🔔 Received request to send daily verse notifications');
    const result = await notificationService.sendDailyVerseNotifications();
    
    res.json({
      success: true,
      message: 'Daily verse notifications processed',
      sent: result.sent,
      failed: result.failed,
    });
  } catch (error) {
    console.error('❌ Error sending daily verse notifications:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to send daily verse notifications' 
    });
  }
});

/**
 * Send test notification
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const success = await notificationService.sendTestNotification(userId);

    res.json({
      success,
      message: success 
        ? 'Test notification sent' 
        : 'Failed to send test notification'
    });
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

export default router;
