const defaultAssets = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 189.84, change: 1.24, signal: 'Bullish momentum', detail: 'Price is holding above its short-term moving average. Confirm volume and broader market direction before acting.' },
  { symbol: 'BTC-USD', name: 'Bitcoin', price: 68420.12, change: -0.62, signal: 'Range-bound', detail: 'Momentum is mixed while price remains inside the recent range. Support and resistance levels are more useful than a directional assumption.' },
  { symbol: 'EURUSD=X', name: 'Euro / US Dollar', price: 1.0842, change: 0.18, signal: 'Watch breakout', detail: 'The pair is approaching a recent resistance area. Wait for a confirmed close and volume context rather than anticipating a breakout.' }
];

let assets = JSON.parse(localStorage.getItem('stockline-assets') || 'null') || defaultAssets;
let selectedSymbol = assets[0]?.symbol;

const save = () => localStorage.setItem('stockline-assets', JSON.stringify(assets));
const formatPrice = (price, symbol) => symbol.includes('=') ? price.toFixed(4) : price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function render() {
  document.querySelector('#asset-count').textContent = assets.length;
  const list = document.querySelector('#watchlist');
  list.innerHTML = assets.map(asset => `<div class="asset ${asset.symbol === selectedSymbol ? 'selected' : ''}" data-symbol="${asset.symbol}">
    <div><span class="asset-name">${asset.name}</span><span class="asset-symbol">${asset.symbol}</span></div>
    <div class="asset-price">${formatPrice(asset.price, asset.symbol)}</div>
    <div class="asset-change ${asset.change >= 0 ? 'positive-text' : 'negative-text'}">${asset.change >= 0 ? '+' : ''}${asset.change.toFixed(2)}%</div>
    <button class="delete" data-delete="${asset.symbol}" title="Remove asset">×</button>
  </div>`).join('');
  list.querySelectorAll('.asset').forEach(row => row.addEventListener('click', () => { selectedSymbol = row.dataset.symbol; renderInsight(); render(); }));
  list.querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', event => { event.stopPropagation(); assets = assets.filter(asset => asset.symbol !== button.dataset.delete); selectedSymbol = assets[0]?.symbol; save(); render(); renderInsight(); }));
  renderInsight();
}

function renderInsight() {
  const asset = assets.find(item => item.symbol === selectedSymbol);
  document.querySelector('#insight').innerHTML = asset
    ? `<div class="signal-badge">${asset.change >= 0 ? 'POSITIVE BIAS' : 'CAUTION'}</div><h3>${asset.name}</h3><p class="muted">${asset.signal}</p><p class="muted" style="margin-top:14px">${asset.detail}</p>`
    : '<h3>No assets in your watchlist</h3><p class="muted">Add an asset to begin monitoring.</p>';
}

document.querySelector('#add-asset').addEventListener('click', () => {
  const symbol = window.prompt('Enter a ticker, crypto pair, or forex symbol (for example MSFT):')?.trim().toUpperCase();
  if (!symbol || assets.some(asset => asset.symbol === symbol)) return;
  assets.push({ symbol, name: symbol, price: 0, change: 0, signal: 'Awaiting data', detail: 'Connect a market-data provider to populate live prices and indicator calculations.' });
  selectedSymbol = symbol; save(); render();
});
document.querySelector('#refresh').addEventListener('click', () => {
  document.querySelector('#market-status').textContent = `Last checked ${new Date().toLocaleTimeString()}`;
  window.stockline?.notify('StockLine monitoring', 'Watchlist refresh completed. Review signals before making decisions.');
});
setInterval(() => { document.querySelector('#clock').textContent = new Date().toLocaleTimeString(); }, 1000);
render();
