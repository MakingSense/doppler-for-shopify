import React, { Component} from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Layout, ButtonGroup, Button, TextContainer, DisplayText, TextStyle, Image } from '@shopify/polaris';

import ConnectedImage from '../../../dist/images/connected.svg';

class Welcome extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <Layout>
      <Layout.Section>
        <div style={{ marginTop: "2rem" }}>
          <TextContainer spacing="loose">
            <DisplayText size="large">Connect your Doppler account</DisplayText>
            <TextStyle variation="subdued">
              <DisplayText size="small" >Streamline your workflow, sync customer data,
              generate more revenue, and grow your business.</DisplayText>
            </TextStyle>
          </TextContainer>
        </div>
        <div style={{ marginTop: "2rem" }}>
          <ButtonGroup>
            <Link to="/app/connect-to-doppler"><Button primary>Connect to Doppler</Button></Link>
            <Button external url="https://app2.fromdoppler.com/Registration/Register/StartRegistration/">Create new account</Button>
          </ButtonGroup>
        </div>
      </Layout.Section>
      <Layout.Section secondary>
        <Image source={ConnectedImage}/>
      </Layout.Section>
   </Layout>;
  }
}

export default connect()(Welcome);
