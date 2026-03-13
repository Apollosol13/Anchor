import { notificationWorkflow } from '@/server/services/notificationService';

export async function POST(request: Request) {
  return notificationWorkflow.handler(request);
}
