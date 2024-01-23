import { type SSTConfig } from 'sst';
// eslint-disable-next-line import/no-unresolved
import { API } from './stacks/MyStack';

export default {
  config() {
    return {
      name: 'ray-portfolio',
      region: 'ap-southeast-1',
    };
  },
  stacks(app) {
    app.stack(API);
  },
} satisfies SSTConfig;
