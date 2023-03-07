const appointemntDate = document.querySelector('.appointmentDate');
appointemntDate.addEventListener('change', (e) => {
const date = new Date(e.target.value);
const today = new Date();
if (date < today) {
    alert('Please select a date in the future');
    e.target.value = '';
}
});
const appointemntTime = document.querySelector('.appointmentTime');
console.log(appointemntTime.value);
appointemntTime.addEventListener('change', (e) => {
const time = e.target.value;
const hours = time.split(':')[0];
let minutes = time.split(':')[1];
minutes = Math.floor(minutes / 15) * 15;
console.log(hours, minutes);
e.target.value = `${hours}:${minutes}`;
});
