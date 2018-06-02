import React from 'react';

class AboutPage extends React.Component {
  render() {
    return (
      <div>
        <h1>About</h1>
        <p>This application belongs to Making Sense LLC</p>
        <h2>Details</h2>
        <p>
          Based on the{' '}
          <a href="https://github.com/Shopify/shopify-node-app">
            Shopify Node App
          </a>{' '}
          and the brilliant ideas from the{' '}
          <a href="https://github.com/MakingSense/mern-seed/">MERN seed</a>
        </p>
        <a href="https://www.fromdoppler.com/">Doppler</a>
        <a href="https://www.makingsense.com/">Making Sense LLC</a>
      </div>
    );
  }
}

export default AboutPage;
