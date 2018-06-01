import React, { Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Card, Stack, Button } from '@shopify/polaris';
import * as appSetupActions from '../../actions/appSetupActions';

class AppSetup extends Component {
  constructor(props) {
    super(props);

    this.handleSetupFieldsMapping = this.handleSetupFieldsMapping.bind(this);
    this.handleSetupDopplerList = this.handleSetupDopplerList.bind(this);
  }

  handleSetupDopplerList() {
    this.props.actions.gotoSetupDopplerList();
  }

  handleSetupFieldsMapping() {
    this.props.actions.gotoFieldsMapping();
  }

  render() {
    return <Layout>
    <Layout.Section>
      <Card title="Synchronization Process" sectioned>
        <Stack>
            <Stack.Item fill><p>Populate your Doppler list with all the customers you currently have in Shopify.</p></Stack.Item>
            <Button primary>Run Process</Button>
        </Stack>
      </Card>
    </Layout.Section>
    <Layout.Section>
      <Card title="Subscribers List" sectioned>
        <Stack>
            <Stack.Item fill><p>Set the Doppler subscribers list where all the new customers will be added.</p></Stack.Item>
            <Button primary onClick={this.handleSetupDopplerList}>Setup</Button>
        </Stack>
      </Card>
    </Layout.Section>
    <Layout.Section>
      <Card title="Fields Mapping" sectioned>
        <Stack>
            <Stack.Item fill><p>Choose what fields you want to map from a customer to a subscriber</p></Stack.Item>
            <Button primary onClick={this.handleSetupFieldsMapping}>Setup</Button>
        </Stack>
      </Card>
    </Layout.Section>
  </Layout>;
  }
}

function mapStatesToProps(state, ownProps) {
    return {
      state: state.reducers
    };
  }
  
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...appSetupActions}, dispatch)
  };
}

export default connect(mapStatesToProps, mapDispatchToProps)(AppSetup);
