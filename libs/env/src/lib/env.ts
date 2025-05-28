import { z } from 'zod';

type SchemaDefinition = { [key: string]: z.ZodType };

const schemaCache = new Map<Function, z.ZodObject<any>>();

export function loadEnv<TSchema extends SchemaDefinition>(
  schema: (zod: typeof z) => TSchema,
  env: typeof process.env = process.env
): z.infer<z.ZodObject<TSchema>> {
  if (schemaCache.has(schema)) {
    const cachedSchema = schemaCache.get(schema)! as z.ZodObject<TSchema>; 
    return cachedSchema.parse(env);
  }

  const zodSchema = schema(z);
  const envSchema = z.object(zodSchema) as z.ZodObject<TSchema>;
  schemaCache.set(schema, envSchema);

  return envSchema.parse(env);
}
