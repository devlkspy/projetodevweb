fetch('cabecalho.html')
.then(response => response.text())
.then(data => {
    const placeholder = document.getElementById('header-placeholder');
    if (placeholder) {
        placeholder.innerHTML = data;
    }
});