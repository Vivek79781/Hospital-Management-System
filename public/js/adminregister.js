const category = document.getElementById('category');
console.log(category.value);
category.addEventListener('change', () => {
if (category.value === 'doctor') {
    const form = document.querySelector('.validated-form');
    const doctor = document.querySelector('.doctor');
    if (!doctor) {
    const newFormGroup = document.createElement('div');
    newFormGroup.classList.add('doctor');
    newFormGroup.innerHTML = `
    <div class="form-floating mb-3">
<label for="name">Name</label>
<input type="text" id="name" class="form-control" name="Name" required />
<div class="valid-feedback">Looks good!</div>
</div>
<div class="form-floating mb-3">
<label for="dept">Department</label>
<input type="text" id="dept" class="form-control" name="Department" required />
<div class="valid-feedback">Looks good!</div>
</div>
<div class="form-floating mb-3">
<label for="pos">Position</label>
<input type="text" id="pos" class="form-control" name="Position" required />
<div class="valid-feedback">Looks good!</div>
</div>
<div class="form-floating mb-3">
<label for="Gender">Gender</label>
<select name="Gender" id="Gender" class="form-control">
<option value="male">Male</option>
<option value="Female">Female</option>
<option value="Prefer Not To Say">Prefer Not To Say</option>
</select>
</div>
    `;
    form.insertBefore(newFormGroup, form.lastElementChild);
    }
} else {
    const doctor = document.querySelector('.doctor');
    if (doctor) {
    doctor.remove();
    }
}
});