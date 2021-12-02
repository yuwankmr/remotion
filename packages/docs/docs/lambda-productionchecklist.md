---
id: lambda-checklist
sidebar_label: Production Checklist
title: Production Checklist
slug: /lambda/checklist
---

import {DefaultTimeout} from '../components/lambda/default-timeout';

You have implemented your solution with Remotion Lambda are are ready to launch your project into the world. Congrats!
Before you go live, go through this checklist to make sure Lambda is running stable.

:::warning
We think Lambda is stable enough to ship to production, but remember that Lambda is still in beta and that APIs may change.
:::

### Optimizing for memory

Adding too much memory to your Lambda functions can make rendering more costly. Reducing the memory of your function by 25% will also decrease your cost by 25%! Redeploy your function multiple times and lower the memory size as much as possible until you feel you hit the sweet spot between low costs and confidence that your video will render reliably.

### Maximum file size

Lambda is constrained to a maximum output file size of approximately 250MB. Test the file sizes of your outputs and make sure they don't run at risk of exceeding the limit.
If your video is based on user input, prevent your users from rendering very long videos that would exceed the space available in Remotion Lambda.

### Permissions

Make sure your AWS permissions only have as many permissions as needed and store your credentials as environment variables. Review the [Permissions](/docs/lambda/permissions) page to see what the minimum amount of permissions is.

### AWS burst limit

Familiarize yourself with the [AWS burst limit](https://docs.aws.amazon.com/lambda/latest/dg/invocation-scaling.html). Essentially, you need to avoid a quick spike in video renders that will cause the burst limit to take effect. If you need to scale beyond the burst limit, consider scaling across multiple regions as the burst limit only applies for a certain region. Another strategy to consider is creating multiple sub-accounts in your AWS organization as the burst limit only affects a single account.

### Bucket privacy

By default the rendered videos are publicly accessible in your bucket. Use the `privacy` setting in [`renderVideoOnLambda()`](/docs/lambda/rendervideoonlambda) to make renders private if you'd like so.

### Rate limiting

Consider if it's possible for a user to invoke many video renders that will end up on your AWS bill, and implement a rate limiter to prevent a malicious actor from rendering many videos.

### Timeout

The default timeout for your Lambda function is <DefaultTimeout /> seconds which should be plenty, given that the video rendering is massively parallelized. But also here, measure and adjust the timeout for your needs and make sure it is high enough so that your video render will not fail.

### Valid Company license

Companies with more than 3 people need to buy cloud rendering seats in order to use Remotion Lambda. Please familiarize yourself with the [license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) and [buy the necessary cloud seats](https://companies.remotion.dev/) before launching.