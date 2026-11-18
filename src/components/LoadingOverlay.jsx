import "./LoadingOverlay.css";

const LoadingOverlay = ({ message }) => (
  <div className="loading-overlay" role="status" aria-live="polite">
    <div className="loading-panel">
      <div className="loading-mark" aria-hidden="true">M</div>
      <div className="loading-spinner" aria-hidden="true" />
      <strong>{message}</strong>
      <span>Merci de patienter quelques instants.</span>
    </div>
  </div>
);

export default LoadingOverlay;
