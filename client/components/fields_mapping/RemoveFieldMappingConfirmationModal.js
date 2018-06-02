import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Card, Stack, ButtonGroup, Button } from '@shopify/polaris';
import * as fieldsMappingActions from '../../actions/fieldsMappingActions';

class RemoveFieldMappingConfirmationModal extends Component {
  constructor(props) {
    super(props);
    this.handleYesButtonClick = this.handleYesButtonClick.bind(this);
    this.handleNoButtonClick = this.handleNoButtonClick.bind(this);
  }

  handleYesButtonClick() {
    this.props.actions.removeMappedField(this.props.mappedFieldToRemove);
  }

  handleNoButtonClick() {
    this.props.actions.requestRemoveMappedField(false);
  }

  render() {
    return (
      <Layout>
        <Layout.Section>
          <Card title="Delete confirmation" sectioned>
            <p>
              You're about to delete the mapped field{' '}
              <strong>{this.props.mappedFieldToRemove}</strong>
            </p>
            <p>Do you want to continue?</p>
            <br />
            <Stack alignment="center" distribution="trailing">
              <ButtonGroup>
                <Button onClick={this.handleYesButtonClick} destructive>
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
    mappedFieldToRemove: state.reducers.fieldsMapping.mappedFieldToRemove,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...fieldsMappingActions }, dispatch),
  };
}

export default connect(mapStatesToProps, mapDispatchToProps)(
  RemoveFieldMappingConfirmationModal
);
