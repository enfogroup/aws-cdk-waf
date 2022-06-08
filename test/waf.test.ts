import { WebAcl } from '../lib/waf'
import { IpAddressVersion, Scope } from '../lib/models'

import { Stack } from 'aws-cdk-lib'

import '@aws-cdk/assert/jest'
import { Match, Template } from 'aws-cdk-lib/assertions'
import { CfnIPSet } from 'aws-cdk-lib/aws-wafv2'

describe('WebAcl', () => {
  it('should be possible to create a WebAcl with minimal config and enable all rules', () => {
    const stack = new Stack()

    new WebAcl(stack, 'MyWaf', {
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

  it('should be possible to add a custom rule and enable a rule', () => {
    const stack = new Stack()

    new WebAcl(stack, 'MyWaf', {
      scope: Scope.REGIONAL,
      metricName: 'my-metric',
      defaultAction: {
        allow: {}
      },
      rules: [
        {
          name: 'my-rule',
          priority: 0,
          statement: {

          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'something',
            sampledRequestsEnabled: true
          }
        }
      ]
    })
      .enableIpBlockRule()

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
        {
          Name: 'my-rule',
          Priority: 0,
          Statement: {},
          VisibilityConfig: {
            CloudWatchMetricsEnabled: true,
            MetricName: 'something',
            SampledRequestsEnabled: true
          }
        },
        {}
      ]
    }))
  })

  describe('enableIpBlockRule', () => {
    it('should create a rule with defaults', () => {
      const stack = new Stack()

      new WebAcl(stack, 'MyWaf', {
        scope: Scope.REGIONAL,
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
        scope: Scope.REGIONAL,
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
        scope: Scope.REGIONAL,
        metricName: 'something',
        defaultAction: {
          allow: {}
        }
      })
        .enableIpBlockRule()

      expect(stack).toCountResources('AWS::WAFv2::IPSet', 1)
    })

    it('should be possible to supply your own ip set', () => {
      const stack = new Stack()

      const ipSet = new CfnIPSet(stack, 'MySet', {
        scope: 'REGIONAL',
        name: 'my-set',
        addresses: [],
        ipAddressVersion: 'IPV4'
      })

      new WebAcl(stack, 'MyWaf', {
        scope: Scope.REGIONAL,
        metricName: 'something',
        defaultAction: {
          allow: {}
        }
      })
        .enableIpBlockRule({
          ipSet
        })

      expect(stack).toCountResources('AWS::WAFv2::IPSet', 1)
      expect(stack).toHaveResource('AWS::WAFv2::IPSet', {
        Name: 'my-set'
      })
    })

    it('should be possible to customize the ip set', () => {
      const stack = new Stack()

      new WebAcl(stack, 'MyWaf', {
        scope: Scope.REGIONAL,
        metricName: 'something',
        defaultAction: {
          allow: {}
        }
      })
        .enableIpBlockRule({
          ipSetName: 'my-set',
          ipSetDescription: 'desc',
          addresses: ['127.0.0.1'],
          ipAddressVersion: IpAddressVersion.IPV6,
          ipSetTags: [
            {
              key: 'key!',
              value: 'value!'
            }
          ]
        })

      expect(stack).toCountResources('AWS::WAFv2::IPSet', 1)
      expect(stack).toHaveResource('AWS::WAFv2::IPSet', {
        Addresses: [
          '127.0.0.1'
        ],
        IPAddressVersion: 'IPV6',
        Scope: 'REGIONAL',
        Description: 'desc',
        Name: 'my-set',
        Tags: [
          {
            Key: 'key!',
            Value: 'value!'
          }
        ]
      })
    })

    it('should use the supplied set rather than creating one', () => {
      const stack = new Stack()

      const ipSet = new CfnIPSet(stack, 'MySet', {
        scope: 'REGIONAL',
        name: 'my-supplied-set',
        addresses: [],
        ipAddressVersion: 'IPV4'
      })

      new WebAcl(stack, 'MyWaf', {
        scope: Scope.REGIONAL,
        metricName: 'something',
        defaultAction: {
          allow: {}
        }
      })
        .enableIpBlockRule({
          ipSet,
          ipSetName: 'my-created-set'
        })

      expect(stack).toCountResources('AWS::WAFv2::IPSet', 1)
      expect(stack).toHaveResource('AWS::WAFv2::IPSet', {
        Name: 'my-supplied-set'
      })
    })

    it('should throw if the rule is enabled twice', () => {
      const stack = new Stack()

      expect(() => {
        new WebAcl(stack, 'MyWaf', {
          scope: Scope.REGIONAL,
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
        scope: Scope.REGIONAL,
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
        scope: Scope.REGIONAL,
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
          scope: Scope.REGIONAL,
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
        scope: Scope.REGIONAL,
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
        scope: Scope.REGIONAL,
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
          scope: Scope.REGIONAL,
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
        scope: Scope.REGIONAL,
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
        scope: Scope.REGIONAL,
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
          scope: Scope.REGIONAL,
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
        scope: Scope.REGIONAL,
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
        scope: Scope.REGIONAL,
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
          scope: Scope.REGIONAL,
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
