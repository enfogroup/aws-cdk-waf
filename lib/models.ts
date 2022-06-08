import { CfnTag, IResolvable } from 'aws-cdk-lib'
import { CfnWebACL } from 'aws-cdk-lib/aws-wafv2'

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
export enum Scope {
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
export interface WebAclProps extends VisibilityConfig {
  /**
   * The action to perform if none of the `Rules` contained in the `WebACL` match.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-webacl.html#cfn-wafv2-webacl-defaultaction
   */
  readonly defaultAction: CfnWebACL.DefaultActionProperty | IResolvable;
  /**
   * Specifies how AWS WAF should handle `CAPTCHA` evaluations for rules that don't have their own `CaptchaConfig` settings. If you don't specify this, AWS WAF uses its default settings for `CaptchaConfig` .
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-webacl.html#cfn-wafv2-webacl-captchaconfig
   */
  readonly captchaConfig?: CfnWebACL.CaptchaConfigProperty | IResolvable;
  /**
   * A map of custom response keys and content bodies. When you create a rule with a block action, you can send a custom response to the web request. You define these for the web ACL, and then use them in the rules and default actions that you define in the web ACL.
   *
   * For information about customizing web requests and responses, see [Customizing web requests and responses in AWS WAF](https://docs.aws.amazon.com/waf/latest/developerguide/waf-custom-request-response.html) in the [AWS WAF Developer Guide](https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html) .
   *
   * For information about the limits on count and size for custom request and response settings, see [AWS WAF quotas](https://docs.aws.amazon.com/waf/latest/developerguide/limits.html) in the [AWS WAF Developer Guide](https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html) .
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-webacl.html#cfn-wafv2-webacl-customresponsebodies
   */
  readonly customResponseBodies?: {
      [key: string]: (CfnWebACL.CustomResponseBodyProperty | IResolvable);
  } | IResolvable;
  /**
   * A description of the web ACL that helps with identification.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-webacl.html#cfn-wafv2-webacl-description
   */
  readonly description?: string;
  /**
   * The name of the web ACL. You cannot change the name of a web ACL after you create it.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-webacl.html#cfn-wafv2-webacl-name
   */
  readonly name?: string;
  /**
   * The rule statements used to identify the web requests that you want to allow, block, or count. Each rule includes one top-level statement that AWS WAF uses to identify matching web requests, and parameters that govern how AWS WAF handles them.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-webacl.html#cfn-wafv2-webacl-rules
   */
  readonly rules?: Array<CfnWebACL.RuleProperty | IResolvable> | IResolvable;
  /**
   * Key:value pairs associated with an AWS resource. The key:value pair can be anything you define. Typically, the tag key represents a category (such as "environment") and the tag value represents a specific value within that category (such as "test," "development," or "production"). You can add up to 50 tags to each AWS resource.
   *
   * > To modify tags on existing resources, use the AWS WAF APIs or command line interface. With AWS CloudFormation , you can only add tags to AWS WAF resources during resource creation.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-wafv2-webacl.html#cfn-wafv2-webacl-tags
   */
  readonly tags?: CfnTag[];
  /**
   * Defines which type of resource this WAF should be associated with
   */
  readonly scope: Scope
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
 * Base props for all rules props
 */
export interface BaseRuleProps extends VisibilityConfig {
  /**
   * Specifies how AWS WAF should handle `CAPTCHA` evaluations. If you don't specify this, AWS WAF uses the `CAPTCHA` configuration that's defined for the web ACL.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-captchaconfig
   */
  readonly captchaConfig?: CfnWebACL.CaptchaConfigProperty | IResolvable;
  /**
   * The override action to apply to the rules in a rule group, instead of the individual rule action settings. This is used only for rules whose statements reference a rule group. Rule statements that reference a rule group are `RuleGroupReferenceStatement` and `ManagedRuleGroupStatement` .
   *
   * Set the override action to none to leave the rule group rule actions in effect. Set it to count to only count matches, regardless of the rule action settings.
   *
   * You must set either this `OverrideAction` setting or the `Action` setting, but not both:
   *
   * - If the rule statement references a rule group, you must set this override action setting and you must not set the rule's action setting.
   * - If the rule statement doesn't reference a rule group, you must set the rule action setting and you must not set the rule's override action setting.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-overrideaction
   */
  readonly overrideAction?: CfnWebACL.OverrideActionProperty | IResolvable;
  /**
   * Labels to apply to web requests that match the rule match statement. AWS WAF applies fully qualified labels to matching web requests. A fully qualified label is the concatenation of a label namespace and a rule label. The rule's rule group or web ACL defines the label namespace.
   *
   * Rules that run after this rule in the web ACL can match against these labels using a `LabelMatchStatement` .
   *
   * For each label, provide a case-sensitive string containing optional namespaces and a label name, according to the following guidelines:
   *
   * - Separate each component of the label with a colon.
   * - Each namespace or name can have up to 128 characters.
   * - You can specify up to 5 namespaces in a label.
   * - Don't use the following reserved words in your label specification: `aws` , `waf` , `managed` , `rulegroup` , `webacl` , `regexpatternset` , or `ipset` .
   *
   * For example, `myLabelName` or `nameSpace1:nameSpace2:myLabelName` .
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-rulelabels
   */
  readonly ruleLabels?: Array<CfnWebACL.LabelProperty | IResolvable> | IResolvable;
}

/**
 * Base rule props with action included
 */
export interface BaseRuleWithActionProps extends BaseRuleProps {

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
   */
  readonly action?: CfnWebACL.RuleActionProperty | IResolvable;
}

/**
 * Properties when enabling the IP Block rule
 */
export interface EnableIpBlockProps extends BaseRuleWithActionProps {
  /**
   * Metric name for default action
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-visibilityconfig.html#cfn-wafv2-webacl-visibilityconfig-metricname
   * @default 'ip-block'
   */
  readonly metricName?: CfnWebACL.VisibilityConfigProperty['metricName']
  /**
   * The name of the rule. You can't change the name of a `Rule` after you create it.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-name
   * @default 'ip-block'
   */
  readonly name?: Rule['name']
  /**
   * If you define more than one `Rule` in a `WebACL` , AWS WAF evaluates each request against the `Rules` in order based on the value of `Priority` . AWS WAF processes rules with lower priority first. The priorities don't need to be consecutive, but they must all be different.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-priority
   * @default 10
   */
  readonly priority?: Rule['priority']
}

/**
 * Properties when enabling the Rate Limit rule
 */
export interface EnableRateLimitRuleProps extends BaseRuleProps {
  /**
   * Metric name for default action
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-visibilityconfig.html#cfn-wafv2-webacl-visibilityconfig-metricname
   * @default 'rate-limit'
   */
  readonly metricName?: CfnWebACL.VisibilityConfigProperty['metricName']
  /**
   * The name of the rule. You can't change the name of a `Rule` after you create it.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-name
   * @default 'rate-limit'
   */
  readonly name?: Rule['name']
  /**
   * If you define more than one `Rule` in a `WebACL` , AWS WAF evaluates each request against the `Rules` in order based on the value of `Priority` . AWS WAF processes rules with lower priority first. The priorities don't need to be consecutive, but they must all be different.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-priority
   * @default 20
   */
  readonly priority?: Rule['priority']

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
  readonly action?: Rule['action']
  /**
   * The rate limit for the rule
   *
   * @link https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-rate-based.html
   * @default 1000
   */
  readonly rateLimit?: number
}

/**
 * Properties when enabling the IP Reputation rule
 */
export interface EnableIpReputationRuleProps extends BaseRuleProps {
  /**
   * Metric name for default action
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-visibilityconfig.html#cfn-wafv2-webacl-visibilityconfig-metricname
   * @default 'ip-reputation'
   */
  readonly metricName?: CfnWebACL.VisibilityConfigProperty['metricName']
  /**
   * The name of the rule. You can't change the name of a `Rule` after you create it.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-name
   * @default 'ip-reputation'
   */
  readonly name?: Rule['name']
  /**
   * If you define more than one `Rule` in a `WebACL` , AWS WAF evaluates each request against the `Rules` in order based on the value of `Priority` . AWS WAF processes rules with lower priority first. The priorities don't need to be consecutive, but they must all be different.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-priority
   * @default 30
   */
  readonly priority?: Rule['priority']
}

/**
 * Properties when enabling the Managed Core rule
 */
export interface EnableManagedCoreRuleProps extends BaseRuleProps {
  /**
   * Metric name for default action
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-visibilityconfig.html#cfn-wafv2-webacl-visibilityconfig-metricname
   * @default 'managed-core'
   */
  readonly metricName?: CfnWebACL.VisibilityConfigProperty['metricName']
  /**
   * The name of the rule. You can't change the name of a `Rule` after you create it.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-name
   * @default 'managed-core'
   */
  readonly name?: Rule['name']
  /**
   * If you define more than one `Rule` in a `WebACL` , AWS WAF evaluates each request against the `Rules` in order based on the value of `Priority` . AWS WAF processes rules with lower priority first. The priorities don't need to be consecutive, but they must all be different.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-priority
   * @default 40
   */
  readonly priority?: Rule['priority']
}

/**
 * Properties when enabling the Bad Inputs rule
 */
export interface EnableBadInputsRule extends BaseRuleProps {
  /**
   * Metric name for default action
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-visibilityconfig.html#cfn-wafv2-webacl-visibilityconfig-metricname
   * @default 'bad-inputs'
   */
  readonly metricName?: CfnWebACL.VisibilityConfigProperty['metricName']
  /**
   * The name of the rule. You can't change the name of a `Rule` after you create it.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-name
   * @default 'bad-inputs'
   */
  readonly name?: Rule['name']
  /**
   * If you define more than one `Rule` in a `WebACL` , AWS WAF evaluates each request against the `Rules` in order based on the value of `Priority` . AWS WAF processes rules with lower priority first. The priorities don't need to be consecutive, but they must all be different.
   *
   * @link http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-wafv2-webacl-rule.html#cfn-wafv2-webacl-rule-priority
   * @default 50
   */
  readonly priority?: Rule['priority']
}
