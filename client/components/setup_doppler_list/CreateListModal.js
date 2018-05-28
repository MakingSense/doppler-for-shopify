import React, { Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Layout,
  Card,
  TextContainer,
  Heading,
  TextField
} from '@shopify/polaris';
import * as setupDopplerListActions from '../../actions/SetupDopplerListActions';

class CreateListModal extends Component {
  constructor(props) {
      super(props);
      this.state = {
        name: ''
      };
      this.handleNameChange = this.handleNameChange.bind(this);
      this.validateCurrentState = this.validateCurrentState.bind(this);
      this.handleCreateButtonClick = this.handleCreateButtonClick.bind(this);
  }

  handleNameChange(name) {
    this.props.actions.duplicatedListName(false);
    this.setState({name});
  }

  validateCurrentState() {
    return this.state.name && this.state.name !== ''
  }

  handleCreateButtonClick() {
    this.props.actions.createDopplerList(this.state.name);
  }

  render() {
    return<div style={{minWidth: "50rem"}}>  
            <Layout>
                <Layout.Section>
                  <Card primaryFooterAction={{
                      content: "Create", 
                      disabled: !this.validateCurrentState(),
                      onAction: this.handleCreateButtonClick,
                      loading: this.props.creatingDopplerList}}>
                    <div style={{margin: "2rem"}}>
                      <TextContainer spacing="loose">
                          <Heading>Create A New Doppler List</Heading>
                          <p>You can create a new Doppler list from here, no need to open your Doppler accout.</p>
                          <TextField
                            label="List Name"
                            value={this.state.name}
                            onChange={this.handleNameChange}
                            placeholder="Set a non existing one :)"
                            error={this.props.duplicatedListName ? 'A list with this name already exists' : null}
                            disabled={this.props.creatingDopplerList}
                          />
                      </TextContainer>
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
    creatingDopplerList: state.reducers.setupDopplerList.creatingDopplerList,
    duplicatedListName: state.reducers.setupDopplerList.duplicatedListName
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...setupDopplerListActions}, dispatch, dispatch)
  };
}

export default connect(mapStatesToProps, mapDispatchToProps)(CreateListModal);
