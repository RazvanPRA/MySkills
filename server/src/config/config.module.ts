import { type DynamicModule, Global, Module } from '@nestjs/common';
import { type Env, ENV } from './env.js';

/** Provides the validated configuration everywhere (inject with `@Inject(ENV)`). */
@Global()
@Module({})
export class ConfigModule {
  static forRoot(env: Env): DynamicModule {
    return { module: ConfigModule, providers: [{ provide: ENV, useValue: env }], exports: [ENV] };
  }
}
