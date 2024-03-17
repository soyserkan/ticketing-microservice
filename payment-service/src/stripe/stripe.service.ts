import { Inject, Injectable } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from 'src/stripe/stripe.config';
import Stripe from 'stripe';
import { StripeModuleOptions } from './dto/stripe-module-option';

@Injectable()
export class StripeService {
  public readonly stripe: Stripe;
  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: StripeModuleOptions) {
    this.stripe = new Stripe(this.options.apiKey, this.options.options);
  }
}
