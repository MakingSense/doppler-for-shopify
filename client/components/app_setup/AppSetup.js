import React, { Component } from 'react';
import { connect } from 'react-redux';
import AppSetupSynchronizationSettings from './AppSetupSynchronizationSettings';
import AppSetupMarketingActions from './AppSetupMarketingActions';
import {Card, Tabs, Link, FooterHelp } from  '@shopify/polaris';

class AppSetup extends Component {
  constructor(props) {
    super(props);
    window.currentAppSetupTab = window.currentAppSetupTab || 0;

    this.state = {
      selected: window.currentAppSetupTab
    };
    this.handleTabChange = this.handleTabChange.bind(this);
  }

  handleTabChange(selectedTabIndex) {
    window.currentAppSetupTab = selectedTabIndex;
    this.setState({selected: selectedTabIndex});
  }

  render() {
    const {selected} = this.state;

    const tabs = [
      {
        id: 'marketing-actions',
        accessibilityLabel: 'Marketing Actions',
        content: 'Marketing Actions',
        panelID: 'marketing-actions'
      },
      {
        id: 'customers-synchronization-setup',
        content: 'Customers Synchronization Setup',
        accessibilityLabel: 'Customers Synchronization Setup',
        panelID: 'customers-synchronization-setup'
      },
    ];

    return (
      <div>
        <Card>
          <Tabs
            tabs={tabs}
            selected={selected}
            onSelect={this.handleTabChange}
            fitted
          />
          <Card.Section title={tabs[selected].title}>
            {selected == 0 ? <AppSetupMarketingActions /> : <AppSetupSynchronizationSettings />}
          </Card.Section>
        </Card>
        <FooterHelp>
        Doubts? Questions?{' '}
        <Link external={true} url="https://www.fromdoppler.com/en/contact">
          Contact
        </Link>{' '}
        us!
        </FooterHelp>
      </div>
    );
  }
}

export default connect()(AppSetup);
