import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  EmptyState
} from '@shopify/polaris';
import Modal from 'react-responsive-modal';
import SynchronizeCustomersConfirmationModal from './SynchronizeCustomersConfirmationModal';

import * as appSetupActions from '../../actions/appSetupActions';
import SetupCompletedImage from '../../../dist/images/setupCompleted.svg';

class SetupCompleted extends Component {
  constructor(props) {
    super(props);
    this.handleSkipButtonClick = this.handleSkipButtonClick.bind(this);
    this.handleRunSynchronizeCustomers = this.handleRunSynchronizeCustomers.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  handleSkipButtonClick() {
    this.props.actions.gotoAppSetup();
  }

  handleRunSynchronizeCustomers() {
    window.currentAppSetupTab = 1;
    this.props.actions.requestingSynchronization(true);
  }

  handleCloseModal() {
    this.props.actions.requestingSynchronization(false);
  }

  render() {
    return (<div>
        <EmptyState
            heading="Congrats!"
            action={{content: 'Synchronize Customers', onClick:this.handleRunSynchronizeCustomers}}
            secondaryAction={{content: 'Skip this step', onClick:this.handleSkipButtonClick}}
            image={SetupCompletedImage}
        >
        <p>You have set up successfully your integration.</p>
        <p>Synchronize all your customer with your subscribers list or, you can skip this step and do it whenever you want.</p>
      </EmptyState>
      <Modal
        open={this.props.requestingSynchronization}
        onClose={this.handleCloseModal}
        center
        animationDuration={0}
        showCloseIcon={false}
        >
        <SynchronizeCustomersConfirmationModal />
      </Modal>
      </div>
    );
  }
}

function mapStatesToProps(state, ownProps) {
    return {
      state: state.reducers,
      requestingSynchronization: state.reducers.appSetup.requestingSynchronization,
    };
  }
  
  function mapDispatchToProps(dispatch) {
    return {
      actions: bindActionCreators({ ...appSetupActions }, dispatch),
    };
  }

export default connect(mapStatesToProps, mapDispatchToProps)(SetupCompleted);
