import { Construct } from 'constructs'
import { CfnIPSet, CfnWebACL } from 'aws-cdk-lib/aws-wafv2'
import { EnableBadInputsRule, EnableIpBlockProps, EnableIpReputationRuleProps, EnableManagedCoreRuleProps, EnableRateLimitRuleProps, IpAddressVersion, Rule, WebAclProps } from './models'

enum RULE_ID {
  IP_BLOCK = 'ip-block',
  RATE_LIMIT = 'rate-limit',
  IP_REPUTATION = 'ip-reputation',
  MANAGED_CORE = 'managed-core',
  BAD_INPUTS = 'bad-inputs'
}

/**
 * WebAcl with methods for enabling opinionated rules
 */
export class WebAcl extends Construct {
  /**
   * The internal WebAcl
   */
  public webAcl: CfnWebACL
  /**
   * IP Set used if the IP Block rule is enabled
   */
  public ipSet: CfnIPSet | undefined

  private props: WebAclProps
  /**
   * Set used to keep track of whether or not a rule has already been enabled
   */
  private ruleSet: Set<RULE_ID>

  /**
   * Creates a new WebAcl
   * @param scope
   * A CDK Construct
   * @param id
   * Id for the Construct
   * @param props
   * See interface definition
   */
  constructor (scope: Construct, id: string, props: WebAclProps) {
    super(scope, id)
    this.props = props
    const { cloudWatchMetricsEnabled = true, sampledRequestsEnabled = true, metricName, ...rest } = props

    this.ruleSet = new Set<RULE_ID>()
    this.webAcl = new CfnWebACL(this, 'WebAcl', {
      ...rest,
      visibilityConfig: {
        cloudWatchMetricsEnabled,
        sampledRequestsEnabled,
        metricName
      }
    })
  }

  private pushRule (rule: Rule): void {
    if (!this.webAcl.rules) {
      this.webAcl.rules = []
    }

    if (!('length' in this.webAcl.rules)) {
      // this could backfire the user supplies an IResolvable which results in an array. Not sure how to protect against it though
      this.webAcl.rules = [this.webAcl.rules]
    }
    this.webAcl.rules.push(rule)
  }

  private setRuleAsEnabled (ruleId: RULE_ID): void {
    this.ruleSet.add((ruleId))
  }

  private checkIfRuleIsEnabled (ruleId: RULE_ID): void {
    if (this.ruleSet.has(ruleId)) {
      throw new Error(`${ruleId} has already been enabled`)
    }
  }

  /**
   * Sets up an IP Set and a rule to block IP addresses found in it
   * Can be used in case IP addresses need to be blocked
   * Action can be overwritten to enable custom responses or inverse the handling
   * @param props
   * See interface definition
   */
  public enableIpBlockRule (props: EnableIpBlockProps = {}): WebAcl {
    const id = RULE_ID.IP_BLOCK
    this.checkIfRuleIsEnabled(id)

    const {
      metricName = id,
      name = id,
      cloudWatchMetricsEnabled = true,
      sampledRequestsEnabled = true,
      priority = 10,
      ipSetName,
      ipSetDescription,
      addresses = [],
      ipAddressVersion = IpAddressVersion.IPV4,
      ipSetTags,
      ipSet,
      ...rest
    } = props

    this.ipSet = ipSet ?? new CfnIPSet(this, 'IpSet', {
      name: ipSetName,
      description: ipSetDescription,
      scope: this.props.scope,
      addresses,
      ipAddressVersion,
      tags: ipSetTags
    })
    const rule: Rule = {
      name,
      priority,
      action: { block: {} },
      statement: {
        ipSetReferenceStatement: {
          arn: this.ipSet.attrArn
        }
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled,
        metricName,
        sampledRequestsEnabled
      },
      ...rest
    }

    this.pushRule(rule)
    this.setRuleAsEnabled(id)
    return this
  }

  /**
   * Sets up a rate limiting rule
   * @param props
   * See interface definition
   */
  public enableRateLimitRule (props: EnableRateLimitRuleProps = {}): WebAcl {
    const id = RULE_ID.RATE_LIMIT
    this.checkIfRuleIsEnabled(id)

    const {
      metricName = id,
      name = id,
      cloudWatchMetricsEnabled = true,
      sampledRequestsEnabled = true,
      priority = 20,
      action = { block: { customResponse: { responseCode: 429 } } },
      rateLimit = 1000,
      ...rest
    } = props

    const rule: Rule = {
      name,
      priority,
      action,
      statement: {
        rateBasedStatement: {
          aggregateKeyType: 'IP',
          limit: rateLimit
        }
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled,
        metricName,
        sampledRequestsEnabled
      },
      ...rest
    }

    this.pushRule(rule)
    this.setRuleAsEnabled(id)
    return this
  }

  /**
   * Sets up a rule enabling AWSManagedRulesAmazonIpReputationList
   * @param props
   * See interface definition
   */
  public enableIpReputationRule (props: EnableIpReputationRuleProps = {}): WebAcl {
    const id = RULE_ID.IP_REPUTATION
    this.checkIfRuleIsEnabled(id)

    const {
      metricName = id,
      name = id,
      cloudWatchMetricsEnabled = true,
      sampledRequestsEnabled = true,
      priority = 30,
      excludedRules,
      managedRuleGroupConfigs,
      scopeDownStatement,
      ...rest
    } = props

    const rule: Rule = {
      name,
      priority,
      overrideAction: { none: {} },
      statement: {
        managedRuleGroupStatement: {
          vendorName: 'AWS',
          name: 'AWSManagedRulesAmazonIpReputationList',
          excludedRules,
          managedRuleGroupConfigs,
          scopeDownStatement
        }
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled,
        metricName,
        sampledRequestsEnabled
      },
      ...rest
    }

    this.pushRule(rule)
    this.setRuleAsEnabled(id)
    return this
  }

  /**
   * Sets up a rule enabling AWSManagedRulesCommonRuleSet
   * @param props
   * See interface definition
   */
  public enableManagedCoreRule (props: EnableManagedCoreRuleProps = {}): WebAcl {
    const id = RULE_ID.MANAGED_CORE
    this.checkIfRuleIsEnabled(id)

    const {
      metricName = id,
      name = id,
      cloudWatchMetricsEnabled = true,
      sampledRequestsEnabled = true,
      priority = 40,
      excludedRules,
      managedRuleGroupConfigs,
      scopeDownStatement,
      ...rest
    } = props

    const rule: Rule = {
      name,
      priority,
      overrideAction: { none: {} },
      statement: {
        managedRuleGroupStatement: {
          vendorName: 'AWS',
          name: 'AWSManagedRulesCommonRuleSet',
          excludedRules,
          managedRuleGroupConfigs,
          scopeDownStatement
        }
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled,
        metricName,
        sampledRequestsEnabled
      },
      ...rest
    }

    this.pushRule(rule)
    this.setRuleAsEnabled(id)
    return this
  }

  /**
   * Sets up a rule enabling AWSManagedRulesKnownBadInputsRuleSet
   * @param props
   * See interface definition
   */
  public enableBadInputsRule (props: EnableBadInputsRule = {}): WebAcl {
    const id = RULE_ID.BAD_INPUTS
    this.checkIfRuleIsEnabled(id)

    const {
      metricName = id,
      name = id,
      cloudWatchMetricsEnabled = true,
      sampledRequestsEnabled = true,
      priority = 50,
      excludedRules,
      managedRuleGroupConfigs,
      scopeDownStatement,
      ...rest
    } = props

    const rule: Rule = {
      name,
      priority,
      overrideAction: { none: {} },
      statement: {
        managedRuleGroupStatement: {
          vendorName: 'AWS',
          name: 'AWSManagedRulesKnownBadInputsRuleSet',
          excludedRules,
          managedRuleGroupConfigs,
          scopeDownStatement
        }
      },
      visibilityConfig: {
        cloudWatchMetricsEnabled,
        metricName,
        sampledRequestsEnabled
      },
      ...rest
    }

    this.pushRule(rule)
    this.setRuleAsEnabled(id)
    return this
  }
}
