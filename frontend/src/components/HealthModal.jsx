import React from 'react';
import { Cpu, CheckCircle2, AlertCircle, X, Shield, Key } from 'lucide-react';

export default function HealthModal({ isOpen, onClose, healthData }) {
  if (!isOpen) return null;

  const isLive = healthData?.live_ai;

  return (
    <div className="health-modal-backdrop" onClick={onClose}>
      <div className="health-modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="health-modal-titlebar">
          <div className="titlebar-left">
            <Cpu size={16} />
            <span>AI Core Diagnostics & Backboard Status</span>
          </div>
          <button className="health-close-btn" onClick={onClose} title="Close">
            <X size={16} />
          </button>
        </div>

        <div className="health-modal-body">
          <div className={`health-status-banner ${isLive ? 'banner-live' : 'banner-demo'}`}>
            {isLive ? (
              <>
                <CheckCircle2 size={24} className="banner-icon icon-live" />
                <div>
                  <h4>Live AI Mode Operational</h4>
                  <p>Connected to <code>{healthData?.model || 'meta-llama/llama-3.1-8b-instruct'}</code> via Backboard.</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle size={24} className="banner-icon icon-demo" />
                <div>
                  <h4>Honest Demo Mode Active</h4>
                  <p>{healthData?.error || 'Running in scripted fallback mode. No API key found or Backboard credit not configured.'}</p>
                </div>
              </>
            )}
          </div>

          <div className="diagnostics-table">
            <div className="diag-row">
              <span className="diag-label">Model Identifier</span>
              <span className="diag-value"><code>meta-llama/llama-3.1-8b-instruct</code></span>
            </div>
            <div className="diag-row">
              <span className="diag-label">API Gateway / Provider</span>
              <span className="diag-value">Backboard SDK (<code>backboard-sdk 1.5.x</code>)</span>
            </div>
            <div className="diag-row">
              <span className="diag-label">Free Tier Credit</span>
              <span className="diag-value">$5 Backboard Hackathon Credit Eligible</span>
            </div>
            <div className="diag-row">
              <span className="diag-label">Server Status</span>
              <span className="diag-value"><code>{healthData?.status || 'online'}</code></span>
            </div>
            <div className="diag-row">
              <span className="diag-label">Active Sessions</span>
              <span className="diag-value">{healthData?.active_sessions ?? 1}</span>
            </div>
          </div>

          <div className="env-guide-box">
            <div className="env-guide-header">
              <Key size={14} />
              <span>How to Enable Live AI with Backboard</span>
            </div>
            <p>
              To run live inference with Llama 3.1 8B, set your key in <code>.env</code>:
            </p>
            <pre className="code-snippet">
              BACKBOARD_API_KEY=your_actual_key_here<br />
              BACKBOARD_MODEL=meta-llama/llama-3.1-8b-instruct
            </pre>
            <p className="env-tip">
              Keys remain strictly in backend environment variables and are never leaked to client browsers.
            </p>
          </div>

          <div className="health-actions">
            <button className="btn-health-close" onClick={onClose}>
              <Shield size={15} />
              <span>Return to Ghost Desktop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
