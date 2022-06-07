import { Construct } from 'constructs'
import { CfnIPSet, CfnWebACL, CfnWebACLProps } from 'aws-cdk-lib/aws-wafv2'
import { IResolvable } from 'aws-cdk-lib'
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface VisibilityConfig {
  /**
   * A boolean indicating whether the associated resource sends metrics to Amazon CloudWatch. For the list of available metrics, see [AWS WAF Metrics](https://docs.aws.amazon.com/waf/latest/developerguide/monitoring-cloudwatch.html#waf-metrics) .
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-visibilityconfig.html#cfn-wafv2-webacl-visibilityconfig-cloudwatchmetricsenabled
   *
   * @default true
   */
  readonly cloudWatchMetricsEnabled?: boolean | IResolvable;
  /**
   * A boolean indicating whether AWS WAF should store a sampling of the web requests that match the rules. You can view the sampled requests through the AWS WAF console.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-visibilityconfig.html#cfn-wafv2-webacl-visibilityconfig-sampledrequestsenabled
   *
   * @default true
   */
  readonly sampledRequestsEnabled?: boolean | IResolvable;
}

/**
 * Available resource associations
 */
export enum SCOPE {
  /**
   * Used to allow associations with CloudFront Distributions
   */
  CLOUDFRONT = 'CLOUDFRONT',
  /**
   * Used to associate the WAF with applications other than CloudFront. A regional application can be an Application Load Balancer (ALB), an Amazon API Gateway REST API, or an AWS AppSync GraphQL API.
   */
  REGIONAL = 'REGIONAL'
}

/**
 * Properties when creating a new WebAcl
 */
export interface WebAclProps extends VisibilityConfig, Omit<CfnWebACLProps, 'scope' | 'visibilityConfig'> {
  /**
   * Defines which type of resource this WAF should be associated with
   */
  scope: SCOPE
  /**
   * Metric name for default action
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-visibilityconfig.html#cfn-wafv2-webacl-visibilityconfig-metricname
   */
  readonly metricName: string;
}

/**
 * A single rule, which you can use in a `WebACL` or `RuleGroup` to identify web requests that you want to allow, block, or count. Each rule includes one top-level `Statement` that AWS WAF uses to identify matching web requests, and parameters that govern how AWS WAF handles them.
 *
 * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html
 */
export type Rule = CfnWebACL.RuleProperty

enum RULE_ID {
  IP_BLOCK = 'ip-block'
}

export interface EnableIpBlockProps extends VisibilityConfig, Omit<Rule, 'name' | 'statement' | 'priority' | 'visibilityConfig'> {
  /**
   * Metric name for default action
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-visibilityconfig.html#cfn-wafv2-webacl-visibilityconfig-metricname
   * @default 'ip-block'
   */
  metricName?: string
  /**
   * The name of the rule. You can't change the name of a `Rule` after you create it.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-name
   * @default 'ip-block'
   */
  name?: string
  /**
   * If you define more than one `Rule` in a `WebACL` , AWS WAF evaluates each request against the `Rules` in order based on the value of `Priority` . AWS WAF processes rules with lower priority first. The priorities don't need to be consecutive, but they must all be different.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-priority
   * @default 10
   */
  priority?: number
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
  public enableIpBlock (props: EnableIpBlockProps): void {
    const id = RULE_ID.IP_BLOCK

    const { metricName = id, name = id, cloudWatchMetricsEnabled = true, sampledRequestsEnabled = true, priority = 10, ...rest } = props
    this.checkIfRuleIsEnabled(id)

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
}
