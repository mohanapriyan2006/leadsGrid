export const leadsPageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

  :root {
    --bg-base:        var(--surface, #0a0c14);
    --bg-panel:       var(--surface-secondary, #0f1420);
    --bg-card:        var(--surface-tertiary, #141b2d);
    --bg-card-hover:  var(--surface-elevated, #1a2340);
    --bg-input:       var(--surface-tertiary, #141b2d);
    --border:         rgba(167, 139, 250, 0.1);
    --border-active:  rgba(167, 139, 250, 0.4);
    --accent:         var(--accent, #a78bfa);
    --accent-2:       var(--accent-secondary, #8b5cf6);
    --accent-glow:    rgba(167, 139, 250, 0.25);
    --hot:            var(--warning, #f59e0b);
    --hot-glow:       rgba(245, 158, 11, 0.2);
    --success:        var(--success, #10b981);
    --text-primary:   var(--content, #e8ecff);
    --text-secondary: var(--content-secondary, #94a3b8);
    --text-dim:       var(--content-tertiary, #64748b);
    --radius-card:    16px;
    --radius-btn:     8px;
    --shadow-card:    0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    --shadow-glow:    0 0 32px rgba(167, 139, 250,0.80);
    --font:           'Space Grotesk', system-ui, sans-serif;
    --font-mono:      'JetBrains Mono', monospace;
    --transition:     cubic-bezier(.22,.68,0,1.2);
  }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 var(--accent-glow); }
    50%       { box-shadow: 0 0 0 8px transparent; }
  }
  @keyframes hotPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.55; }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @keyframes scoreBar {
    from { width: 0; }
    to   { width: var(--bar-w); }
  }
  @keyframes spinOnce {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes ripple {
    0%   { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(2.4); opacity: 0; }
  }
  @keyframes tagSlide {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .leads-page * { box-sizing: border-box; margin: 0; padding: 0; font-family: var(--font); }

  .leads-page {
    background: var(--bg-base);
    min-height: 100vh;
    padding: 32px 28px;
    animation: fadeIn 0.4s ease;
    position: relative;
  }
  .leads-page-bg { pointer-events: none; position: absolute; inset: 0; z-index: 0; overflow: hidden; }
  .leads-page-bg img { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%) translateY(8%); width: min(75%, 520px); height: auto; opacity: 0.035; user-select: none; }
  .leads-page-bg .bg-glow { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% 100%, rgba(16, 185, 129, 0.10) 0%, transparent 70%); }
  .leads-page-bg .bg-fade { position: absolute; inset: 0; background: linear-gradient(to bottom, var(--bg-base) 0%, rgba(10,12,20,0.7) 40%, transparent 100%); }
  .leads-page > *:not(.leads-page-bg) { position: relative; z-index: 1; }

  .lp-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 24px;
    animation: fadeSlideUp 0.45s var(--transition) both;
  }
  .lp-header-left h2 {
    font-size: 26px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.5px;
    line-height: 1;
    margin-bottom: 6px;
  }
  .lp-header-left p {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 400;
  }
  .lp-count-badge {
    font-size: 12px;
    color: var(--text-secondary);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 4px 12px;
    margin-left: 10px;
    vertical-align: middle;
    display: inline-block;
    animation: fadeIn 0.6s ease both 0.2s;
  }
  .lp-header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    animation: fadeSlideUp 0.5s var(--transition) 0.1s both;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-family: var(--font);
    font-size: 13px;
    font-weight: 500;
    border: none;
    border-radius: var(--radius-btn);
    cursor: pointer;
    padding: 9px 16px;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
  }
  .btn::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.2s;
    background: rgba(255,255,255,0.06);
  }
  .btn:hover::after { opacity: 1; }
  .btn:active { transform: scale(0.97); }

  .btn-ghost {
    background: var(--bg-card);
    color: var(--text-secondary);
    border: 1px solid var(--border);
  }
  .btn-ghost:hover { color: var(--text-primary); border-color: rgba(255,255,255,0.12); }

  .btn-primary {
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
    color: #fff;
    box-shadow: 0 2px 16px var(--accent-glow);
  }
  .btn-primary:hover {
    box-shadow: 0 4px 24px rgba(139,92,246,0.4);
    transform: translateY(-1px);
  }

  .btn-generate {
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
    color: #fff;
    font-size: 12.5px;
    padding: 8px 14px;
    border-radius: 8px;
    box-shadow: 0 2px 12px var(--accent-glow);
  }
  .btn-generate:hover {
    box-shadow: 0 4px 20px rgba(139,92,246,0.45);
    transform: translateY(-1px);
  }

  .ripple-wrap { position: relative; overflow: hidden; }
  .ripple-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.18);
    animation: ripple 0.55s ease-out forwards;
    pointer-events: none;
    transform-origin: center;
  }

  .lp-filters {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    animation: fadeSlideUp 0.5s var(--transition) 0.15s both;
  }
  .filter-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-dim);
    margin-right: 4px;
  }
  .filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--text-secondary);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 5px 12px;
    cursor: pointer;
    transition: all 0.18s ease;
    user-select: none;
  }
  .filter-chip.active {
    background: rgba(139,92,246,0.12);
    border-color: var(--border-active);
    color: var(--text-primary);
  }
  .filter-chip:hover:not(.active) {
    border-color: rgba(255,255,255,0.1);
    color: var(--text-primary);
  }
  .filter-chip-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
  }
  .filter-chip-dot.linkedin { background: #0a66c2; }
  .filter-chip-dot.twitter  { background: #1d9bf0; }
  .filter-chip-dot.reddit   { background: #ff4500; }

  .filter-divider {
    width: 1px; height: 18px;
    background: var(--border);
    margin: 0 4px;
  }

  .score-range {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-secondary);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 5px 14px;
  }
  .score-range input[type=range] {
    accent-color: var(--accent);
    width: 70px;
    cursor: pointer;
  }

  .industry-select {
    font-family: var(--font);
    font-size: 12.5px;
    color: var(--text-secondary);
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 5px 14px;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
    appearance: none;
    -webkit-appearance: none;
    padding-right: 28px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238b8fa8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
  }
  .industry-select:focus { border-color: var(--border-active); color: var(--text-primary); }

  .clear-btn {
    font-size: 12px;
    color: var(--text-dim);
    cursor: pointer;
    padding: 0 4px;
    transition: color 0.15s;
    background: none; border: none;
    font-family: var(--font);
  }
  .clear-btn:hover { color: var(--text-secondary); }

  .lp-grid {
    display: grid;
    gap: 20px;
    grid-template-columns: 1.25fr 1fr;
  }
  @media (max-width: 1100px) { .lp-grid { grid-template-columns: 1fr; } }

  .search-wrap {
    position: relative;
    margin-bottom: 16px;
  }
  .search-wrap svg.search-icon {
    position: absolute;
    left: 13px; top: 50%;
    transform: translateY(-50%);
    color: var(--text-dim);
    pointer-events: none;
  }
  .search-input {
    width: 100%;
    font-family: var(--font);
    font-size: 13.5px;
    color: var(--text-primary);
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 11px 12px 11px 38px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .search-input::placeholder { color: var(--text-dim); }
  .search-input:focus {
    border-color: var(--border-active);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }
  .search-input-spinner {
    position: absolute; right: 13px; top: 50%;
    transform: translateY(-50%);
    width: 14px; height: 14px;
    border: 2px solid rgba(139,92,246,0.25);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spinOnce 0.7s linear infinite;
  }

  .leads-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .lead-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 18px 20px;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s var(--transition), background 0.2s;
    animation: fadeSlideUp 0.4s var(--transition) both;
    position: relative;
    overflow: hidden;
  }
  .lead-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba(139,92,246,0.04) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.25s;
  }
  .lead-card:hover { transform: translateY(-2px); background: var(--bg-card-hover); border-color: rgba(255,255,255,0.09); }
  .lead-card:hover::before { opacity: 1; }
  .lead-card.selected {
    border-color: var(--border-active);
    box-shadow: var(--shadow-glow), inset 0 0 0 1px rgba(139,92,246,0.1);
    background: var(--bg-card-hover);
  }
  .lead-card.selected::before { opacity: 1; }
  .lead-card.hot-card { border-color: rgba(245,158,11,0.25); }
  .lead-card.hot-card:hover { border-color: rgba(245,158,11,0.4); }

  .lead-card-hot-band {
    position: absolute;
    top: 0; right: 0;
    width: 3px; height: 100%;
    background: linear-gradient(180deg, var(--hot) 0%, transparent 100%);
    border-radius: 0 var(--radius-card) var(--radius-card) 0;
  }

  .lead-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 14px;
    gap: 12px;
  }

  .lead-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--border);
    flex-shrink: 0;
    background: linear-gradient(135deg, #2d1f6e 0%, #1e2a5e 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.7);
  }

  .lead-identity { flex: 1; min-width: 0; }
  .lead-name {
    font-size: 14.5px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .lead-title {
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .lead-score-block { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex-shrink: 0; }
  .hot-signal-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 10.5px; font-weight: 700; color: var(--hot);
    letter-spacing: 0.05em; text-transform: uppercase;
    animation: hotPulse 1.8s ease-in-out infinite;
  }
  .hot-signal-badge svg { animation: hotPulse 1.8s ease-in-out infinite; }
  .lead-score-num {
    font-size: 26px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1;
    font-family: var(--font-mono);
    letter-spacing: -1px;
  }
  .lead-score-bar-wrap {
    width: 80px; height: 3px;
    background: rgba(255,255,255,0.07);
    border-radius: 2px;
    overflow: hidden;
  }
  .lead-score-bar {
    height: 100%;
    border-radius: 2px;
    animation: scoreBar 0.8s var(--transition) both;
  }

  .lead-signals {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 14px;
  }
  .signal-box {
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 11px 13px;
    transition: background 0.2s;
  }
  .signal-box:hover { background: rgba(255,255,255,0.05); }
  .signal-source {
    display: flex; align-items: center; gap: 5px;
    font-size: 10.5px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.06em;
    margin-bottom: 6px;
  }
  .signal-source.linkedin { color: #4da6ff; }
  .signal-source.twitter  { color: #60c4ff; }
  .signal-source.reddit   { color: #ff7043; }
  .signal-source.ai       { color: var(--accent); }
  .signal-text {
    font-size: 12px; color: var(--text-secondary);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .lead-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .lead-meta {
    display: flex; align-items: center; gap: 12px;
    font-size: 11.5px; color: var(--text-dim);
  }
  .lead-meta-item { display: flex; align-items: center; gap: 4px; }

  .lead-card-actions { display: flex; align-items: center; gap: 8px; }
  .icon-btn {
    width: 32px; height: 32px;
    border-radius: 8px;
    background: transparent;
    border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    color: var(--text-dim);
    cursor: pointer;
    transition: all 0.18s;
    flex-shrink: 0;
  }
  .icon-btn:hover { background: var(--bg-card-hover); color: var(--text-secondary); border-color: rgba(255,255,255,0.1); }

  .skeleton {
    background: linear-gradient(90deg, var(--bg-card) 0%, rgba(255,255,255,0.04) 50%, var(--bg-card) 100%);
    background-size: 400px 100%;
    animation: shimmer 1.4s ease infinite;
    border-radius: 8px;
  }

  .ai-panel {
    background: var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 22px 22px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    animation: fadeSlideUp 0.5s var(--transition) 0.1s both;
    position: sticky;
    top: 24px;
    max-height: calc(100vh - 120px);
    overflow-y: auto;
  }
  .ai-panel::-webkit-scrollbar { width: 4px; }
  .ai-panel::-webkit-scrollbar-track { background: transparent; }
  .ai-panel::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .ai-panel-header { display: flex; align-items: center; justify-content: space-between; }
  .ai-panel-title {
    font-size: 14px; font-weight: 700; color: var(--text-primary);
    display: flex; align-items: center; gap: 8px;
  }
  .ai-badge {
    font-size: 10px; font-weight: 700; letter-spacing: 0.07em;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    color: #fff; border-radius: 4px; padding: 2px 7px;
    text-transform: uppercase;
  }

  .tone-selector { display: flex; gap: 6px; }
  .tone-btn {
    font-family: var(--font); font-size: 12px; font-weight: 500;
    color: var(--text-dim); background: var(--bg-card);
    border: 1px solid var(--border); border-radius: 20px;
    padding: 5px 12px; cursor: pointer;
    transition: all 0.18s;
  }
  .tone-btn.active {
    background: rgba(139,92,246,0.15);
    border-color: var(--border-active);
    color: var(--text-primary);
  }
  .tone-btn:hover:not(.active) { color: var(--text-secondary); border-color: rgba(255,255,255,0.1); }

  .selected-lead-summary {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 16px;
    display: flex; align-items: center; gap: 12px;
  }
  .selected-lead-summary .lead-avatar { width: 36px; height: 36px; font-size: 13px; }
  .selected-lead-summary-info h4 { font-size: 13.5px; font-weight: 600; color: var(--text-primary); }
  .selected-lead-summary-info p  { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
  .selected-lead-summary-score {
    margin-left: auto;
    font-size: 22px; font-weight: 700;
    font-family: var(--font-mono); color: var(--text-primary);
  }

  .message-area-label {
    font-size: 12px; font-weight: 600; color: var(--text-secondary);
    text-transform: uppercase; letter-spacing: 0.07em;
    margin-bottom: 8px;
    display: flex; align-items: center; gap: 8px;
  }
  .message-area-label::after {
    content: ''; flex: 1; height: 1px; background: var(--border);
  }

  .message-textarea {
    width: 100%;
    font-family: var(--font); font-size: 13px; line-height: 1.65;
    color: var(--text-primary);
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 16px;
    resize: vertical; min-height: 150px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .message-textarea::placeholder { color: var(--text-dim); }
  .message-textarea:focus {
    border-color: var(--border-active);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }
  .message-textarea.generating {
    animation: shimmer 1.2s ease infinite;
    background-size: 400px 100%;
    background-image: linear-gradient(90deg, var(--bg-input) 0%, rgba(139,92,246,0.05) 50%, var(--bg-input) 100%);
    pointer-events: none;
  }

  .ai-panel-actions { display: flex; gap: 8px; }
  .ai-panel-actions .btn { flex: 1; justify-content: center; }

  .insight-bar {
    background: rgba(139,92,246,0.07);
    border: 1px solid rgba(139,92,246,0.18);
    border-radius: 10px;
    padding: 12px 14px;
    display: flex; gap: 10px; align-items: flex-start;
  }
  .insight-bar svg { color: var(--accent); flex-shrink: 0; margin-top: 1px; }
  .insight-bar p { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
  .insight-bar strong { color: var(--accent); font-weight: 600; }

  .empty-state {
    text-align: center; padding: 48px 24px;
    color: var(--text-dim); font-size: 13px;
  }
  .empty-state svg { margin-bottom: 12px; color: var(--text-dim); }
  .empty-state h3 { font-size: 15px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }

  .source-dot {
    width: 6px; height: 6px; border-radius: 50%; display: inline-block;
  }
`;