import React, { Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Layout,
  Card,
  TextContainer,
  TextField,
  Form,
  Stack,
  ButtonGroup,
  Button
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
      this.handleCloseModal = this.handleCloseModal.bind(this);
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

  handleCloseModal() { 
    this.props.actions.requestListCreation(false);
   }

  render() {
    return <div style={{minWidth: "50rem"}}>  
            <Layout>
                <Layout.Section>
                  <Card title="Create A New Doppler List">
                    <div style={{margin: "2rem"}}>
                      <TextContainer spacing="loose">
                          <p>You can create a new Doppler list from here, no need to open your Doppler accout.</p>
                          <Form>
                            <TextField
                              focused
                              autoComplete={false}
                              label="List Name"
                              value={this.state.name}
                              onChange={this.handleNameChange}
                              placeholder="Set a non existing one"
                              error={this.props.duplicatedListName ? 'A list with this name already exists' : null}
                              disabled={this.props.creatingDopplerList}
                            />
                            <br/>
                            <Stack alignment="center" distribution="trailing">
                              <ButtonGroup>
                                <Button onClick={this.handleCloseModal}>Cancel</Button>
                                <Button primary
                                  submit
                                  onClick={this.handleCreateButtonClick}
                                  loading={this.props.creatingDopplerList}
                                  disabled={!this.validateCurrentState()}>Create</Button>
                              </ButtonGroup>
                            </Stack>
                          </Form>
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
