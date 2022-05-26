import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "bootstrap-icons/font/bootstrap-icons.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div id="load-modal" className="modal" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content">
          <div className="modal-body py-5">
            <div className='text-center'>
              <div className="spinner-border text-dark me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
              </div>
              <span className='fs-4'>Loading ...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <App />
  </React.StrictMode>
);

