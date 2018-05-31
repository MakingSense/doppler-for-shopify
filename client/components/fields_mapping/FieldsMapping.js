import React, { Component} from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Layout, Card, TextContainer, Heading, DataTable, Link, Icon } from '@shopify/polaris';
import Modal from 'react-responsive-modal';
import * as fieldsMappingActions from '../../actions/fieldsMappingActions';
import UpsertFieldMappingModal from './UpsertFieldMappingModal';
import RemoveFieldMappingConfirmationModal from './RemoveFieldMappingConfirmationModal';

class FieldsMapping extends Component {
  constructor(props) {
    super(props);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.createDataTableRows = this.createDataTableRows.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleOpenRemoveModal = this.handleOpenRemoveModal.bind(this);
    this.handleCloseRemoveModal = this.handleCloseRemoveModal.bind(this);
    this.handleSetFieldsMappingClick = this.handleSetFieldsMappingClick.bind(this);
  }

  componentDidMount() {
    this.props.actions.getFields(true);
  }

  handleOpenModal() {
    this.props.actions.requestFieldMappingUpsert(true);
  }

  handleCloseModal() { 
    this.props.actions.requestFieldMappingUpsert(false);
  }

  handleOpenRemoveModal(shopifyField) {
    const ref = this;
    return function() {
      if (!ref.props.retrievingFields && !ref.props.settingFieldsMapping)
        ref.props.actions.requestRemoveMappedField(true, shopifyField);
    }
  }

  handleCloseRemoveModal() {
    this.props.actions.requestRemoveMappedField(false);
  }
  
  createDataTableRows() {
    if (this.props.retrievingFields 
      || this.props.dopplerFields.length === 0 
      || this.props.shopifyFields.length === 0) return [];

    const ret = this.props.fieldsMapping
        .map(m => {
            const dopplerField = this.props.dopplerFields.find(df => df.name === m.doppler);
            const shopifyField = this.props.shopifyFields.find(cf => cf.path === m.shopify);
            return [shopifyField.name, dopplerField.name, shopifyField.type,<Link url="#" onClick={this.handleOpenRemoveModal(shopifyField.path)}><Icon source="delete" /></Link>]
        });
    ret.unshift([<strong>Email</strong>, <strong>EMAIL</strong>, 'string', '']);
    return ret;
  }

  handleSetFieldsMappingClick() {
    this.props.actions.setFieldsMapping(this.props.fieldsMapping);
  }

  render() {
    return <div>
    <Layout>
    <Layout.Section>
      <Card primaryFooterAction={{content: "Next", loading: this.props.retrievingFields || this.props.settingFieldsMapping, onAction: this.handleSetFieldsMappingClick}}
        secondaryFooterAction={{content: "Map A New Field", onAction: this.handleOpenModal, disabled: this.props.retrievingFields || this.props.settingFieldsMapping}}>
        <div style={{margin: "2rem"}}>
          <TextContainer spacing="loose">
              <Heading>Map your Shopify customer fields to your Doppler subscriber fields</Heading>
              <p>Your Doppler account is connected to MS. Increase sales by automations such as abandoned carts, product retargeting and order notification emails powered by Doppler.</p>
          </TextContainer>
        </div>
        <div style={{margin: "0 2rem 2rem 2rem"}}>
        <DataTable
            columnContentTypes={[
              'text',
              'text',
              'text',
              'text'
            ]}
            headings={[
              'Shopify Customer',
              'Doppler Subscriber',
              'Field Type',
              ''
            ]}
            rows={this.createDataTableRows()}
          />
        </div>
      </Card>
    </Layout.Section>
  </Layout>
  <Modal 
    open={this.props.requestingFieldMappingUpsert} 
    onClose={this.handleCloseModal} 
    center
    closeIconSize={16}>
        <UpsertFieldMappingModal/>
  </Modal>
  <Modal
    open={this.props.requestingRemoveMappedField} 
    onClose={this.handleCloseRemoveModal} 
    center
    animationDuration={0}
    showCloseIcon={false}>
        <RemoveFieldMappingConfirmationModal/>
  </Modal>
  </div>;
  }
}

function mapStatesToProps(state, ownProps) {
    return {
      state: state.reducers,
      requestingFieldMappingUpsert: state.reducers.fieldsMapping.requestingFieldMappingUpsert,
      requestingRemoveMappedField: state.reducers.fieldsMapping.requestingRemoveMappedField,
      retrievingFields: state.reducers.fieldsMapping.retrievingFields,
      fieldsMapping: state.reducers.fieldsMapping.fieldsMapping,
      shopifyFields: state.reducers.fieldsMapping.shopifyFields,
      dopplerFields: state.reducers.fieldsMapping.dopplerFields,
      settingFieldsMapping: state.reducers.fieldsMapping.settingFieldsMapping
    };
  }
  
  function mapDispatchToProps(dispatch) {
    return {
      actions: bindActionCreators({...fieldsMappingActions}, dispatch)
    };
  }

export default connect(mapStatesToProps, mapDispatchToProps)(FieldsMapping);
