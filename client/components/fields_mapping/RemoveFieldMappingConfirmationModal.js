import React, { Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Card } from '@shopify/polaris';
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
          <Card primaryFooterAction={{ content: "Yes", onAction: this.handleYesButtonClick}}
                secondaryFooterAction={{ content: "No", onAction: this.handleNoButtonClick}}>
            <div style={{margin: "2rem"}}>
                <p>You're about to remove the mapped field <strong>{this.props.mappedFieldToRemove}</strong></p>
                <p>Do you want to continue?</p>
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