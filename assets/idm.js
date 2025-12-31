// Simple client-side downloader: fetches URL and saves as file via blob
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('idmForm');
  const urlIn = document.getElementById('fileUrl');
  const nameIn = document.getElementById('fileName');
  const status = document.getElementById('status');
  const openBtn = document.getElementById('openBtn');

  // Prefill from query params (used by roms links)
  try{
    const p = new URLSearchParams(location.search);
    if(p.get('url')) urlIn.value = decodeURIComponent(p.get('url'));
    if(p.get('name')) nameIn.value = decodeURIComponent(p.get('name'));
  }catch(e){}

  openBtn.addEventListener('click', ()=>{
    if(!urlIn.value) return;
    window.open(urlIn.value, '_blank');
  });

  form.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    const fileUrl = urlIn.value.trim();
    if(!fileUrl){ status.textContent = 'Please provide a URL.'; return; }
    const filename = nameIn.value.trim() || fileUrl.split('/').pop() || 'download.bin';
    status.textContent = 'Starting download...';

    try{
      const resp = await fetch(fileUrl, {mode:'cors'});
      if(!resp.ok) throw new Error('Network response was not ok: '+resp.status);
      const blob = await resp.blob();
      const a = document.createElement('a');
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      status.textContent = 'Download started. Check your browser downloads.';
    }catch(err){
      console.error(err);
      status.textContent = 'Download failed: '+err.message+". Try opening the URL in a new tab.";
    }
  });
});
