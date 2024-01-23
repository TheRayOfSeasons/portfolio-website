import { type SSTConfig } from 'sst';
// eslint-disable-next-line import/no-unresolved
import { Frontend } from './stacks/Frontend';

export default {
  config() {
    return {
      name: process.env.PROJECT_NAME || 'ray-portfolio',
      region: process.env.REGION || 'ap-southeast-1',
    };
  },
  stacks(app) {
    app.stack(Frontend);
  },
} satisfies SSTConfig;
