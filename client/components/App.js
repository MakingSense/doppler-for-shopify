import React, { Component} from 'react';
import { connect } from 'react-redux';
import { Page } from '@shopify/polaris';
import { EmbeddedApp } from '@shopify/polaris/embedded';
import ErrorBanner from './error_banner/ErrorBanner';
import Icon from '../../dist/images/doppler-icon.png'

class App extends Component {
  render() {
    const { apiKey, shopOrigin } = window;

    return (
      <EmbeddedApp shopOrigin={shopOrigin} apiKey={apiKey}>
        <Page icon={Icon}>
          <ErrorBanner />
          {this.props.children}
        </Page>
      </EmbeddedApp>
    );
  }
}

export default connect()(App);
