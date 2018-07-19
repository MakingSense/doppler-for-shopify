import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Layout,
  Card,
  Stack,
  ButtonGroup,
  Button,
  Icon,
} from '@shopify/polaris';
import * as appSetupActions from '../../actions/appSetupActions';

class SynchronizeCustomersConfirmationModal extends Component {
  constructor(props) {
    super(props);
    this.handleYesButtonClick = this.handleYesButtonClick.bind(this);
    this.handleNoButtonClick = this.handleNoButtonClick.bind(this);
  }

  handleYesButtonClick() {
    this.props.actions.synchronizeCustomers();
  }

  handleNoButtonClick() {
    this.props.actions.requestingSynchronization(false);
  }

  render() {
    return (
      <Layout>
        <Layout.Section>
          <Card title="Synchronization confirmation" sectioned>
            <Stack spacing="extraTight">
              <Icon source="risk" color="yellow" />
              <p>
                By running the synchronization process the existing Subscribers
              </p>
            </Stack>
            <p>
              will be added to the selected List and their data will be updated
            </p>
            <p>
              by the Shopify customers data. This action may take several minutes.
            </p>
            <p>
              Do you want to continue?
            </p>
            <br />
            <Stack alignment="center" distribution="trailing">
              <ButtonGroup>
                <Button onClick={this.handleYesButtonClick} primary>
                  Yes
                </Button>
                <Button onClick={this.handleNoButtonClick}>No</Button>
              </ButtonGroup>
            </Stack>
          </Card>
        </Layout.Section>
      </Layout>
    );
  }
}

function mapStatesToProps(state, ownProps) {
  return {
    state: state.reducers,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...appSetupActions }, dispatch),
  };
}

export default connect(mapStatesToProps, mapDispatchToProps)(SynchronizeCustomersConfirmationModal);
