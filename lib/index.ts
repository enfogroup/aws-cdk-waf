import { Construct } from 'constructs'
import { CfnIPSet, CfnWebACL } from 'aws-cdk-lib/aws-wafv2'
import { EnableIpBlockProps, EnableRateLimitRule, Rule, WebAclProps } from './models'

enum RULE_ID {
  IP_BLOCK = 'ip-block',
  RATE_LIMIT = 'rate-limit'
}

/**
 * WebAcl with methods for enabling opinionated rules
 */
export class WebAcl extends Construct {
  public webAcl: CfnWebACL
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
   * Sets up an IP and a rule
   * Can be used in case IP addresses need to be blocked
   * Action can be overwritten to enable custom responses or inverse the handling
   * @param props
   * See interface definition
   */
  public enableIpBlockRule (props: EnableIpBlockProps): void {
    const id = RULE_ID.IP_BLOCK
    this.checkIfRuleIsEnabled(id)

    const {
      metricName = id,
      name = id,
      cloudWatchMetricsEnabled = true,
      sampledRequestsEnabled = true,
      priority = 10,
      ...rest
    } = props

    this.ipSet = new CfnIPSet(this, 'IpSet', {
      scope: this.props.scope,
      addresses: [],
      ipAddressVersion: 'IPV4'
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
  }

  public enableRateLimitRule (props: EnableRateLimitRule): void {
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

    this.ipSet = new CfnIPSet(this, 'IpSet', {
      scope: this.props.scope,
      addresses: [],
      ipAddressVersion: 'IPV4'
    })
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
  }

  public enableIpReputationRule (): void {

  }

  public enableManagedCoreRule (): void {

  }

  public enableBadInputsRule (): void {

  }
}
