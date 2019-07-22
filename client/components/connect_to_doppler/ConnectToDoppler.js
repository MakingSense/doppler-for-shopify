import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Layout,
  Image,
  Stack,
  Card,
  TextContainer,
  TextStyle,
  FormLayout,
  Form,
  TextField,
  FooterHelp,
  Link,
  Button,
} from '@shopify/polaris';
import ShopifyDopplerImage from '../../../dist/images/shopify-doppler.png';
import * as connectToDopplerActions from '../../actions/connectToDopplerActions';

class ConnectToDoppler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dopplerAccountName: '',
      dopplerApiKey: '',
    };
    this.handleClickConnect = this.handleClickConnect.bind(this);
    this.handleApiKeyChange = this.handleApiKeyChange.bind(this);
    this.handleAccountNameChange = this.handleAccountNameChange.bind(this);
    this.validateCurrentState = this.validateCurrentState.bind(this);
  }

  handleClickConnect() {
    this.props.actions.connectToDoppler(this.state);
  }

  handleApiKeyChange(dopplerApiKey) {
    this.setState({ dopplerApiKey });
    this.props.actions.changeDopplerCredentialValiationStatus(true);
  }

  handleAccountNameChange(dopplerAccountName) {
    this.setState({ dopplerAccountName });
    this.props.actions.changeDopplerCredentialValiationStatus(true);
  }

  validateCurrentState() {
    return (
      this.state.dopplerAccountName &&
      this.state.dopplerAccountName !== '' &&
      this.state.dopplerApiKey &&
      this.state.dopplerApiKey !== ''
    );
  }

  render() {
    return (
      <Layout>
        <Layout.Section>
          <Stack distribution="fill" vertical>
            <Card>
              <Stack
                distribution="fill"
                alignment="center"
                vertical
                spacing="tight"
              >
                <Image
                  source={ShopifyDopplerImage}
                  style={{ marginTop: '2rem' }}
                />
                <TextContainer>
                  <TextStyle variation="strong">Connect</TextStyle>{' '}
                  Doppler{' '}
                  <TextStyle variation="strong">to your Shopify account</TextStyle>
                </TextContainer>
                <TextContainer>
                  <TextStyle variation="subdued">
                    Doppler is a free application that connects your
                  </TextStyle>
                </TextContainer>
                <TextContainer>
                  <TextStyle variation="subdued">
                    Shopify store with your Doppler account.
                  </TextStyle>
                </TextContainer>
                <div
                  style={{
                    minWidth: '40rem',
                    marginTop: '2rem',
                    marginBottom: '2rem',
                  }}
                >
                  <FormLayout>
                    <Form>
                      <TextField
                        autoFocus
                        autoComplete={false}
                        label="Username"
                        placeholder="Psst! It's your Email"
                        type="email"
                        value={this.state.dopplerAccountName}
                        onChange={this.handleAccountNameChange}
                        disabled={this.props.connectingToDoppler}
                        error={
                          this.props.invalidDopplerCredentials
                            ? 'Invalid Credentials'
                            : null
                        }
                      />
                      <br />
                      <TextField
                        label="API Key"
                        autoComplete={false}
                        placeholder="e.g.: C22CADA13759DB9BBDF93B9D87C14D5A"
                        value={this.state.dopplerApiKey}
                        disabled={this.props.connectingToDoppler}
                        error={
                          this.props.invalidDopplerCredentials
                            ? 'Invalid Credentials'
                            : null
                        }
                        onChange={this.handleApiKeyChange}
                      />
                      <br />
                      <Stack distribution="trailing" alignment="fill">
                        <Button
                          primary
                          onClick={this.handleClickConnect}
                          loading={this.props.connectingToDoppler}
                          disabled={!this.validateCurrentState()}
                          submit
                        >
                          Connect
                        </Button>
                      </Stack>
                    </Form>
                  </FormLayout>
                </div>
              </Stack>
            </Card>
            <FooterHelp>
              Learn where to find your{' '}
              <Link
                external={true}
                url="https://help.fromdoppler.com/en/where-do-i-find-my-api-key/?utm_source=integracion&utm_medium=integracion&utm_campaign=shopify">
                API Key
              </Link>.
            </FooterHelp>
          </Stack>
        </Layout.Section>
      </Layout>
    );
  }
}

function mapStatesToProps(state, ownProps) {
  return {
    state: state.reducers,
    connectingToDoppler: state.reducers.connectingToDoppler.connectingToDoppler,
    invalidDopplerCredentials:
      state.reducers.connectingToDoppler.invalidDopplerCredentials,
    appName: state.reducers.appSetup.appName,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...connectToDopplerActions }, dispatch),
  };
}

export default connect(mapStatesToProps, mapDispatchToProps)(ConnectToDoppler);
