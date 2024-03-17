import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ConfigurableModuleClass } from './stripe.config';

@Module({
  providers: [StripeService],
  exports: [StripeService],
  imports: [],
})
export class StripeModule extends ConfigurableModuleClass {}
