import { Pool, PoolClient } from 'pg'
import { Effect, Context, Layer } from 'effect'
import { DatabaseError } from '@volunteer-proxy/shared'

export interface Database {
  readonly query: <T = any>(sql: string, params?: any[]) => Effect.Effect<T[]>
  readonly getClient: () => Effect.Effect<PoolClient, DatabaseError>
  readonly releaseClient: (client: PoolClient) => Effect.Effect<void>
}

export const Database = Context.GenericTag<Database>('@services/Database')

export const makeDatabaseLayer = (connectionString: string): Layer.Layer<Database> => {
  return Layer.scoped(
    Database,
    Effect.gen(function* (_) {
      const pool = new Pool({ connectionString })

      // Test connection
      yield* _(
        Effect.tryPromise({
          try: () => pool.query('SELECT NOW()'),
          catch: (error) => new DatabaseError({ message: 'Database connection failed', cause: error }),
        })
      )

      yield* _(
        Effect.addFinalizer(() =>
          Effect.promise(() => pool.end())
        )
      )

      return {
        query: <T = any>(sql: string, params?: any[]) =>
          Effect.tryPromise({
            try: async () => {
              const result = await pool.query(sql, params)
              return result.rows as T[]
            },
            catch: (error) => new DatabaseError({ message: 'Query failed', cause: error }),
          }),

        getClient: () =>
          Effect.tryPromise({
            try: () => pool.connect(),
            catch: (error) => new DatabaseError({ message: 'Failed to get client', cause: error }),
          }),

        releaseClient: (client: PoolClient) =>
          Effect.sync(() => client.release()),
      }
    })
  )
}
