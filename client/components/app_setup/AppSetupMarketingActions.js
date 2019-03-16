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
          <Card title="Abandoned cart email" sectioned>
            <p>
              Remind customers about items they've left behind to recapture sales and generate more revenue.
              This email includes items from the customer’s cart and a quick link to checkout. You can customize it in Doppler.
            </p>
            <br />
            <Button primary external url={"https://app2.fromdoppler.com/Integrations/Shopify/Checkouts?shop=" + this.props.shopOrigin}>
                Open in Doppler
            </Button>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card title="Published products" sectioned>
            <p>
              Encourage customers to make a purchase with retargeting emails that showcase new items, best sellers, and other products they might like.
              After someone visits a product page, this email reminds them of what they saw. Use Doppler editor to customize the design.
            </p>
            <br />
            <Button primary external url={"https://app2.fromdoppler.com/Integrations/Shopify/Products?shop=" + this.props.shopOrigin}>
                Open in Doppler
            </Button>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card title="Visited products" sectioned>
            <p>
              Encourage customers to make a purchase with retargeting emails that showcase new items, best sellers, and other products they might like.
              After someone visits a product page, this email reminds them of what they saw. Use Doppler editor to customize the design.
            </p>
            <br />
            <Button primary external url={"https://app2.fromdoppler.com/Integrations/Shopify/VisitedProducts?shop=" + this.props.shopOrigin}>
                Open in Doppler
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