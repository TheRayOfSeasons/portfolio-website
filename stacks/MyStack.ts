import { StackContext, StaticSite } from "sst/constructs";

export function API({ stack }: StackContext) {
  const web = new StaticSite(stack, 'web', {
    path: 'packages/frontend',
    buildOutput: 'dist',
    buildCommand: 'npm run build',
    environment: {
      VITE_API_URL: 'https://my.api.url.com',
    },
  });

  stack.addOutputs({
    CloudfrontUrl: web.url
  });
}
