import { ConfigurableModuleBuilder } from '@nestjs/common';
import { StripeModuleOptions } from './dto/stripe-module-option';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } = new ConfigurableModuleBuilder<StripeModuleOptions>().setClassMethodName('forRoot').build();
