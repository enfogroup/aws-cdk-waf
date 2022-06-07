import { WebAcl } from '../lib'
import { SCOPE } from '../lib/models'

import { Stack } from 'aws-cdk-lib'

import '@aws-cdk/assert/jest'
import { Match, Template } from 'aws-cdk-lib/assertions'

describe('WebAcl', () => {
  it('should be possible to create a WebAcl with minimal config and enable all rules', () => {
    const stack = new Stack()

    new WebAcl(stack, 'MyWaf', {
      scope: SCOPE.REGIONAL,
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

    const template = Template.fromStack(stack)
    template.hasResourceProperties('AWS::WAFv2::WebACL', Match.objectLike({
      DefaultAction: {
        Allow: {}
      },
      Scope: 'REGIONAL',
      VisibilityConfig: {
        CloudWatchMetricsEnabled: true,
        MetricName: 'my-metric',
        SampledRequestsEnabled: true
      },
      Rules: [
        {},
        {},
        {},
        {},
        {}
      ]
    }))
  })

  describe('enableIpBlockRule', () => {
    it('should create a rule with defaults', () => {
      const stack = new Stack()

      new WebAcl(stack, 'MyWaf', {
        scope: SCOPE.REGIONAL,
        metricName: 'something',
        defaultAction: {
          allow: {}
        }
      })
        .enableIpBlockRule()

      const template = Template.fromStack(stack)
      template.hasResourceProperties('AWS::WAFv2::WebACL', Match.objectLike({
        Rules: [
          {
            Action: {
              Block: {}
            },
            Name: 'ip-block',
            Priority: 10,
            Statement: {
              IPSetReferenceStatement: {
                Arn: {}
              }
            },
            VisibilityConfig: {
              CloudWatchMetricsEnabled: true,
              MetricName: 'ip-block',
              SampledRequestsEnabled: true
            }
          }
        ]
      }))
    })

    it('should be possible to customize', () => {
      const stack = new Stack()

      new WebAcl(stack, 'MyWaf', {
        scope: SCOPE.REGIONAL,
        metricName: 'something',
        defaultAction: {
          allow: {}
        }
      })
        .enableIpBlockRule({
          name: 'my-rule',
          action: {
            allow: {}
          },
          priority: 9,
          metricName: 'my-metric',
          cloudWatchMetricsEnabled: false,
          sampledRequestsEnabled: false
        })

      const template = Template.fromStack(stack)
      template.hasResourceProperties('AWS::WAFv2::WebACL', Match.objectLike({
        Rules: [
          {
            Action: {
              Allow: {}
            },
            Name: 'my-rule',
            Priority: 9,
            Statement: {
              IPSetReferenceStatement: {
                Arn: {}
              }
            },
            VisibilityConfig: {
              CloudWatchMetricsEnabled: false,
              MetricName: 'my-metric',
              SampledRequestsEnabled: false
            }
          }
        ]
      }))
    })

    it('should create an ip set', () => {
      const stack = new Stack()

      new WebAcl(stack, 'MyWaf', {
        scope: SCOPE.REGIONAL,
        metricName: 'something',
        defaultAction: {
          allow: {}
        }
      })
        .enableIpBlockRule()

      expect(stack).toCountResources('AWS::WAFv2::IPSet', 1)
    })

    it('should throw if the rule is enabled twice', () => {
      const stack = new Stack()

      expect(() => {
        new WebAcl(stack, 'MyWaf', {
          scope: SCOPE.REGIONAL,
          metricName: 'something',
          defaultAction: {
            allow: {}
          }
        })
          .enableIpBlockRule()
          .enableIpBlockRule()
      }).toThrow('ip-block has already been enabled')
    })
  })

  describe('enableRateLimitRule', () => {
    it('should create a rule with defaults', () => {
      const stack = new Stack()

      new WebAcl(stack, 'MyWaf', {
        scope: SCOPE.REGIONAL,
        metricName: 'something',
        defaultAction: {
          allow: {}
        }
      })
        .enableRateLimitRule()

      const template = Template.fromStack(stack)
      template.hasResourceProperties('AWS::WAFv2::WebACL', Match.objectLike({
        Rules: [
          {
            Action: {
              Block: {
                CustomResponse: {
                  ResponseCode: 429
                }
              }
            },
            Name: 'rate-limit',
            Priority: 20,
            Statement: {
              RateBasedStatement: {
                AggregateKeyType: 'IP',
                Limit: 1000
              }
            },
            VisibilityConfig: {
              CloudWatchMetricsEnabled: true,
              MetricName: 'rate-limit',
              SampledRequestsEnabled: true
            }
          }
        ]
      }))
    })

    it('should be possible to customize', () => {
      const stack = new Stack()

      new WebAcl(stack, 'MyWaf', {
        scope: SCOPE.REGIONAL,
        metricName: 'something',
        defaultAction: {
          allow: {}
        }
      })
        .enableRateLimitRule({
          name: 'my-rule',
          action: {
            allow: {}
          },
          priority: 9,
          metricName: 'my-metric',
          cloudWatchMetricsEnabled: false,
          sampledRequestsEnabled: false,
          rateLimit: 10
        })

      const template = Template.fromStack(stack)
      template.hasResourceProperties('AWS::WAFv2::WebACL', Match.objectLike({
        Rules: [
          {
            Action: {
              Allow: {}
            },
            Name: 'my-rule',
            Priority: 9,
            Statement: {
              RateBasedStatement: {
                AggregateKeyType: 'IP',
                Limit: 10
              }
            },
            VisibilityConfig: {
              CloudWatchMetricsEnabled: false,
              MetricName: 'my-metric',
              SampledRequestsEnabled: false
            }
          }
        ]
      }))
    })

    it('should throw if the rule is enabled twice', () => {
      const stack = new Stack()

      expect(() => {
        new WebAcl(stack, 'MyWaf', {
          scope: SCOPE.REGIONAL,
          metricName: 'something',
          defaultAction: {
            allow: {}
          }
        })
          .enableRateLimitRule()
          .enableRateLimitRule()
      }).toThrow('rate-limit has already been enabled')
    })
  })

  describe('enableIpReputationRule', () => {
    it('should create a rule with defaults', () => {
      const stack = new Stack()

      new WebAcl(stack, 'MyWaf', {
        scope: SCOPE.REGIONAL,
        metricName: 'something',
        defaultAction: {
          allow: {}
        }
      })
        .enableIpReputationRule()

      const template = Template.fromStack(stack)
      template.hasResourceProperties('AWS::WAFv2::WebACL', Match.objectLike({
        Rules: [
          {
            OverrideAction: {
              None: {}
            },
            Name: 'ip-reputation',
            Priority: 30,
            Statement: {
              ManagedRuleGroupStatement: {
                Name: 'AWSManagedRulesAmazonIpReputationList',
                VendorName: 'AWS'
              }
            },
            VisibilityConfig: {
              CloudWatchMetricsEnabled: true,
              MetricName: 'ip-reputation',
              SampledRequestsEnabled: true
            }
          }
        ]
      }))
    })

    it('should be possible to customize', () => {
      const stack = new Stack()

      new WebAcl(stack, 'MyWaf', {
        scope: SCOPE.REGIONAL,
        metricName: 'something',
        defaultAction: {
          allow: {}
        }
      })
        .enableIpReputationRule({
          name: 'my-rule',
          priority: 9,
          metricName: 'my-metric',
          cloudWatchMetricsEnabled: false,
          sampledRequestsEnabled: false
        })

      const template = Template.fromStack(stack)
      template.hasResourceProperties('AWS::WAFv2::WebACL', Match.objectLike({
        Rules: [
          {
            OverrideAction: {
              None: {}
            },
            Name: 'my-rule',
            Priority: 9,
            Statement: {
              ManagedRuleGroupStatement: {
                Name: 'AWSManagedRulesAmazonIpReputationList',
                VendorName: 'AWS'
              }
            },
            VisibilityConfig: {
              CloudWatchMetricsEnabled: false,
              MetricName: 'my-metric',
              SampledRequestsEnabled: false
            }
          }
        ]
      }))
    })

    it('should throw if the rule is enabled twice', () => {
      const stack = new Stack()

      expect(() => {
        new WebAcl(stack, 'MyWaf', {
          scope: SCOPE.REGIONAL,
          metricName: 'something',
          defaultAction: {
            allow: {}
          }
        })
          .enableIpReputationRule()
          .enableIpReputationRule()
      }).toThrow('ip-reputation has already been enabled')
    })
  })

  describe('enableManagedCoreRule', () => {
    it('should create a rule with defaults', () => {
      const stack = new Stack()

      new WebAcl(stack, 'MyWaf', {
        scope: SCOPE.REGIONAL,
        metricName: 'something',
        defaultAction: {
          allow: {}
        }
      })
        .enableManagedCoreRule()

      const template = Template.fromStack(stack)
      template.hasResourceProperties('AWS::WAFv2::WebACL', Match.objectLike({
        Rules: [
          {
            OverrideAction: {
              None: {}
            },
            Name: 'managed-core',
            Priority: 40,
            Statement: {
              ManagedRuleGroupStatement: {
                Name: 'AWSManagedRulesCommonRuleSet',
                VendorName: 'AWS'
              }
            },
            VisibilityConfig: {
              CloudWatchMetricsEnabled: true,
              MetricName: 'managed-core',
              SampledRequestsEnabled: true
            }
          }
        ]
      }))
    })

    it('should be possible to customize', () => {
      const stack = new Stack()

      new WebAcl(stack, 'MyWaf', {
        scope: SCOPE.REGIONAL,
        metricName: 'something',
        defaultAction: {
          allow: {}
        }
      })
        .enableManagedCoreRule({
          name: 'my-rule',
          priority: 9,
          metricName: 'my-metric',
          cloudWatchMetricsEnabled: false,
          sampledRequestsEnabled: false
        })

      const template = Template.fromStack(stack)
      template.hasResourceProperties('AWS::WAFv2::WebACL', Match.objectLike({
        Rules: [
          {
            OverrideAction: {
              None: {}
            },
            Name: 'my-rule',
            Priority: 9,
            Statement: {
              ManagedRuleGroupStatement: {
                Name: 'AWSManagedRulesCommonRuleSet',
                VendorName: 'AWS'
              }
            },
            VisibilityConfig: {
              CloudWatchMetricsEnabled: false,
              MetricName: 'my-metric',
              SampledRequestsEnabled: false
            }
          }
        ]
      }))
    })

    it('should throw if the rule is enabled twice', () => {
      const stack = new Stack()

      expect(() => {
        new WebAcl(stack, 'MyWaf', {
          scope: SCOPE.REGIONAL,
          metricName: 'something',
          defaultAction: {
            allow: {}
          }
        })
          .enableManagedCoreRule()
          .enableManagedCoreRule()
      }).toThrow('managed-core has already been enabled')
    })
  })

  describe('enableBadInputsRule', () => {
    it('should create a rule with defaults', () => {
      const stack = new Stack()

      new WebAcl(stack, 'MyWaf', {
        scope: SCOPE.REGIONAL,
        metricName: 'something',
        defaultAction: {
          allow: {}
        }
      })
        .enableBadInputsRule()

      const template = Template.fromStack(stack)
      template.hasResourceProperties('AWS::WAFv2::WebACL', Match.objectLike({
        Rules: [
          {
            OverrideAction: {
              None: {}
            },
            Name: 'bad-inputs',
            Priority: 50,
            Statement: {
              ManagedRuleGroupStatement: {
                Name: 'AWSManagedRulesKnownBadInputsRuleSet',
                VendorName: 'AWS'
              }
            },
            VisibilityConfig: {
              CloudWatchMetricsEnabled: true,
              MetricName: 'bad-inputs',
              SampledRequestsEnabled: true
            }
          }
        ]
      }))
    })

    it('should be possible to customize', () => {
      const stack = new Stack()

      new WebAcl(stack, 'MyWaf', {
        scope: SCOPE.REGIONAL,
        metricName: 'something',
        defaultAction: {
          allow: {}
        }
      })
        .enableBadInputsRule({
          name: 'my-rule',
          priority: 9,
          metricName: 'my-metric',
          cloudWatchMetricsEnabled: false,
          sampledRequestsEnabled: false
        })

      const template = Template.fromStack(stack)
      template.hasResourceProperties('AWS::WAFv2::WebACL', Match.objectLike({
        Rules: [
          {
            OverrideAction: {
              None: {}
            },
            Name: 'my-rule',
            Priority: 9,
            Statement: {
              ManagedRuleGroupStatement: {
                Name: 'AWSManagedRulesKnownBadInputsRuleSet',
                VendorName: 'AWS'
              }
            },
            VisibilityConfig: {
              CloudWatchMetricsEnabled: false,
              MetricName: 'my-metric',
              SampledRequestsEnabled: false
            }
          }
        ]
      }))
    })

    it('should throw if the rule is enabled twice', () => {
      const stack = new Stack()

      expect(() => {
        new WebAcl(stack, 'MyWaf', {
          scope: SCOPE.REGIONAL,
          metricName: 'something',
          defaultAction: {
            allow: {}
          }
        })
          .enableBadInputsRule()
          .enableBadInputsRule()
      }).toThrow('bad-inputs has already been enabled')
    })
  })
})
