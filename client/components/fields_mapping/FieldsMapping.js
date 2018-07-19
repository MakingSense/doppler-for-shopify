import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Layout,
  Card,
  DataTable,
  Button,
  Stack,
  ButtonGroup,
  FooterHelp,
  Link,
  SkeletonPage,
  SkeletonBodyText,
} from '@shopify/polaris';
import Modal from 'react-responsive-modal';
import * as fieldsMappingActions from '../../actions/fieldsMappingActions';
import UpsertFieldMappingModal from './UpsertFieldMappingModal';
import RemoveFieldMappingConfirmationModal from './RemoveFieldMappingConfirmationModal';
import LoadingSkeleton from '../loading_skeleton/LoadingSkeleton';

class FieldsMapping extends Component {
  constructor(props) {
    super(props);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.createDataTableRows = this.createDataTableRows.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleOpenRemoveModal = this.handleOpenRemoveModal.bind(this);
    this.handleCloseRemoveModal = this.handleCloseRemoveModal.bind(this);
    this.handleSetFieldsMappingClick = this.handleSetFieldsMappingClick.bind(
      this
    );
    this.handleCancelButtonClick = this.handleCancelButtonClick.bind(this);
    this.getCancelAction = this.getCancelAction.bind(this);
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
    };
  }

  handleCloseRemoveModal() {
    this.props.actions.requestRemoveMappedField(false);
  }

  createDataTableRows() {
    if (
      this.props.retrievingFields ||
      this.props.dopplerFields.length === 0 ||
      this.props.shopifyFields.length === 0
    )
      return [];

    const ret = this.props.fieldsMapping.map(m => {
      const dopplerField = this.props.dopplerFields.find(
        df => df.name === m.doppler
      );
      const shopifyField = this.props.shopifyFields.find(
        cf => cf.path === m.shopify
      );
      return [
        shopifyField.name,
        dopplerField.name,
        shopifyField.type,
        <Button
          onClick={this.handleOpenRemoveModal(shopifyField.path)}
          icon="delete"
          size="slim"
        />,
      ];
    });
    ret.unshift([<strong>Email</strong>, <strong>EMAIL</strong>, 'string', '']);
    return ret;
  }

  handleSetFieldsMappingClick() {
    this.props.actions.setFieldsMapping(this.props.fieldsMapping, this.props.setupCompleted);
  }

  handleCancelButtonClick() {
    this.props.actions.gotoAppSetup();
  }

  getCancelAction() {
    return this.props.setupCompleted ? (
      <Button
        onClick={this.handleCancelButtonClick}
        disabled={this.props.settingFieldsMapping}
      >
        Cancel
      </Button>
    ) : null;
  }

  render() {
    return this.props.retrievingFields ? (
      <LoadingSkeleton />
    ) : (
      <div>
        <Layout>
          <Layout.Section>
            <Card
              sectioned
              title="Map the Fields of your Shopify customers to your Doppler Subscribers"
            >
              <p>
                Select the Doppler Field you'd like to assign to each Shopify field. 
                For each new customer a new Subscriber will be created based on this mapping.
              </p>
              <br />
              <DataTable
                columnContentTypes={['text', 'text', 'text', 'text']}
                headings={[
                  'Shopify',
                  'Doppler',
                  'Field Type',
                  '',
                ]}
                rows={this.createDataTableRows()}
              />
            </Card>
          </Layout.Section>
        </Layout>
        <div style={{ marginTop: '2rem' }}>
          <Stack>
            <Stack.Item fill>
              <Button
                icon="add"
                onClick={this.handleOpenModal}
                disabled={
                  this.props.retrievingFields || this.props.settingFieldsMapping
                }
              >
                Add new Field
              </Button>
            </Stack.Item>
            <ButtonGroup>
              {this.getCancelAction()}
              <Button
                loading={
                  this.props.retrievingFields || this.props.settingFieldsMapping
                }
                onClick={this.handleSetFieldsMappingClick}
                primary
              >
                Save
              </Button>
            </ButtonGroup>
          </Stack>
        </div>
        <FooterHelp>
          Need to create a Custom Field in Doppler? Check{' '}
          <Link
            external={true}
            url="https://help.fromdoppler.com/en/?s=custom+fields"
          >
            this tutorial
          </Link>.
        </FooterHelp>
        <Modal
          open={this.props.requestingFieldMappingUpsert}
          onClose={this.handleCloseModal}
          center
          closeIconSize={16}
        >
          <UpsertFieldMappingModal />
        </Modal>
        <Modal
          open={this.props.requestingRemoveMappedField}
          onClose={this.handleCloseRemoveModal}
          center
          animationDuration={0}
          showCloseIcon={false}
        >
          <RemoveFieldMappingConfirmationModal />
        </Modal>
      </div>
    );
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
    settingFieldsMapping: state.reducers.fieldsMapping.settingFieldsMapping,
    setupCompleted: state.reducers.appSetup.setupCompleted,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...fieldsMappingActions }, dispatch),
  };
}

export default connect(mapStatesToProps, mapDispatchToProps)(FieldsMapping);
