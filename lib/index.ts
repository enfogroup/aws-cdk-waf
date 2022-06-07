import { Construct } from 'constructs'
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface AwsCdkWafProps {
  // Define construct properties here
}

export class AwsCdkWaf extends Construct {
  constructor (scope: Construct, id: string, props: AwsCdkWafProps = {}) {
    super(scope, id)

    // Define construct contents here

    // example resource
    // const queue = new sqs.Queue(this, 'AwsCdkWafQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
