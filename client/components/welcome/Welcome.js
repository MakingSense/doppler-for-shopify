import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import {
  Layout,
  ButtonGroup,
  Button,
  TextContainer,
  DisplayText,
  TextStyle,
  Image,
} from '@shopify/polaris';

import ConnectedImage from '../../../dist/images/connected.svg';

class Welcome extends Component {
  constructor(props) {
    super(props);
    this.handleConnectButtonClick = this.handleConnectButtonClick.bind(this);
  }

  handleConnectButtonClick() {
    this.props.dispatch(push('/app/connect-to-doppler'));
  }

  render() {
    return (
      <Layout>
        <Layout.Section>
          <div style={{ marginTop: '2rem' }}>
            <TextContainer spacing="loose">
              <DisplayText size="large">
                Connect your Shopify store to your Doppler account
              </DisplayText>
              <br />
              <TextStyle variation="subdued">
                <DisplayText size="small">
                  Follow a few steps to connect both platforms and add customers and their purchase data 
                  automatically to Doppler, import your store products into Email Templates and create Abandoned 
                  Cart and Retargeting Product Automations. To start, please use your Doppler account or
                  create one if you haven't yet.
                  <br/>
                  You need a paid account to connect with Shopify.
                </DisplayText>
              </TextStyle>
            </TextContainer>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <ButtonGroup>
              <Button primary onClick={this.handleConnectButtonClick}>
                Connect existing account
              </Button>
              <Button
                external
                url="https://app2.fromdoppler.com/Registration/Register/StartRegistration?origin=shopify">
                Sign up now
              </Button>
            </ButtonGroup>
          </div>
        </Layout.Section>
        <Layout.Section secondary>
          <Image style={{maxWidth:"30rem"}} source={ConnectedImage} />
        </Layout.Section>
      </Layout>
    );
  }
}

export default connect()(Welcome);
