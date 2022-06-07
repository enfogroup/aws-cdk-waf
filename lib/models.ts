import { IResolvable } from 'aws-cdk-lib'
import { CfnWebACL, CfnWebACLProps } from 'aws-cdk-lib/aws-wafv2'

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

/**
 * Properties when enabling the IP Block rule
 */
export interface EnableIpBlockProps extends VisibilityConfig, Omit<Rule, 'name' | 'statement' | 'priority' | 'visibilityConfig'> {
  /**
   * Metric name for default action
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-visibilityconfig.html#cfn-wafv2-webacl-visibilityconfig-metricname
   * @default 'ip-block'
   */
  metricName?: CfnWebACL.VisibilityConfigProperty['metricName']
  /**
   * The name of the rule. You can't change the name of a `Rule` after you create it.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-name
   * @default 'ip-block'
   */
  name?: Rule['name']
  /**
   * If you define more than one `Rule` in a `WebACL` , AWS WAF evaluates each request against the `Rules` in order based on the value of `Priority` . AWS WAF processes rules with lower priority first. The priorities don't need to be consecutive, but they must all be different.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-priority
   * @default 10
   */
  priority?: Rule['priority']
}

/**
 * Properties when enabling the Rate Limit rule
 */
export interface EnableRateLimitRule extends VisibilityConfig, Omit<Rule, 'name' | 'statement' | 'priority' | 'action' | 'visibilityConfig'> {
  /**
   * Metric name for default action
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-visibilityconfig.html#cfn-wafv2-webacl-visibilityconfig-metricname
   * @default 'rate-limit'
   */
  metricName?: CfnWebACL.VisibilityConfigProperty['metricName']
  /**
   * The name of the rule. You can't change the name of a `Rule` after you create it.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-name
   * @default 'rate-limit'
   */
  name?: Rule['name']
  /**
   * If you define more than one `Rule` in a `WebACL` , AWS WAF evaluates each request against the `Rules` in order based on the value of `Priority` . AWS WAF processes rules with lower priority first. The priorities don't need to be consecutive, but they must all be different.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-priority
   * @default 20
   */
  priority?: Rule['priority']

  /**
   * The action that AWS WAF should take on a web request when it matches the rule's statement. Settings at the web ACL level can override the rule action setting.
   *
   * This is used only for rules whose statements don't reference a rule group. Rule statements that reference a rule group are `RuleGroupReferenceStatement` and `ManagedRuleGroupStatement` .
   *
   * You must set either this `Action` setting or the rule's `OverrideAction` , but not both:
   *
   * - If the rule statement doesn't reference a rule group, you must set this rule action setting and you must not set the rule's override action setting.
   * - If the rule statement references a rule group, you must not set this action setting, because the actions are already set on the rules inside the rule group. You must set the rule's override action setting to indicate specifically whether to override the actions that are set on the rules in the rule group.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-action
   * @default { block: { customResponse: { responseCode: 429 } } }
   */
  action?: Rule['action']
  /**
   * The rate limit for the rule
   *
   * @link https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-rate-based.html
   * @default 1000
   */
  rateLimit?: number
}
