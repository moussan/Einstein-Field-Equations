import { WebTracerProvider } from '@opentelemetry/web';
import { SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/tracing';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';

const serviceName = 'einstein-frontend';

export function initTracing() {
  const provider = new WebTracerProvider({
    resource: {
      'service.name': serviceName,
      'deployment.environment': process.env.NODE_ENV || 'development'
    }
  });

  // Configure exporters
  const consoleExporter = new ConsoleSpanExporter();
  const collectorExporter = new CollectorTraceExporter({
    url: process.env.OTEL_COLLECTOR_URL || 'http://localhost:4318/v1/traces'
  });

  // Add exporters to provider
  provider.addSpanProcessor(new SimpleSpanProcessor(consoleExporter));
  provider.addSpanProcessor(new SimpleSpanProcessor(collectorExporter));

  // Register instrumentations
  registerInstrumentations({
    instrumentations: [
      new XMLHttpRequestInstrumentation({
        ignoreUrls: [/localhost:8090\/v1\/metrics/],
        propagateTraceHeaderCorsUrls: /.*/
      }),
      new FetchInstrumentation({
        ignoreUrls: [/localhost:8090\/v1\/metrics/],
        propagateTraceHeaderCorsUrls: /.*/
      }),
      new DocumentLoadInstrumentation(),
      new UserInteractionInstrumentation()
    ]
  });

  // Initialize the provider
  provider.register({
    contextManager: new ZoneContextManager(),
    propagator: new B3Propagator()
  });

  return provider;
}

// Create a tracer for the service
export const tracer = initTracing().getTracer(serviceName);

// Utility function to create spans
export function createSpan(name: string, fn: () => Promise<any>) {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      const result = await fn();
      span.setStatus({ code: 0 }); // Success
      return result;
    } catch (error) {
      span.setStatus({ code: 1, message: error.message }); // Error
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}

// Utility function to add attributes to the current span
export function addSpanAttributes(attributes: Record<string, any>) {
  const currentSpan = tracer.getCurrentSpan();
  if (currentSpan) {
    Object.entries(attributes).forEach(([key, value]) => {
      currentSpan.setAttribute(key, value);
    });
  }
}

// Utility function to create error spans
export function recordError(error: Error, attributes?: Record<string, any>) {
  const currentSpan = tracer.getCurrentSpan();
  if (currentSpan) {
    currentSpan.setStatus({ code: 1, message: error.message });
    currentSpan.recordException(error);
    if (attributes) {
      addSpanAttributes(attributes);
    }
  }
}

// Decorator for tracing class methods
export function trace(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const spanName = name || `${target.constructor.name}.${propertyKey}`;
      return createSpan(spanName, () => originalMethod.apply(this, args));
    };
    return descriptor;
  };
} 