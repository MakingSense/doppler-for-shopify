import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Banner, Link } from '@shopify/polaris';
import * as errorBannerActions from '../../actions/errorBannerActions';

class ErrorBanner extends Component {
  constructor(props) {
    super(props);
    this.handleBannerDismiss = this.handleBannerDismiss.bind(this);
    this.getErrorDetails = this.getErrorDetails.bind(this);
  }

  handleBannerDismiss() {
    this.props.actions.showErrorBanner(false);
  }

  getErrorDetails() {
    return this.props.errorMessage && this.props.errorMessage != '' ? ` Details: ${this.props.errorMessage}. ` : ' ';
  }

  render() {
    return this.props.showErrorBanner ?
    <div style={{ marginBottom:"2rem"}}>
        <Banner onDismiss={this.handleBannerDismiss} status="critical">
            <p><strong>An unexpected error occurred.</strong>{this.getErrorDetails()}<Link url="mailto:support@fromdoppler.com">Let us know about this.</Link></p>
        </Banner>
    </div> : null;
  }
}

function mapStatesToProps(state, ownProps) {
    return {
      state: state.reducers,
      showErrorBanner: state.reducers.errorHandling.showErrorBanner,
      errorMessage: state.reducers.errorHandling.errorMessage
    };
}

function mapDispatchToProps(dispatch) {
    return {
       actions: bindActionCreators({...errorBannerActions}, dispatch)
    };
}

export default connect(mapStatesToProps, mapDispatchToProps)(ErrorBanner);
