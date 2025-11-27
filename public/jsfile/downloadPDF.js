document.getElementById("downloadBtn").addEventListener("click", () => {
  const oldTitle = document.title;

  document.title = "Portfolio_" + "<%= user.name %>";

  window.print();

  setTimeout(() => {
    document.title = oldTitle;
  }, 500);
});
