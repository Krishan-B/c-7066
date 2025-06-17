import { GDPRService } from '@/services/gdpr/GDPRService';

export interface ProcessingContext {
  activityType: string;
  dataCategory: string;
  purpose: string;
  legalBasis: string;
}

interface ComponentProps {
  userId: string;
  [key: string]: unknown;
}

export const withGDPRConsent = (
  component: (props: ComponentProps) => JSX.Element,
  consentType: string,
  processingContext: ProcessingContext
) => {
  return function GDPRWrapper(props: ComponentProps) {
    const handleOperation = async () => {
      const hasConsent = await GDPRService.hasConsent(props.userId, consentType);
      if (!hasConsent) {
        throw new Error(`Consent required for ${consentType}`);
      }

      // Record the processing activity
      await GDPRService.recordProcessing(
        props.userId,
        processingContext.activityType,
        processingContext.dataCategory,
        processingContext.purpose,
        processingContext.legalBasis
      );

      return component(props);
    };

    return handleOperation();
  };
};

export const recordProcessing = (processingContext: ProcessingContext) => {
  return function decorator(
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const userId = this.userId ?? (args[0] as { userId?: string })?.userId;
      if (!userId) {
        throw new Error('User ID not found in context');
      }

      // Record the processing activity
      await GDPRService.recordProcessing(
        userId,
        processingContext.activityType,
        processingContext.dataCategory,
        processingContext.purpose,
        processingContext.legalBasis
      );

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
};
