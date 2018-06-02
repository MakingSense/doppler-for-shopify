import React from 'react';
import { Link } from 'react-router';

const NotFound = props => {
  return (
    <div>
      <h2>404 Not Found</h2>
      <p>Sorry, the page you were looking for is not available.</p>
      <p>
        {' '}
        Please try again or go to &nbsp;
        <Link to="/">Home</Link>
      </p>
    </div>
  );
};

export default NotFound;
