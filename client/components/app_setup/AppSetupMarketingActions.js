import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Layout,
  Card,
  Button
} from '@shopify/polaris';

class AppSetupMarketingActions extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (<div>
      <Layout>
        <Layout.Section>
          <Card title="Integrated products in Emails" sectioned>
            <p>
              Through this feature, 
              you can import the items from your store to an Email Template. 
              It will take the image, the price, the description and the alternative text of the product. 
              Also the Call to Action you loaded in your Shopify store.
            </p>
            <br />
            <Button primary external url={"https://app2.fromdoppler.com/Campaigns/BasicInfo"}>
              Create your Campaign
            </Button>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card title="Abandoned Cart Automation" sectioned>
            <p>
            Send automated Emails with the items your customers left in their carts. Encourage them to
            come back and complete their purchase.
            </p>
            <br />
            <Button primary external url={"https://app2.fromdoppler.com/Automation/EditorConfig?idTaskType=0"}>
              Recover Abandoned Carts
            </Button>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card title="Product Retargeting Automation" sectioned>
            <p>
              Send automated Emails with the items your customers visited on your Shopify store but they didn't buy.
            </p>
            <br />
            <Button primary external url={"https://app2.fromdoppler.com/Automation/EditorConfig?idTaskType=0"}>
              Retarget your Customers
            </Button>
          </Card>
        </Layout.Section>
      </Layout>
    </div>);
  }
}

function mapStatesToProps(state, ownProps) {
  return {
    state: state.reducers,
    shopOrigin: state.reducers.appSetup.shopOrigin,
  };
}


export default connect(mapStatesToProps)(AppSetupMarketingActions);