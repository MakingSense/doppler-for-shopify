import React, { Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { 
    Layout, 
    Card,
    Heading,
    TextContainer,
    Select } from '@shopify/polaris';
import Modal from 'react-responsive-modal';    
import CreateListModal from './CreateListModal';
import * as setupDopplerListActions from '../../actions/SetupDopplerListActions';

class SetupDopplerList extends Component {
  constructor(props) {
    super(props);
   
    this.handleSetListButtonClick = this.handleSetListButtonClick.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleSelectedListChange = this.handleSelectedListChange.bind(this);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  componentDidMount() {
    this.props.actions.getDopplerLists();
  }
  
  handleSetListButtonClick() {
    if (this.props.selectedListId != null)
      this.props.actions.setDopplerList(this.props.selectedListId)
  }

  handleSelectedListChange(newValue) {
    this.props.actions.changeCurrentSelectedList(newValue);
  }

  handleOpenModal() {
    this.props.actions.requestListCreation(true);
  }

  handleCloseModal() { 
   this.props.actions.requestListCreation(false);
  }

  render() {
    return <div>
      <Layout>
        <Layout.Section>
          <Card secondaryFooterAction={{content: "Create a New Doppler List", onAction: this.handleOpenModal, disabled: this.props.retrievingDopplerLists || this.props.settingDopplerList }}
            primaryFooterAction={{content: "Next", onAction: this.handleSetListButtonClick, disabled: !this.props.selectedListId, loading: this.props.retrievingDopplerLists || this.props.settingDopplerList}}>
            <div style={{margin: "2rem"}}>
              <TextContainer spacing="loose">
                  <Heading>Sync your store to a Doppler list</Heading>
                  <p>Your Doppler account is connected to MS. Increase sales by automations such as abandoned carts, product retargeting and order notification emails powered by Doppler.</p>
                  <p>Select a list to sync to your store.
                  </p>
                  <Select options={this.props.dopplerLists}
                          value={this.props.selectedListId} 
                          onChange={this.handleSelectedListChange}
                          disabled={!this.props.dopplerLists.length || this.props.retrievingDopplerLists || this.props.settingList }/>
              </TextContainer>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
      <Modal 
        open={this.props.requestingListCreation} 
        onClose={this.handleCloseModal} 
        center
        closeIconSize={16}>
          <CreateListModal />
      </Modal>
    </div>;
  }
}

function mapStatesToProps(state, ownProps) {
  return {
    state: state.reducers,
    dopplerLists: state.reducers.setupDopplerList.dopplerLists,
    retrievingDopplerLists: state.reducers.setupDopplerList.retrievingDopplerLists,
    selectedListId: state.reducers.setupDopplerList.selectedListId,
    settingDopplerList: state.reducers.setupDopplerList.settingDopplerList,
    requestingListCreation: state.reducers.setupDopplerList.requestingListCreation
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...setupDopplerListActions}, dispatch, dispatch)
  };
}

export default connect(mapStatesToProps, mapDispatchToProps)(SetupDopplerList);