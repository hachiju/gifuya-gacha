function submitForm(form) {
  const number = form.number.value;
  fetch(`/gacha?number=${number}`)
    .then(response => response.text())
    .then(result => {
      document.getElementById('result').innerHTML = result;
    });
}
