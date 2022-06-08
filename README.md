# Introduction

This package exposes an opinionated Construct for setting up an AWS WebAcl using the CDK. Five custom rules are ready to be enabled. If you are not using the custom rules this package will not bring you much value.

# Installation

Install the package by running

```bash
npm install @enfo/aws-cdk-fixme
```

# Getting started

## Quick start

This is example is the least amount of configuration you have to do in order for the WebAcl to be created

```typescript
import { Fixme, Scope } from '@enfo/aws-cdk-fixme'
import { Stack } from 'aws-cdk-lib'
import { RestApi } from 'aws-cdk-lib/aws-apigateway'
import { CfnWebACLAssociation } from 'aws-cdk-lib/aws-wafv2'
import { Distribution } from 'aws-cdk-lib/aws-cloudfront'

const stack = new Stack()
const fixme = new Fixme(stack, 'MyFixme', {
  scope: Scope.REGIONAL,
  metricName: 'my-metric',
  defaultAction: {
    allow: {}
  }
})
  .enableIpBlockRule()
  .enableRateLimitRule()
  .enableIpReputationRule()
  .enableManagedCoreRule()
  .enableBadInputsRule()

// associating it with an API
const api = new RestApi(stack, 'Api')
api.root.addMethod('GET')
new CfnWebACLAssociation(this, 'ApiAssociation', {
  webAclArn: fixme.webAcl.attrArn,
  resourceArn: `arn:aws:apigateway:${Stack.of(stack).region}::/restapis/${api.deploymentStage.restApi.restApiId}/stages/${api.deploymentStage.stageName}`
});

// associating it with a CloudFront Distribution
new Distribution(stack, 'Distribution', {
  webAclId: fixme.webAcl.attrArn,
  // more properties
})
```

## Configuration options

The Fixme and all rules can be configured.

### Fixme configuration

The Fixme Construct takes an object with the interface FixmeProps which supports all properties from CfnWebAclProps except:

* scope, this has been replaced with an enum instead of a string
* visibilityConfig, this has been removed and its properties flattened into FixmeProps. Only metricName is mandatory

Example of unique configuration options unique to Fixme:

```typescript
new Fixme(stack, 'MyFixme', {
  scope: Scope.CLOUDFRONT,
  metricName: 'my-metric',
  cloudWatchMetricsEnabled: true,
  sampledRequestsEnabled: true,
  defaultAction: { // not unique but must be included
    allow: {}
  }
})
```

### Rules configurations

You can only enable a rule **ONCE**. Attempting to enable a rule twice will result in an Error being thrown.

All rules share the same base interface. The following properties have been modified from CfnWebACL.RuleProperty:

* name, no longer mandatory, has a rule specific default
* priority, no longer mandatory, has a rule specific default
* statement, removed, set for you
* visibilityConfig, removed and properties flatted into rule properties
* action, removed from all rules but IP Block
* overrideAction, set to `{ none: {} }` on all rules but IP Block

### enableIpBlockRule configuration

You can read about IP set rules [here](https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-ipset-match.html). The IP Block rule supports more properties than other rules. These have been grabbed from CfnIPSetProps, some have been replaced, others removed:

* ipSetName, name you want for the IP Set
* ipSetDescription, description you want for the IP Set
* addresses, no longer mandatory
* ipAddressVersion, replaced with enum instead of a string
* ipSetTags

Example of enableIpBlockRule options:

```typescript
new Fixme(...)
.enableIpBlockRule({
  name: 'cool-name', // default 'ip-block'
  priority: 1, // default 10
  metricName: 'something', // default 'ip-block'
  cloudWatchMetricsEnabled: true,
  sampledRequestsEnabled: true,
  action: {
    allow: {}
  }
})
```

Customizing the IP Set:

```typescript
new Fixme(stack, 'Fixme', {
  scope: Scope.REGIONAL,
  metricName: 'something',
  defaultAction: {
    allow: {}
  }
})
  .enableIpBlockRule({
    ipSetName: 'my-set',
    ipSetDescription: 'desc',
    addresses: ['2001:0db8:85a3:0000:0000:8a2e:0370:7334'],
    ipAddressVersion: IpAddressVersion.IPV6,
    ipSetTags: [
      {
        key: 'key!',
        value: 'value!'
      }
    ]
  })
```

You can also supply your own IP Set:

```typescript
const ipSet = new CfnIPSet(stack, 'MySet', {
  scope: 'REGIONAL',
  name: 'my-set',
  addresses: [],
  ipAddressVersion: 'IPV4'
})

new Fixme(stack, 'Fixme', {
  scope: Scope.REGIONAL,
  metricName: 'something',
  defaultAction: {
    allow: {}
  }
})
  .enableIpBlockRule({
    ipSet
  })
```

If an IP Set is supplied Fixme will not create one

### enableRateLimitRule configuration

You can read about rate limit rules [here](https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-rate-based.html). The Rate Limit rule supports one property extra than the other rules:

* rateLimit, defaults to 1000

Example of options:

```typescript
new Fixme(...)
.enableRateLimitRule({
  name: 'cool-name', // default 'rate-limit'
  priority: 1, // default 20
  metricName: 'something', // default 'rate-limit'
  rateLimit: 1337,
  cloudWatchMetricsEnabled: true,
  sampledRequestsEnabled: true
})
```

### enableIpReputationRule configuration

You can read about IP reputation rules [here](https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-ip-rep.html). Example of enableIpReputationRule options:

```typescript
new Fixme(...)
.enableIpReputationRule({
  name: 'cool-name', // default 'ip-reputation'
  priority: 1, // default 30
  metricName: 'something', // default 'ip-reputation'
  cloudWatchMetricsEnabled: true,
  sampledRequestsEnabled: true
})
```

### enableManagedCoreRule configuration

You can read about the AWS core rules [here](https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-baseline.html). Example of enableManagedCoreRule options:

```typescript
new Fixme(...)
.enableManagedCoreRule({
  name: 'cool-name', // default 'managed-core'
  priority: 1, // default 40
  metricName: 'something', // default 'managed-core'
  cloudWatchMetricsEnabled: true,
  sampledRequestsEnabled: true
})
```

### enableBadInputsRule configuration

You can read about the AWS bad inputs rules [here](https://docs.aws.amazon.com/waf/latest/developerguide/aws-managed-rule-groups-baseline.html#aws-managed-rule-groups-baseline-known-bad-inputs). Example of enableBadInputsRule options:

```typescript
new Fixme(...)
.enableBadInputsRule({
  name: 'cool-name', // default 'bad-inputs'
  priority: 1, // default 50
  metricName: 'something', // default 'bad-inputs'
  cloudWatchMetricsEnabled: true,
  sampledRequestsEnabled: true
})
```
