const treatmentDate = document.querySelector('.treatment-date');
treatmentDate.addEventListener('change', (e) => {
const date = new Date(e.target.value);
const today = new Date();
if (date < today) {
    alert('Please select a date in the future');
    e.target.value = '';
}
});
const treatmentTime = document.querySelector('.treatment-time');
treatmentTime.addEventListener('change', (e) => {
const time = e.target.value;
const hours = time.split(':')[0];
const minutes = '00';
e.target.value = `${hours}:${minutes}`;
});
