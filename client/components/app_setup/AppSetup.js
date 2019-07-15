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
        id: 'customers-synchronization-setup',
        content: 'Customers Synchronization Setup',
        accessibilityLabel: 'Customers Synchronization Setup',
        panelID: 'customers-synchronization-setup'
      },
      {
        id: 'email-marketing-actions',
        accessibilityLabel: 'Email Marketing Actions',
        content: 'Email Marketing Actions',
        panelID: 'email-marketing-actions'
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
            {selected == 0 ? <AppSetupSynchronizationSettings /> : <AppSetupMarketingActions />}
          </Card.Section>
        </Card>
        <FooterHelp>
          Any questions?{' '}
        <Link external={true} url="mailto:support@fromdoppler.com">
          Contact
        </Link>{' '}
        us!
        </FooterHelp>
      </div>
    );
  }
}

export default connect()(AppSetup);
