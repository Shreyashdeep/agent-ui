import { z } from 'zod';

// Chart types supported
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'funnel' | 'retention';

// Series definition for multi-series charts (line, bar, area)
export const SeriesSchema = z.object({
  key: z.string().describe('Data key for this series'),
  label: z.string().describe('Display label for the series'),
  color: z.string().optional().describe('Optional hex or CSS color'),
});

export type Series = z.infer<typeof SeriesSchema>;

// Fields schema - varies by chart type
export const LineChartFieldsSchema = z.object({
  xKey: z.string().describe('Key for X-axis data'),
  series: z.array(SeriesSchema).min(1).describe('One or more series'),
});

export const BarChartFieldsSchema = z.object({
  xKey: z.string().describe('Key for X-axis categories'),
  series: z.array(SeriesSchema).min(1).describe('One or more series'),
});

export const PieChartFieldsSchema = z.object({
  categoryKey: z.string().describe('Key for category names'),
  valueKey: z.string().describe('Key for slice values'),
});

export const AreaChartFieldsSchema = z.object({
  xKey: z.string().describe('Key for X-axis data'),
  series: z.array(SeriesSchema).min(1).describe('One or more series'),
});

export const FunnelChartFieldsSchema = z.object({
  stepsKey: z.string().describe('Key for funnel step names'),
  valuesKey: z.string().describe('Key for step values'),
});

export const RetentionChartFieldsSchema = z.object({
  cohortKey: z.string().describe('Key for cohort identifiers'),
  periodKey: z.string().describe('Key for time periods'),
  retentionKey: z.string().describe('Key for retention percentage/count'),
});

// Metadata schema
export const ChartMetadataSchema = z.object({
  title: z.string().describe('Chart title'),
  xLabel: z.string().optional().describe('X-axis label'),
  yLabel: z.string().optional().describe('Y-axis label'),
  unit: z.string().optional().describe('Unit of measurement (e.g., USD, %)'),
  colors: z.array(z.string()).optional().describe('Color palette for series'),
  a11y: z.object({
    alt: z.string().describe('Alt text for accessibility'),
    description: z.string().optional().describe('Extended description'),
  }).optional(),
  legend: z.boolean().optional().default(true).describe('Show legend'),
  tooltip: z.boolean().optional().default(true).describe('Show tooltip'),
  notes: z.string().optional().describe('Additional notes or data source'),
});

export type ChartMetadata = z.infer<typeof ChartMetadataSchema>;

// Union type for all fields schemas
export const ChartFieldsSchema = z.union([
  LineChartFieldsSchema,
  BarChartFieldsSchema,
  PieChartFieldsSchema,
  AreaChartFieldsSchema,
  FunnelChartFieldsSchema,
  RetentionChartFieldsSchema,
]);

export type ChartFields = z.infer<typeof ChartFieldsSchema>;

// Main chart message schema
export const ChartMessageSchema = z.object({
  content_type: z.literal('chart').describe('Marks this as a chart message'),
  type: z.enum(['line', 'bar', 'pie', 'area', 'funnel', 'retention']).describe('Chart type'),
  fields: ChartFieldsSchema.describe('Fields configuration'),
  data: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))).min(1).describe('Chart data array'),
  meta: ChartMetadataSchema.describe('Chart metadata'),
  id: z.string().optional().describe('Optional unique ID for streaming updates'),
  operation: z.enum(['replace', 'append', 'patch']).optional().default('replace').describe('Update operation for streams'),
});


export type ChartMessage = z.infer<typeof ChartMessageSchema>;

// Validation helper
export const validateChartMessage = (data: unknown): { valid: true; data: ChartMessage } | { valid: false; errors: string[] } => {
  const result = ChartMessageSchema.safeParse(data);
  if (result.success) {
    return { valid: true, data: result.data };
  }
  return {
    valid: false,
    errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
  };
};

// Type guards
export const isChartMessage = (data: unknown): data is ChartMessage => {
  return ChartMessageSchema.safeParse(data).success;
};

export const isLineChart = (message: ChartMessage): message is ChartMessage & { type: 'line' } => {
  return message.type === 'line';
};

export const isBarChart = (message: ChartMessage): message is ChartMessage & { type: 'bar' } => {
  return message.type === 'bar';
};

export const isPieChart = (message: ChartMessage): message is ChartMessage & { type: 'pie' } => {
  return message.type === 'pie';
};

export const isAreaChart = (message: ChartMessage): message is ChartMessage & { type: 'area' } => {
  return message.type === 'area';
};

export const isFunnelChart = (message: ChartMessage): message is ChartMessage & { type: 'funnel' } => {
  return message.type === 'funnel';
};

export const isRetentionChart = (message: ChartMessage): message is ChartMessage & { type: 'retention' } => {
  return message.type === 'retention';
};