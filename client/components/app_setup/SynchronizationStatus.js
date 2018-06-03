import React, { Component } from 'react';
import { Banner, Link } from '@shopify/polaris';

class SynchronizationStatus extends Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    if (
        !this.props.lastSynchronizationDate ||
        this.props.lastSynchronizationDate === ''
      )
        return null;
  
      if (this.props.synchronizationInProgress)
        return (
          <div>
            <Banner icon="horizontalDots" status="warning">
              <p>
                Synchronization process status: <strong>IN PROGRESS </strong>
                (Click <Link onClick={this.props.handleReloadLink} url=".">here</Link> to refresh)
              </p>
              <p>
                Requested on:{' '}
                <strong>
                  {new Date(this.props.lastSynchronizationDate).toLocaleString()}
                </strong>
              </p>
            </Banner>
            <br />
          </div>
        );
  
      return (
        <div>
          <Banner icon="checkmark" status="info">
            <p>
              Synchronization process status: <strong>COMPLETED</strong>
            </p>
            <p>
              Requested on:{' '}
              <strong>
                {new Date(this.props.lastSynchronizationDate).toLocaleString()}
              </strong>
            </p>
          </Banner>
          <br />
        </div>
      );
  }
}

export default SynchronizationStatus;
