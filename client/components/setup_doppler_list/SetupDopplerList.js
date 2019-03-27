import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Layout,
  Card,
  TextContainer,
  Select,
  Stack,
  Button,
  ButtonGroup,
  FooterHelp,
  Link,
  Tooltip
} from '@shopify/polaris';
import Modal from 'react-responsive-modal';
import CreateListModal from './CreateListModal';
import * as setupDopplerListActions from '../../actions/setupDopplerListActions.js';
import LoadingSkeleton from '../loading_skeleton/LoadingSkeleton';

class SetupDopplerList extends Component {
  constructor(props) {
    super(props);

    this.handleSetListButtonClick = this.handleSetListButtonClick.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleSelectedListChange = this.handleSelectedListChange.bind(this);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleCancelButtonClick = this.handleCancelButtonClick.bind(this);
    this.getCancelAction = this.getCancelAction.bind(this);
    this.getListsDropdown = this.getListsDropdown.bind(this);
  }

  componentDidMount() {
    this.props.actions.getDopplerLists();
  }

  handleSetListButtonClick() {
    if (this.props.selectedListId != null) {
      dopplerListName = this.props.dopplerLists.find(
        l => l.value === this.props.selectedListId
      ).label;
      this.props.actions.setDopplerList(
        this.props.selectedListId,
        dopplerListName,
        this.props.setupCompleted
      );
    }
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

  handleCancelButtonClick() {
    this.props.actions.gotoAppSetup();
  }

  getCancelAction() {
    return this.props.setupCompleted ? (
      <Button
        onClick={this.handleCancelButtonClick}
        disabled={this.props.settingDopplerList}
      >
        Cancel
      </Button>
    ) : null;
  }

  getListsDropdown() {
    var selectComponent = <Select
        options={this.props.dopplerLists}
        value={this.props.selectedListId}
        onChange={this.handleSelectedListChange}
        disabled={
          !this.props.dopplerLists.length ||
          this.props.retrievingDopplerLists ||
          this.props.settingDopplerList
        }
      />;
    
      if (this.props.selectedListId === -1 && !this.props.setupCompleted)
        selectComponent = <Tooltip content="This list will be created" preferredPosition="above">{selectComponent}</Tooltip>
      
      return selectComponent;
  }

  render() {
    return this.props.retrievingDopplerLists ? (
      <LoadingSkeleton />
    ) : (
      <div>
        <Layout>
          <Layout.Section>
            <Card sectioned title="Sync your store to a Doppler List">
              <TextContainer spacing="loose">
                <p>
                  Your Doppler account is now connected. By associating your contacts to your Doppler Lists, 
                  you can trigger customized and targeted Automation Emails based on a specific date, event, 
                  or Subscriber activity. This will allow you to send personalized messages that will maximize 
                  your business conversions, improve your consumer shopping experience and increase your profits.
                </p>
                <p>Select a Subscribers List to sync to your store:</p>
                {this.getListsDropdown()}
              </TextContainer>
            </Card>
            <div style={{ marginTop: '2rem' }}>
              <Stack>
                <Stack.Item fill>
                  <Button
                    icon="add"
                    onClick={this.handleOpenModal}
                    disabled={
                      this.props.retrievingDopplerLists ||
                      this.props.settingDopplerList
                    }
                  >
                    Create new List
                  </Button>
                </Stack.Item>
                <ButtonGroup>
                  {this.getCancelAction()}
                  <Button
                    loading={
                      this.props.retrievingDopplerLists ||
                      this.props.settingDopplerList
                    }
                    onClick={this.handleSetListButtonClick}
                    disabled={
                      !this.props.selectedListId ||
                      this.props.retrievingDopplerLists ||
                      this.props.settingDopplerList
                    }
                    primary
                  >
                    Save
                  </Button>
                </ButtonGroup>
              </Stack>
            </div>
          </Layout.Section>
        </Layout>
        <FooterHelp>
          Check{' '}
          <Link
            external={true}
            url="https://help.fromdoppler.com/en/guide-to-managing-your-subscribers-lists/"
          >
            these tips
          </Link>{' '}
          for managing your Lists.
        </FooterHelp>
        <Modal
          closeOnOverlayClick={false}
          closeOnEsc={false}
          showCloseIcon={false}
          open={this.props.requestingListCreation}
          onClose={this.handleCloseModal}
          center
          closeIconSize={16}
        >
          <CreateListModal />
        </Modal>
      </div>
    );
  }
}

function mapStatesToProps(state, ownProps) {
  return {
    state: state.reducers,
    dopplerLists: state.reducers.setupDopplerList.dopplerLists,
    retrievingDopplerLists: state.reducers.setupDopplerList.retrievingDopplerLists,
    selectedListId: state.reducers.setupDopplerList.selectedListId,
    settingDopplerList: state.reducers.setupDopplerList.settingDopplerList,
    requestingListCreation: state.reducers.setupDopplerList.requestingListCreation,
    setupCompleted: state.reducers.appSetup.setupCompleted
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...setupDopplerListActions }, dispatch),
  };
}

export default connect(mapStatesToProps, mapDispatchToProps)(SetupDopplerList);
