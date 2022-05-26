import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "bootstrap-icons/font/bootstrap-icons.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div id="load-modal" class="modal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content">
          <div class="modal-body py-5">
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

