import React, { Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Card, Heading, Stack, ButtonGroup, Button, Icon } from '@shopify/polaris';
import * as fieldsMappingActions from '../../actions/fieldsMappingActions';

class RemoveFieldMappingConfirmationModal extends Component {
  constructor(props) {
    super(props);
    this.handleYesButtonClick = this.handleYesButtonClick.bind(this);
    this.handleNoButtonClick = this.handleNoButtonClick.bind(this);
  }

  handleYesButtonClick() {
    this.props.actions.removeMappedField(this.props.mappedFieldToRemove)
  }

  handleNoButtonClick() {
    this.props.actions.requestRemoveMappedField(false);
 }
 
  render() {
    return <div>  
    <Layout>
        <Layout.Section>
          <Card>
            <div style={{margin: "2rem"}}>
                <Heading>Delete confirmation</Heading>
                <br/>
                <p>You're about to delete the mapped field <strong>{this.props.mappedFieldToRemove}</strong></p>
                <p>Do you want to continue?</p>
            </div>
            <div style={{margin: "0 2rem 2rem 0"}}>
              <Stack alignment="center" distribution="trailing">
                <ButtonGroup>
                  <Button onClick={this.handleYesButtonClick} destructive>Yes</Button>
                  <Button onClick={this.handleNoButtonClick}>No</Button>
                </ButtonGroup>
              </Stack>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
      </div>;
  }
}

function mapStatesToProps(state, ownProps) {
    return {
      state: state.reducers,
      mappedFieldToRemove: state.reducers.fieldsMapping.mappedFieldToRemove
    };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...fieldsMappingActions}, dispatch)
  };
}

export default connect(mapStatesToProps, mapDispatchToProps)(RemoveFieldMappingConfirmationModal);