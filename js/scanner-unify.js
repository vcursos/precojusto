// Unificação de eventos do scanner para garantir uso de openBarcodeScanner e evitar teclado móvel.
(function(){
  function blurActive(){
    try{ if(document.activeElement && document.activeElement !== document.body){ document.activeElement.blur(); } }catch(_){ }
  }
  function handler(e){
    e.preventDefault();
    blurActive();
    if(typeof window.openBarcodeScanner === 'function'){
      window.openBarcodeScanner();
    } else {
      console.warn('openBarcodeScanner não disponível');
    }
  }
  function wire(){
    ['barcode-search-btn','floating-barcode-btn'].forEach(id => {
      const el = document.getElementById(id);
      if(el){ el.addEventListener('click', handler, { capture:true }); }
    });
    const img = document.querySelector('.barcode-img');
    if(img){ img.addEventListener('click', handler, { capture:true }); }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', wire);
  } else wire();
})();