import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Layout,
  Card,
  Select,
  Heading,
  FormLayout,
  Stack,
  ButtonGroup,
  Button,
} from '@shopify/polaris';
import * as fieldsMappingActions from '../../actions/fieldsMappingActions';

class UpsertFieldMappingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shopifyFieldsOptions: [],
      dopplerFieldsOptions: [],
      shopifyFieldValue: null,
      dopplerFieldValue: null,
      shopifyFieldHelpText: '',
      dopplerFieldHelpText: '',
    };

    this.getShopifyOptions = this.getShopifyOptions.bind(this);
    this.getDopplerFieldsOptions = this.getDopplerFieldsOptions.bind(this);
    this.handleShopifyFieldChange = this.handleShopifyFieldChange.bind(this);
    this.getShopifyFieldHelpText = this.getShopifyFieldHelpText.bind(this);
    this.getDopplerFieldHelpText = this.getDopplerFieldHelpText.bind(this);
    this.handleSaveButtonClick = this.handleSaveButtonClick.bind(this);
    this.handleDopplerFieldChange = this.handleDopplerFieldChange.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.getFriendlyTypeName = this.getFriendlyTypeName.bind(this);
  }

  componentDidMount() {
    const shopifyFieldsOptions = this.getShopifyOptions();
    const shopifyFieldValue =
      shopifyFieldsOptions.length > 0 ? shopifyFieldsOptions[0].value : null;
    this.setState({ shopifyFieldsOptions });
    this.handleShopifyFieldChange(shopifyFieldValue);
  }

  getFriendlyTypeName(type) {
    switch(type) {
      case 'string': return 'text';
      case 'boolean': return 'true/false';
      default: return type;
    }
  }

  getShopifyFieldHelpText(shopifyFieldValue) {
    if (shopifyFieldValue === null) return '';

    const shopifyField = this.props.shopifyFields.find(
      sf => sf.path === shopifyFieldValue
    );
    return `Type: ${this.getFriendlyTypeName(shopifyField.type)}. Sample: ${shopifyField.sample}`;
  }

  getDopplerFieldHelpText(dopplerFieldValue) {
    if (dopplerFieldValue === null) return '';

    const dopplerField = this.props.dopplerFields.find(
      df => df.name === dopplerFieldValue
    );
    return `Type: ${this.getFriendlyTypeName(dopplerField.type)}.${dopplerField.sample ? ` Sample: ${dopplerField.sample}` : ''}`;
  }

  getShopifyOptions() {
    return this.props.shopifyFields
      .filter(f => !this.props.fieldsMapping.some(m => m.shopify === f.path))
      .map(f => {
        return { value: f.path, label: f.name };
      });
  }

  getDopplerFieldsOptions(shopifyFieldValue) {
    return this.props.dopplerFields
      .filter(
        d =>
          !this.props.fieldsMapping.some(m => m.doppler === d.name) &&
          this.props.shopifyFields.find(f => f.path === shopifyFieldValue).type === d.type
      )
      .map(d => {
        return { value: d.name, label: d.name };
      });
  }

  handleShopifyFieldChange(shopifyFieldValue) {
    const dopplerFieldsOptions = this.getDopplerFieldsOptions(
      shopifyFieldValue
    );
    const dopplerFieldValue =
      dopplerFieldsOptions.length > 0 ? dopplerFieldsOptions[0].value : null;
    const shopifyFieldHelpText = this.getShopifyFieldHelpText(
      shopifyFieldValue
    );
    const dopplerFieldHelpText = this.getDopplerFieldHelpText(
      dopplerFieldValue
    );
    this.setState({
      dopplerFieldsOptions,
      shopifyFieldValue,
      dopplerFieldValue,
      shopifyFieldHelpText,
      dopplerFieldHelpText,
    });
  }

  handleDopplerFieldChange(dopplerFieldValue) {
    const dopplerFieldHelpText = this.getDopplerFieldHelpText(
      dopplerFieldValue
    );
    this.setState({
      dopplerFieldValue,
      dopplerFieldHelpText,
    });
  }

  handleSaveButtonClick() {
    this.props.actions.addNewMappedField({
      shopify: this.state.shopifyFieldValue,
      doppler: this.state.dopplerFieldValue,
    });
  }

  handleCloseModal() {
    this.props.actions.requestFieldMappingUpsert(false);
  }

  render() {
    return (
      <div style={{ minWidth: '50rem' }}>
        <Layout>
          <Layout.Section>
            <Card sectioned title="New Field">
              <p>
                Choose a Shopify filed to be mapped with your Doppler field.
              </p>
              <p>Only fields of the same type can be mapped.</p>
              <br />
              <FormLayout>
                <Select
                  label="Shopify Customer Field"
                  helpText={this.state.shopifyFieldHelpText}
                  options={this.state.shopifyFieldsOptions}
                  onChange={this.handleShopifyFieldChange}
                  value={this.state.shopifyFieldValue}
                  disabled={this.state.shopifyFieldValue === null}
                />
                <Select
                  label="Doppler Subscriber Field"
                  helpText={this.state.dopplerFieldHelpText}
                  options={this.state.dopplerFieldsOptions}
                  value={this.state.dopplerFieldValue}
                  disabled={this.state.dopplerFieldValue === null}
                  onChange={this.handleDopplerFieldChange}
                />
                <Stack alignment="center" distribution="trailing">
                  <ButtonGroup>
                    <Button onClick={this.handleCloseModal}>Cancel</Button>
                    <Button
                      primary
                      onClick={this.handleSaveButtonClick}
                      disabled={
                        this.state.dopplerFieldValue === null ||
                        this.state.shopifyFieldValue === null
                      }
                    >
                      Save
                    </Button>
                  </ButtonGroup>
                </Stack>
              </FormLayout>
            </Card>
          </Layout.Section>
        </Layout>
      </div>
    );
  }
}

function mapStatesToProps(state, ownProps) {
  return {
    state: state.reducers,
    fieldsMapping: state.reducers.fieldsMapping.fieldsMapping,
    shopifyFields: state.reducers.fieldsMapping.shopifyFields,
    dopplerFields: state.reducers.fieldsMapping.dopplerFields,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...fieldsMappingActions }, dispatch),
  };
}

export default connect(mapStatesToProps, mapDispatchToProps)(
  UpsertFieldMappingModal
);
