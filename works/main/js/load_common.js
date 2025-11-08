fetch('common.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('common').innerHTML = data;
  });

const currentPage = location.pathname.match(/story(\d)\.html$/);
if (currentPage) {
  const num = parseInt(currentPage[1], 10);
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  if (num === 1 && prevBtn) prevBtn.style.display = 'none';
  if (num === 5 && nextBtn) nextBtn.style.display = 'none';

  if (num > 1 && prevBtn) prevBtn.href = `story${num - 1}.html`;
  if (num < 5 && nextBtn) nextBtn.href = `story${num + 1}.html`;
}
