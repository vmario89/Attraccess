import { z } from 'zod';

type SchemaDefinition = { [key: string]: z.ZodType };

// Cache for memoized schemas
const schemaCache = new Map<Function, z.ZodObject<any>>(); // Use 'any' for the cache type

export function loadEnv<TSchema extends SchemaDefinition>(
  schema: (zod: typeof z) => TSchema,
  env: typeof process.env = process.env
): z.infer<z.ZodObject<TSchema>> {
  if (schemaCache.has(schema)) {
    // Type assertion needed here as the cache stores z.ZodObject<any>
    const cachedSchema = schemaCache.get(schema)! as z.ZodObject<TSchema>; 
    return cachedSchema.parse(env);
  }

  const zodSchema = schema(z);
  const envSchema = z.object(zodSchema) as z.ZodObject<TSchema>; // Cast to satisfy TypeScript
  schemaCache.set(schema, envSchema);

  return envSchema.parse(env);
}
