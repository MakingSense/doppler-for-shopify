import React, { Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Card, Button, Tooltip, Banner, Link, FooterHelp } from '@shopify/polaris';
import Modal from 'react-responsive-modal';
import SynchronizeCustomersConfirmationModal from './SynchronizeCustomersConfirmationModal';
import * as appSetupActions from '../../actions/appSetupActions';

class AppSetup extends Component {
  constructor(props) {
    super(props);

    this.handleSetupFieldsMapping = this.handleSetupFieldsMapping.bind(this);
    this.handleSetupDopplerList = this.handleSetupDopplerList.bind(this);
    this.handleRunSynchronizeCustomers = this.handleRunSynchronizeCustomers.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.getButton = this.getButton.bind(this);
    this.getSynchronizationStatus = this.getSynchronizationStatus.bind(this);
  }

  handleSetupDopplerList() {
    this.props.actions.gotoSetupDopplerList();
  }

  handleSetupFieldsMapping() {
    this.props.actions.gotoFieldsMapping();
  }

  handleRunSynchronizeCustomers(){
    this.props.actions.requestingSynchronization(true);
  }

  handleCloseModal() {
    this.props.actions.requestingSynchronization(false);
  }

  getButton({onClick, label}) {
    if (this.props.synchronizationInProgress) 
      return <Tooltip content="This action cannot be performed while there is a synchronization process in progess" >
               <Button primary disabled>{label}</Button>
             </Tooltip>;
    return <Button primary onClick={onClick}>{label}</Button>;
  }

  getSynchronizationStatus() {
    if (!this.props.lastSynchronizationDate || this.props.lastSynchronizationDate === '')
      return null;

    if (this.props.synchronizationInProgress)
      return <div>
      <Banner icon="horizontalDots" status="warning">
        <p>Synchronization process status: <strong>IN PROGRESS </strong>
        (Click <Link url=".">here</Link> to refresh)
        </p>
        <p>Requested on: <strong>{(new Date(this.props.lastSynchronizationDate)).toLocaleString()}</strong></p>
      </Banner>
      <br/>
      </div>;

    return <div>
    <Banner icon="checkmark" status="info">
        <p>Synchronization process status: <strong>COMPLETED</strong></p>
        <p>Requested on: <strong>{(new Date(this.props.lastSynchronizationDate)).toLocaleString()}</strong></p>
    </Banner>
    <br/>
    </div>;
  }

  render() {
    return <div>
      <Layout>
      <Layout.Section>
        <Card title="Customers Synchronization" sectioned>
          <p>Shopify is connected with the <strong>{this.props.dopplerAccountName}</strong>'s Doppler account.
          Every new customer will automatically be added as a Doppler subscriber. 
          If you wish to populate your Doppler list with all the customers you currently have in Shopify,
          run the synchronization process.</p>
          <br/>
          {this.getSynchronizationStatus()}
          {this.getButton({
            onClick: this.handleRunSynchronizeCustomers,
            label: 'Synchronize'
          })}
        </Card>
      </Layout.Section>
      <Layout.Section>
        <Card title="Subscribers List" sectioned>
          <p>You have currently configured the <strong>{this.props.dopplerListName}</strong> list.
          This is where all the new subscribers will be added. If you want to change this list or create a new one
          click the <i>Change List</i> button.
          </p>
          <br/>
          {this.getButton({
            onClick: this.handleSetupDopplerList,
            label: 'Change List'
          })}
        </Card>
      </Layout.Section>
      <Layout.Section>
        <Card title="Fields Mapping" sectioned>
          <p>Collect all the information that you need for your Doppler campaigns, like names, addresses, phone numbers, etc.
            Choose what fields you want to map from a customer to a subscriber.</p>
          <br/>
          {this.getButton({
            onClick: this.handleSetupFieldsMapping,
            label: 'Setup Fields Mapping'
          })}
        </Card>
      </Layout.Section>
    </Layout>
    <FooterHelp>
      Doubts? Questions? <Link external={true} url="https://www.fromdoppler.com/en/contact">Contact</Link> us!
    </FooterHelp>
    <Modal
      open={this.props.requestingSynchronization} 
      onClose={this.handleCloseModal} 
      center
      animationDuration={0}
      showCloseIcon={false}>
          <SynchronizeCustomersConfirmationModal/>
    </Modal>
  </div>;
  }
}

function mapStatesToProps(state, ownProps) {
    return {
      state: state.reducers,
      requestingSynchronization: state.reducers.appSetup.requestingSynchronization,
      dopplerAccountName: state.reducers.appSetup.dopplerAccountName,
      dopplerListName: state.reducers.appSetup.dopplerListName,
      synchronizationInProgress: state.reducers.appSetup.synchronizationInProgress,
      lastSynchronizationDate: state.reducers.appSetup.lastSynchronizationDate
    };
  }
  
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...appSetupActions}, dispatch)
  };
}

export default connect(mapStatesToProps, mapDispatchToProps)(AppSetup);
